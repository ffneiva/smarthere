import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import { CORES, D_SIMBOLO, QUADRO_SIMBOLO } from '@/lib/marca'

/**
 * As texturas do celular, desenhadas em canvas na hora.
 *
 * Nenhuma imagem baixada: a trilha da placa, o rótulo da bateria, a interface
 * da tela e as grades de som são desenho em código, com as fontes do próprio
 * site. Isso mantém a cena num chunk só (sem pedir arquivo nenhum) e deixa
 * cada detalhe com a marca da Smarthere — inclusive a serigrafia da placa.
 *
 * Um gerador pseudoaleatório com semente fixa garante que a placa seja
 * sempre a MESMA placa: recarregar a página não redesenha as trilhas.
 */

export function aleatorio(semente = 7): () => number {
  let s = semente >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Desenho = (c: CanvasRenderingContext2D, w: number, h: number) => void

function textura(w: number, h: number, desenhar: Desenho, srgb = true): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (ctx) desenhar(ctx, w, h)
  const t = new CanvasTexture(canvas)
  if (srgb) t.colorSpace = SRGBColorSpace
  t.anisotropy = 4
  return t
}

const MONO = '"Geist Mono", ui-monospace, monospace'
const DISPLAY = 'Unbounded, "Arial Black", sans-serif'
const SANS = 'Geist, system-ui, sans-serif'

/** O símbolo da marca desenhado no canvas, com a base em (x, y) e altura h. */
function simbolo(c: CanvasRenderingContext2D, x: number, y: number, h: number, cor: string) {
  const k = h / QUADRO_SIMBOLO.h
  c.save()
  c.translate(x - (QUADRO_SIMBOLO.w * k) / 2, y)
  c.scale(k, k)
  c.fillStyle = cor
  c.fill(new Path2D(D_SIMBOLO), 'evenodd')
  c.restore()
}

function arredondado(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  c.beginPath()
  c.roundRect(x, y, w, h, r)
}

/* ── Placa lógica ─────────────────────────────────────────────────────── */

export type Retangulo = { x: number; y: number; w: number; h: number }

/**
 * A face da placa: laminado escuro, trilhas em cobre sob a máscara de
 * solda, vias douradas, ilhas de solda em volta de cada componente e a
 * serigrafia — referências (U1, C214…) e o código da placa.
 *
 * `paraPx` converte coordenadas da placa (cm) em pixels, para que as ilhas
 * caiam exatamente embaixo dos componentes 3D.
 */
export function texturaPlaca(
  larguraPx: number,
  alturaPx: number,
  componentes: Retangulo[],
  paraPx: (x: number, y: number) => [number, number],
  escala: number,
): CanvasTexture {
  const rnd = aleatorio(31)
  return textura(larguraPx, alturaPx, (c, w, h) => {
    // Laminado: o verde-quase-preto das placas de celular, com textura.
    c.fillStyle = '#0c1714'
    c.fillRect(0, 0, w, h)
    for (let i = 0; i < 2600; i++) {
      c.fillStyle = `rgba(255,255,255,${rnd() * 0.025})`
      c.fillRect(rnd() * w, rnd() * h, 2, 2)
    }

    // Trilhas: caminhos em L, de 45° em 45°, como as de um roteador de PCB.
    c.lineCap = 'round'
    c.lineJoin = 'round'
    for (let i = 0; i < 230; i++) {
      let x = rnd() * w
      let y = rnd() * h
      c.strokeStyle = rnd() > 0.85 ? 'rgba(200,140,70,0.32)' : 'rgba(40,92,74,0.75)'
      c.lineWidth = rnd() > 0.8 ? 4 : 1.6
      c.beginPath()
      c.moveTo(x, y)
      const passos = 2 + Math.floor(rnd() * 4)
      for (let p = 0; p < passos; p++) {
        const dir = Math.floor(rnd() * 8) * (Math.PI / 4)
        const comp = 20 + rnd() * 120
        x += Math.cos(dir) * comp
        y += Math.sin(dir) * comp
        c.lineTo(x, y)
      }
      c.stroke()
    }

    // Barramento paralelo saindo do processador — o detalhe que diz "placa".
    c.strokeStyle = 'rgba(46,104,84,0.9)'
    c.lineWidth = 1.4
    for (let i = 0; i < 18; i++) {
      const y0 = h * 0.42 + i * 6
      c.beginPath()
      c.moveTo(w * 0.45, y0)
      c.lineTo(w * 0.58, y0)
      c.lineTo(w * 0.62, y0 + 30)
      c.lineTo(w * 0.8, y0 + 30)
      c.stroke()
    }

    // Vias: anéis dourados com o furo escuro.
    for (let i = 0; i < 520; i++) {
      const x = rnd() * w
      const y = rnd() * h
      const r = 1.6 + rnd() * 2.2
      c.fillStyle = '#c9a050'
      c.beginPath()
      c.arc(x, y, r, 0, Math.PI * 2)
      c.fill()
      c.fillStyle = '#081210'
      c.beginPath()
      c.arc(x, y, r * 0.45, 0, Math.PI * 2)
      c.fill()
    }

    // Ilhas de solda e serigrafia em volta de cada componente.
    c.font = `500 ${Math.round(escala * 0.11)}px ${MONO}`
    componentes.forEach((r, i) => {
      const [x0, y0] = paraPx(r.x - r.w / 2, r.y + r.h / 2)
      const [x1, y1] = paraPx(r.x + r.w / 2, r.y - r.h / 2)
      const pw = x1 - x0
      const ph = y1 - y0
      c.fillStyle = 'rgba(214,170,82,0.9)'
      const n = Math.max(3, Math.round(pw / 9))
      for (let k = 0; k < n; k++) {
        const px = x0 + 3 + (k * (pw - 6)) / (n - 1)
        c.fillRect(px - 1.5, y0 - 6, 3, 5)
        c.fillRect(px - 1.5, y1 + 1, 3, 5)
      }
      c.strokeStyle = 'rgba(230,236,232,0.55)'
      c.lineWidth = 1.2
      c.strokeRect(x0 - 9, y0 - 9, pw + 18, ph + 18)
      c.fillStyle = 'rgba(230,236,232,0.65)'
      c.fillText(i === 0 ? 'U1' : `U${i + 1}${i % 3 === 0 ? '0' : ''}`, x0 - 8, y0 - 13)
    })

    // Referências soltas: o "alfabeto" de uma placa real.
    c.fillStyle = 'rgba(230,236,232,0.42)'
    c.font = `500 ${Math.round(escala * 0.075)}px ${MONO}`
    const prefixos = ['C', 'R', 'L', 'FL', 'TP', 'D', 'Q']
    for (let i = 0; i < 70; i++) {
      const ref = `${prefixos[Math.floor(rnd() * prefixos.length)]}${100 + Math.floor(rnd() * 800)}`
      c.fillText(ref, rnd() * w, rnd() * h)
    }

    // O código da placa — com a marca.
    c.fillStyle = 'rgba(236,240,236,0.8)'
    c.font = `600 ${Math.round(escala * 0.15)}px ${MONO}`
    c.fillText('SMH-A1  REV 2.3', w * 0.62, h * 0.94)
    c.font = `500 ${Math.round(escala * 0.1)}px ${MONO}`
    c.fillText('smarthere.com.br  ·  2026', w * 0.62, h * 0.985)
  })
}

/** O topo de um chip: preto fosco com a gravação a laser. */
export function texturaChip(linhas: string[], marca = false): CanvasTexture {
  return textura(256, 256, (c, w, h) => {
    c.fillStyle = '#16181c'
    c.fillRect(0, 0, w, h)
    const g = c.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, 'rgba(255,255,255,0.05)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    c.fillStyle = g
    c.fillRect(0, 0, w, h)
    // O ponto do pino 1.
    c.fillStyle = 'rgba(255,255,255,0.18)'
    c.beginPath()
    c.arc(26, 26, 8, 0, Math.PI * 2)
    c.fill()
    c.fillStyle = 'rgba(214,220,230,0.6)'
    c.textAlign = 'center'
    linhas.forEach((l, i) => {
      c.font = i === 0 ? `600 34px ${MONO}` : `500 22px ${MONO}`
      c.fillText(l, w / 2, h / 2 - 10 + i * 34 - (linhas.length - 1) * 12)
    })
    if (marca) simbolo(c, w - 34, h - 58, 34, 'rgba(214,220,230,0.45)')
  })
}

/** Blindagem de RF: aço estampado com a malha de furinhos. */
export function texturaBlindagem(): CanvasTexture {
  const t = textura(256, 256, (c, w, h) => {
    c.fillStyle = '#c9ced5'
    c.fillRect(0, 0, w, h)
    c.fillStyle = 'rgba(40,46,56,0.55)'
    for (let y = 8; y < h; y += 16) {
      for (let x = (y / 16) % 2 ? 16 : 8; x < w; x += 16) {
        c.beginPath()
        c.arc(x, y, 2.6, 0, Math.PI * 2)
        c.fill()
      }
    }
  })
  t.wrapS = RepeatWrapping
  t.wrapT = RepeatWrapping
  return t
}

/** Grade do alto-falante: furos em colmeia num plástico preto. */
export function texturaGrade(): CanvasTexture {
  const t = textura(256, 128, (c, w, h) => {
    c.fillStyle = '#121418'
    c.fillRect(0, 0, w, h)
    c.fillStyle = '#020203'
    for (let y = 6; y < h; y += 10) {
      for (let x = (y / 10) % 2 ? 11 : 6; x < w; x += 10) {
        c.beginPath()
        c.arc(x, y, 3, 0, Math.PI * 2)
        c.fill()
      }
    }
  })
  t.wrapS = RepeatWrapping
  t.wrapT = RepeatWrapping
  return t
}

/** Conector placa-a-placa: o corpo preto e as duas fileiras de pinos. */
export function texturaConector(): CanvasTexture {
  return textura(256, 96, (c, w, h) => {
    c.fillStyle = '#0d0e10'
    c.fillRect(0, 0, w, h)
    c.fillStyle = '#d4a648'
    for (let x = 14; x < w - 10; x += 9) {
      c.fillRect(x, 16, 4, 20)
      c.fillRect(x, h - 36, 4, 20)
    }
  })
}

/**
 * O rótulo da bateria: célula de íon de lítio com a marca da Smarthere,
 * especificação, avisos e código de barras. A especificação é de uma célula
 * típica de celular — a peça é ilustrativa, e o rótulo diz isso.
 */
export function texturaBateria(): CanvasTexture {
  return textura(820, 980, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, '#22262d')
    g.addColorStop(1, '#16191e')
    c.fillStyle = g
    c.fillRect(0, 0, w, h)

    // Faixa de sinal no alto.
    c.fillStyle = CORES.sinal
    c.fillRect(0, 0, w, 16)

    simbolo(c, 104, 70, 96, CORES.sinal)
    c.fillStyle = CORES.gelo
    c.font = `600 54px ${DISPLAY}`
    c.fillText('smart', 168, 140)
    const larg = c.measureText('smart').width
    c.fillStyle = CORES.sinal
    c.fillText('here', 168 + larg, 140)
    c.fillStyle = 'rgba(242,244,247,0.6)'
    c.font = `500 24px ${MONO}`
    c.fillText('CÉLULA DE SERVIÇO · PEÇA ILUSTRATIVA', 168, 182)

    c.fillStyle = CORES.gelo
    c.font = `600 74px ${DISPLAY}`
    c.fillText('4.500 mAh', 60, 330)
    c.font = `500 30px ${MONO}`
    c.fillStyle = 'rgba(242,244,247,0.75)'
    const specs = [
      'Bateria de íons de lítio-polímero',
      '3,88 V ⎓ 4.500 mAh · 17,46 Wh',
      'Tensão de carga limite: 4,45 V',
      'Recarregável · Não perfure · Não aqueça',
    ]
    specs.forEach((s, i) => {
      c.fillText(s, 60, 400 + i * 48)
    })

    // Avisos: círculos cortados, como os pictogramas de segurança.
    for (let i = 0; i < 4; i++) {
      const x = 100 + i * 120
      const y = 690
      c.strokeStyle = 'rgba(242,244,247,0.7)'
      c.lineWidth = 6
      c.beginPath()
      c.arc(x, y, 40, 0, Math.PI * 2)
      c.stroke()
      c.beginPath()
      c.moveTo(x - 28, y - 28)
      c.lineTo(x + 28, y + 28)
      c.stroke()
      c.fillStyle = 'rgba(242,244,247,0.7)'
      c.font = `600 26px ${MONO}`
      c.textAlign = 'center'
      c.fillText(['°C', '⚡', '✕', '◇'][i], x, y + 9)
      c.textAlign = 'left'
    }

    // Código de barras.
    const rnd = aleatorio(5)
    let x = 60
    while (x < 520) {
      const lw = 2 + Math.floor(rnd() * 6)
      c.fillStyle = 'rgba(242,244,247,0.82)'
      c.fillRect(x, 800, lw, 100)
      x += lw + 2 + Math.floor(rnd() * 6)
    }
    c.font = `500 24px ${MONO}`
    c.fillText('SMH 4500 A1 2026 0001', 60, 940)

    // Selo de verificação, no canto: o que a Smarthere faz antes de instalar.
    c.strokeStyle = CORES.sinal
    c.lineWidth = 5
    c.beginPath()
    c.arc(w - 150, 860, 78, 0, Math.PI * 2)
    c.stroke()
    c.fillStyle = CORES.sinal
    c.font = `600 22px ${MONO}`
    c.textAlign = 'center'
    c.fillText('TESTADA', w - 150, 850)
    c.fillText('NA BANCADA', w - 150, 880)
    c.textAlign = 'left'
  })
}

/** A hora e a data de agora, como a barra de status de um celular mostra. */
function relogio() {
  const agora = new Date()
  const hora = `${agora.getHours()}:${String(agora.getMinutes()).padStart(2, '0')}`
  const data = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(agora)
  return { hora, data }
}

/**
 * A tela acesa. Três estados: o diagnóstico (enquanto o aparelho se monta),
 * o reparo concluído (quando ele fecha) e a marca (o chamado final).
 *
 * A hora é a de agora: `userData.redesenhar()` desenha de novo com o
 * relógio atual (a cena chama a cada virada de minuto).
 */
export function texturaTela(estado: 'diagnostico' | 'pronto' | 'marca'): CanvasTexture {
  const desenhar = (c: CanvasRenderingContext2D, w: number, h: number) => {
    const { hora, data } = relogio()
    c.textAlign = 'left'
    // Papel de parede: o grafite com um brilho verde vindo de baixo.
    const fundo = c.createLinearGradient(0, 0, 0, h)
    fundo.addColorStop(0, '#0b0d11')
    fundo.addColorStop(1, '#050607')
    c.fillStyle = fundo
    c.fillRect(0, 0, w, h)
    const brilho = c.createRadialGradient(w * 0.5, h * 0.98, 10, w * 0.5, h * 0.98, h * 0.7)
    brilho.addColorStop(0, estado === 'pronto' ? 'rgba(200,255,46,0.55)' : 'rgba(200,255,46,0.3)')
    brilho.addColorStop(1, 'rgba(200,255,46,0)')
    c.fillStyle = brilho
    c.fillRect(0, 0, w, h)

    // Barra de status.
    c.fillStyle = CORES.gelo
    c.font = `600 30px ${SANS}`
    c.fillText(hora, 56, 70)
    c.textAlign = 'right'
    c.font = `500 24px ${MONO}`
    c.fillText('5G  ▮▮▮▯  100%', w - 56, 68)
    c.textAlign = 'left'

    // A câmera frontal (o furo na tela) — o mesmo furo do símbolo da marca.
    c.fillStyle = '#000'
    c.beginPath()
    c.arc(w / 2, 58, 18, 0, Math.PI * 2)
    c.fill()

    if (estado === 'marca') {
      simbolo(c, w / 2, 330, 300, CORES.sinal)
      c.textAlign = 'center'
      c.fillStyle = CORES.gelo
      c.font = `600 96px ${DISPLAY}`
      c.fillText('smart.', w / 2, 830)
      c.fillStyle = CORES.sinal
      c.fillText('here.', w / 2, 940)
      c.fillStyle = 'rgba(242,244,247,0.55)'
      c.font = `500 24px ${MONO}`
      c.fillText('SMARTHERE.COM.BR', w / 2, h - 60)
      return
    }

    if (estado === 'pronto') {
      // O sinal de concluído, grande.
      c.strokeStyle = CORES.sinal
      c.lineWidth = 16
      c.lineCap = 'round'
      c.lineJoin = 'round'
      c.beginPath()
      c.arc(w / 2, 470, 150, 0, Math.PI * 2)
      c.stroke()
      c.beginPath()
      c.moveTo(w / 2 - 70, 475)
      c.lineTo(w / 2 - 15, 530)
      c.lineTo(w / 2 + 80, 420)
      c.stroke()
      c.fillStyle = CORES.gelo
      c.textAlign = 'center'
      c.font = `600 52px ${DISPLAY}`
      c.fillText('pronto.', w / 2, 730)
      c.font = `400 30px ${SANS}`
      c.fillStyle = 'rgba(242,244,247,0.7)'
      c.fillText('Reparo concluído e testado', w / 2, 790)
      c.fillText('na bancada.', w / 2, 830)
      // Lista de testes.
      const testes = ['Tela e toque', 'Bateria', 'Carga', 'Câmeras', 'Áudio', 'Sinal']
      c.textAlign = 'left'
      testes.forEach((t, i) => {
        const y = 940 + i * 56
        c.fillStyle = 'rgba(242,244,247,0.06)'
        arredondado(c, 70, y - 38, w - 140, 48, 14)
        c.fill()
        c.fillStyle = 'rgba(242,244,247,0.85)'
        c.font = `500 26px ${SANS}`
        c.fillText(t, 96, y - 6)
        c.fillStyle = CORES.sinal
        c.font = `600 24px ${MONO}`
        c.textAlign = 'right'
        c.fillText('OK', w - 96, y - 6)
        c.textAlign = 'left'
      })
      return
    }

    // Diagnóstico: o relógio, o símbolo e a leitura das peças.
    c.fillStyle = CORES.gelo
    c.textAlign = 'center'
    c.font = `300 150px ${DISPLAY}`
    c.fillText(hora, w / 2, 320)
    c.font = `400 30px ${SANS}`
    c.fillStyle = 'rgba(242,244,247,0.6)'
    c.fillText(data, w / 2, 375)

    simbolo(c, w / 2, 470, 150, CORES.sinal)

    c.font = `600 32px ${DISPLAY}`
    c.fillStyle = CORES.gelo
    c.fillText('diagnóstico', w / 2, 720)
    c.textAlign = 'left'

    const leituras: [string, number, string][] = [
      ['Tela', 1, 'OK'],
      ['Bateria', 0.71, '71%'],
      ['Conector', 0.4, 'falha'],
      ['Câmeras', 1, 'OK'],
      ['Áudio', 0.86, 'OK'],
    ]
    leituras.forEach(([nome, v, txt], i) => {
      const y = 800 + i * 92
      c.fillStyle = 'rgba(242,244,247,0.85)'
      c.font = `500 28px ${SANS}`
      c.fillText(nome, 70, y)
      c.textAlign = 'right'
      c.font = `600 24px ${MONO}`
      c.fillStyle = v < 0.5 ? CORES.cobre : v < 0.8 ? '#ffd34d' : CORES.sinal
      c.fillText(txt.toUpperCase(), w - 70, y)
      c.textAlign = 'left'
      c.fillStyle = 'rgba(242,244,247,0.1)'
      arredondado(c, 70, y + 18, w - 140, 10, 5)
      c.fill()
      c.fillStyle = v < 0.5 ? CORES.cobre : v < 0.8 ? '#ffd34d' : CORES.sinal
      arredondado(c, 70, y + 18, (w - 140) * v, 10, 5)
      c.fill()
    })

    c.fillStyle = 'rgba(242,244,247,0.5)'
    c.textAlign = 'center'
    c.font = `500 22px ${MONO}`
    c.fillText('SMARTHERE.COM.BR', w / 2, h - 60)
  }
  const t = textura(640, 1360, desenhar)
  t.userData.redesenhar = () => {
    const canvas = t.image as HTMLCanvasElement
    const c = canvas.getContext('2d')
    if (!c) return
    c.clearRect(0, 0, canvas.width, canvas.height)
    desenhar(c, canvas.width, canvas.height)
    t.needsUpdate = true
  }
  return t
}
/** A marca na tampa traseira: o símbolo e o nome, em baixo-relevo. */
export function texturaTampa(): CanvasTexture {
  return textura(512, 512, (c, w) => {
    c.clearRect(0, 0, w, w)
    simbolo(c, w / 2, 70, 200, 'rgba(242,244,247,0.22)')
    c.fillStyle = 'rgba(242,244,247,0.2)'
    c.textAlign = 'center'
    c.font = `500 44px ${DISPLAY}`
    c.fillText('smarthere', w / 2, 360)
    c.font = `500 18px ${MONO}`
    c.fillStyle = 'rgba(242,244,247,0.14)'
    c.fillText('MODELO SMH-A1 · PEÇA ILUSTRATIVA', w / 2, 470)
  })
}

/** O feixe do laser de diagnóstico: uma linha fina e o halo em volta. */
export function texturaFeixe(): CanvasTexture {
  return textura(16, 256, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, 'rgba(200,255,46,0)')
    g.addColorStop(0.42, 'rgba(200,255,46,0.18)')
    g.addColorStop(0.49, 'rgba(230,255,160,0.95)')
    g.addColorStop(0.5, 'rgba(255,255,255,1)')
    g.addColorStop(0.51, 'rgba(230,255,160,0.95)')
    g.addColorStop(0.58, 'rgba(200,255,46,0.18)')
    g.addColorStop(1, 'rgba(200,255,46,0)')
    c.fillStyle = g
    c.fillRect(0, 0, w, h)
  })
}

/**
 * Titânio escovado: o mapa de rugosidade com riscos finos na horizontal —
 * o reflexo da moldura "corre" ao longo do aparelho, como no metal real.
 */
export function texturaEscovado(): CanvasTexture {
  const rnd = aleatorio(3)
  const t = textura(
    512,
    512,
    (c, w, h) => {
      c.fillStyle = 'rgb(70,70,70)'
      c.fillRect(0, 0, w, h)
      for (let i = 0; i < 1800; i++) {
        const y = rnd() * h
        const v = 40 + Math.floor(rnd() * 70)
        c.strokeStyle = `rgba(${v},${v},${v},0.55)`
        c.lineWidth = 0.6 + rnd()
        c.beginPath()
        c.moveTo(0, y)
        c.lineTo(w, y + (rnd() - 0.5) * 2)
        c.stroke()
      }
    },
    false,
  )
  t.wrapS = RepeatWrapping
  t.wrapT = RepeatWrapping
  return t
}

/** Folha de grafite térmico: cinza fosco com a impressão do fabricante. */
export function texturaGrafite(rotulo: string): CanvasTexture {
  const rnd = aleatorio(17)
  return textura(512, 512, (c, w, h) => {
    c.fillStyle = '#26292e'
    c.fillRect(0, 0, w, h)
    for (let i = 0; i < 3000; i++) {
      c.fillStyle = `rgba(255,255,255,${rnd() * 0.04})`
      c.fillRect(rnd() * w, rnd() * h, 2, 1)
    }
    c.fillStyle = 'rgba(200,205,214,0.45)'
    c.font = `500 20px ${MONO}`
    for (let y = 60; y < h; y += 120) c.fillText(rotulo, 30 + ((y / 120) % 2) * 80, y)
  })
}

/** Câmara de vapor: cobre estampado com o desenho dos canais por dentro. */
export function texturaCamaraVapor(): CanvasTexture {
  return textura(512, 640, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, '#b0683a')
    g.addColorStop(0.5, '#d28a55')
    g.addColorStop(1, '#a35e33')
    c.fillStyle = g
    c.fillRect(0, 0, w, h)
    c.strokeStyle = 'rgba(80,40,18,0.35)'
    c.lineWidth = 3
    for (let x = 40; x < w; x += 36) {
      c.beginPath()
      c.moveTo(x, 40)
      c.lineTo(x, h - 40)
      c.stroke()
    }
    c.strokeStyle = 'rgba(255,220,180,0.35)'
    c.lineWidth = 6
    c.strokeRect(14, 14, w - 28, h - 28)
    c.fillStyle = 'rgba(60,30,12,0.55)'
    c.font = `600 26px ${MONO}`
    c.fillText('VC-SMH-A1', 40, h - 60)
  })
}

/** O verso do painel OLED: a malha de cobre que espalha o calor. */
export function texturaVersoOled(): CanvasTexture {
  const t = textura(256, 256, (c, w, h) => {
    c.fillStyle = '#6b4127'
    c.fillRect(0, 0, w, h)
    c.strokeStyle = 'rgba(30,16,8,0.45)'
    c.lineWidth = 1
    for (let i = 0; i <= w; i += 8) {
      c.beginPath()
      c.moveTo(i, 0)
      c.lineTo(i, h)
      c.moveTo(0, i)
      c.lineTo(w, i)
      c.stroke()
    }
  })
  t.wrapS = RepeatWrapping
  t.wrapT = RepeatWrapping
  t.repeat.set(6, 12)
  return t
}

/**
 * A conversa no WhatsApp, desenhada na tela do aparelho — a seção de
 * diagnóstico escreve aqui a mensagem que a pessoa está montando.
 * Devolve a textura e uma função que redesenha com outro texto.
 */
export function texturaConversa(): { textura: CanvasTexture; escrever: (texto: string) => void } {
  const canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = 1360
  const t = new CanvasTexture(canvas)
  t.colorSpace = SRGBColorSpace
  t.anisotropy = 4
  const c = canvas.getContext('2d')
  const quebrar = (texto: string, largura: number) => {
    if (!c) return []
    const linhas: string[] = []
    for (const paragrafo of texto.split('\n')) {
      let atual = ''
      for (const palavra of paragrafo.split(' ')) {
        const teste = atual ? `${atual} ${palavra}` : palavra
        if (c.measureText(teste).width > largura && atual) {
          linhas.push(atual)
          atual = palavra
        } else atual = teste
      }
      linhas.push(atual)
    }
    return linhas
  }
  const escrever = (texto: string) => {
    if (!c) return
    const w = canvas.width
    const h = canvas.height
    c.fillStyle = '#0b141a'
    c.fillRect(0, 0, w, h)
    // Cabeçalho da conversa.
    c.fillStyle = '#1f2c34'
    c.fillRect(0, 0, w, 190)
    c.fillStyle = '#000'
    c.beginPath()
    c.arc(w / 2, 58, 18, 0, Math.PI * 2)
    c.fill()
    c.fillStyle = CORES.breu
    c.beginPath()
    c.arc(84, 140, 34, 0, Math.PI * 2)
    c.fill()
    simbolo(c, 84, 116, 46, CORES.sinal)
    c.fillStyle = CORES.gelo
    c.font = `600 32px ${SANS}`
    c.fillText('Smarthere', 136, 136)
    c.fillStyle = 'rgba(242,244,247,0.6)'
    c.font = `400 22px ${SANS}`
    c.fillText('online', 136, 166)
    // O balão da mensagem, à direita.
    c.font = `400 38px ${SANS}`
    const linhas = quebrar(texto, w - 200)
    const alt = linhas.length * 52 + 70
    const y0 = Math.min(h - alt - 170, 260)
    c.fillStyle = '#005c4b'
    arredondado(c, 96, y0, w - 130, alt, 26)
    c.fill()
    c.fillStyle = '#e9edef'
    linhas.forEach((l, i) => {
      c.fillText(l, 132, y0 + 60 + i * 52)
    })
    c.fillStyle = 'rgba(233,237,239,0.6)'
    c.font = `400 18px ${SANS}`
    c.textAlign = 'right'
    c.fillText('agora ✓✓', w - 64, y0 + alt - 16)
    c.textAlign = 'left'
    // A barra de digitação.
    c.fillStyle = '#1f2c34'
    arredondado(c, 24, h - 130, w - 140, 80, 40)
    c.fill()
    c.fillStyle = 'rgba(233,237,239,0.45)'
    c.font = `400 26px ${SANS}`
    c.fillText('Mensagem', 70, h - 80)
    c.fillStyle = '#00a884'
    c.beginPath()
    c.arc(w - 66, h - 90, 40, 0, Math.PI * 2)
    c.fill()
    t.needsUpdate = true
  }
  escrever('Olá, Smarthere! Vim pelo site e quero um orçamento de conserto.')
  return { textura: t, escrever }
}

/**
 * O reflexo que atravessa o vidro: uma faixa diagonal de luz branca, suave,
 * com as pontas transparentes. A cena desliza a textura pela tela.
 */
export function texturaReflexo(): CanvasTexture {
  const t = textura(512, 512, (c, w, h) => {
    c.clearRect(0, 0, w, h)
    const g = c.createLinearGradient(0, h, w, 0)
    g.addColorStop(0.36, 'rgba(255,255,255,0)')
    g.addColorStop(0.46, 'rgba(255,255,255,0.18)')
    g.addColorStop(0.5, 'rgba(255,255,255,0.5)')
    g.addColorStop(0.53, 'rgba(255,255,255,0.18)')
    g.addColorStop(0.58, 'rgba(255,255,255,0.06)')
    g.addColorStop(0.66, 'rgba(255,255,255,0)')
    c.fillStyle = g
    c.fillRect(0, 0, w, h)
  })
  return t
}
