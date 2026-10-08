import { PASSOS } from './business.ts'

/**
 * Os estados do celular 3D ao longo da home — o contrato entre as seções
 * (que marcam a posição com `data-s`) e a cena (src/scene/celular.ts).
 *
 *   0          herói: as peças soltas
 *   1 … N      a montagem, uma peça por passo
 *   N + 1      pronto: montado e testado
 *   N + 2 …    uma pose por seção do resto da página
 */
const N = PASSOS.length

export const SECOES = [
  'servicos',
  'como-funciona',
  'diagnostico',
  'direitos',
  'duvidas',
  'fecho',
] as const

export const ESTADO = {
  heroi: 0,
  passo: (k: number) => 1 + k,
  pronto: N + 1,
  secao: (id: (typeof SECOES)[number]) => N + 2 + SECOES.indexOf(id),
} as const

export const TOTAL_ESTADOS = N + 1 + SECOES.length

/** As peças 3D de cada passo da montagem, na ordem. */
export const PASSOS_3D = PASSOS.map((p) => p.pecas3d)

/**
 * O estado contínuo da cena a partir da rolagem: os marcadores `data-s` cujo
 * centro está acima e abaixo do meio da tela, interpolados. Antes do
 * primeiro, 0; depois do último, o total.
 */
export function estadoDaRolagem(raiz: ParentNode, meio: number): number {
  const pontos = [...raiz.querySelectorAll<HTMLElement>('[data-s]')]
    .map((m) => {
      const r = m.getBoundingClientRect()
      return { s: Number(m.dataset.s), c: r.top + r.height / 2 }
    })
    .sort((a, b) => a.c - b.c)
  if (!pontos.length || meio <= pontos[0].c) return pontos[0]?.s ?? 0
  for (let i = 0; i < pontos.length - 1; i++) {
    const a = pontos[i]
    const b = pontos[i + 1]
    if (meio >= a.c && meio <= b.c) {
      // Dois marcadores na mesma altura: sem isto, 0/0 vira NaN e a cena
      // inteira perde a pose.
      if (b.c - a.c < 1) return b.s
      return a.s + ((meio - a.c) / (b.c - a.c)) * (b.s - a.s)
    }
  }
  return pontos[pontos.length - 1].s
}
