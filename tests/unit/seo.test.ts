import { describe, expect, it } from 'vitest'
import * as BUSINESS from '@/lib/business'
import {
  DIREITOS,
  EMPRESA,
  ETAPAS,
  FAQ,
  linkContato,
  MARCAS,
  mensagemDiagnostico,
  PASSOS,
  SERVICOS,
  SITE_URL,
  SOCORROS,
} from '@/lib/business'
import { PAGINAS } from '@/lib/paginas'
import { canonicalDe, NAO_ENCONTRADA, ogArquivoDe, ogUrlDe, ROTAS, rotaDe } from '@/lib/routes'
import { gerarJsonLd, gerarLlmsTxt } from '@/lib/seo'
import { cn, prefersReducedMotion } from '@/lib/utils'

type No = Record<string, unknown> & { '@type': string }
const grafo = (path: string) => gerarJsonLd(path)['@graph'] as No[]
const doTipo = (path: string, tipo: string) => grafo(path).filter((n) => n['@type'] === tipo)

describe('rotas', () => {
  it('encontra a rota ignorando barra final e caixa; o resto é 404', () => {
    expect(rotaDe('/Politica-de-Privacidade/').path).toBe('/politica-de-privacidade')
    expect(rotaDe('/marca').path).toBe('/marca')
    expect(rotaDe('/').path).toBe('/')
    expect(rotaDe('/cardapio')).toBe(NAO_ENCONTRADA)
  })

  it('títulos e descrições únicos, e dentro do que o Google mostra', () => {
    expect(new Set(ROTAS.map((r) => r.titulo)).size).toBe(ROTAS.length)
    for (const r of ROTAS) {
      expect(r.titulo.length, r.path).toBeLessThanOrEqual(70)
      expect(r.descricao.length, r.path).toBeGreaterThan(80)
      expect(r.descricao.length, r.path).toBeLessThanOrEqual(200)
      expect(r.titulo, r.path).toContain('Smarthere')
    }
    expect(NAO_ENCONTRADA.noindex).toBe(true)
  })

  it('canonical absoluta no domínio da marca e arte de compartilhamento', () => {
    expect(SITE_URL).toBe('https://smarthere.com.br')
    expect(canonicalDe(ROTAS[0])).toBe(`${SITE_URL}/`)
    expect(canonicalDe(rotaDe('/marca'))).toBe(`${SITE_URL}/marca`)
    expect(ogArquivoDe(ROTAS[0])).toBe('og.jpg')
    expect(ogArquivoDe(rotaDe('/marca'))).toBe('og-marca.jpg')
    expect(ogArquivoDe(rotaDe('/politica-de-privacidade'))).toBe('og.jpg')
    expect(ogUrlDe(ROTAS[0])).toBe(`${SITE_URL}/og.jpg`)
  })
})

describe('JSON-LD', () => {
  it('sem endereço, a empresa é Organization (não loja física inventada)', () => {
    expect(EMPRESA.endereco).toBeNull()
    const [o] = doTipo('/', 'Organization')
    expect(o.name).toBe('Smarthere')
    expect(o).not.toHaveProperty('address')
    expect(doTipo('/', 'LocalBusiness')).toHaveLength(0)
  })

  it('sem nota autodeclarada, sem horário, sem preço', () => {
    for (const r of ROTAS) {
      const json = JSON.stringify(gerarJsonLd(r.path))
      expect(json).not.toContain('aggregateRating')
      expect(json).not.toContain('openingHours')
      expect(json).not.toContain('priceRange')
      expect(json).not.toMatch(/"price"/)
    }
  })

  it('todos os serviços entram no catálogo', () => {
    const [o] = doTipo('/', 'Organization')
    const catalogo = JSON.stringify(o.hasOfferCatalog)
    for (const s of SERVICOS) expect(catalogo).toContain(s.nome)
  })

  it('FAQPage só na home; trilha só nas páginas internas', () => {
    expect(doTipo('/', 'FAQPage')).toHaveLength(1)
    expect(doTipo('/marca', 'FAQPage')).toHaveLength(0)
    expect(doTipo('/', 'BreadcrumbList')).toHaveLength(0)
    const [trilha] = doTipo('/politica-de-privacidade', 'BreadcrumbList')
    expect(JSON.stringify(trilha)).toContain('Privacidade')
    const [faq] = doTipo('/', 'FAQPage')
    expect((faq.mainEntity as unknown[]).length).toBe(FAQ.length)
  })
})

describe('contato', () => {
  it('o contato é o WhatsApp da loja, com a mensagem codificada inteira', () => {
    expect(EMPRESA.whatsapp).toBe('556499730616')
    const url = new URL(linkContato('Tela trincada & toque falhando?'))
    expect(url.hostname).toBe('wa.me')
    expect(url.pathname).toBe('/556499730616')
    expect(url.searchParams.get('text')).toBe('Tela trincada & toque falhando?')
  })

  it('o diagnóstico rápido monta a mensagem com aparelho, sintomas e detalhe', () => {
    const m = mensagemDiagnostico({
      marca: 'Samsung',
      modelo: ' S23 ',
      sintomas: ['tela', 'agua'],
      detalhe: 'caiu ontem',
    })
    expect(m).toContain('Tenho Samsung S23 com: tela quebrada ou falhando, caiu na água.')
    expect(m).toContain('Detalhes: caiu ontem')
    expect(mensagemDiagnostico({ marca: '', modelo: '', sintomas: [], detalhe: '' })).toContain(
      'Tenho um celular.',
    )
  })
})

describe('conteúdo', () => {
  it('nenhum preço em lugar nenhum do site', () => {
    expect(JSON.stringify(BUSINESS)).not.toMatch(/R\$\s?\d/)
    expect(gerarLlmsTxt()).not.toMatch(/R\$\s?\d/)
  })

  it('nenhum número de prova social inventado', () => {
    const tudo = JSON.stringify(BUSINESS)
    expect(tudo).not.toMatch(/\+\s?\d+\s?(mil|clientes|aparelhos)/i)
    expect(tudo).not.toMatch(/\d+ anos de experiência/i)
  })

  it('os passos do tour têm número em sequência e mensagem própria', () => {
    expect(PASSOS.map((p) => p.numero)).toEqual(['01', '02', '03', '04', '05', '06', '07', '08'])
    expect(new Set(PASSOS.map((p) => p.mensagem)).size).toBe(PASSOS.length)
    for (const p of PASSOS) expect(p.pecas3d.length).toBeGreaterThan(0)
  })

  it('os direitos citam o CDC literalmente, com artigo; os socorros têm passos', () => {
    expect(DIREITOS.map((d) => d.artigo)).toEqual(['Art. 40', 'Art. 21', 'Art. 26, II'])
    expect(DIREITOS[0].citacao).toContain('orçamento prévio')
    expect(DIREITOS[2].citacao).toContain('noventa dias')
    for (const s of SOCORROS) expect(s.passos.length).toBeGreaterThan(0)
    expect(SOCORROS[0].fonte?.url).toMatch(/^https:\/\/support\.apple\.com\//)
  })

  it('as etapas e as marcas existem', () => {
    expect(ETAPAS).toHaveLength(5)
    expect(MARCAS.length).toBeGreaterThan(3)
  })
})

describe('páginas de serviço', () => {
  it('uma rota por página, com conteúdo próprio e sem repetição', () => {
    for (const p of PAGINAS) {
      const rota = rotaDe(`/conserto/${p.slug}`)
      expect(rota.pagina, p.slug).toBe(p.slug)
      expect(p.sinais.length, p.slug).toBeGreaterThanOrEqual(3)
      expect(p.reparo.length, p.slug).toBeGreaterThanOrEqual(3)
      expect(p.perguntas.length, p.slug).toBeGreaterThanOrEqual(1)
      expect(p.resumo.length, p.slug).toBeGreaterThan(120)
    }
    expect(new Set(PAGINAS.map((p) => p.resumo)).size).toBe(PAGINAS.length)
    expect(new Set(PAGINAS.map((p) => p.h1)).size).toBe(PAGINAS.length)
  })

  it('todo serviço com slug tem página', () => {
    for (const s of SERVICOS) if (s.slug) expect(PAGINAS.some((p) => p.slug === s.slug)).toBe(true)
  })

  it('o JSON-LD da página traz o serviço, as perguntas dele e a trilha', () => {
    const p = PAGINAS[0]
    const path = `/conserto/${p.slug}`
    const [servico] = doTipo(path, 'Service')
    expect(servico.name).toBe(p.h1)
    expect(servico.provider).toEqual({ '@id': 'https://smarthere.com.br/#smarthere' })
    const [faq] = doTipo(path, 'FAQPage')
    expect((faq.mainEntity as unknown[]).length).toBe(p.perguntas.length)
    expect(doTipo(path, 'BreadcrumbList')).toHaveLength(1)
    expect(doTipo(path, 'WebSite')).toHaveLength(1)
  })
})

describe('llms.txt', () => {
  it('traz contato, serviços, peças, direitos e o FAQ', () => {
    const txt = gerarLlmsTxt()
    expect(txt.startsWith(`# ${EMPRESA.nome}\n`)).toBe(true)
    expect(txt).toContain(EMPRESA.telefone)
    expect(txt).toContain('wa.me/556499730616')
    expect(txt).toContain('Troca de bateria')
    expect(txt).toContain('Art. 40')
    for (const p of FAQ) expect(txt).toContain(p.pergunta)
    expect(txt.endsWith('\n')).toBe(true)
  })
})

describe('utilitários', () => {
  it('cn junta classes e ignora falsy', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b')
  })

  it('prefersReducedMotion é falso fora do navegador', () => {
    expect(prefersReducedMotion()).toBe(false)
  })
})
