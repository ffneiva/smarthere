import {
  Box3,
  BoxGeometry,
  BufferGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  DoubleSide,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  type Material,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Path,
  PlaneGeometry,
  Quaternion,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  type Texture,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from 'three'
import type { IdPeca } from '@/lib/business'
import {
  aleatorio,
  type Retangulo,
  texturaBateria,
  texturaBlindagem,
  texturaCamaraVapor,
  texturaChip,
  texturaConector,
  texturaEscovado,
  texturaGrade,
  texturaGrafite,
  texturaPlaca,
  texturaTampa,
  texturaTela,
  texturaVersoOled,
} from './texturas'

/**
 * O celular, peça por peça, em geometria procedural.
 *
 * Nenhum `.glb`: os modelos gratuitos de celular desmontável que existem
 * (Sketchfab, CGTrader, TurboSquid) ou não permitem download, ou proíbem uso
 * comercial, ou são só a casca externa. Desenhar em código resolve as três
 * coisas — e cada peça nasce separada, com o próprio centro e o próprio
 * vetor de explosão, que é exatamente o que a montagem precisa.
 *
 * O nível de detalhe é o de uma bancada de verdade: parafusos com fenda,
 * suportes de aço sobre os conectores, cabos coaxiais de antena, esferas de
 * solda na borda do processador, centenas de passivos com terminais, câmara
 * de vapor, folhas de grafite, barril de lente em degraus. O que se repete
 * (passivos, parafusos, esferas, furos) vai em `InstancedMesh` — uma chamada
 * de desenho para centenas de peças.
 *
 * Unidade: 1 = 1 cm. O aparelho tem 7,2 × 15,4 × 0,82 cm — as medidas de um
 * topo de linha atual. É um aparelho genérico, de propósito: nenhuma marca
 * de fabricante, nenhum desenho reconhecível de modelo.
 *
 * Eixos: x para a direita, y para cima (topo do aparelho), z para fora da
 * tela. A frente é +z.
 */

export const W = 7.2
export const H = 15.4
const R = 1.05
export const E = 0.82

const TAU = Math.PI * 2

/* ── Geometria utilitária ────────────────────────────────────────────── */

function tracar<T extends Path>(p: T, w: number, h: number, r: number, cx = 0, cy = 0): T {
  const x = cx - w / 2
  const y = cy - h / 2
  const k = Math.min(r, w / 2, h / 2)
  p.moveTo(x + k, y)
  p.lineTo(x + w - k, y)
  p.absarc(x + w - k, y + k, k, -Math.PI / 2, 0, false)
  p.lineTo(x + w, y + h - k)
  p.absarc(x + w - k, y + h - k, k, 0, Math.PI / 2, false)
  p.lineTo(x + k, y + h)
  p.absarc(x + k, y + h - k, k, Math.PI / 2, Math.PI, false)
  p.lineTo(x, y + k)
  p.absarc(x + k, y + k, k, Math.PI, Math.PI * 1.5, false)
  return p
}

const forma = (w: number, h: number, r: number, cx = 0, cy = 0) =>
  tracar(new Shape(), w, h, r, cx, cy)
const furo = (w: number, h: number, r: number, cx = 0, cy = 0) =>
  tracar(new Path(), w, h, r, cx, cy)
function furoRedondo(cx: number, cy: number, r: number): Path {
  const p = new Path()
  p.absarc(cx, cy, r, 0, TAU, true)
  return p
}

/**
 * Extrusão centrada em z = 0, com espessura TOTAL `esp`. O chanfro do
 * three.js cresce para fora do contorno; aqui ele é descontado, para que a
 * peça tenha exatamente a largura pedida.
 */
function placa(
  w: number,
  h: number,
  r: number,
  esp: number,
  chanfro = 0,
  opcoes: { cx?: number; cy?: number; furos?: Path[]; curvas?: number } = {},
): ExtrudeGeometry {
  const { cx = 0, cy = 0, furos = [], curvas = 16 } = opcoes
  const b = Math.min(chanfro, esp / 2.2)
  const s = forma(w - b * 1.8, h - b * 1.8, Math.max(0.01, r - b), cx, cy)
  s.holes.push(...furos)
  const prof = Math.max(0.002, esp - b * 2)
  const g = new ExtrudeGeometry(s, {
    depth: prof,
    bevelEnabled: b > 0,
    bevelThickness: b,
    bevelSize: b * 0.9,
    bevelSegments: b > 0 ? 3 : 0,
    curveSegments: curvas,
  })
  g.translate(0, 0, -prof / 2)
  return g
}

/** UV planar em xy: o retângulo (x0, y0, w, h) vira [0,1]². */
function mapearUV(g: BufferGeometry, x0: number, y0: number, w: number, h: number) {
  const pos = g.getAttribute('position')
  const uv = new Float32Array(pos.count * 2)
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) - x0) / w
    uv[i * 2 + 1] = (pos.getY(i) - y0) / h
  }
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  return g
}

/**
 * A forma da área acesa da tela, com UV de 0 a 1 — a cena usa a mesma
 * forma para o reflexo que atravessa o vidro.
 */
export function geometriaDaTela(curvas = 18): BufferGeometry {
  const tw = W - 0.42
  const th = H - 0.42
  return mapearUV(new ShapeGeometry(forma(tw, th, R - 0.2), curvas), -tw / 2, -th / 2, tw, th)
}

/** Um plano w × h com UV de 0 a 1 — para as faces texturizadas. */
const plano = (w: number, h: number) => mapearUV(new PlaneGeometry(w, h), -w / 2, -h / 2, w, h)

/**
 * Fita — o cabo flexível. Uma tira de largura `largura` ao longo de uma curva
 * suave pelos `pontos`. `lado` fixa a direção da largura (para fitas que
 * dobram num plano); sem ele, a largura fica no plano da tela.
 */
function fita(pontos: Vector3[], largura: number, lado?: Vector3): BufferGeometry {
  const curva = new CatmullRomCurve3(pontos, false, 'centripetal')
  const n = 48
  const pos: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  const z = new Vector3(0, 0, 1)
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const p = curva.getPointAt(t)
    const tg = curva.getTangentAt(t)
    const l = lado ? lado.clone() : new Vector3().crossVectors(tg, z).normalize()
    if (l.lengthSq() < 1e-6) l.set(1, 0, 0)
    l.multiplyScalar(largura / 2)
    pos.push(p.x - l.x, p.y - l.y, p.z - l.z, p.x + l.x, p.y + l.y, p.z + l.z)
    uv.push(0, t, 1, t)
    if (i < n) {
      const a = i * 2
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

/** Cabo redondo (coaxial de antena) ao longo de pontos. */
const cabo = (pontos: Vector3[], raio: number) =>
  new TubeGeometry(new CatmullRomCurve3(pontos, false, 'centripetal'), 64, raio, 8, false)

/* ── Materiais ───────────────────────────────────────────────────────── */

/**
 * A paleta física. Cada peça recebe CÓPIAS destes materiais (ver
 * `Peca.materiais`), para que o destaque acenda só a peça da vez.
 */
function criarMateriais(compacto: boolean, escovado: Texture) {
  return {
    vidroFrontal: new MeshPhysicalMaterial({
      color: '#0a0c10',
      metalness: 0,
      roughness: 0.03,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      transparent: true,
      opacity: compacto ? 0.22 : 0.18,
      envMapIntensity: 0.9,
      depthWrite: false,
    }),
    // Titânio escovado: os riscos no mapa de rugosidade fazem o reflexo
    // "correr" ao longo da moldura.
    titanio: new MeshStandardMaterial({
      color: '#a2a9b3',
      metalness: 1,
      roughness: 0.32,
      roughnessMap: escovado,
    }),
    aluminio: new MeshStandardMaterial({ color: '#b6bcc5', metalness: 1, roughness: 0.42 }),
    aluminioEscuro: new MeshStandardMaterial({ color: '#4a505a', metalness: 1, roughness: 0.38 }),
    plasticoPreto: new MeshStandardMaterial({ color: '#0e0f12', metalness: 0, roughness: 0.55 }),
    borracha: new MeshStandardMaterial({ color: '#050506', metalness: 0, roughness: 0.9 }),
    espuma: new MeshStandardMaterial({ color: '#111214', metalness: 0, roughness: 1 }),
    painel: new MeshStandardMaterial({ color: '#08090b', metalness: 0.4, roughness: 0.35 }),
    folhaCobre: new MeshStandardMaterial({ color: '#7a4a2a', metalness: 1, roughness: 0.45 }),
    ouro: new MeshStandardMaterial({ color: '#d6a64a', metalness: 1, roughness: 0.22 }),
    cobre: new MeshStandardMaterial({ color: '#d0804a', metalness: 1, roughness: 0.28 }),
    aco: new MeshStandardMaterial({ color: '#d5d9df', metalness: 1, roughness: 0.3 }),
    acoEscovado: new MeshStandardMaterial({
      color: '#c3c8cf',
      metalness: 1,
      roughness: 0.4,
      roughnessMap: escovado,
    }),
    niquel: new MeshStandardMaterial({ color: '#c9c3b2', metalness: 1, roughness: 0.35 }),
    solda: new MeshStandardMaterial({ color: '#c7cbd0', metalness: 1, roughness: 0.2 }),
    flex: new MeshStandardMaterial({
      color: '#c87a22',
      metalness: 0.15,
      roughness: 0.42,
      side: DoubleSide,
    }),
    flexEscuro: new MeshStandardMaterial({
      color: '#1a1c20',
      metalness: 0.1,
      roughness: 0.6,
      side: DoubleSide,
    }),
    caboPreto: new MeshStandardMaterial({ color: '#16171a', metalness: 0.1, roughness: 0.45 }),
    capacitor: new MeshStandardMaterial({ color: '#b39a72', metalness: 0, roughness: 0.6 }),
    resistor: new MeshStandardMaterial({ color: '#1b1c1f', metalness: 0, roughness: 0.5 }),
    indutor: new MeshStandardMaterial({ color: '#4b4f56', metalness: 0.3, roughness: 0.6 }),
    terminal: new MeshStandardMaterial({ color: '#c8ccd2', metalness: 1, roughness: 0.3 }),
    pcbVerde: new MeshStandardMaterial({ color: '#163a2c', metalness: 0.1, roughness: 0.6 }),
    ferrite: new MeshStandardMaterial({ color: '#141518', metalness: 0.2, roughness: 0.8 }),
    vidroTraseiro: new MeshPhysicalMaterial({
      color: '#2a2f37',
      metalness: 0.05,
      roughness: 0.5,
      clearcoat: 0.35,
      clearcoatRoughness: 0.4,
    }),
    vidroIlha: new MeshPhysicalMaterial({
      color: '#22262d',
      metalness: 0.05,
      roughness: 0.08,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    }),
    lente: new MeshPhysicalMaterial({
      color: '#030406',
      metalness: 0.2,
      roughness: 0.02,
      clearcoat: 1,
      clearcoatRoughness: 0,
      // O reflexo arroxeado/esverdeado do tratamento antirreflexo de lente.
      iridescence: 1,
      iridescenceIOR: 1.6,
      iridescenceThicknessRange: [260, 520],
    }),
    led: new MeshStandardMaterial({
      color: '#f3eccd',
      metalness: 0,
      roughness: 0.25,
      emissive: '#3a3420',
    }),
    ledAmbar: new MeshStandardMaterial({
      color: '#f1c27d',
      metalness: 0,
      roughness: 0.25,
      emissive: '#3a2810',
    }),
  }
}

/* ── A peça ──────────────────────────────────────────────────────────── */

export type Peca = {
  id: IdPeca | 'vidro'
  /** Posição + explosão. */
  grupo: Group
  /** Pivô no centro da peça: é ele que gira quando a peça entra em foco. */
  pivo: Group
  /** Centro da peça montada, em coordenadas do aparelho. */
  centro: Vector3
  /** Raio da esfera que envolve a peça — para enquadrar a câmera. */
  raio: number
  /** Deslocamento da peça com o aparelho todo aberto (z em camadas). */
  explosao: Vector3
  /** Rotação do pivô quando a peça está em foco (mostrar o lado bom). */
  giroFoco?: [number, number, number]
  materiais: MeshStandardMaterial[]
}

export type Aparelho = {
  raiz: Group
  pecas: Peca[]
  /** O material da tela: a cena troca a textura (diagnóstico, pronto, conversa…). */
  tela: MeshStandardMaterial
  texturas: { diagnostico: Texture; pronto: Texture; marca: Texture }
  /** Todas as texturas, para a cena enviar à GPU antes do primeiro quadro. */
  todasAsTexturas: Texture[]
  descartar: () => void
}

/* ── Construção ──────────────────────────────────────────────────────── */

export function construirAparelho(compacto: boolean): Aparelho {
  const texturas: Texture[] = []
  const tex = <T extends Texture>(t: T) => {
    texturas.push(t)
    return t
  }
  const escovado = tex(texturaEscovado())
  // As UV das extrusões vêm em centímetros: com repetição alta, os riscos do
  // escovado viravam listras finíssimas que cintilavam com o aparelho
  // girando (o "tremor" visto por trás). Uma textura a cada ~7 cm.
  escovado.repeat.set(0.14, 0.14)
  escovado.anisotropy = 8
  const M = criarMateriais(compacto, escovado)
  const raiz = new Group()
  const pecas: Peca[] = []
  const geometrias = new Set<BufferGeometry>()
  const curvas = compacto ? 10 : 18
  const base = new Set<Material>(Object.values(M))
  const avulsos = new Set<Material>()

  // A tela acesa: o material existe antes das peças, porque é o único que
  // NÃO é copiado por peça (a troca de textura vale para o aparelho).
  const tDiagnostico = tex(texturaTela('diagnostico'))
  const tPronto = tex(texturaTela('pronto'))
  const tMarca = tex(texturaTela('marca'))
  const telaMaterial = new MeshStandardMaterial({
    color: '#000000',
    emissive: '#ffffff',
    emissiveMap: tDiagnostico,
    emissiveIntensity: 1,
    roughness: 0.3,
    metalness: 0,
    // A tela emite luz: fora do mapeamento de tons, as cores saem como foram
    // desenhadas (com ACES, o verde e o branco ficam acinzentados).
    toneMapped: false,
    // A tela fica a 0,15 mm do painel: sem o deslocamento de profundidade,
    // os dois disputam o mesmo pixel e a tela "pisca" com a câmera longe.
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  })

  /** Monta a peça: os filhos ficam em coordenadas do aparelho. */
  function novaPeca(
    id: Peca['id'],
    explosao: [number, number, number],
    montar: (g: Group) => void,
    giroFoco?: Peca['giroFoco'],
  ): Peca {
    const conteudo = new Group()
    montar(conteudo)

    const caixa = new Box3().setFromObject(conteudo)
    const centro = caixa.getCenter(new Vector3())
    const raio = caixa.getSize(new Vector3()).length() / 2

    const pivo = new Group()
    conteudo.position.copy(centro).multiplyScalar(-1)
    pivo.add(conteudo)
    const grupo = new Group()
    grupo.position.copy(centro)
    grupo.add(pivo)
    raiz.add(grupo)

    // Cópias dos materiais, só desta peça — o destaque acende uma peça só.
    const copias = new Map<Material, MeshStandardMaterial>()
    conteudo.traverse((o) => {
      if (!(o instanceof Mesh)) return
      geometrias.add(o.geometry)
      const m = o.material as MeshStandardMaterial
      if (m === telaMaterial) return
      let c = copias.get(m)
      if (!c) {
        c = m.clone()
        copias.set(m, c)
        // Material avulso (criado na própria peça): a cópia o substitui.
        if (!base.has(m)) avulsos.add(m)
      }
      o.material = c
    })

    const peca: Peca = {
      id,
      grupo,
      pivo,
      centro,
      raio,
      explosao: new Vector3(...explosao),
      giroFoco,
      materiais: [...copias.values()],
    }
    pecas.push(peca)
    return peca
  }

  const malha = (geo: BufferGeometry, mat: Material, x = 0, y = 0, z = 0) => {
    const m = new Mesh(geo, mat)
    m.position.set(x, y, z)
    return m
  }

  /** Caixa com cantos levemente arredondados (a maioria dos componentes). */
  const bloco = (
    w: number,
    h: number,
    d: number,
    mat: Material,
    x: number,
    y: number,
    z: number,
    r = 0.04,
  ) => malha(placa(w, h, r, d, Math.min(0.02, d / 4), { curvas: 4 }), mat, x, y, z)

  /** Uma face texturizada, deitada no plano da tela, voltada para +z. */
  const face = (
    w: number,
    h: number,
    mat: Material,
    x: number,
    y: number,
    z: number,
    girar = 0,
  ) => {
    const m = malha(plano(w, h), mat, x, y, z)
    m.rotation.z = girar
    return m
  }

  // Geometrias compartilhadas pelas instâncias.
  const unit = new BoxGeometry(1, 1, 1)
  const cilindro = new CylinderGeometry(1, 1, 1, 14).rotateX(Math.PI / 2)
  const esfera = new SphereGeometry(1, 8, 6)
  const m4 = new Matrix4()
  const qz = new Quaternion()
  const eixoZ = new Vector3(0, 0, 1)

  /**
   * Instâncias: uma geometria, um material, muitas posições. Cada item é
   * [x, y, z, sx, sy, sz, giro em z].
   */
  const instancias = (geo: BufferGeometry, mat: Material, itens: number[][]) => {
    const im = new InstancedMesh(geo, mat, Math.max(1, itens.length))
    itens.forEach(([x, y, z, sx, sy, sz, rz = 0], i) => {
      qz.setFromAxisAngle(eixoZ, rz)
      m4.compose(new Vector3(x, y, z), qz, new Vector3(sx, sy, sz))
      im.setMatrixAt(i, m4)
    })
    im.count = itens.length
    return im
  }

  /**
   * Parafusos: a cabeça de aço e a fenda em cruz, voltados para +z (ou −z
   * com `costas`). Duas instâncias por chamada.
   */
  const parafusos = (g: Group, pontos: [number, number, number][], r = 0.1, costas = false) => {
    const s = costas ? -1 : 1
    g.add(
      instancias(
        cilindro,
        M.aco,
        pontos.map(([x, y, z]) => [x, y, z, r, r, 0.05]),
      ),
    )
    g.add(
      instancias(
        unit,
        M.plasticoPreto,
        pontos.flatMap(([x, y, z]) => [
          [x, y, z + s * 0.026, r * 1.3, r * 0.22, 0.012, Math.PI / 4],
          [x, y, z + s * 0.026, r * 1.3, r * 0.22, 0.012, -Math.PI / 4],
        ]),
      ),
    )
  }

  /* 1. Vidro frontal ─────────────────────────────────────────────────── */
  novaPeca('vidro', [0, 0.6, 3], (g) => {
    // O vidro fica 0,1 mm acima da moldura: no mesmo plano, a borda dos dois
    // cintila com o aparelho girando. (O vidro traseiro, idem, por trás.)
    g.add(
      malha(
        placa(W - 0.08, H - 0.08, R - 0.03, 0.07, 0.03, { curvas }),
        M.vidroFrontal,
        0,
        0,
        0.385,
      ),
    )
    // A borda preta impressa por dentro do vidro (a moldura da tela).
    const borda = forma(W - 0.12, H - 0.12, R - 0.05)
    borda.holes.push(furo(W - 0.36, H - 0.36, R - 0.17))
    g.add(malha(new ShapeGeometry(borda, curvas), M.borracha, 0, 0, 0.3385))
  })

  /* 2. Tela (OLED) ───────────────────────────────────────────────────── */
  const tVersoOled = tex(texturaVersoOled())
  novaPeca('tela', [0, 0.35, 2], (g) => {
    // O painel em camadas: OLED, camada de toque (o fio dourado na borda).
    g.add(malha(placa(W - 0.3, H - 0.3, R - 0.13, 0.1, 0.015, { curvas }), M.painel, 0, 0, 0.285))
    const toque = forma(W - 0.34, H - 0.34, R - 0.15)
    toque.holes.push(furo(W - 0.4, H - 0.4, R - 0.18))
    g.add(malha(new ShapeGeometry(toque, curvas), M.ouro, 0, 0, 0.3362))
    const tw = W - 0.42
    const th = H - 0.42
    const geoTela = mapearUV(
      new ShapeGeometry(forma(tw, th, R - 0.2), curvas),
      -tw / 2,
      -th / 2,
      tw,
      th,
    )
    g.add(malha(geoTela, telaMaterial, 0, 0, 0.3365))
    // O verso: a malha de cobre que espalha calor, a espuma e as etiquetas.
    const verso = malha(
      mapearUV(
        new ShapeGeometry(forma(W - 0.8, H - 1.6, 0.6), 8),
        -(W - 0.8) / 2,
        -(H - 1.6) / 2,
        W - 0.8,
        H - 1.6,
      ),
      new MeshStandardMaterial({ map: tVersoOled, metalness: 0.9, roughness: 0.4 }),
      0,
      0.3,
      0.232,
    )
    verso.rotation.x = Math.PI
    g.add(verso)
    g.add(bloco(3.4, 4.2, 0.012, M.espuma, -0.6, 2.4, 0.228, 0.2))
    g.add(bloco(1.6, 0.9, 0.006, M.plasticoPreto, 1.6, -4.4, 0.228, 0.06))
    // O flex da tela dobra por trás, no pé do painel, e termina no conector.
    g.add(
      new Mesh(
        fita(
          [
            new Vector3(0, -H / 2 + 0.25, 0.27),
            new Vector3(0, -H / 2 + 0.06, 0.22),
            new Vector3(0, -H / 2 + 0.18, 0.15),
            new Vector3(0, -H / 2 + 0.75, 0.15),
            new Vector3(0.6, -H / 2 + 1.2, 0.15),
          ],
          1.3,
          new Vector3(1, 0, 0),
        ),
        M.flex,
      ),
    )
    // O CI de vídeo e os passivos colados no flex, o reforço de aço e a
    // cabeça do conector.
    g.add(bloco(0.8, 0.25, 0.04, M.resistor, 0, -H / 2 + 0.55, 0.13))
    g.add(
      instancias(
        unit,
        M.capacitor,
        Array.from({ length: 10 }, (_, i) => [
          -0.5 + (i % 5) * 0.25,
          -H / 2 + 0.85 + Math.floor(i / 5) * 0.12,
          0.135,
          0.07,
          0.035,
          0.03,
        ]),
      ),
    )
    g.add(bloco(0.85, 0.42, 0.015, M.acoEscovado, 0.6, -H / 2 + 1.25, 0.16, 0.04))
    g.add(bloco(0.7, 0.3, 0.06, M.plasticoPreto, 0.6, -H / 2 + 1.25, 0.12, 0.03))
  })

  /* 3. Chassi (moldura + placa média) ───────────────────────────────── */
  const tVapor = tex(texturaCamaraVapor())
  const tGrafite = tex(texturaGrafite('GRAPHITE TIM · SMH-A1'))
  novaPeca(
    'chassi',
    [0, 0.15, 1],
    (g) => {
      // A moldura em titânio escovado: um anel com bordas arredondadas.
      g.add(
        malha(
          placa(W, H, R, E, 0.07, { furos: [furo(W - 0.44, H - 0.44, R - 0.2)], curvas }),
          M.titanio,
        ),
      )
      // A placa média, com recortes de alívio.
      const recortes = [
        furoRedondo(-2.2, -3.2, 0.3),
        furoRedondo(2.2, -3.2, 0.3),
        furo(2.2, 0.6, 0.3, 0, 1.6),
        furo(1.2, 0.5, 0.25, -1.9, 5.55),
      ]
      g.add(
        malha(
          placa(W - 0.4, H - 0.4, R - 0.2, 0.05, 0, { furos: recortes, curvas }),
          M.aluminio,
          0,
          0,
          0.2,
        ),
      )
      // Nervuras de reforço e as torres de parafuso.
      for (const [x, y, w, h] of [
        [0, 2.75, 6.2, 0.08],
        [0, -5.0, 6.2, 0.08],
        [-3.0, -1.2, 0.08, 7.2],
        [3.0, -1.2, 0.08, 7.2],
      ]) {
        g.add(bloco(w, h, 0.06, M.aluminio, x, y, 0.255, 0.02))
      }
      const torres: [number, number][] = [
        [-3.05, 6.95],
        [3.05, 6.95],
        [-3.05, 2.85],
        [3.05, 2.85],
        [-3.05, -6.85],
        [3.05, -6.85],
        [0, -6.9],
        [3.1, 5.4],
      ]
      g.add(
        instancias(
          cilindro,
          M.aluminio,
          torres.map(([x, y]) => [x, y, 0.255, 0.16, 0.16, 0.08]),
        ),
      )
      // A câmara de vapor de cobre, sobre a região do processador.
      g.add(
        face(
          2.6,
          3.0,
          new MeshStandardMaterial({ map: tVapor, metalness: 1, roughness: 0.35 }),
          1.3,
          4.9,
          0.2295,
        ),
      )
      // A folha de grafite e a fita adesiva da borda.
      g.add(
        face(
          4.8,
          5.2,
          new MeshStandardMaterial({ map: tGrafite, metalness: 0.3, roughness: 0.7 }),
          0,
          -1.6,
          0.2285,
        ),
      )
      const adesivo = forma(W - 0.5, H - 0.5, R - 0.25)
      adesivo.holes.push(furo(W - 0.72, H - 0.72, R - 0.34))
      g.add(malha(new ShapeGeometry(adesivo, curvas), M.flexEscuro, 0, 0, 0.2272))
      // Botões: volume à esquerda, liga/desliga à direita, com a base
      // embutida na moldura.
      const botao = (y: number, comp: number, lado: number) => {
        g.add(bloco(0.1, comp, 0.26, M.titanio, lado * (W / 2 + 0.03), y, 0, 0.04))
        g.add(bloco(0.04, comp + 0.08, 0.3, M.aluminioEscuro, lado * (W / 2 - 0.02), y, 0, 0.03))
      }
      botao(3.3, 0.95, -1)
      botao(2.1, 0.95, -1)
      botao(2.7, 1.5, 1)
      // As faixas de antena: o plástico que interrompe o metal.
      const faixa = (x: number, y: number, horizontal: boolean) =>
        g.add(
          malha(
            new BoxGeometry(horizontal ? 0.06 : 0.25, horizontal ? 0.25 : 0.06, E * 0.9),
            M.plasticoPreto,
            x,
            y,
            0,
          ),
        )
      faixa(-W / 2 + 0.08, 6.0, false)
      faixa(W / 2 - 0.08, 6.0, false)
      faixa(-W / 2 + 0.08, -6.0, false)
      faixa(W / 2 - 0.08, -6.0, false)
      faixa(1.7, H / 2 - 0.08, true)
      faixa(-1.7, -H / 2 + 0.08, true)
      // O pé: a porta USB-C, os furos do alto-falante e do microfone, e os
      // dois parafusos pentalobe.
      g.add(bloco(0.95, 0.06, 0.34, M.borracha, 0, -H / 2 - 0.01, 0, 0.15))
      const furosSom: number[][] = []
      for (let i = 0; i < 12; i++) {
        const lado = i < 6 ? -1 : 1
        furosSom.push([lado * (1.0 + (i % 6) * 0.2), -H / 2 - 0.005, 0, 0.055, 0.055, 0.05])
      }
      const furoTopo = cilindro.clone().rotateX(Math.PI / 2)
      g.add(instancias(furoTopo, M.borracha, furosSom))
      g.add(instancias(furoTopo, M.borracha, [[-1.2, H / 2 + 0.005, 0, 0.05, 0.05, 0.05]]))
      g.add(
        instancias(
          furoTopo,
          M.aco,
          [-0.75, 0.75].map((x) => [x, -H / 2 - 0.01, 0, 0.06, 0.06, 0.04]),
        ),
      )
      // A gaveta do chip, na lateral esquerda, com o furo de ejetar.
      g.add(bloco(0.04, 1.2, 0.32, M.aluminioEscuro, -W / 2 - 0.005, -1.2, 0, 0.12))
      const furoLado = cilindro.clone().rotateY(Math.PI / 2)
      g.add(instancias(furoLado, M.borracha, [[-W / 2 - 0.03, -1.65, 0, 0.03, 0.04, 0.04]]))
    },
    [0.32, 0, 0],
  )

  /* 4. Placa lógica ─────────────────────────────────────────────────── */
  const placaY = 4.88
  const placaW = 6.7
  const placaH = 4.5
  const furoCam = { x: -1.8, y: 5.55, w: 2.75, h: 2.75 }
  const comps: (Retangulo & { d: number; tipo: string; linhas?: string[] })[] = [
    { x: 1.25, y: 5.35, w: 1.45, h: 1.45, d: 0.07, tipo: 'soc' },
    { x: 0.85, y: 3.45, w: 1.35, h: 1.0, d: 0.08, tipo: 'chip', linhas: ['UFS 4.0', '256 GB'] },
    { x: 2.65, y: 3.55, w: 0.75, h: 0.75, d: 0.05, tipo: 'chip', linhas: ['PM', 'A1'] },
    { x: 2.55, y: 6.4, w: 1.35, h: 1.05, d: 0.14, tipo: 'blindagem' },
    { x: -2.4, y: 3.45, w: 1.2, h: 1.0, d: 0.07, tipo: 'sim' },
    { x: -0.9, y: 2.95, w: 0.7, h: 0.28, d: 0.07, tipo: 'conector' },
    { x: 2.65, y: 2.88, w: 0.7, h: 0.26, d: 0.07, tipo: 'conector' },
    { x: -0.05, y: 6.4, w: 0.26, h: 0.6, d: 0.07, tipo: 'conector' },
    { x: -0.05, y: 4.7, w: 0.26, h: 0.6, d: 0.07, tipo: 'conector' },
    { x: 2.0, y: 4.2, w: 0.5, h: 0.5, d: 0.04, tipo: 'chip', linhas: ['AU', '7'] },
    { x: 3.0, y: 4.75, w: 0.4, h: 0.6, d: 0.04, tipo: 'chip', linhas: ['RF'] },
    { x: 0.75, y: 6.98, w: 0.35, h: 0.2, d: 0.05, tipo: 'cristal' },
    { x: -1.55, y: 2.85, w: 0.22, h: 0.22, d: 0.06, tipo: 'ufl' },
    { x: 0.3, y: 6.5, w: 0.22, h: 0.22, d: 0.06, tipo: 'ufl' },
  ]

  novaPeca(
    'placa',
    [0, 1.2, 0],
    (g) => {
      const furoPlaca = furo(furoCam.w, furoCam.h, 0.5, furoCam.x, furoCam.y)
      g.add(
        malha(
          placa(placaW, placaH, 0.45, 0.08, 0.01, { cy: placaY, furos: [furoPlaca], curvas }),
          M.resistor,
        ),
      )
      // A face de cima, com a textura da placa (trilhas, vias, serigrafia).
      const x0 = -placaW / 2
      const y0 = placaY - placaH / 2
      const pxPorCm = compacto ? 130 : 220
      const largPx = Math.round(placaW * pxPorCm)
      const altPx = Math.round(placaH * pxPorCm)
      const paraPx = (x: number, y: number): [number, number] => [
        ((x - x0) / placaW) * largPx,
        (1 - (y - y0) / placaH) * altPx,
      ]
      const tPlaca = tex(texturaPlaca(largPx, altPx, comps, paraPx, pxPorCm))
      const faceForma = forma(placaW - 0.02, placaH - 0.02, 0.44, 0, placaY)
      faceForma.holes.push(furo(furoCam.w, furoCam.h, 0.5, furoCam.x, furoCam.y))
      const faceGeo = mapearUV(new ShapeGeometry(faceForma, curvas), x0, y0, placaW, placaH)
      g.add(
        malha(
          faceGeo,
          new MeshStandardMaterial({ map: tPlaca, roughness: 0.55, metalness: 0.1 }),
          0,
          0,
          0.0405,
        ),
      )

      const tBlindagem = tex(texturaBlindagem())
      const tConector = tex(texturaConector())
      const matBlindagem = new MeshStandardMaterial({
        map: tBlindagem,
        metalness: 1,
        roughness: 0.36,
      })
      const topo = 0.04
      const bolas: number[][] = []
      for (const c of comps) {
        if (c.tipo === 'soc') {
          // Substrato, as esferas de solda na borda (BGA), o encapsulamento e
          // a memória empilhada por cima (PoP).
          g.add(bloco(c.w, c.h, 0.04, M.folhaCobre, c.x, c.y, topo + 0.035, 0.05))
          const n = 13
          for (let i = 0; i < n; i++) {
            const t = -c.w / 2 + 0.06 + (i * (c.w - 0.12)) / (n - 1)
            for (const s of [-1, 1]) {
              bolas.push([c.x + t, c.y + s * (c.h / 2 - 0.035), topo + 0.012, 0.024, 0.024, 0.016])
              bolas.push([c.x + s * (c.w / 2 - 0.035), c.y + t, topo + 0.012, 0.024, 0.024, 0.016])
            }
          }
          g.add(bloco(c.w - 0.1, c.h - 0.1, 0.05, M.resistor, c.x, c.y, topo + 0.08, 0.05))
          const tMem = tex(texturaChip(['SMH S1', 'LPDDR5X', '12 GB'], true))
          g.add(bloco(c.w - 0.18, c.h - 0.18, 0.06, M.resistor, c.x, c.y, topo + 0.135, 0.05))
          g.add(
            face(
              c.w - 0.22,
              c.h - 0.22,
              new MeshStandardMaterial({ map: tMem, roughness: 0.45, metalness: 0.1 }),
              c.x,
              c.y,
              topo + 0.166,
            ),
          )
        } else if (c.tipo === 'chip') {
          g.add(bloco(c.w, c.h, c.d, M.resistor, c.x, c.y, topo + c.d / 2, 0.03))
          const tChip = tex(texturaChip(c.linhas ?? []))
          g.add(
            face(
              c.w - 0.04,
              c.h - 0.04,
              new MeshStandardMaterial({ map: tChip, roughness: 0.5 }),
              c.x,
              c.y,
              topo + c.d + 0.001,
            ),
          )
        } else if (c.tipo === 'blindagem') {
          // A blindagem estampada: o quadro soldado na placa e a tampa, com a
          // folha de grafite térmico por cima.
          g.add(bloco(c.w + 0.06, c.h + 0.06, 0.06, M.aco, c.x, c.y, topo + 0.03, 0.05))
          g.add(bloco(c.w, c.h, c.d, matBlindagem, c.x, c.y, topo + c.d / 2 + 0.01, 0.06))
          g.add(
            face(
              c.w - 0.25,
              c.h - 0.25,
              new MeshStandardMaterial({ map: tGrafite, roughness: 0.7, metalness: 0.3 }),
              c.x,
              c.y,
              topo + c.d + 0.012,
            ),
          )
        } else if (c.tipo === 'sim') {
          g.add(bloco(c.w, c.h, c.d, M.aco, c.x, c.y, topo + c.d / 2, 0.08))
          // As seis molas de contato do leitor de chip.
          for (let i = 0; i < 6; i++) {
            g.add(
              bloco(
                0.08,
                0.3,
                0.02,
                M.ouro,
                c.x - 0.35 + (i % 3) * 0.35,
                c.y + (i < 3 ? 0.22 : -0.22),
                topo + c.d + 0.01,
                0.02,
              ),
            )
          }
        } else if (c.tipo === 'conector') {
          g.add(
            malha(
              new BoxGeometry(c.w, c.h, c.d),
              new MeshStandardMaterial({ map: tConector, roughness: 0.45, metalness: 0.2 }),
              c.x,
              c.y,
              topo + c.d / 2,
            ),
          )
          // O suporte de aço que segura o conector, com o parafuso.
          const vertical = c.h > c.w
          const bw = vertical ? c.w + 0.22 : c.w + 0.3
          const bh = vertical ? c.h + 0.3 : c.h + 0.22
          g.add(bloco(bw, bh, 0.02, M.acoEscovado, c.x, c.y, topo + c.d + 0.06, 0.04))
          parafusos(
            g,
            [
              [
                c.x + (vertical ? 0 : bw / 2 + 0.05),
                c.y + (vertical ? bh / 2 + 0.05 : 0),
                topo + 0.03,
              ],
            ],
            0.07,
          )
        } else if (c.tipo === 'cristal') {
          g.add(bloco(c.w, c.h, c.d, M.aco, c.x, c.y, topo + c.d / 2, 0.03))
        } else if (c.tipo === 'ufl') {
          // O conector de antena (U.FL): base dourada e o anel do cabo.
          g.add(bloco(c.w, c.h, 0.03, M.ouro, c.x, c.y, topo + 0.015, 0.02))
          g.add(instancias(cilindro, M.aco, [[c.x, c.y, topo + 0.06, 0.08, 0.08, 0.06]]))
        }
      }
      g.add(instancias(esfera, M.solda, bolas))

      // A face de baixo: as blindagens do modem e do RF, e o chip do modem.
      g.add(bloco(3.2, 3.2, 0.12, matBlindagem, 1.4, 5.0, -0.1, 0.1))
      g.add(bloco(2.6, 1.1, 0.1, matBlindagem, -1.8, 3.3, -0.09, 0.08))
      g.add(bloco(0.9, 0.9, 0.05, M.resistor, -2.7, 6.6, -0.07, 0.03))

      // Os passivos: capacitores, resistores e indutores 0201/0402, cada um
      // com os dois terminais metálicos — numa instância por material.
      const rnd = aleatorio(11)
      const total = compacto ? 220 : 820
      const livres: [number, number, number, number][] = []
      const ocupado = (x: number, y: number) => {
        if (
          Math.abs(x - furoCam.x) < furoCam.w / 2 + 0.08 &&
          Math.abs(y - furoCam.y) < furoCam.h / 2 + 0.08
        )
          return true
        for (const c of comps) {
          if (Math.abs(x - c.x) < c.w / 2 + 0.12 && Math.abs(y - c.y) < c.h / 2 + 0.12) return true
        }
        return false
      }
      let tentativas = 0
      while (livres.length < total && tentativas < total * 40) {
        tentativas++
        const x = (rnd() - 0.5) * (placaW - 0.35)
        const y = placaY + (rnd() - 0.5) * (placaH - 0.35)
        if (ocupado(x, y)) continue
        const grande = rnd() > 0.82
        const comp = grande ? 0.1 : 0.06
        const larg = grande ? 0.05 : 0.032
        // Fileiras: a maioria dos passivos fica alinhada em x ou em y.
        const ang = rnd() > 0.5 ? 0 : Math.PI / 2
        livres.push([x, y, ang, grande ? comp : -comp])
        // Vizinhos alinhados — passivos andam em grupos.
        for (let k = 1; k <= 3 && rnd() > 0.35; k++) {
          const dx = ang === 0 ? 0 : (comp + 0.03) * k
          const dy = ang === 0 ? (larg + 0.03) * k : 0
          if (!ocupado(x + dx, y + dy)) livres.push([x + dx, y + dy, ang, grande ? comp : -comp])
        }
      }
      const capacitores: number[][] = []
      const resistores: typeof capacitores = []
      const indutores: typeof capacitores = []
      const terminais: typeof capacitores = []
      livres.forEach(([x, y, ang, comp], i) => {
        const tam = Math.abs(comp)
        const larg = tam > 0.08 ? 0.05 : 0.032
        const alt = tam > 0.08 ? 0.05 : 0.03
        const corpo = [x, y, topo + alt / 2, tam * 0.62, larg, alt, ang]
        if (i % 23 === 0) {
          indutores.push([x, y, topo + 0.04, 0.12, 0.12, 0.08, ang])
          return
        }
        if (i % 3 === 0) resistores.push(corpo)
        else capacitores.push(corpo)
        for (const s of [-1, 1]) {
          const off = new Vector3(s * tam * 0.4, 0, 0).applyAxisAngle(eixoZ, ang)
          terminais.push([
            x + off.x,
            y + off.y,
            topo + alt / 2,
            tam * 0.2,
            larg * 1.02,
            alt * 1.02,
            ang,
          ])
        }
      })
      g.add(instancias(unit, M.capacitor, capacitores))
      g.add(instancias(unit, M.resistor, resistores))
      g.add(instancias(unit, M.indutor, indutores))
      g.add(instancias(unit, M.terminal, terminais))

      // Parafusos da placa.
      parafusos(g, [
        [3.05, 2.85, topo + 0.04],
        [-3.05, 2.85, topo + 0.04],
        [0.35, 7.0, topo + 0.04],
        [3.1, 5.4, topo + 0.04],
      ])
    },
    [0.2, -0.35, 0],
  )

  /* 5. Bateria ──────────────────────────────────────────────────────── */
  novaPeca(
    'bateria',
    [0, -0.6, 0],
    (g) => {
      const bw = 6.5
      const bh = 7.7
      const by = -1.55
      g.add(
        malha(placa(bw, bh, 0.42, 0.48, 0.08, { cy: by, curvas }), M.aluminioEscuro, 0, 0, -0.06),
      )
      // A costura da bolsa: a aba selada que sobra no topo da célula.
      g.add(bloco(bw - 0.6, 0.18, 0.04, M.aluminioEscuro, 0, by + bh / 2 + 0.06, 0.02, 0.03))
      const tBat = tex(texturaBateria())
      const lw = bw - 0.3
      const lh = bh - 0.3
      g.add(
        malha(
          mapearUV(
            new ShapeGeometry(forma(lw, lh, 0.35, 0, by), curvas),
            -lw / 2,
            by - lh / 2,
            lw,
            lh,
          ),
          new MeshStandardMaterial({ map: tBat, roughness: 0.38, metalness: 0.15 }),
          0,
          0,
          0.181,
        ),
      )
      // As abas pretas de remoção, no pé.
      for (const x of [-1.6, 1.6]) {
        g.add(
          new Mesh(
            fita(
              [
                new Vector3(x, by - bh / 2 + 0.4, 0.19),
                new Vector3(x, by - bh / 2 - 0.05, 0.16),
                new Vector3(x, by - bh / 2 - 0.5, 0.05),
              ],
              0.55,
              new Vector3(1, 0, 0),
            ),
            M.flexEscuro,
          ),
        )
      }
      // A placa de proteção no topo: PCB verde, os chips e as abas de níquel.
      const py = by + bh / 2 - 0.05
      g.add(bloco(3.4, 0.36, 0.06, M.pcbVerde, -0.3, py, 0.22, 0.04))
      g.add(bloco(0.4, 0.22, 0.05, M.resistor, -1.2, py, 0.27, 0.02))
      g.add(bloco(0.3, 0.2, 0.05, M.resistor, -0.4, py, 0.27, 0.02))
      g.add(
        instancias(
          unit,
          M.capacitor,
          Array.from({ length: 8 }, (_, i) => [0.2 + i * 0.14, py, 0.265, 0.07, 0.035, 0.03]),
        ),
      )
      for (const x of [-1.8, 1.2]) g.add(bloco(0.36, 0.5, 0.01, M.niquel, x, py - 0.1, 0.255, 0.02))
      // O flex até a placa lógica, com a cabeça do conector.
      g.add(
        new Mesh(
          fita(
            [
              new Vector3(-0.9, py + 0.1, 0.22),
              new Vector3(-0.9, by + bh / 2 + 0.35, 0.2),
              new Vector3(-0.9, 2.85, 0.14),
            ],
            0.42,
            new Vector3(1, 0, 0),
          ),
          M.flex,
        ),
      )
      g.add(bloco(0.62, 0.24, 0.06, M.plasticoPreto, -0.9, 2.95, 0.15, 0.03))
    },
    [0, 0, 0],
  )

  /* 6. Conector de carga (sub-placa USB-C + cabos de antena) ─────────── */
  novaPeca(
    'conector',
    [0, -2.4, 0],
    (g) => {
      // A sub-placa.
      g.add(bloco(1.3, 1.1, 0.06, M.resistor, 0, -6.75, 0, 0.12))
      // O corpo da porta: um tubo achatado de aço, com a língua por dentro.
      const casca = new ExtrudeGeometry(forma(0.95, 0.32, 0.16), {
        depth: 0.75,
        bevelEnabled: false,
        curveSegments: 12,
      })
      casca.rotateX(Math.PI / 2)
      g.add(malha(casca, M.aco, 0, -H / 2 + 0.85, 0))
      g.add(bloco(0.62, 0.7, 0.07, M.plasticoPreto, 0, -H / 2 + 0.45, 0, 0.02))
      g.add(
        instancias(
          unit,
          M.ouro,
          Array.from({ length: 12 }, (_, i) => [
            -0.24 + (i % 6) * 0.096,
            -H / 2 + 0.4,
            i < 6 ? 0.04 : -0.04,
            0.04,
            0.4,
            0.01,
          ]),
        ),
      )
      // O suporte de aço que prende a porta ao chassi, com dois parafusos.
      g.add(bloco(1.6, 0.4, 0.02, M.acoEscovado, 0, -H / 2 + 1.05, 0.2, 0.05))
      parafusos(
        g,
        [
          [-0.65, -H / 2 + 1.05, 0.22],
          [0.65, -H / 2 + 1.05, 0.22],
        ],
        0.08,
      )
      // A vedação de borracha em volta da boca da porta.
      g.add(bloco(1.15, 0.05, 0.46, M.borracha, 0, -H / 2 + 0.15, 0, 0.18))
      // O microfone, as molas de antena e os passivos da sub-placa.
      g.add(instancias(cilindro, M.aco, [[0.42, -6.4, 0.08, 0.16, 0.16, 0.1]]))
      g.add(
        instancias(
          unit,
          M.ouro,
          [-0.45, 0.45].map((x) => [x, -7.05, 0.08, 0.1, 0.18, 0.12]),
        ),
      )
      g.add(
        instancias(
          unit,
          M.capacitor,
          Array.from({ length: 12 }, (_, i) => [
            -0.48 + (i % 6) * 0.1,
            -6.32 - Math.floor(i / 6) * 0.1,
            0.05,
            0.07,
            0.035,
            0.03,
          ]),
        ),
      )
      // O flex que sobe pela lateral até a placa lógica.
      g.add(
        new Mesh(
          fita(
            [
              new Vector3(0.55, -6.35, 0.06),
              new Vector3(1.6, -5.9, 0.24),
              new Vector3(3.22, -5.2, 0.24),
              new Vector3(3.22, 0, 0.24),
              new Vector3(3.22, 2.4, 0.24),
              new Vector3(2.65, 2.9, 0.12),
            ],
            0.32,
          ),
          M.flex,
        ),
      )
      g.add(bloco(0.62, 0.24, 0.06, M.plasticoPreto, 2.65, 2.88, 0.15, 0.03))
      // Os dois cabos coaxiais de antena: da placa lógica ao pé do aparelho,
      // pela lateral esquerda, com o conector dourado nas pontas.
      const coax = [
        [
          new Vector3(-1.55, 2.85, 0.12),
          new Vector3(-2.9, 2.2, 0.26),
          new Vector3(-3.2, -2, 0.26),
          new Vector3(-3.1, -5.6, 0.24),
          new Vector3(-0.5, -6.6, 0.1),
        ],
        [
          new Vector3(0.3, 6.5, 0.12),
          new Vector3(0.1, 7.05, 0.26),
          new Vector3(-2.2, 7.1, 0.28),
          new Vector3(-3.25, 5.5, 0.28),
          new Vector3(-3.3, -1, 0.3),
          new Vector3(-3.0, -5.8, 0.26),
          new Vector3(-0.4, -6.9, 0.1),
        ],
      ]
      for (const pontos of coax) {
        g.add(malha(cabo(pontos, 0.03), M.caboPreto))
        for (const p of [pontos[0], pontos[pontos.length - 1]]) {
          g.add(instancias(cilindro, M.ouro, [[p.x, p.y, p.z + 0.02, 0.07, 0.07, 0.06]]))
        }
      }
    },
    [0.55, 0, 0],
  )

  /* 7. Áudio e vibração ─────────────────────────────────────────────── */
  const tGrade = tex(texturaGrade())
  novaPeca(
    'audio',
    [0, -2.0, 0],
    (g) => {
      // O alto-falante: a caixa acústica preta, o quadro de aço estampado com
      // a tela, a espuma de vedação e as molas de contato.
      g.add(bloco(2.6, 1.4, 0.42, M.plasticoPreto, 2.0, -6.45, -0.02, 0.12))
      g.add(bloco(2.0, 1.0, 0.02, M.acoEscovado, 2.05, -6.45, 0.195, 0.08))
      g.add(
        face(
          1.75,
          0.75,
          new MeshStandardMaterial({ map: tGrade, roughness: 0.7 }),
          2.05,
          -6.45,
          0.207,
        ),
      )
      g.add(bloco(0.5, 1.2, 0.08, M.espuma, 0.85, -6.45, 0.06, 0.04))
      g.add(
        instancias(
          unit,
          M.ouro,
          [-6.15, -6.75].map((y) => [1.0, y, 0.23, 0.3, 0.14, 0.05]),
        ),
      )
      parafusos(
        g,
        [
          [3.2, -5.85, 0.21],
          [3.2, -7.05, 0.21],
        ],
        0.08,
      )
      // O motor de vibração (atuador linear): carcaça de aço com rebites, a
      // etiqueta, as orelhas de fixação e o flex.
      g.add(bloco(2.3, 1.0, 0.38, M.acoEscovado, -1.95, -6.4, -0.03, 0.1))
      g.add(bloco(1.6, 0.6, 0.01, M.plasticoPreto, -2.05, -6.4, 0.165, 0.05))
      g.add(
        instancias(
          cilindro,
          M.aco,
          [-2.95, -0.95].flatMap((x) => [-6.05, -6.75].map((y) => [x, y, 0.165, 0.04, 0.04, 0.02])),
        ),
      )
      for (const x of [-3.25, -0.65]) {
        g.add(bloco(0.32, 0.36, 0.02, M.acoEscovado, x, -6.75, 0.0, 0.04))
      }
      parafusos(
        g,
        [
          [-3.25, -6.75, 0.03],
          [-0.65, -6.75, 0.03],
        ],
        0.07,
      )
      g.add(bloco(0.4, 0.5, 0.05, M.flex, -0.65, -6.2, 0.1, 0.03))
      // No alto: o alto-falante de ouvido e o sensor de proximidade.
      g.add(bloco(1.3, 0.32, 0.18, M.plasticoPreto, 0.9, 7.12, 0.1, 0.06))
      g.add(
        face(
          1.1,
          0.14,
          new MeshStandardMaterial({ map: tGrade, roughness: 0.7 }),
          0.9,
          7.12,
          0.192,
        ),
      )
      g.add(instancias(unit, M.ouro, [[1.65, 7.1, 0.12, 0.16, 0.16, 0.08]]))
      g.add(bloco(0.36, 0.22, 0.12, M.resistor, -1.0, 7.12, 0.12, 0.04))
      g.add(
        instancias(
          cilindro,
          M.lente,
          [-1.08, -0.92].map((x) => [x, 7.12, 0.19, 0.045, 0.045, 0.02]),
        ),
      )
    },
    [0, -0.4, 0],
  )

  /* 8. Câmeras ──────────────────────────────────────────────────────── */
  const unidades: [number, number, number][] = [
    [-2.45, 6.2, 1],
    [-2.45, 4.9, 0.92],
    [-1.15, 5.55, 0.84],
  ]
  novaPeca(
    'camera',
    [0, 0.8, -1],
    (g) => {
      // O suporte que segura as três câmeras, com os parafusos.
      g.add(
        malha(
          placa(2.65, 2.65, 0.45, 0.04, 0, {
            cx: furoCam.x,
            cy: furoCam.y,
            furos: unidades.map(([x, y]) => furo(0.9, 0.9, 0.15, x, y)),
          }),
          M.aluminioEscuro,
          0,
          0,
          0.22,
        ),
      )
      parafusos(
        g,
        [
          [furoCam.x - 1.1, furoCam.y + 1.1, 0.25],
          [furoCam.x + 1.1, furoCam.y - 1.1, 0.25],
        ],
        0.08,
      )
      const anel = new TorusGeometry(0.33, 0.035, 10, 36)
      const vidro = new CylinderGeometry(0.3, 0.3, 0.04, 32).rotateX(Math.PI / 2)
      for (const [x, y, s] of unidades) {
        // O corpo do módulo (com as aberturas do estabilizador óptico) e a
        // placa verde do sensor por cima, com os passivos.
        g.add(bloco(1.0 * s, 1.0 * s, 0.5, M.plasticoPreto, x, y, -0.04, 0.08))
        g.add(bloco(0.12, 0.5 * s, 0.02, M.aluminioEscuro, x - 0.5 * s - 0.005, y, -0.04, 0.02))
        g.add(bloco(0.86 * s, 0.86 * s, 0.03, M.pcbVerde, x, y, 0.215, 0.06))
        g.add(
          instancias(
            unit,
            M.capacitor,
            Array.from({ length: 6 }, (_, i) => [
              x - 0.25 * s + (i % 3) * 0.25 * s,
              y + (i < 3 ? 0.28 : -0.28) * s,
              0.24,
              0.07,
              0.035,
              0.03,
            ]),
          ),
        )
        g.add(bloco(0.3 * s, 0.3 * s, 0.04, M.resistor, x, y, 0.245, 0.02))
        // O barril da lente em degraus, o anel e o vidro com tratamento.
        for (const [r, z, h] of [
          [0.42, -0.36, 0.14],
          [0.37, -0.48, 0.12],
          [0.33, -0.58, 0.1],
        ]) {
          g.add(instancias(cilindro, M.aluminioEscuro, [[x, y, z, r * s, r * s, h]]))
        }
        const aro = malha(anel, M.aco, x, y, -0.63)
        aro.scale.set(s, s, 1)
        g.add(aro)
        g.add(malha(vidro, M.lente, x, y, -0.62))
        // O flex de cada câmera até o conector na placa, com o reforço.
        const destino = y > 5.55 ? 6.4 : 4.7
        g.add(
          new Mesh(
            fita(
              [
                new Vector3(x + 0.3, y, 0.24),
                new Vector3(x + 0.9, (y + destino) / 2, 0.26),
                new Vector3(-0.05, destino, 0.14),
              ],
              0.28,
            ),
            M.flex,
          ),
        )
      }
      // A câmera frontal e o módulo de sensores ao lado dela.
      g.add(bloco(0.55, 0.55, 0.22, M.plasticoPreto, 0, 6.8, 0.12, 0.06))
      g.add(instancias(cilindro, M.lente, [[0, 6.8, 0.25, 0.14, 0.14, 0.06]]))
      g.add(instancias(cilindro, M.aluminioEscuro, [[0, 6.8, 0.24, 0.2, 0.2, 0.04]]))
      g.add(bloco(0.3, 0.3, 0.02, M.pcbVerde, 0, 6.3, 0.05, 0.04))
    },
    [0, Math.PI, 0],
  )

  /* 9. Bobina de carga sem fio ──────────────────────────────────────── */
  novaPeca(
    'bobina',
    [0, -0.3, -2],
    (g) => {
      const cy = -1.2
      // A folha de ferrite (quadrada, com cantos) e o disco sob a bobina.
      g.add(bloco(5.3, 5.3, 0.012, M.ferrite, 0, cy, -0.325, 0.3))
      g.add(
        malha(
          new CylinderGeometry(2.45, 2.45, 0.02, compacto ? 40 : 72).rotateX(Math.PI / 2),
          M.ferrite,
          0,
          cy,
          -0.32,
        ),
      )
      // A bobina: espiras concêntricas de cobre, achatadas.
      const espiras = compacto ? 12 : 24
      const toro = new TorusGeometry(1, 0.026, 6, compacto ? 48 : 96)
      for (let i = 0; i < espiras; i++) {
        const r = 0.85 + i * (1.42 / espiras)
        const anel = new Mesh(toro, M.cobre)
        anel.scale.set(r, r, 0.45)
        anel.position.set(0, cy, -0.3)
        g.add(anel)
      }
      // O ímã central e o anel de ímãs de alinhamento, com a marca de posição.
      g.add(instancias(cilindro, M.aluminioEscuro, [[0, cy, -0.3, 0.45, 0.45, 0.03]]))
      const n = 18
      const imas: number[][] = []
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU
        imas.push([
          Math.cos(a) * 2.75,
          cy + Math.sin(a) * 2.75,
          -0.31,
          0.42,
          0.14,
          0.04,
          a + Math.PI / 2,
        ])
      }
      g.add(instancias(unit, M.aluminioEscuro, imas))
      g.add(bloco(0.16, 0.5, 0.04, M.aluminioEscuro, 0, cy - 3.15, -0.31, 0.03))
      // A antena de NFC: uma espira retangular em volta de tudo.
      const nfc = forma(5.6, 7.4, 0.5, 0, cy)
      nfc.holes.push(furo(5.45, 7.25, 0.43, 0, cy))
      g.add(malha(new ShapeGeometry(nfc, 8), M.cobre, 0, 0, -0.318))
      // O sensor de temperatura e o flex que leva a bobina à placa.
      g.add(bloco(0.2, 0.12, 0.03, M.resistor, 0.6, cy + 0.6, -0.285, 0.02))
      g.add(
        new Mesh(
          fita(
            [
              new Vector3(1.9, 1.0, -0.3),
              new Vector3(2.2, 2.0, -0.2),
              new Vector3(2.0, 2.9, -0.06),
            ],
            0.45,
          ),
          M.flex,
        ),
      )
      g.add(bloco(0.55, 0.22, 0.05, M.plasticoPreto, 2.0, 2.95, -0.04, 0.03))
    },
    [0.2, 0, 0],
  )

  /* 10. Tampa traseira ──────────────────────────────────────────────── */
  const tTampa = tex(texturaTampa())
  novaPeca(
    'traseira',
    [0, -0.6, -3],
    (g) => {
      g.add(
        malha(
          placa(W - 0.06, H - 0.06, R - 0.02, 0.08, 0.025, { curvas }),
          M.vidroTraseiro,
          0,
          0,
          -0.38,
        ),
      )
      // A ilha das câmeras, em vidro polido, com o degrau chanfrado.
      g.add(
        malha(
          placa(3.05, 3.05, 0.72, 0.1, 0.035, { cx: furoCam.x, cy: furoCam.y, curvas }),
          M.vidroIlha,
          0,
          0,
          -0.45,
        ),
      )
      const aro = new CylinderGeometry(0.52, 0.52, 0.12, 40).rotateX(Math.PI / 2)
      const chanfro = new TorusGeometry(0.47, 0.03, 8, 40)
      const vidro = new CylinderGeometry(0.42, 0.42, 0.02, 40).rotateX(Math.PI / 2)
      for (const [x, y] of unidades) {
        g.add(malha(aro, M.titanio, x, y, -0.53))
        g.add(malha(chanfro, M.aco, x, y, -0.592))
        g.add(malha(vidro, M.lente, x, y, -0.595))
      }
      // O flash duplo (luz fria e quente) sob a cúpula, o sensor de
      // distância e o furo do microfone.
      g.add(instancias(cilindro, M.titanio, [[-1.15, 6.55, -0.51, 0.2, 0.2, 0.05]]))
      g.add(bloco(0.12, 0.12, 0.03, M.led, -1.21, 6.55, -0.535, 0.02))
      g.add(bloco(0.12, 0.12, 0.03, M.ledAmbar, -1.09, 6.55, -0.535, 0.02))
      g.add(instancias(cilindro, M.lente, [[-1.15, 4.55, -0.51, 0.16, 0.16, 0.05]]))
      g.add(instancias(cilindro, M.borracha, [[-1.15, 5.55, -0.505, 0.04, 0.04, 0.03]]))
      // A marca, gravada por fora.
      const decal = malha(
        new PlaneGeometry(3.2, 3.2),
        new MeshStandardMaterial({
          map: tTampa,
          transparent: true,
          roughness: 0.4,
          depthWrite: false,
          // Gravada 0,1 mm fora do vidro: sem o deslocamento, a marca e o
          // vidro disputavam o pixel e cintilavam com o aparelho girando.
          polygonOffset: true,
          polygonOffsetFactor: -4,
          polygonOffsetUnits: -4,
        }),
        0,
        -1.2,
        -0.424,
      )
      decal.rotation.y = Math.PI
      g.add(decal)
      // Por dentro: a fita adesiva da borda (o que se troca junto no reparo)
      // e a folha de grafite.
      const adesivo = forma(W - 0.3, H - 0.3, R - 0.15)
      adesivo.holes.push(furo(W - 0.55, H - 0.55, R - 0.27))
      g.add(malha(new ShapeGeometry(adesivo, curvas), M.flexEscuro, 0, 0, -0.329))
      g.add(
        face(
          3.0,
          3.6,
          new MeshStandardMaterial({ map: tGrafite, roughness: 0.7, metalness: 0.3 }),
          1.4,
          3.3,
          -0.3285,
        ),
      )
    },
    [0, Math.PI, 0],
  )

  return {
    raiz,
    pecas,
    tela: telaMaterial,
    texturas: { diagnostico: tDiagnostico, pronto: tPronto, marca: tMarca },
    todasAsTexturas: texturas,
    descartar: () => {
      for (const g of geometrias) g.dispose()
      for (const t of texturas) t.dispose()
      for (const p of pecas) for (const m of p.materiais) m.dispose()
      telaMaterial.dispose()
      for (const m of Object.values(M)) m.dispose()
      for (const m of avulsos) m.dispose()
      for (const g of [unit, cilindro, esfera]) g.dispose()
    },
  }
}
