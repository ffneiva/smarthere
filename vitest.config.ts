import path from 'node:path'
import { defineConfig } from 'vitest/config'

/**
 * Configuração dos testes unitários.
 *
 * O ambiente padrão é `node`, e não `jsdom`: a lógica testada aqui — rotas,
 * JSON-LD, llms.txt, a geometria da marca — não toca no DOM. Subir um jsdom por arquivo custaria centenas de milissegundos cada, e o
 * teste que roda rápido é o teste que se roda.
 *
 * A cobertura mira `src/lib`, que é onde mora a decisão. Componentes de
 * apresentação ficam para o Playwright, que os exercita no navegador de
 * verdade — testar `<Reveal>` com jsdom mediria se o React renderiza, não se a
 * animação funciona.
 */
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/lib/**/*.ts'],
      // analytics e observability são wrappers de API de navegador atrás de
      // variável de ambiente; movimento.ts só carrega o GSAP no navegador.
      // Cobri-los mediria o mock.
      exclude: ['src/lib/analytics.ts', 'src/lib/observability.ts', 'src/lib/movimento.ts'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
  },
})
