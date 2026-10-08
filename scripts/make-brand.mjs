/**
 * Gera os arquivos de marca: favicon, ícones, artes de compartilhamento e o
 * kit para baixar do manual (/marca).
 *
 *   npm run brand
 *
 * Fontes: a marca em vetor (src/lib/marca.ts), a lista de rotas
 * (src/lib/routes.ts) e a foto do aparelho (npm run fotos). As artes e os
 * logos horizontais são renderizados por um Chromium de verdade (o do
 * Playwright), com as fontes do próprio site.
 *
 * Roda com --experimental-strip-types para importar os .ts sem build.
 * CHROMIUM=/caminho/chrome aponta um Chromium específico, se preciso.
 */
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'
import sharp from 'sharp'
import { CORES, D_SIMBOLO, QUADRO_SIMBOLO } from '../src/lib/marca.ts'
import { ogArquivoDe, ROTAS } from '../src/lib/routes.ts'

const RAIZ = path.resolve(import.meta.dirname, '..')
const PUBLIC = path.join(RAIZ, 'public')
const KIT = path.join(PUBLIC, 'marca')

/** O símbolo em SVG, numa cor, ocupando `lado` com `margem` livre em volta. */
function simboloSvg({ cor = CORES.sinal, fundo = null, lado = 1000, margem = 0.2 } = {}) {
  const altura = lado * (1 - margem * 2)
  const k = altura / QUADRO_SIMBOLO.h
  const dx = (lado - QUADRO_SIMBOLO.w * k) / 2
  const dy = (lado - altura) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${lado} ${lado}">${
    fundo ? `<rect width="${lado}" height="${lado}" fill="${fundo}"/>` : ''
  }<g transform="translate(${dx.toFixed(1)} ${dy.toFixed(1)}) scale(${k.toFixed(4)})"><path d="${D_SIMBOLO}" fill="${cor}" fill-rule="evenodd"/></g></svg>`
}

/** Ícone de aplicativo: o símbolo em sinal sobre o breu, com um brilho. */
function iconeSvg(margem) {
  const lado = 1000
  const brilho = `<defs><radialGradient id="g" cx="0.5" cy="0.55" r="0.6"><stop offset="0" stop-color="${CORES.sinal}" stop-opacity="0.22"/><stop offset="1" stop-color="${CORES.sinal}" stop-opacity="0"/></radialGradient></defs>`
  return simboloSvg({ fundo: CORES.breu, margem }).replace(
    `<rect width="${lado}" height="${lado}" fill="${CORES.breu}"/>`,
    `${brilho}<rect width="${lado}" height="${lado}" fill="${CORES.breu}"/><rect width="${lado}" height="${lado}" fill="url(#g)"/>`,
  )
}

/**
 * O .ico que o navegador pede sozinho em /favicon.ico, mesmo com o SVG
 * declarado — sem ele, cada visita gera um 404 no log. O ICO aceita PNG
 * embutido: um cabeçalho de 22 bytes e o PNG de 32 px.
 */
function icoDePng(png) {
  const c = Buffer.alloc(22)
  c.writeUInt16LE(0, 0)
  c.writeUInt16LE(1, 2)
  c.writeUInt16LE(1, 4)
  c.writeUInt8(32, 6)
  c.writeUInt8(32, 7)
  c.writeUInt16LE(1, 10)
  c.writeUInt16LE(32, 12)
  c.writeUInt32LE(png.length, 14)
  c.writeUInt32LE(22, 18)
  return Buffer.concat([c, png])
}

const png = async (svg, tamanho, destino) => {
  await sharp(Buffer.from(svg), { density: 300 })
    .resize(tamanho, tamanho)
    .png({ compressionLevel: 9 })
    .toFile(destino)
  console.log(`  ${path.relative(PUBLIC, destino)}`)
}

async function icones() {
  // No favicon o símbolo ocupa quase tudo: a 16 px, margem é desperdício.
  const favicon = iconeSvg(0.08)
  await writeFile(path.join(PUBLIC, 'favicon.svg'), favicon)
  console.log('  favicon.svg')
  await png(favicon, 32, path.join(PUBLIC, 'favicon-32.png'))
  await png(favicon, 64, path.join(PUBLIC, 'favicon-64.png'))
  // Tela inicial e manifesto: margem maior, porque o sistema recorta em
  // círculo ou squircle (e o "maskable" exige a zona segura de 80%).
  await png(iconeSvg(0.2), 180, path.join(PUBLIC, 'apple-touch-icon.png'))
  await png(iconeSvg(0.24), 192, path.join(PUBLIC, 'icon-192.png'))
  await png(iconeSvg(0.24), 512, path.join(PUBLIC, 'icon-512.png'))
  await writeFile(
    path.join(PUBLIC, 'favicon.ico'),
    icoDePng(await readFile(path.join(PUBLIC, 'favicon-32.png'))),
  )
  console.log('  favicon.ico')

  const v = async (arquivo) =>
    createHash('sha1')
      .update(await readFile(path.join(PUBLIC, arquivo)))
      .digest('hex')
      .slice(0, 8)
  const versoes = { 192: await v('icon-192.png'), 512: await v('icon-512.png') }
  const manifesto = {
    name: 'Smarthere — conserto de celular',
    short_name: 'Smarthere',
    description: 'Conserto de celular com a precisão de laboratório.',
    lang: 'pt-BR',
    start_url: '/',
    display: 'standalone',
    background_color: CORES.breu,
    theme_color: CORES.breu,
    icons: ['any', 'maskable'].flatMap((purpose) =>
      [192, 512].map((l) => ({
        src: `/icon-${l}.png?v=${versoes[l]}`,
        sizes: `${l}x${l}`,
        type: 'image/png',
        purpose,
      })),
    ),
  }
  await writeFile(path.join(PUBLIC, 'site.webmanifest'), `${JSON.stringify(manifesto, null, 2)}\n`)
  console.log('  site.webmanifest')
}

const base64 = async (arquivo) => (await readFile(arquivo)).toString('base64')

async function comNavegador(fn) {
  const navegador = await chromium.launch(
    process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {},
  )
  try {
    await fn(navegador)
  } finally {
    await navegador.close()
  }
}

async function cssFontes() {
  const u = await base64(path.join(PUBLIC, 'fonts', 'unbounded-latin.woff2'))
  const g = await base64(path.join(PUBLIC, 'fonts', 'geist-latin.woff2'))
  const m = await base64(path.join(PUBLIC, 'fonts', 'mono-latin.woff2'))
  return `@font-face{font-family:U;src:url(data:font/woff2;base64,${u}) format('woff2');font-weight:300 900}
    @font-face{font-family:G;src:url(data:font/woff2;base64,${g}) format('woff2');font-weight:100 900}
    @font-face{font-family:M;src:url(data:font/woff2;base64,${m}) format('woff2');font-weight:400 600}`
}

/** As artes de 1200×630 que o WhatsApp, o Instagram e o Google mostram. */
async function artes(navegador) {
  const fontes = await cssFontes()
  const simbolo = `data:image/svg+xml;base64,${Buffer.from(simboloSvg({ margem: 0 })).toString('base64')}`
  const aparelho = `data:image/webp;base64,${await base64(path.join(PUBLIC, 'images', 'aparelho-aberto.webp'))}`
  const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 } })
  const feitas = new Set()

  for (const rota of ROTAS) {
    const arquivo = ogArquivoDe(rota)
    if (feitas.has(arquivo) || !rota.og) continue
    feitas.add(arquivo)
    const [linha1, linha2] = rota.og
    await pagina.setContent(`<!doctype html><html><head><style>${fontes}
      *{margin:0;box-sizing:border-box}
      body{width:1200px;height:630px;background:${CORES.breu};color:${CORES.gelo};font-family:G;position:relative;overflow:hidden}
      .grade{position:absolute;inset:0;background-image:linear-gradient(rgba(242,244,247,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(242,244,247,.04) 1px,transparent 1px);background-size:40px 40px}
      .brilho{position:absolute;right:-120px;top:-60px;width:800px;height:760px;border-radius:50%;background:radial-gradient(circle,rgba(200,255,46,.16),transparent 62%)}
      .aparelho{position:absolute;right:-40px;top:20px;height:610px}
      .txt{position:absolute;left:72px;top:0;bottom:0;width:640px;display:flex;flex-direction:column;justify-content:center;gap:28px;padding-top:30px}
      h1{font-family:U;font-weight:600;font-size:64px;line-height:1;letter-spacing:-.04em}
      h1 em{display:block;font-style:normal;font-weight:300;color:${CORES.sinal}}
      p{font-family:M;font-size:18px;letter-spacing:.14em;text-transform:uppercase;color:${CORES.nevoa}}
      .marca{position:absolute;left:72px;top:56px;display:flex;align-items:center;gap:14px;font-family:U;font-weight:500;font-size:34px;letter-spacing:-.03em}
      .marca img{height:44px}.marca b{font-weight:500;color:${CORES.sinal}}
    </style></head><body>
      <div class="grade"></div><div class="brilho"></div>
      <img class="aparelho" src="${aparelho}">
      <div class="marca"><img src="${simbolo}"><span>smart<b>here</b></span></div>
      <div class="txt"><h1>${linha1}<em>${linha2}</em></h1>${rota.ogNota ? `<p>${rota.ogNota}</p>` : ''}</div>
    </body></html>`)
    await pagina.evaluate(() => document.fonts.ready)
    const shot = await pagina.screenshot({ type: 'png' })
    await sharp(shot).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(PUBLIC, arquivo))
    console.log(`  ${arquivo}`)
  }
  await pagina.close()
}

/** O kit do manual da marca: símbolo em SVG/PNG, logos horizontais, perfil. */
async function kit(navegador) {
  await mkdir(KIT, { recursive: true })
  await writeFile(path.join(KIT, 'smarthere-simbolo.svg'), simboloSvg({ margem: 0.04 }))
  console.log('  marca/smarthere-simbolo.svg')
  await png(simboloSvg({ margem: 0.08 }), 1024, path.join(KIT, 'smarthere-simbolo-1024.png'))
  // Perfil de rede social: recortado em círculo, então margem generosa.
  await png(iconeSvg(0.26), 1080, path.join(KIT, 'smarthere-perfil.png'))

  const fontes = await cssFontes()
  const pagina = await navegador.newPage({ viewport: { width: 1600, height: 600 } })
  const variantes = [
    {
      nome: 'escuro',
      fundo: CORES.breu,
      texto: CORES.gelo,
      simbolo: CORES.sinal,
      here: CORES.sinal,
    },
    {
      nome: 'claro',
      fundo: CORES.gelo,
      texto: CORES.breu,
      simbolo: CORES.breu,
      here: CORES.breu,
      peso: 700,
    },
    {
      nome: 'sinal',
      fundo: CORES.sinal,
      texto: CORES.breu,
      simbolo: CORES.breu,
      here: CORES.breu,
      peso: 700,
    },
  ]
  for (const v of variantes) {
    const simbolo = `data:image/svg+xml;base64,${Buffer.from(simboloSvg({ cor: v.simbolo, margem: 0 })).toString('base64')}`
    await pagina.setContent(`<!doctype html><html><head><style>${fontes}
      *{margin:0}body{width:1600px;height:600px;background:${v.fundo};display:grid;place-items:center}
      .l{display:flex;align-items:center;gap:44px;font-family:U;font-weight:500;font-size:150px;letter-spacing:-.035em;color:${v.texto}}
      .l img{height:200px}.l b{font-weight:${v.peso ?? 500};color:${v.here}}
    </style></head><body><div class="l"><img src="${simbolo}"><span>smart<b>here</b></span></div></body></html>`)
    await pagina.evaluate(() => document.fonts.ready)
    await pagina.screenshot({ path: path.join(KIT, `smarthere-logo-${v.nome}.png`) })
    console.log(`  marca/smarthere-logo-${v.nome}.png`)
  }
  await pagina.close()
}

console.log('Ícones:')
await icones()
await comNavegador(async (navegador) => {
  console.log('Artes de compartilhamento:')
  await artes(navegador)
  console.log('Kit da marca:')
  await kit(navegador)
})
