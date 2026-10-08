import { describe, expect, it } from 'vitest'
import {
  CORES,
  D_CAMERA,
  D_EXTERNO,
  D_INTERNO,
  D_SIMBOLO,
  MEDIDAS,
  QUADRO_SIMBOLO,
} from '@/lib/marca'

/**
 * O símbolo é geometria: estes testes garantem que ninguém "corrija" um lado
 * e esqueça o outro, e que tudo cabe no quadro declarado.
 */
const numeros = (d: string) => (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number)

describe('símbolo', () => {
  it('é simétrico em torno do eixo: cada x tem o seu espelho', () => {
    const eixo = QUADRO_SIMBOLO.w / 2
    for (const d of [D_EXTERNO, D_INTERNO]) {
      // Coordenadas x dos comandos H/V/C/M/A, aproximadas a 0,01.
      const xs = [...d.matchAll(/[MHCL]\s?(-?[\d.]+)/g)].map((m) => Number(m[1]))
      for (const x of xs) {
        const espelho = 2 * eixo - x
        const temEspelho = numeros(d).some((n) => Math.abs(n - espelho) < 0.02)
        expect(temEspelho, `x=${x}`).toBe(true)
      }
    }
  })

  it('cabe no quadro', () => {
    for (const n of numeros(`${D_EXTERNO}${D_INTERNO}`)) {
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThanOrEqual(QUADRO_SIMBOLO.h)
    }
  })

  it('a câmera fica dentro do vão, no eixo', () => {
    expect(
      D_CAMERA.startsWith(`M${QUADRO_SIMBOLO.w / 2 - MEDIDAS.camera.r} ${MEDIDAS.camera.y}`),
    ).toBe(true)
    expect(MEDIDAS.camera.y - MEDIDAS.camera.r).toBeGreaterThan(MEDIDAS.traco)
  })

  it('o caminho completo junta borda, vão e câmera', () => {
    expect(D_SIMBOLO).toBe(`${D_EXTERNO}${D_INTERNO}${D_CAMERA}`)
    expect(D_SIMBOLO.match(/Z/g)).toHaveLength(3)
  })
})

describe('cores', () => {
  it('a paleta é hexadecimal de 6 dígitos', () => {
    for (const c of Object.values(CORES)) expect(c).toMatch(/^#[0-9a-f]{6}$/)
  })
})
