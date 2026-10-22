/**
 * Confere o SEO do que vai ao ar (o dist/ já construído):
 *   npm run build && node scripts/validar-seo.mjs
 *
 * Por página: JSON-LD válido, todo `@id` citado existe no grafo, um H1 (o do
 * <noscript>, que é o conteúdo que robôs sem JavaScript leem), H1 diferente
 * entre as páginas, title e description no tamanho que o Google mostra, alt em
 * toda imagem e nenhum travessão no texto (regra da casa). Sai com código 1 se
 * algo falhar.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const DIST = path.resolve(import.meta.dirname, '..', 'dist')
const erros = []
const h1s = new Map()

function html(dir, lista = []) {
  for (const nome of readdirSync(dir)) {
    const c = path.join(dir, nome)
    if (statSync(c).isDirectory()) html(c, lista)
    else if (nome.endsWith('.html') && !/^google[0-9a-f]+\.html$/.test(nome)) lista.push(c)
  }
  return lista
}

for (const arq of html(DIST)) {
  const rel = path.relative(DIST, arq).replaceAll('\\', '/')
  const s = readFileSync(arq, 'utf8')
  const erro = (m) => erros.push(`${rel}: ${m}`)
  const titulo = s.match(/<title>([^<]*)<\/title>/)?.[1] ?? ''
  const descricao = s.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? ''
  if (!titulo || titulo.length > 70) erro(`title com ${titulo.length} caracteres`)
  if (rel !== '404.html' && (descricao.length < 80 || descricao.length > 200))
    erro(`description com ${descricao.length}`)
  const corpo = s.match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1] ?? ''
  const h1 = [...corpo.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) =>
    m[1].replace(/<[^>]+>/g, '').trim(),
  )
  if (h1.length !== 1) erro(`${h1.length} H1`)
  else if (rel !== '404.html') {
    if (h1s.has(h1[0])) erro(`H1 repetido com ${h1s.get(h1[0])}: "${h1[0]}"`)
    h1s.set(h1[0], rel)
  }
  for (const img of corpo.match(/<img [^>]*>/g) ?? [])
    if (!/\salt="/.test(img)) erro(`imagem sem alt: ${img.slice(0, 80)}`)
  const texto = corpo
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>/g, '')
    .replace(/<[^>]+>/g, ' ')
  if (/[—–]/.test(texto + titulo + descricao)) erro('travessão no texto')

  const blocos = [...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  if (!blocos.length) {
    erro('sem JSON-LD')
    continue
  }
  for (const [, json] of blocos) {
    let dados
    try {
      dados = JSON.parse(json)
    } catch (e) {
      erro(`JSON-LD inválido: ${e.message}`)
      continue
    }
    const nos = dados['@graph'] ?? [dados]
    const ids = new Set()
    const refs = []
    const varrer = (n) => {
      if (Array.isArray(n)) return n.forEach(varrer)
      if (!n || typeof n !== 'object') return
      if (n['@id'] && Object.keys(n).length > 1) ids.add(n['@id'])
      else if (n['@id']) refs.push(n['@id'])
      for (const v of Object.values(n)) varrer(v)
    }
    varrer(nos)
    for (const r of refs) if (!ids.has(r)) erro(`@id sem nó: ${r}`)
    for (const n of nos) {
      const t = [n['@type']].flat()
      if (t.includes('WebPage') && !(n.url && n.name && n.isPartOf)) erro('WebPage incompleto')
      if (t.includes('Service') && !(n.name && n.provider)) erro('Service sem name/provider')
      if (t.includes('FAQPage') && !n.mainEntity?.length) erro('FAQPage vazio')
      if (
        t.includes('BreadcrumbList') &&
        !n.itemListElement?.every((i) => i.position && i.name && i.item)
      )
        erro('Breadcrumb incompleto')
    }
  }
  console.log(`ok? ${rel}`)
}

if (erros.length) {
  console.error(`\n${erros.length} problema(s):\n${erros.join('\n')}`)
  process.exit(1)
}
console.log('\nTudo certo.')
