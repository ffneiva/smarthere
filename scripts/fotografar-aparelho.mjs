/**
 * Fotografa o celular 3D: public/images/aparelho-{frente,aberto}.{avif,webp}.
 *
 *   npm run fotos
 *
 * As fotos são a reserva da cena — o que aparece enquanto o three.js chega e
 * o aparelho inteiro para quem não tem WebGL ou pediu movimento reduzido. Elas
 * também entram na arte de compartilhamento (scripts/make-brand.mjs).
 *
 * Saem do MESMO modelo da página: o script sobe o servidor de
 * desenvolvimento, abre a home com `?foto` (sem laser, sem flutuar), esconde
 * tudo menos o canvas, leva a cena ao estado pedido e fotografa com fundo
 * transparente. O `trim` do sharp corta a sobra.
 *
 * Como o build, roda na máquina de quem mexe no modelo; o resultado é
 * versionado. CHROMIUM=/caminho/chrome aponta outro Chromium, se preciso.
 */
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'
import sharp from 'sharp'
import { createServer } from 'vite'

const RAIZ = path.resolve(import.meta.dirname, '..')
const DESTINO = path.join(RAIZ, 'public/images')
const PORTA = 5198

const FOTOS = [
  // estado da cena, caixa final (o aparelho cabe dentro, sem distorcer)
  // Os estados de src/lib/estados.ts: 0 é o herói (as peças soltas), 9 é o
  // aparelho montado ("pronto").
  { nome: 'aparelho-frente', estado: 9, caixa: [900, 1400] },
  { nome: 'aparelho-aberto', estado: 0, caixa: [1400, 1100] },
]

// `npm run fotos -- aparelho-aberto` refaz só uma.
const so = process.argv[2]

await mkdir(DESTINO, { recursive: true })
const servidor = await createServer({
  root: RAIZ,
  server: { port: PORTA, strictPort: true, host: '127.0.0.1' },
  logLevel: 'error',
})
await servidor.listen()

const navegador = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}),
})

try {
  for (const foto of FOTOS.filter((f) => !so || f.nome === so)) {
    const pagina = await navegador.newPage({
      viewport: { width: 1600, height: 1000 },
      // 1,5×: em 2× o renderizador por software do headless perde o contexto
      // WebGL no aparelho aberto, e a foto sai escura e sem texturas.
      deviceScaleFactor: 1.5,
    })
    await pagina.addInitScript(() => sessionStorage.setItem('smarthere:abertura', '1'))
    await pagina.goto(`http://127.0.0.1:${PORTA}/?foto`)
    await pagina.waitForFunction(() => document.querySelector('canvas')?.width > 0, null, {
      timeout: 90_000,
    })
    // A página cresce quando o chunk de baixo chega: espera os marcadores.
    await pagina.waitForFunction((s) => document.querySelector(`[data-s="${s}"]`), foto.estado)
    await pagina.waitForTimeout(1500)
    await pagina.evaluate((s) => {
      const m = document.querySelector(`[data-s="${s}"]`)
      if (m) {
        const r = m.getBoundingClientRect()
        window.scrollTo(0, window.scrollY + r.top + r.height / 2 - window.innerHeight / 2)
      }
      // Só o canvas: sem texto, sem fundo, sem cabeçalho.
      const estilo = document.createElement('style')
      estilo.textContent = `html,body{background:transparent!important}
        body *{visibility:hidden!important}
        canvas{visibility:visible!important}`
      document.head.appendChild(estilo)
    }, foto.estado)
    // No headless a cena roda a poucos quadros por segundo: espera ela
    // assentar na pose.
    await pagina.waitForTimeout(14_000)
    const png = await pagina.screenshot({ omitBackground: true, timeout: 240_000 })
    const [w, h] = foto.caixa
    const base = sharp(png)
      .trim({ threshold: 2 })
      .resize(w, h, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
    await base
      .clone()
      .webp({ quality: 86, alphaQuality: 90 })
      .toFile(path.join(DESTINO, `${foto.nome}.webp`))
    await base
      .clone()
      .avif({ quality: 60 })
      .toFile(path.join(DESTINO, `${foto.nome}.avif`))
    await base
      .clone()
      .png()
      .toFile(path.join(RAIZ, 'assets-src', `${foto.nome}.png`))
    console.log(`  ${foto.nome}  (${w}×${h})`)
    await pagina.close()
  }
} finally {
  await navegador.close()
  await servidor.close()
}
