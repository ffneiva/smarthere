import { SITE_URL } from './business.ts'
import { PAGINAS } from './paginas.ts'

/**
 * As rotas do site e o `<head>` de cada uma.
 *
 * Importado dos dois lados: pelo React e pelo vite.config.ts, que gera um HTML
 * estático por rota. Por isso não toca em `window` nem importa nada de DOM.
 */
export type Rota = {
  path: string
  rotulo: string
  titulo: string
  descricao: string
  noindex?: boolean
  /** Página de serviço: o slug do conteúdo em lib/paginas.ts. */
  pagina?: string
  /** As duas linhas grandes da arte de compartilhamento. */
  og?: readonly [string, string]
  ogNota?: string
}

export const ROTAS: Rota[] = [
  {
    path: '/',
    rotulo: 'Início',
    titulo: 'Smarthere · Conserto de celular com precisão de laboratório',
    descricao:
      'Troca de tela e bateria, conector de carga, câmera, tampa traseira e reparo de placa. Veja o celular por dentro, peça por peça, e peça seu orçamento por escrito.',
    og: ['A gente mostra', 'o que tem dentro.'],
    ogNota: 'Conserto de celular · smarthere.com.br',
  },
  // Uma página por serviço — o que as pessoas procuram no Google.
  ...PAGINAS.map((p) => ({
    path: `/conserto/${p.slug}`,
    rotulo: p.nome,
    titulo: p.titulo,
    descricao: p.descricao,
    pagina: p.slug,
  })),
  {
    path: '/marca',
    rotulo: 'Marca',
    titulo: 'Manual da marca · Smarthere',
    descricao:
      'O símbolo, as cores, as fontes e as regras de uso da marca Smarthere — com os arquivos do logotipo para baixar em SVG e PNG.',
    og: ['Manual', 'da marca.'],
    ogNota: 'Símbolo · cores · tipografia · smarthere.com.br',
  },
  {
    path: '/politica-de-privacidade',
    rotulo: 'Privacidade',
    titulo: 'Política de privacidade · Smarthere',
    descricao:
      'Como o site da Smarthere trata dados: o que fica no seu aparelho, o que vai para o WhatsApp e o que não é coletado.',
  },
]

/**
 * Endereço inexistente — servido como 404 de verdade (ver aws-setup.sh).
 * `noindex` evita o *soft 404*: uma URL errada devolvendo a home com 200.
 */
export const NAO_ENCONTRADA: Rota = {
  path: '/404',
  rotulo: 'Não encontrada',
  titulo: 'Página não encontrada · Smarthere',
  descricao: 'Este endereço não existe no site da Smarthere.',
  noindex: true,
}

function limpar(pathname: string): string {
  return pathname.replace(/\/+$/, '').toLowerCase() || '/'
}

export function rotaDe(pathname: string): Rota {
  return ROTAS.find((r) => r.path === limpar(pathname)) ?? NAO_ENCONTRADA
}

export function canonicalDe(rota: Rota): string {
  return rota.path === '/' ? `${SITE_URL}/` : `${SITE_URL}${rota.path}`
}

/**
 * Arquivo da arte de compartilhamento — a MESMA função no gerador
 * (scripts/make-brand.mjs) e no plugin que escreve o `<head>`.
 */
export function ogArquivoDe(rota: Rota): string {
  if (!rota.og || rota.path === '/') return 'og.jpg'
  return `og-${rota.path.replace(/^\//, '').replace(/\//g, '-')}.jpg`
}

export function ogUrlDe(rota: Rota): string {
  return `${SITE_URL}/${ogArquivoDe(rota)}`
}
