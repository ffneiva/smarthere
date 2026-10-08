/**
 * Baixa as fontes do Google e escreve os @font-face já apontando para /fonts.
 *
 * Duas famílias (mais a mono), só nos subsets latin e latin-ext:
 *
 *   · Archivo          — variável em largura E peso. Expandida e pesada, é o
 *                        desenho do letreiro LOTTUS (quadrado, largo); em
 *                        largura normal, é o corpo do texto. Um arquivo só.
 *   · Instrument Serif — itálico de acento, uma ou duas palavras por título.
 *                        O contraste com o letreiro reto é o que dá o ar caro.
 *   · JetBrains Mono   — rótulos e números.
 *
 *   npm run fonts
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const RAIZ = path.resolve(import.meta.dirname, '..')
const OUT = path.join(RAIZ, 'public/fonts')

// O Google só devolve woff2 para User-Agents que reconhece.
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

const FAMILIAS = [
  { query: 'family=Unbounded:wght@300..900', slug: 'unbounded' },
  { query: 'family=Geist:wght@100..900', slug: 'geist' },
  { query: 'family=Geist+Mono:wght@400..600', slug: 'mono' },
]

const SUBSETS = new Set(['latin', 'latin-ext'])

async function baixar(url, nome) {
  const bin = await fetch(url).then((r) => r.arrayBuffer())
  await writeFile(path.join(OUT, nome), Buffer.from(bin))
  console.log(`  ${nome}  ${(bin.byteLength / 1024).toFixed(1)} kB`)
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const blocos = []

  for (const { query, slug } of FAMILIAS) {
    const css = await fetch(`https://fonts.googleapis.com/css2?${query}&display=swap`, {
      headers: { 'User-Agent': UA },
    }).then((r) => r.text())

    for (const [, subset, bloco] of css.matchAll(
      /\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[\s\S]*?\})/g,
    )) {
      if (!SUBSETS.has(subset)) continue
      const url = bloco.match(/url\((https:[^)]+)\)/)?.[1]
      if (!url) continue
      const nome = `${slug}-${subset}.woff2`
      await baixar(url, nome)
      blocos.push(bloco.replace(/src:\s*url\([^)]+\)/, `src: url(/fonts/${nome})`))
    }
  }

  await writeFile(
    path.join(RAIZ, 'src/styles/fonts.css'),
    `/* Gerado por scripts/fetch-fonts.mjs — não editar à mão. */\n\n${blocos.join('\n\n')}\n`,
  )
  console.log('  → src/styles/fonts.css')
}

main().catch((erro) => {
  console.error(erro)
  process.exit(1)
})
