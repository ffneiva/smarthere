import {
  CDC_URL,
  DIREITOS,
  EMPRESA,
  ETAPAS,
  FAQ,
  linkContato,
  MARCAS,
  PASSOS,
  SERVICOS,
  SITE_URL,
} from './business.ts'
import { PAGINAS } from './paginas.ts'
import { canonicalDe, ogUrlDe, ROTAS } from './routes.ts'

/**
 * Dados estruturados (JSON-LD) e llms.txt — ambos derivados de business.ts.
 *
 * Enquanto a loja não tem endereço, o nó é uma `Organization` com o catálogo
 * de serviços. Quando `EMPRESA.endereco` existir, ele vira `LocalBusiness`
 * com endereço — sem mudar mais nada. Três ausências deliberadas:
 *
 *   · sem `aggregateRating`: nota autodeclarada o Google não mostra e pode
 *     punir — e a loja ainda não tem avaliações;
 *   · sem `openingHoursSpecification`: o horário ainda não existe;
 *   · sem `priceRange` nem `offers` com preço: o valor sai no orçamento.
 */
const ID = `${SITE_URL}/#smarthere`

function noDaEmpresa() {
  const e = EMPRESA.endereco
  const sameAs = EMPRESA.instagram ? [`https://www.instagram.com/${EMPRESA.instagram}/`] : []
  return {
    '@type': e ? 'LocalBusiness' : 'Organization',
    '@id': ID,
    name: EMPRESA.nome,
    slogan: EMPRESA.lema,
    description: EMPRESA.descricao,
    url: `${SITE_URL}/`,
    logo: {
      '@type': 'ImageObject',
      '@id': `${SITE_URL}/#logo`,
      url: `${SITE_URL}/icon-512.png`,
      width: 512,
      height: 512,
      caption: EMPRESA.nome,
    },
    image: `${SITE_URL}/og.jpg`,
    telephone: `+${EMPRESA.whatsapp}`,
    // O único canal da loja é o WhatsApp: o ponto de contato diz isso ao Google.
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: `+${EMPRESA.whatsapp}`,
      contactType: 'customer service',
      availableLanguage: ['pt-BR'],
      url: linkContato(),
    },
    ...(e
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: e.logradouro,
            addressLocality: e.cidade,
            addressRegion: e.uf,
            postalCode: e.cep,
            addressCountry: 'BR',
          },
        }
      : {}),
    knowsAbout: ['Conserto de celular', 'Troca de tela', 'Troca de bateria', 'Microssoldagem'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Serviços de conserto de celular',
      itemListElement: SERVICOS.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.nome, description: s.detalhe },
      })),
    },
    potentialAction: {
      '@type': 'CommunicateAction',
      target: linkContato(),
      name: 'Pedir orçamento',
    },
    ...(sameAs.length ? { sameAs } : {}),
  }
}

/** O site em si: nome, idioma e quem publica — o que o Google usa no nome do resultado. */
function noDoSite() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#site`,
    url: `${SITE_URL}/`,
    name: EMPRESA.nome,
    inLanguage: 'pt-BR',
    publisher: { '@id': ID },
  }
}

/** Página de serviço: o serviço oferecido, com quem oferece e onde. */
function noDoServico(slug: string) {
  const p = PAGINAS.find((x) => x.slug === slug)
  if (!p) return []
  const url = `${SITE_URL}/conserto/${p.slug}`
  return [
    {
      '@type': 'Service',
      '@id': `${url}#servico`,
      name: p.h1,
      serviceType: p.nome,
      description: p.resumo,
      url,
      provider: { '@id': ID },
      areaServed: { '@type': 'Country', name: 'Brasil' },
      potentialAction: {
        '@type': 'CommunicateAction',
        target: linkContato(p.mensagem),
        name: 'Pedir orçamento pelo WhatsApp',
      },
    },
    faq(p.perguntas),
  ]
}

function faq(itens: { pergunta: string; resposta: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: itens.map((p) => ({
      '@type': 'Question',
      name: p.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: p.resposta },
    })),
  }
}

function noDoFaq() {
  return {
    '@type': 'FAQPage',
    mainEntity: FAQ.map((p) => ({
      '@type': 'Question',
      name: p.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: p.resposta },
    })),
  }
}

function trilha(path: string) {
  const rota = ROTAS.find((r) => r.path === path)
  if (!rota || path === '/') return null
  const itens = [{ name: 'Início', item: `${SITE_URL}/` }]
  if (rota.pagina) itens.push({ name: 'Serviços', item: `${SITE_URL}/#servicos` })
  itens.push({ name: rota.rotulo, item: canonicalDe(rota) })
  return {
    '@type': 'BreadcrumbList',
    '@id': `${canonicalDe(rota)}#trilha`,
    itemListElement: itens.map((x, i) => ({ '@type': 'ListItem', position: i + 1, ...x })),
  }
}

/**
 * A página em si: liga título, descrição, imagem e trilha à empresa e ao
 * site. É o nó que diz ao Google "esta URL é sobre isto, publicada por quem".
 */
function noDaPagina(path: string) {
  const rota = ROTAS.find((r) => r.path === path)
  if (!rota) return null
  const url = canonicalDe(rota)
  return {
    '@type': 'WebPage',
    '@id': `${url}#pagina`,
    url,
    name: rota.titulo,
    description: rota.descricao,
    inLanguage: 'pt-BR',
    isPartOf: { '@id': `${SITE_URL}/#site` },
    about: { '@id': ID },
    primaryImageOfPage: { '@type': 'ImageObject', url: ogUrlDe(rota), width: 1200, height: 630 },
    ...(path !== '/' ? { breadcrumb: { '@id': `${url}#trilha` } } : {}),
    ...(rota.pagina ? { mainEntity: { '@id': `${url}#servico` } } : {}),
  }
}

/** Na home: a lista das páginas de serviço, na ordem do site. */
function listaDeServicos() {
  return {
    '@type': 'ItemList',
    '@id': `${SITE_URL}/#servicos`,
    name: 'Serviços de conserto de celular da Smarthere',
    itemListElement: PAGINAS.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.nome,
      url: `${SITE_URL}/conserto/${p.slug}`,
    })),
  }
}

/**
 * O grafo de uma rota: a empresa e o site em todas; o FAQ geral só na home;
 * nas páginas de serviço, o serviço e as perguntas dele.
 */
export function gerarJsonLd(path = '/') {
  const grafo: Record<string, unknown>[] = [noDaEmpresa(), noDoSite()]
  const pagina = noDaPagina(path)
  if (pagina) grafo.push(pagina)
  if (path === '/') grafo.push(noDoFaq(), listaDeServicos())
  const rota = ROTAS.find((r) => r.path === path)
  if (rota?.pagina) grafo.push(...noDoServico(rota.pagina))
  const b = trilha(path)
  if (b) grafo.push(b)
  return { '@context': 'https://schema.org', '@graph': grafo }
}

/** llms.txt — o site resumido para assistentes de IA, com os dados da página. */
export function gerarLlmsTxt(): string {
  const l: string[] = [
    `# ${EMPRESA.nome}`,
    '',
    `> ${EMPRESA.lema} ${EMPRESA.descricao}`,
    '',
    '## Contato',
    '',
    `- Site: ${SITE_URL}`,
    `- WhatsApp: ${EMPRESA.telefone} (https://wa.me/${EMPRESA.whatsapp})`,
  ]
  if (EMPRESA.instagram) l.push(`- Instagram: @${EMPRESA.instagram}`)
  if (EMPRESA.endereco) {
    const e = EMPRESA.endereco
    l.push(`- Endereço: ${e.logradouro}, ${e.bairro}, ${e.cidade} - ${e.uf}, ${e.cep}`)
  }
  l.push('- Preços: informados no orçamento (o site não publica preço).', '')
  l.push('## Serviços', '')
  for (const s of SERVICOS) {
    const pagina = s.slug ? ` (${SITE_URL}/conserto/${s.slug})` : ''
    l.push(`- ${s.nome}: ${s.detalhe}${pagina}`)
  }
  l.push('', '## Guias por serviço', '')
  for (const p of PAGINAS) {
    l.push(`### ${p.h1}`, '', `${SITE_URL}/conserto/${p.slug}`, '', p.resumo, '')
    l.push(`Sinais: ${p.sinais.join('; ')}.`, '', `Por que acontece: ${p.causas}`, '')
    l.push('Até o reparo:', ...p.cuidados.map((c) => `- ${c}`), '')
    for (const q of p.perguntas) l.push(`**${q.pergunta}** ${q.resposta}`)
    l.push('')
  }
  l.push('', '## As peças do celular e o que costuma falhar', '')
  for (const p of PASSOS) l.push(`- ${p.peca} (${p.servico}): ${p.sintomas.join('; ')}. ${p.nota}`)
  l.push('', '## Como funciona', '')
  for (const e of ETAPAS) l.push(`${e.numero}. ${e.titulo}: ${e.texto}`)
  l.push('', `## Seus direitos no conserto (Código de Defesa do Consumidor, ${CDC_URL})`, '')
  for (const d of DIREITOS) l.push(`- ${d.artigo} · ${d.titulo}: ${d.texto}`)
  l.push('', '## Marcas atendidas', '', MARCAS.join(', '), '')
  l.push('## Perguntas frequentes', '')
  for (const p of FAQ) l.push(`**${p.pergunta}**`, p.resposta, '')
  return `${l.join('\n').trim()}\n`
}

/**
 * llms-full.txt: o llms.txt com o passo a passo de cada reparo. Para os
 * assistentes de IA que leem o site inteiro de uma vez, sem executar o JS.
 */
export function gerarLlmsFullTxt(): string {
  const l: string[] = [gerarLlmsTxt().trim(), '', '## Como é cada reparo, passo a passo', '']
  for (const p of PAGINAS) {
    l.push(`### ${p.h1}`, '', `${SITE_URL}/conserto/${p.slug}`, '')
    l.push(...p.reparo.map((r, i) => `${i + 1}. ${r}`))
    l.push('')
  }
  return `${l.join('\n').trim()}\n`
}
