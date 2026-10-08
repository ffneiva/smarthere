/**
 * A marca da Smarthere em vetor.
 *
 * A empresa nasceu só com o nome e o domínio; a marca foi desenhada junto com
 * o site. A ideia cabe numa linha: **"smart" + "here"** — o contorno de um
 * celular cuja base afina até virar a ponta de um pin de localização. O furo
 * do pin é a câmera frontal. Lido rápido, é um pin ("aqui"); lido devagar, é
 * um aparelho.
 *
 * Tudo é geometria simples (retas e arcos de círculo) num quadro de
 * 100 × 140, simétrico em torno de x = 50 — o teste de marca confere isso.
 *
 * Importado pelo React, pela cena 3D (textura da tela e da tampa) e pelo
 * gerador de favicon/OG (scripts/make-brand.mjs): uma fonte só.
 */

export const QUADRO_SIMBOLO = { w: 100, h: 140 } as const

/** Medidas que definem o símbolo — os caminhos abaixo saem delas. */
export const MEDIDAS = {
  /** Largura do corpo (o "celular"). */
  largura: 80,
  /** Altura em que os lados retos terminam e começa a afinar. */
  ombro: 86,
  /** Raio dos cantos de cima. */
  raio: 24,
  /** Ponta do pin. */
  ponta: 138,
  /** Espessura do traço do contorno. */
  traco: 13,
  /** A câmera: centro e raio. */
  camera: { y: 30, r: 7.5 },
} as const

const EIXO = QUADRO_SIMBOLO.w / 2

/**
 * O contorno externo do símbolo, de largura `l` e com `inset` de recuo —
 * o mesmo desenho serve para a borda de fora e para o vão de dentro.
 */
function contorno(inset: number): string {
  const { largura, ombro, raio, ponta } = MEDIDAS
  const esq = EIXO - largura / 2 + inset
  const dir = EIXO + largura / 2 - inset
  const topo = 1 + inset
  const r = Math.max(2, raio - inset)
  const ombroY = ombro - inset * 0.2
  // A ponta recua mais que o resto, para o traço ficar com espessura
  // visualmente igual na diagonal (a diagonal "afina" o traço).
  const pontaY = ponta - inset * 2.1
  // As diagonais saem do ombro e convergem no eixo. Uma curva suave (cúbica)
  // no ombro evita a quina — é o "ombro" arredondado do celular.
  const curva = 20 - inset * 0.9
  const f = (n: number) => Number(n.toFixed(2))
  return [
    `M${f(esq + r)} ${f(topo)}`,
    `H${f(dir - r)}`,
    `A${f(r)} ${f(r)} 0 0 1 ${f(dir)} ${f(topo + r)}`,
    `V${f(ombroY)}`,
    `C${f(dir)} ${f(ombroY + curva)} ${f(EIXO + 10)} ${f(pontaY - 22)} ${f(EIXO)} ${f(pontaY)}`,
    `C${f(EIXO - 10)} ${f(pontaY - 22)} ${f(esq)} ${f(ombroY + curva)} ${f(esq)} ${f(ombroY)}`,
    `V${f(topo + r)}`,
    `A${f(r)} ${f(r)} 0 0 1 ${f(esq + r)} ${f(topo)}`,
    'Z',
  ].join('')
}

function circulo(cx: number, cy: number, r: number): string {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`
}

/** Borda de fora. */
export const D_EXTERNO = contorno(0)
/** Vão de dentro (a "tela"). */
export const D_INTERNO = contorno(MEDIDAS.traco)
/** A câmera — o furo do pin. */
export const D_CAMERA = circulo(EIXO, MEDIDAS.camera.y, MEDIDAS.camera.r)

/**
 * O símbolo inteiro num caminho só, para `fill-rule="evenodd"`: a borda, o
 * vão (que vira furo) e a câmera (que, dentro do furo, volta a ser cheia).
 */
export const D_SIMBOLO = `${D_EXTERNO}${D_INTERNO}${D_CAMERA}`

/** O nome se escreve sempre em minúsculas; "here" leva a cor de sinal. */
export const NOME = { inicio: 'smart', fim: 'here' } as const

/**
 * A paleta — os mesmos valores do `@theme` em index.css, para quem não lê
 * CSS (cena 3D, gerador de ícones).
 */
export const CORES = {
  breu: '#07080a',
  grafite: '#0e1014',
  grafite2: '#15181e',
  chumbo: '#232832',
  nevoa: '#8a93a3',
  aco: '#c7cdd6',
  gelo: '#f2f4f7',
  sinal: '#c8ff2e',
  cobre: '#ff8a3d',
} as const
