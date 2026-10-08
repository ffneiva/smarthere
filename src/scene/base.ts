import {
  ACESFilmicToneMapping,
  BackSide,
  CanvasTexture,
  Color,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  WebGLRenderer,
  type WebGLRenderTarget,
} from 'three'

/**
 * O que toda cena 3D do site tem em comum.
 *
 * · **Estúdio cozido em código.** O reflexo do metal e do vidro vem de uma
 *   cena de ambiente montada aqui — uma cúpula escura e seis softboxes
 *   (brancas, uma verde-limão e uma âmbar) — passada pelo `PMREMGenerator`.
 *   Nenhum HDRI baixado: o alumínio reflete as cores da própria Smarthere.
 * · **Um laço só, sob demanda.** Quem monta a cena liga e desliga o laço pela
 *   visibilidade; fora da tela, nada é desenhado.
 * · **Amortecimento no tempo, não no quadro.** Igual em 60 e em 144 Hz.
 * · **Giro por arrasto, com inércia.** Mouse ou dedo; ao soltar, a peça
 *   continua girando e freia sozinha.
 */

export type Descartavel = { dispose: () => void }

export type OpcoesCena = {
  /** Celular: menos segmentos, menos partículas, sem antialias, DPR ≤ 1,5. */
  compacto?: boolean
  fov?: number
}

function texturaCupula(): CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 4
  c.height = 256
  const ctx = c.getContext('2d')
  if (ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, 256)
    g.addColorStop(0, '#1d2129')
    g.addColorStop(0.45, '#0a0b0e')
    g.addColorStop(1, '#030304')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 4, 256)
  }
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  return t
}

function ambienteDeEstudio(renderer: WebGLRenderer): WebGLRenderTarget {
  const estudio = new Scene()
  estudio.add(
    new Mesh(
      new SphereGeometry(20, 32, 16),
      new MeshBasicMaterial({ map: texturaCupula(), side: BackSide }),
    ),
  )

  const softbox = (cor: string, intensidade: number, w: number, h: number, pos: number[]) => {
    const m = new Mesh(
      new PlaneGeometry(w, h),
      new MeshBasicMaterial({ color: new Color(cor).multiplyScalar(intensidade) }),
    )
    m.position.set(pos[0], pos[1], pos[2])
    m.lookAt(0, 0, 0)
    estudio.add(m)
  }
  // Chave: faixa branca alta à esquerda — o fio de luz nos chanfros do chassi.
  softbox('#ffffff', 3.4, 2.2, 9, [-7, 2, 5])
  // Recorte verde-limão à direita, por trás: a cor da marca no alumínio.
  softbox('#c8ff2e', 1.1, 1.2, 8, [8, 0, -3])
  // Teto largo e neutro, fraco.
  softbox('#e8ecf2', 1.3, 12, 3, [0, 9, 2])
  // Contra-luz âmbar baixa — o reflexo do cobre e do flex.
  softbox('#ff8a3d', 0.9, 10, 1.2, [0, -7, 4])
  // Frente, atrás da câmera: duas faixas (clara em cima, escura embaixo)
  // para o vidro ter um degradê que "varre" quando o aparelho inclina.
  softbox('#f2f4f7', 1.6, 16, 3.5, [0, 3.2, 12])
  softbox('#5d6675', 0.9, 16, 3, [0, -3.5, 12])

  const pmrem = new PMREMGenerator(renderer)
  const alvo = pmrem.fromScene(estudio, 0.035)
  pmrem.dispose()
  estudio.traverse((o) => {
    if (o instanceof Mesh) {
      o.geometry.dispose()
      const mat = o.material as MeshBasicMaterial
      mat.map?.dispose()
      mat.dispose()
    }
  })
  return alvo
}

const suave = (atual: number, alvo: number, rapidez: number, dt: number) =>
  atual + (alvo - atual) * (1 - rapidez ** dt)

const limitar = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))

/** 0 antes de `a`, 1 depois de `b`, linear entre os dois. */
export const faixa = (v: number, a: number, b: number) => limitar((v - a) / (b - a))

export abstract class CenaBase {
  protected renderer: WebGLRenderer
  protected cena = new Scene()
  protected camera: PerspectiveCamera
  protected compacto: boolean
  protected descartaveis: Descartavel[] = []

  protected progresso = 0
  protected progressoSuave = 0
  protected ponteiro = { x: 0, y: 0 }
  protected ponteiroSuave = { x: 0, y: 0 }
  /**
   * Giro acumulado pelo arrasto (radianos) nos dois eixos, e a velocidade
   * que sobra ao soltar. Depois de alguns segundos parado, o giro volta
   * devagar a zero — a peça retoma a pose que a página pede.
   */
  protected giro = 0
  protected giroX = 0
  private giroVel = 0
  private giroXVel = 0
  private arrastando = false
  private soltouEm = 0

  private frame = 0
  private rodando = false
  private ultimo = performance.now()
  protected readonly inicio = performance.now()

  constructor(canvas: HTMLCanvasElement, { compacto = false, fov = 32 }: OpcoesCena = {}) {
    this.compacto = compacto
    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !compacto,
      powerPreference: 'high-performance',
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, compacto ? 1.5 : 2))
    this.renderer.toneMapping = ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05
    this.renderer.outputColorSpace = SRGBColorSpace
    // Os avisos do compilador de shader (os "X4122" do Direct3D no Windows)
    // são inofensivos; em produção, o three nem os pede ao driver.
    this.renderer.debug.checkShaderErrors = import.meta.env.DEV

    const ambiente = ambienteDeEstudio(this.renderer)
    this.cena.environment = ambiente.texture
    this.descartaveis.push(ambiente)

    this.camera = new PerspectiveCamera(fov, 1, 0.1, 60)
  }

  redimensionar(w: number, h: number) {
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.aoRedimensionar(w, h)
    this.camera.updateProjectionMatrix()
    this.desenhar()
  }

  /** Para a cena ajustar câmera e escala à proporção da tela. */
  protected aoRedimensionar(_w: number, _h: number) {}

  /** 0…1 — o avanço da rolagem pela seção que abriga a cena. */
  definirProgresso(p: number) {
    this.progresso = limitar(p)
  }

  /** Ponteiro normalizado em −1…1. */
  definirPonteiro(x: number, y: number) {
    this.ponteiro.x = x
    this.ponteiro.y = y
  }

  /** `dx`, `dy` em pixels desde o último evento, `dt` em segundos. */
  arrastar(dx: number, dy: number, dt: number) {
    this.arrastando = true
    const d = dx * 0.009
    const dX = dy * 0.007
    this.giro += d
    this.giroX = limitar(this.giroX + dX, -1.3, 1.3)
    if (dt > 0) {
      this.giroVel = this.giroVel * 0.5 + (d / dt) * 0.5
      this.giroXVel = this.giroXVel * 0.5 + (dX / dt) * 0.5
    }
  }

  soltar() {
    this.arrastando = false
    this.soltouEm = performance.now()
  }

  /**
   * Prepara a cena antes do primeiro quadro: compila os shaders em paralelo
   * (KHR_parallel_shader_compile) em vez de travar a página no primeiro
   * desenho — no Windows, a compilação pelo Direct3D leva segundos.
   */
  async preparar(): Promise<void> {
    await this.renderer.compileAsync(this.cena, this.camera)
  }

  iniciar() {
    if (this.rodando) return
    this.rodando = true
    this.ultimo = performance.now()
    const laco = (agora: number) => {
      if (!this.rodando) return
      const dt = Math.min(0.064, (agora - this.ultimo) / 1000)
      this.ultimo = agora
      this.progressoSuave = suave(this.progressoSuave, this.progresso, 0.08, dt)
      this.ponteiroSuave.x = suave(this.ponteiroSuave.x, this.ponteiro.x, 0.02, dt)
      this.ponteiroSuave.y = suave(this.ponteiroSuave.y, this.ponteiro.y, 0.02, dt)
      if (!this.arrastando) {
        this.giro += this.giroVel * dt
        this.giroVel *= 0.12 ** dt
        this.giroX = limitar(this.giroX + this.giroXVel * dt, -1.3, 1.3)
        this.giroXVel *= 0.12 ** dt
        // Parado há 2,5 s: volta à pose (a volta inteira mais próxima).
        if (agora - this.soltouEm > 2500) {
          const volta = Math.round(this.giro / (2 * Math.PI)) * 2 * Math.PI
          const k = 1 - 0.35 ** dt
          this.giro += (volta - this.giro) * k
          this.giroX += -this.giroX * k
        }
      }
      this.passo(dt, (agora - this.inicio) / 1000)
      this.desenhar()
      this.frame = requestAnimationFrame(laco)
    }
    this.frame = requestAnimationFrame(laco)
  }

  pausar() {
    this.rodando = false
    cancelAnimationFrame(this.frame)
  }

  protected abstract passo(dt: number, t: number): void

  protected desenhar() {
    this.renderer.render(this.cena, this.camera)
  }

  destruir() {
    this.pausar()
    for (const d of this.descartaveis) d.dispose()
    this.renderer.dispose()
  }
}
