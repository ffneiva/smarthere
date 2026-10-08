import { describe, expect, it } from 'vitest'
import { PASSOS } from '@/lib/business'
import { ESTADO, estadoDaRolagem, PASSOS_3D, SECOES, TOTAL_ESTADOS } from '@/lib/estados'
import { PAGINAS, paginaDe } from '@/lib/paginas'

describe('estados do celular 3D', () => {
  it('herói, montagem, pronto e seções em sequência, sem buraco', () => {
    expect(ESTADO.heroi).toBe(0)
    expect(ESTADO.passo(0)).toBe(1)
    expect(ESTADO.pronto).toBe(PASSOS.length + 1)
    expect(ESTADO.secao(SECOES[0])).toBe(ESTADO.pronto + 1)
    expect(ESTADO.secao(SECOES[SECOES.length - 1])).toBe(TOTAL_ESTADOS)
  })

  it('cada passo da montagem diz quais peças 3D entram', () => {
    expect(PASSOS_3D).toHaveLength(PASSOS.length)
  })
})

describe('estadoDaRolagem', () => {
  /** Uma raiz falsa: marcadores com o centro em `c`. */
  const raiz = (pontos: { s: number; c: number }[]) =>
    ({
      querySelectorAll: () =>
        pontos.map((p) => ({
          dataset: { s: String(p.s) },
          getBoundingClientRect: () => ({ top: p.c - 10, height: 20 }),
        })),
    }) as unknown as ParentNode

  it('sem marcadores, 0', () => {
    expect(estadoDaRolagem(raiz([]), 300)).toBe(0)
  })

  it('interpola entre os vizinhos e fica nas pontas fora deles', () => {
    const r = raiz([
      { s: 0, c: 100 },
      { s: 1, c: 300 },
    ])
    expect(estadoDaRolagem(r, 50)).toBe(0)
    expect(estadoDaRolagem(r, 200)).toBeCloseTo(0.5)
    expect(estadoDaRolagem(r, 900)).toBe(1)
  })

  it('dois marcadores na mesma altura não produzem NaN', () => {
    const r = raiz([
      { s: 5, c: 400 },
      { s: 6, c: 400 },
      { s: 7, c: 900 },
    ])
    expect(Number.isFinite(estadoDaRolagem(r, 400))).toBe(true)
  })
})

describe('páginas de serviço', () => {
  it('o slug acha a página; slug desconhecido, nada', () => {
    for (const p of PAGINAS) expect(paginaDe(p.slug)?.slug).toBe(p.slug)
    expect(paginaDe('nao-existe')).toBeUndefined()
  })
})

describe('utils', () => {
  it('cn ignora falsy; prefersReducedMotion lê a preferência do navegador', async () => {
    const { cn, prefersReducedMotion } = await import('@/lib/utils')
    expect(cn('a', false, null, undefined, 'b')).toBe('a b')
    // Sem window (Node), nunca reduz.
    expect(prefersReducedMotion()).toBe(false)
    const global = globalThis as unknown as { window?: unknown }
    global.window = { matchMedia: () => ({ matches: true }) }
    try {
      expect(prefersReducedMotion()).toBe(true)
    } finally {
      delete global.window
    }
  })
})
