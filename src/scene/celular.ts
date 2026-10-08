import {
  AdditiveBlending,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshBasicMaterial,
  type MeshStandardMaterial,
  PlaneGeometry,
  Quaternion,
  type Texture,
  Vector3,
} from 'three'
import { CenaBase, faixa, type OpcoesCena } from './base'
import { type Aparelho, construirAparelho, E, geometriaDaTela, H, type Peca, W } from './modelo'
import { texturaConversa, texturaFeixe, texturaReflexo } from './texturas'

/**
 * O celular da página inteira.
 *
 * Um canvas fixo atrás de todo o conteúdo da home; a rolagem vira um número
 * contínuo, o **estado** `s`, marcado no DOM por `data-s`:
 *
 *   s = 0              herói: as peças soltas, em camadas, flutuando
 *   s = 1 … N          montagem: a peça k vem "para a mão" (em destaque,
 *                      mostrando o lado bom) e encaixa no lugar; da tampa
 *                      traseira até a tela
 *   s = N + 1          pronto: montado, de frente, o laser varre e a tela
 *                      mostra "reparo concluído"
 *   s = N + 2 … N + 7  o resto da página: o aparelho acompanha cada seção,
 *                      com pose, enquadramento e tela próprios (serviços,
 *                      como funciona, diagnóstico — com a conversa sendo
 *                      escrita na tela —, direitos, dúvidas, fecho)
 *
 * Entre dois estados inteiros, tudo é interpolado com uma curva suave.
 *
 * O enquadramento é por **deslocamento de lente** (a matriz de projeção é
 * deslocada), e não movendo o aparelho: ele vai para o lado livre de cada
 * seção sem perder a perspectiva centrada.
 */

export type Leitura = {
  /** Posição da peça em destaque, em pixels do canvas. */
  x: number
  y: number
  /** 0…1 — o quanto a peça está "na mão". */
  foco: number
  passo: number
}

type Tela = 'diagnostico' | 'pronto' | 'conversa' | 'marca'

type Pose = {
  rx: number
  ry: number
  rz: number
  /** Abertura mínima do aparelho nesta pose (0 fechado, 1 aberto). */
  explosao: number
  /** Meia largura e meia altura do que deve caber no quadro (0 = a peça da vez). */
  meioW: number
  meioH: number
  /** Deslocamento da lente em NDC. */
  sx: number
  sy: number
  /** Fração da tela que o enquadramento pode ocupar. */
  fw: number
  fh: number
  /** Giro contínuo em torno do eixo do aparelho, em rad/s. */
  gira: number
  tela: Tela
}

/** Distância entre as peças na fila (e na pilha do herói), em cm. */
const ESPACO = 2.9
/** Onde a fila começa, acima do aparelho, durante a montagem. */
const FILA0 = 5
/** Quanto a peça "na mão" se afasta da pilha, na direção da câmera. */
const ALCA = 2.6

const suavizar = (t: number) => t * t * (3 - 2 * t)
const misturar = (a: number, b: number, t: number) => a + (b - a) * t
const limitar = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const SINAL = new Color('#c8ff2e')

export class CenaCelular extends CenaBase {
  private aparelho: Aparelho
  private plano = new Group()
  private inclinacao = new Group()
  private giroGrupo = new Group()
  private feixe: Mesh
  private feixeMaterial: MeshBasicMaterial
  private reflexo: Mesh
  private reflexoMaterial: MeshBasicMaterial
  private minuto = -1
  /** Os passos da montagem, na ordem: as peças de cada um. */
  private passos: Peca[][]
  /** Índice do passo de cada peça. */
  private passoDe = new Map<Peca, number>()
  private n: number
  private total: number
  private retrato = false
  private emissivos = new Map<MeshStandardMaterial, Color>()
  private conversa = texturaConversa()
  private telaAtual: Tela = 'diagnostico'
  private girado = 0

  private alvo = new Vector3()
  private distancia = 40
  private sx = 0
  private sy = 0
  private iniciado = false
  /** `?foto` na URL: sem laser e sem flutuar — para o script que fotografa o aparelho. */
  private foto = new URLSearchParams(window.location.search).has('foto')
  /**
   * Modo calmo ("reduzir movimento" ligado): a montagem continua ligada à
   * rolagem — é a própria pessoa quem move —, mas nada se mexe sozinho:
   * sem flutuar, sem girar, sem laser nem reflexo passando na tela.
   */
  private calmo = false
  private aoEscrever = (e: Event) => this.conversa.escrever((e as CustomEvent<string>).detail)

  /** Chamado a cada quadro — a seção posiciona o marcador da peça. */
  aoQuadro?: (l: Leitura) => void

  constructor(
    canvas: HTMLCanvasElement,
    opcoes: OpcoesCena & { passos: Peca['id'][][]; secoes: number; calmo?: boolean },
  ) {
    super(canvas, { ...opcoes, fov: 28 })
    this.calmo = opcoes.calmo ?? false
    // Plano próximo a 2 cm, e não a 1 mm: a câmera nunca chega tão perto, e
    // a precisão de profundidade que sobra acaba com o "pisca" entre as
    // camadas finas (tela, borda, vidro) vistas de longe.
    this.camera.near = 2
    this.camera.far = 400

    this.aparelho = construirAparelho(this.compacto)
    for (const p of this.aparelho.pecas) {
      for (const m of p.materiais) this.emissivos.set(m, m.emissive.clone())
    }
    this.passos = opcoes.passos.map((ids) =>
      this.aparelho.pecas.filter((p) => (ids as string[]).includes(p.id)),
    )
    this.passos.forEach((pecas, k) => {
      for (const p of pecas) this.passoDe.set(p, k)
    })
    this.n = this.passos.length
    this.total = this.n + 1 + opcoes.secoes

    // A luz na tela. Os dois efeitos ficam presos às próprias peças — o laser
    // à tela, o reflexo ao vidro —, então acompanham a peça em qualquer
    // estado: soltas no herói, na mão durante a montagem, montadas depois.
    const conteudoDe = (id: string) =>
      this.aparelho.pecas.find((p) => p.id === id)?.pivo.children[0] ?? this.aparelho.raiz

    // O laser de diagnóstico: uma faixa verde aditiva que desce pela tela.
    const tFeixe = texturaFeixe()
    this.feixeMaterial = new MeshBasicMaterial({
      map: tFeixe,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      opacity: 0,
    })
    this.feixe = new Mesh(new PlaneGeometry(W + 0.8, 2.6), this.feixeMaterial)
    this.feixe.position.z = E / 2 + 0.06
    conteudoDe('tela').add(this.feixe)

    // O reflexo: uma faixa diagonal de luz branca que atravessa o vidro,
    // recortada na forma da tela (não vaza para fora do aparelho).
    const tReflexo = texturaReflexo()
    this.reflexoMaterial = new MeshBasicMaterial({
      map: tReflexo,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      opacity: 0,
    })
    this.reflexo = new Mesh(geometriaDaTela(), this.reflexoMaterial)
    this.reflexo.position.z = 0.4255
    conteudoDe('vidro').add(this.reflexo)

    this.giroGrupo.add(this.aparelho.raiz)
    this.inclinacao.add(this.giroGrupo)
    this.plano.add(this.inclinacao)
    this.cena.add(this.plano)

    // Luz direcional para o relevo dos componentes miúdos, um recorte verde
    // fraco e o preenchimento vindo da câmera.
    const chave = new DirectionalLight('#ffffff', 2.4)
    chave.position.set(-6, 10, 12)
    const recorte = new DirectionalLight('#c8ff2e', 0.25)
    recorte.position.set(10, -4, -6)
    const frente = new DirectionalLight('#dfe5ee', 1.1)
    frente.position.set(0, 2, 20)
    this.cena.add(chave, recorte, frente)
    this.renderer.toneMappingExposure = 1.2

    window.addEventListener('smarthere:conversa', this.aoEscrever)
    this.descartaveis.push(
      tFeixe,
      this.feixeMaterial,
      this.feixe.geometry,
      tReflexo,
      this.reflexoMaterial,
      this.reflexo.geometry,
      this.conversa.textura,
      { dispose: () => window.removeEventListener('smarthere:conversa', this.aoEscrever) },
      { dispose: () => this.aparelho.descartar() },
    )
  }

  /**
   * Antes do primeiro quadro: as texturas sobem para a GPU de uma vez e o
   * estado de "inverter a imagem" volta ao padrão. Sem isso, o three cria
   * a textura 3D interna dele com a inversão ainda ligada pela última
   * textura de canvas, e o Chrome reclama ("FLIP_Y … 3D textures").
   */
  override async preparar() {
    for (const t of [...this.aparelho.todasAsTexturas, this.conversa.textura]) {
      this.renderer.initTexture(t)
    }
    const gl = this.renderer.getContext()
    this.renderer.state.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
    this.renderer.state.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
    await super.preparar()
  }

  /** Onde o aparelho está na tela (px), para o arrasto pela página. */
  readonly area = { x: 0, y: 0, r: 0 }

  protected aoRedimensionar(w: number, h: number) {
    this.retrato = w / h < 0.85
  }

  /** A pose de cada estado inteiro, já ajustada ao formato da tela. */
  private pose(s: number): Pose {
    const r = this.retrato
    const deitado = { rx: -1.12, ry: 0.4, rz: -0.6 }
    if (s <= 0) {
      return {
        ...deitado,
        explosao: 1,
        meioW: 12,
        meioH: 15,
        sx: r ? 0 : 0.36,
        sy: r ? 0.3 : 0,
        fw: r ? 0.95 : 0.6,
        fh: r ? 0.55 : 0.98,
        gira: 0,
        tela: 'diagnostico',
      }
    }
    if (s <= this.n) {
      // Um passo da montagem: o enquadramento é o da peça (calculado à parte).
      return {
        ...deitado,
        explosao: 0,
        meioW: 0,
        meioH: 0,
        sx: r ? 0 : 0.4,
        sy: r ? 0.32 : 0,
        fw: r ? 0.85 : 0.5,
        fh: r ? 0.46 : 0.78,
        gira: 0,
        tela: 'diagnostico',
      }
    }
    const frente = { meioW: 4.4, meioH: 8.3, fw: r ? 0.8 : 0.42, fh: r ? 0.44 : 0.84 }
    const secoes: Pose[] = [
      // Pronto: de frente, à direita do texto.
      {
        rx: 0.08,
        ry: 0.46,
        rz: -0.03,
        explosao: 0,
        ...frente,
        sx: r ? 0 : 0.44,
        sy: r ? 0.36 : 0,
        gira: 0,
        tela: 'pronto',
      },
      // Serviços: de costas, girando devagar, embaixo do título.
      {
        rx: -0.2,
        ry: Math.PI + 0.5,
        rz: 0.12,
        explosao: 0,
        meioW: 4.4,
        meioH: 8.3,
        fw: 0.3,
        fh: 0.5,
        sx: r ? 0 : -0.62,
        sy: r ? 0 : -0.32,
        gira: 0.25,
        tela: 'pronto',
      },
      // Como funciona: entreaberto — o "diagnóstico na bancada".
      {
        rx: -0.95,
        ry: 0.5,
        rz: -0.5,
        explosao: 0.32,
        meioW: 4.6,
        meioH: 7.6,
        fw: 0.44,
        fh: 0.86,
        sx: r ? 0 : 0.5,
        sy: r ? 0 : 0,
        gira: 0,
        tela: 'diagnostico',
      },
      // Diagnóstico: de frente, à direita, com a conversa na tela.
      {
        rx: 0.04,
        ry: -0.28,
        rz: 0.02,
        explosao: 0,
        meioW: 4.2,
        meioH: 8.2,
        fw: 0.36,
        fh: 0.56,
        sx: r ? 0 : 0.5,
        sy: r ? 0 : 0.2,
        gira: 0,
        tela: 'conversa',
      },
      // Direitos: deitado, ao lado do título.
      {
        rx: -1.2,
        ry: 0.2,
        rz: 0.5,
        explosao: 0,
        meioW: 5,
        meioH: 9,
        fw: 0.3,
        fh: 0.5,
        sx: r ? 0 : 0.6,
        sy: r ? 0 : 0.5,
        gira: 0,
        tela: 'pronto',
      },
      // Dúvidas: de costas de novo, girando, embaixo do título.
      {
        rx: 0.3,
        ry: Math.PI - 0.6,
        rz: -0.15,
        explosao: 0,
        meioW: 4.4,
        meioH: 8.3,
        fw: 0.26,
        fh: 0.34,
        sx: r ? 0 : -0.7,
        sy: r ? 0 : -0.62,
        gira: 0.3,
        tela: 'pronto',
      },
      // Fecho: de frente, com a marca na tela.
      {
        rx: 0.06,
        ry: -0.38,
        rz: 0.03,
        explosao: 0,
        ...frente,
        fh: r ? 0.44 : 0.78,
        sx: r ? 0 : 0.46,
        sy: r ? 0.36 : 0,
        gira: 0,
        tela: 'marca',
      },
    ]
    return secoes[Math.min(secoes.length - 1, Math.round(s) - this.n - 1)]
  }

  /** Distância da câmera para caber meio-tamanho (mw, mh) na fração (fw, fh). */
  private distanciaPara(mw: number, mh: number, fw: number, fh: number): number {
    const tg = Math.tan((this.camera.fov * Math.PI) / 360)
    const dh = mh / (tg * fh)
    const dw = mw / (tg * this.camera.aspect * fw)
    return Math.max(dh, dw)
  }

  private trocarTela(tela: Tela) {
    if (tela === this.telaAtual) return
    this.telaAtual = tela
    const mapa: Record<Tela, Texture> = {
      ...this.aparelho.texturas,
      conversa: this.conversa.textura,
    }
    this.aparelho.tela.emissiveMap = mapa[tela]
    this.aparelho.tela.needsUpdate = true
  }

  protected passo(dt: number, t: number) {
    // Na fotografia, a pose é imediata — sem esperar o amortecimento.
    if (this.foto) this.progressoSuave = this.progresso
    const s = this.progressoSuave * this.total
    const i0 = Math.min(this.total - 1, Math.max(0, Math.floor(s)))
    const f = suavizar(limitar(s - i0))
    const a = this.pose(i0)
    const b = this.pose(i0 + 1)

    // ── Rotação ──
    const heroi = 1 - faixa(s, 0, 0.7)
    const montado = faixa(s, this.n + 0.4, this.n + 1)
    const vivo = Math.max(heroi * 0.4, montado)
    const parado = this.foto || this.calmo
    const flutua = parado ? 0 : Math.sin(t * 0.8) * 0.12 * vivo
    const gira = misturar(a.gira, b.gira, f)
    if (!this.calmo) this.girado += dt * gira
    // Fora das seções que giram, o giro acumulado volta devagar à volta
    // inteira mais próxima — o aparelho não "desgira" de uma vez.
    if (gira < 0.01) {
      const volta = Math.round(this.girado / (2 * Math.PI)) * 2 * Math.PI
      this.girado = misturar(this.girado, volta, 1 - 0.3 ** dt)
    }
    const rx = misturar(a.rx, b.rx, f) + this.ponteiroSuave.y * 0.08 * vivo + this.giroX
    const ry =
      misturar(a.ry, b.ry, f) +
      this.ponteiroSuave.x * 0.16 * vivo +
      (parado ? 0 : Math.sin(t * 0.3) * 0.08 * heroi) +
      this.girado +
      this.giro
    this.inclinacao.rotation.x = rx
    this.giroGrupo.rotation.y = ry
    this.plano.rotation.z = misturar(a.rz, b.rz, f)
    this.aparelho.raiz.position.y = flutua

    this.giroGrupo.updateMatrixWorld(true)
    const qMundo = this.giroGrupo.getWorldQuaternion(new Quaternion())
    const paraCamera = new Vector3(0, 0, 1).applyQuaternion(qMundo.invert())

    // ── A montagem ──
    // Cada peça tem três lugares:
    //   · a FILA — as que ainda vão entrar, empilhadas acima do aparelho na
    //     ordem de montagem. A fila desce uma posição a cada passo, então
    //     nenhuma peça pendente fica entre a câmera e a da vez;
    //   · a MÃO — acima do próprio encaixe, puxada na direção da câmera;
    //   · o ENCAIXE — o lugar dela no aparelho montado.
    // u = s − 1 − k: −1 ou menos, na fila; 0, na mão; 1 ou mais, encaixada.
    const poseExplosao = misturar(a.explosao, b.explosao, f)
    const passoAtual = s - 1
    const pesos = this.passos.map((_, k) => {
      const u = s - 1 - k
      return u <= -1 || u >= 1 ? 0 : suavizar(1 - Math.abs(u))
    })
    const fila = new Vector3()
    const mao3 = new Vector3()
    const encaixe = new Vector3()
    for (const p of this.aparelho.pecas) {
      const k = this.passoDe.get(p) ?? 0
      const u = s - 1 - k
      // A fila do herói é a pilha centrada; a da montagem começa logo acima
      // do aparelho e anda com o passo.
      const zHeroi = (k - (this.n - 1) / 2) * ESPACO + p.explosao.z * 0.4
      const zMontagem = FILA0 + (k - passoAtual) * ESPACO + p.explosao.z * 0.4
      fila.set(p.explosao.x, p.explosao.y, misturar(zMontagem, zHeroi, heroi)).add(p.centro)
      mao3.set(0, 0, 1.3).add(p.centro).addScaledVector(paraCamera, ALCA)
      // Encaixada — ou entreaberta, nas poses que pedem (como funciona).
      encaixe
        .set(p.explosao.x, p.explosao.y, p.explosao.z * ESPACO)
        .multiplyScalar(poseExplosao)
        .add(p.centro)
      if (u <= -1) p.grupo.position.copy(fila)
      else if (u <= 0) p.grupo.position.lerpVectors(fila, mao3, suavizar(u + 1))
      else if (u < 1) p.grupo.position.lerpVectors(mao3, encaixe, suavizar(u))
      else p.grupo.position.copy(encaixe)
      const mao = pesos[k]
      const giro = p.giroFoco ?? [0, 0, 0]
      p.pivo.rotation.set(giro[0] * mao, giro[1] * mao, giro[2] * mao)
      // O destaque: a peça na mão acende em verde, pulsando de leve.
      const brilho = mao * (0.022 + Math.sin(t * 3.2) * 0.008)
      for (const m of p.materiais) {
        const base = this.emissivos.get(m)
        if (base) m.emissive.copy(base).lerp(SINAL, brilho)
      }
    }

    // ── A tela ──
    let tela: Tela = 'diagnostico'
    if (s > this.n + 0.5) tela = this.pose(Math.max(this.n + 1, Math.round(s))).tela
    this.trocarTela(tela)

    // ── O relógio da tela: a hora de agora, redesenhada a cada minuto ──
    const minuto = Math.floor(Date.now() / 60000)
    if (minuto !== this.minuto) {
      if (this.minuto >= 0) {
        for (const tx of Object.values(this.aparelho.texturas)) tx.userData.redesenhar?.()
      }
      this.minuto = minuto
    }

    // ── A luz na tela ──
    // O laser varre a tela a cada 4,5 s em qualquer estado — e, quando o
    // aparelho fecha, acompanha a rolagem. O reflexo atravessa o vidro a
    // cada 3,2 s, fora de fase com o laser.
    let u = -1
    const fechando = faixa(s, this.n + 0.3, this.n + 1)
    if (fechando > 0 && fechando < 1) u = fechando
    else {
      const ciclo = (t % 4.5) / 2
      if (ciclo < 1) u = ciclo
    }
    if (u >= 0 && !parado) {
      this.feixe.position.y = misturar(H / 2 + 1, -H / 2 - 1, u)
      this.feixeMaterial.opacity = Math.sin(u * Math.PI) * 0.9
    } else {
      this.feixeMaterial.opacity = 0
    }
    const brilhoCiclo = ((t + 1.6) % 3.2) / 1.5
    if (brilhoCiclo < 1 && !parado) {
      const o = misturar(0.85, -0.85, suavizar(brilhoCiclo))
      this.reflexoMaterial.map?.offset.set(o, -o)
      this.reflexoMaterial.opacity = Math.sin(brilhoCiclo * Math.PI) * 0.85
    } else {
      this.reflexoMaterial.opacity = 0
    }

    // ── Câmera ──
    this.plano.updateMatrixWorld(true)
    const alvoDe = (k: number) => {
      const pecas = this.passos[k] ?? []
      const c = new Vector3()
      let raio = 0
      for (const p of pecas) {
        c.add(p.grupo.getWorldPosition(new Vector3()))
        raio = Math.max(raio, p.raio)
      }
      if (pecas.length) c.divideScalar(pecas.length)
      return { c, raio: Math.max(2.6, raio) }
    }
    const enquadrar = (pose: Pose, estado: number) => {
      if (estado >= 1 && estado <= this.n) {
        const { c, raio } = alvoDe(estado - 1)
        const m = raio * 1.05
        return { c, d: this.distanciaPara(m, m, pose.fw, pose.fh) }
      }
      const c = this.aparelho.raiz.localToWorld(new Vector3(0, 0, 0))
      if (estado === 0) c.set(0, 0, 0)
      return { c, d: this.distanciaPara(pose.meioW, pose.meioH, pose.fw, pose.fh) }
    }
    const ea = enquadrar(a, i0)
    const eb = enquadrar(b, i0 + 1)
    const alvo = ea.c.lerp(eb.c, f)
    const dist = misturar(ea.d, eb.d, f)
    const sx = misturar(a.sx, b.sx, f)
    const sy = misturar(a.sy, b.sy, f)

    // Primeiro quadro: sem amortecer (a câmera não "viaja" do zero).
    const k = this.iniciado && !this.foto ? 1 - 0.002 ** dt : 1
    this.iniciado = true
    this.alvo.lerp(alvo, k)
    this.distancia = misturar(this.distancia, dist, k)
    this.sx = misturar(this.sx, sx, k)
    this.sy = misturar(this.sy, sy, k)

    this.camera.position.set(this.alvo.x, this.alvo.y, this.alvo.z + this.distancia)
    this.camera.lookAt(this.alvo)
    this.camera.updateProjectionMatrix()
    // Lente shift: o alvo aparece em (sx, sy) da tela, em NDC.
    const pm = this.camera.projectionMatrix.elements
    pm[8] = -this.sx
    pm[9] = -this.sy
    this.camera.projectionMatrixInverse.copy(this.camera.projectionMatrix).invert()

    // ── A área do aparelho na tela (para o arrasto pela página) ──
    {
      const el = this.renderer.domElement
      const c = this.alvo.clone().project(this.camera)
      const tg = Math.tan((this.camera.fov * Math.PI) / 360)
      const raio = s < this.n + 0.5 ? 9 : 8.5
      this.area.x = ((c.x + 1) / 2) * el.clientWidth
      this.area.y = ((1 - c.y) / 2) * el.clientHeight
      this.area.r = (raio / (this.distancia * tg)) * (el.clientHeight / 2)
    }

    // ── Leitura para o marcador ──
    if (this.aoQuadro) {
      let melhor = -1
      let peso = 0
      pesos.forEach((p, i) => {
        if (p > peso) {
          peso = p
          melhor = i
        }
      })
      if (melhor >= 0) {
        const { c } = alvoDe(melhor)
        c.project(this.camera)
        const el = this.renderer.domElement
        this.aoQuadro({
          x: ((c.x + 1) / 2) * el.clientWidth,
          y: ((1 - c.y) / 2) * el.clientHeight,
          foco: peso,
          passo: melhor,
        })
      } else {
        this.aoQuadro({ x: 0, y: 0, foco: 0, passo: -1 })
      }
    }
  }
}
