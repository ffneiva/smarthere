/**
 * TODO o conteúdo do site. Fonte única: a página, o JSON-LD, o llms.txt, o
 * <noscript> e as mensagens de contato saem daqui.
 *
 * A Smarthere ainda não abriu as portas: em 06/10/2026 existiam só o nome e
 * o domínio smarthere.com.br. Por isso este arquivo separa com cuidado três
 * tipos de informação:
 *
 *   · **Fato verificável** — o que a lei garante (Código de Defesa do
 *     Consumidor, com o artigo e o link) e o que o fabricante recomenda
 *     (com o link da página de suporte). Vai para o site como está.
 *   · **Proposta** — o jeito de trabalhar que o site promete (orçamento por
 *     escrito, peça trocada devolvida, teste na frente do cliente). É o
 *     posicionamento sugerido para a marca; está marcado CONFIRMAR e
 *     listado no DEPLOY.md, para o dono validar antes de divulgar.
 *   · **Dado que não existe ainda** — endereço, telefone, horário, CNPJ,
 *     Instagram. Fica `null` e o site se adapta: sem endereço, o rodapé
 *     não inventa um.
 *
 * Nada aqui é inventado: sem depoimento, sem nota, sem "+10 mil aparelhos
 * consertados", sem preço.
 */

export const SITE_URL = 'https://smarthere.com.br'

/**
 * O domínio é da própria marca, então o site já nasce indexável — a
 * canonical aponta para smarthere.com.br mesmo enquanto o endereço
 * provisório (*.cloudfront.net) está no ar.
 */
export const INDEXAVEL = true

export const EMPRESA = {
  nome: 'Smarthere',
  dominio: 'smarthere.com.br',
  lema: 'Conserto de celular com a precisão de laboratório.',
  /** A frase da marca: "smart" + "here". */
  assinatura: 'O conserto inteligente acontece aqui.',
  descricao:
    'Assistência técnica de celulares: troca de tela e bateria, conector de carga, câmera, tampa traseira, áudio, botões e reparo de placa, com orçamento por escrito antes de qualquer reparo.',
  /**
   * O WhatsApp da loja, só dígitos com DDI e DDD — o único canal de contato
   * (a empresa não tem e-mail). Passado pelo Felipe em 06/10/2026 como
   * "+55 64 9973-0616", provisório. CONFIRMAR: o número tem 8 dígitos depois
   * do DDD; se a conta foi criada com o 9 na frente, trocar por 5564999730616.
   */
  whatsapp: '556499730616',
  /** O mesmo número, para leitura. */
  telefone: '(64) 9973-0616',
  /** CONFIRMAR: o perfil do Instagram, sem @. */
  instagram: null as string | null,
  /**
   * CONFIRMAR: endereço da loja. Enquanto não existir, o site não mostra
   * mapa nem endereço, e o JSON-LD é de `Organization` (não de loja física).
   */
  endereco: null as null | {
    logradouro: string
    bairro: string
    cidade: string
    uf: string
    cep: string
  },
  /** CONFIRMAR: horário de atendimento. Sem ele, o site não publica horário. */
  horario: null as string | null,
} as const

/* ── Contato ─────────────────────────────────────────────────────────── */

export const MENSAGEM_PADRAO = 'Olá, Smarthere! Vim pelo site e quero um orçamento de conserto.'

/** O link do WhatsApp com a mensagem já escrita. */
export function linkContato(texto: string = MENSAGEM_PADRAO): string {
  return `https://wa.me/${EMPRESA.whatsapp}?text=${encodeURIComponent(texto)}`
}

export const ROTULO_CONTATO = 'Orçamento pelo WhatsApp'

/* ── O aparelho: as peças, na ordem em que o celular 3D se monta ────── */

/** As peças do celular 3D (ver src/scene/modelo.ts). */
export type IdPeca =
  | 'tela'
  | 'chassi'
  | 'placa'
  | 'bateria'
  | 'conector'
  | 'audio'
  | 'camera'
  | 'bobina'
  | 'traseira'

export type Passo = {
  id: string
  numero: string
  /** O nome da peça, como aparece no tour. */
  peca: string
  /** As peças 3D que acendem neste passo (a tela leva o vidro junto). */
  pecas3d: (IdPeca | 'vidro')[]
  /** O serviço que resolve. */
  servico: string
  /** Como a pessoa percebe que é essa peça — os sintomas, na língua dela. */
  sintomas: string[]
  /** O que vale saber antes — explicação técnica honesta, sem prometer. */
  nota: string
  /** A mensagem que o botão do passo já deixa escrita. */
  mensagem: string
}

export const PASSOS: Passo[] = [
  {
    id: 'traseira',
    numero: '01',
    peca: 'Tampa traseira',
    pecas3d: ['traseira', 'bobina'],
    servico: 'Troca do vidro traseiro',
    sintomas: ['Vidro de trás trincado', 'Tampa descolando', 'Lascas na ilha das câmeras'],
    nota: 'Em muitos modelos o vidro traseiro é colado direto no chassi. Antes de começar, explicamos como ele sai no seu aparelho e o que é trocado junto, como a fita de vedação.',
    mensagem: 'Olá, Smarthere! Quero um orçamento de troca da tampa traseira.',
  },
  {
    id: 'camera',
    numero: '02',
    peca: 'Câmeras',
    pecas3d: ['camera'],
    servico: 'Reparo de câmera',
    sintomas: [
      'Foto embaçada ou com mancha',
      'Câmera tremendo ou fazendo barulho',
      'Tela preta ao abrir a câmera',
    ],
    nota: 'Quando só o vidrinho da lente quebrou, ele é trocado sozinho, sem mexer no módulo. Se o problema for o módulo, dizemos qual das câmeras e por quê.',
    mensagem: 'Olá, Smarthere! Quero um orçamento de reparo de câmera.',
  },
  {
    id: 'placa',
    numero: '03',
    peca: 'Placa lógica',
    pecas3d: ['placa'],
    servico: 'Reparo de placa',
    sintomas: ['Não liga', 'Reinicia sozinho', 'Sem sinal ou sem Wi-Fi', 'Caiu na água'],
    // CONFIRMAR: a loja vai oferecer microssoldagem (componente) ou só troca
    // de módulo? O texto abaixo assume microscópio e estação de solda.
    nota: 'Com microscópio e estação de solda, o reparo é no componente que falhou (um capacitor, um CI), e não na troca da placa inteira, que costuma custar quase um aparelho novo.',
    mensagem: 'Olá, Smarthere! Meu celular não liga / tem problema na placa.',
  },
  {
    id: 'bateria',
    numero: '04',
    peca: 'Bateria',
    pecas3d: ['bateria'],
    servico: 'Troca de bateria',
    sintomas: ['Descarrega rápido', 'Desliga com carga sobrando', 'Esquenta ou estufou'],
    nota: 'Bateria estufada empurra a tela e a tampa para fora. Se for o caso, pare de usar e de carregar o aparelho e traga logo. Não tente furar nem apertar.',
    mensagem: 'Olá, Smarthere! Quero um orçamento de troca de bateria.',
  },
  {
    id: 'conector',
    numero: '05',
    peca: 'Conector de carga',
    pecas3d: ['conector'],
    servico: 'Limpeza ou troca do conector',
    sintomas: ['Só carrega numa posição', 'Cabo frouxo', 'Não aparece no computador'],
    nota: 'Muitas vezes é poeira de bolso compactada no fundo da porta. Limpamos e testamos primeiro; a troca do conector só entra no orçamento se a limpeza não resolver.',
    mensagem: 'Olá, Smarthere! Meu celular está com problema para carregar.',
  },
  {
    id: 'audio',
    numero: '06',
    peca: 'Áudio e vibração',
    pecas3d: ['audio'],
    servico: 'Alto-falante, microfone e vibração',
    sintomas: ['Não ouve nem é ouvido na ligação', 'Som baixo ou chiando', 'Vibração fraca'],
    nota: 'Antes de trocar o alto-falante, limpamos a grade: poeira e oleosidade abafam o som e são a causa mais comum.',
    mensagem: 'Olá, Smarthere! Meu celular está com problema de som.',
  },
  {
    id: 'chassi',
    numero: '07',
    peca: 'Chassi e botões',
    pecas3d: ['chassi'],
    servico: 'Botões e carcaça',
    sintomas: ['Botão afundado ou sem clique', 'Carcaça empenada', 'Gaveta do chip presa'],
    nota: 'O chassi é a espinha do aparelho: se ele empenou numa queda, a tela nova também trinca. Por isso conferimos o alinhamento antes de instalar qualquer peça.',
    mensagem: 'Olá, Smarthere! Quero um orçamento de botões/carcaça.',
  },
  {
    id: 'tela',
    numero: '08',
    peca: 'Tela',
    pecas3d: ['vidro', 'tela'],
    servico: 'Troca de tela',
    sintomas: ['Vidro trincado', 'Toque falhando ou "fantasma"', 'Manchas, linhas ou tela preta'],
    nota: 'Nos aparelhos atuais, vidro e display vêm colados de fábrica: a troca é do conjunto. Antes de fechar, testamos toque, brilho, cores e o sensor de proximidade.',
    mensagem: 'Olá, Smarthere! Quero um orçamento de troca de tela.',
  },
]

/* ── Serviços (lista completa) ───────────────────────────────────────── */

export type Servico = {
  nome: string
  detalhe: string
  mensagem: string
  /** A página do serviço (/conserto/<slug>), quando ele tem uma. */
  slug?: string
}

/**
 * A lista de consulta: os serviços do tour e os que não têm peça para
 * mostrar (software, dados, aparelho molhado). Sem preço — o valor depende
 * de modelo e peça e sai no orçamento.
 */
/**
 * O endereço da página de cada serviço: as palavras que as pessoas digitam
 * no Google ("troca de tela de celular"), não o nome interno da peça.
 */
const SLUG_DO_PASSO: Record<string, string> = {
  tela: 'troca-de-tela-de-celular',
  bateria: 'troca-de-bateria-de-celular',
  conector: 'conector-de-carga-de-celular',
  camera: 'conserto-de-camera-de-celular',
  traseira: 'troca-de-tampa-traseira-de-celular',
  placa: 'reparo-de-placa-de-celular',
  audio: 'alto-falante-e-microfone-de-celular',
  chassi: 'botoes-e-carcaca-de-celular',
}

/** A ordem da lista: a do que mais se procura, não a da montagem. */
const ORDEM_DE_PROCURA = [
  'tela',
  'bateria',
  'conector',
  'camera',
  'traseira',
  'placa',
  'audio',
  'chassi',
]

export const SERVICOS: Servico[] = [
  ...ORDEM_DE_PROCURA.map((id) => PASSOS.find((p) => p.id === id) as Passo).map((p) => ({
    nome: p.servico,
    detalhe: p.sintomas.join(' · '),
    mensagem: p.mensagem,
    slug: SLUG_DO_PASSO[p.id],
  })),
  {
    nome: 'Aparelho molhado',
    detalhe: 'Limpeza da placa contra oxidação e diagnóstico do que foi afetado',
    mensagem: 'Olá, Smarthere! Meu celular molhou. O que eu faço?',
    slug: 'celular-molhado',
  },
  {
    nome: 'Software e dados',
    detalhe: 'Backup, transferência para o aparelho novo, atualização e restauração',
    mensagem: 'Olá, Smarthere! Preciso de ajuda com backup/transferência de dados.',
    slug: 'backup-e-transferencia-de-dados-do-celular',
  },
  {
    nome: 'Diagnóstico',
    detalhe: 'Não sabe o que é? Abrimos, medimos e dizemos, antes de qualquer reparo',
    mensagem: 'Olá, Smarthere! Meu celular está com um problema e não sei o que é.',
  },
]

/**
 * CONFIRMAR: as marcas que a loja vai atender. Os nomes aparecem como
 * texto (nunca o logotipo do fabricante) e o site não diz "autorizada".
 */
export const MARCAS = ['iPhone', 'Samsung', 'Motorola', 'Xiaomi', 'Realme', 'Asus', 'Google Pixel']

/* ── Como funciona ───────────────────────────────────────────────────── */

export type Etapa = { numero: string; titulo: string; texto: string; leitura: string }

/** CONFIRMAR: o fluxo é a proposta da marca; o dono valida antes de divulgar. */
export const ETAPAS: Etapa[] = [
  {
    numero: '01',
    titulo: 'Você conta o problema',
    texto:
      'Modelo do aparelho e o que está acontecendo. Com isso já dá para dizer o que provavelmente é e quanto pode custar.',
    leitura: 'ENTRADA',
  },
  {
    numero: '02',
    titulo: 'Diagnóstico na bancada',
    texto:
      'O aparelho é aberto, medido e testado. A gente diz o que é e o que não é, para você não pagar por peça que não precisava.',
    leitura: 'MEDIÇÃO',
  },
  {
    numero: '03',
    titulo: 'Orçamento por escrito',
    texto:
      'Mão de obra, peça, prazo e forma de pagamento, discriminados. Você aprova ou não; sem aprovação, nada é trocado.',
    leitura: 'CDC ART. 40',
  },
  {
    numero: '04',
    titulo: 'Reparo',
    texto:
      'Peça nova ou com especificação de fábrica. A peça que saiu volta para você, se quiser ver.',
    leitura: 'CDC ART. 21',
  },
  {
    numero: '05',
    titulo: 'Teste e entrega',
    texto:
      'Tela, toque, carga, câmeras, áudio e sinal testados na sua frente. O serviço sai com garantia.',
    leitura: 'CDC ART. 26',
  },
]

/* ── Seus direitos no conserto (fato, com fonte) ─────────────────────── */

export const CDC_URL = 'https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm'

export type Direito = { artigo: string; titulo: string; texto: string; citacao: string }

/**
 * O que o Código de Defesa do Consumidor (Lei 8.078/1990) garante em todo
 * conserto — em qualquer loja. A citação é literal (conferida no Planalto
 * em 06/10/2026); o texto ao lado é a tradução para o dia a dia.
 */
export const DIREITOS: Direito[] = [
  {
    artigo: 'Art. 40',
    titulo: 'Orçamento antes do reparo',
    texto:
      'A loja é obrigada a entregar o orçamento discriminado antes de começar. Aprovado, ele vale para os dois lados; sem estipulação em contrário, o valor orçado vale por dez dias.',
    citacao:
      'O fornecedor de serviço será obrigado a entregar ao consumidor orçamento prévio discriminando o valor da mão-de-obra, dos materiais e equipamentos a serem empregados, as condições de pagamento, bem como as datas de início e término dos serviços.',
  },
  {
    artigo: 'Art. 21',
    titulo: 'Peça adequada',
    texto:
      'No conserto, a peça de reposição tem de ser original e nova, ou manter as especificações técnicas do fabricante. Uma peça fora disso só com a sua autorização.',
    citacao:
      'No fornecimento de serviços que tenham por objetivo a reparação de qualquer produto considerar-se-á implícita a obrigação do fornecedor de empregar componentes de reposição originais adequados e novos, ou que mantenham as especificações técnicas do fabricante, salvo, quanto a estes últimos, autorização em contrário do consumidor.',
  },
  {
    artigo: 'Art. 26, II',
    titulo: '90 dias para reclamar',
    texto:
      'Celular é produto durável: você tem noventa dias, contados da entrega, para reclamar de defeito aparente no serviço.',
    citacao:
      'O direito de reclamar pelos vícios aparentes ou de fácil constatação caduca em: [...] II - noventa dias, tratando-se de fornecimento de serviço e de produtos duráveis.',
  },
]

/* ── Diagnóstico rápido (o formulário que monta a mensagem) ──────────── */

export const SINTOMAS_RAPIDOS = [
  { id: 'tela', rotulo: 'Tela quebrada ou falhando' },
  { id: 'bateria', rotulo: 'Bateria fraca ou estufada' },
  { id: 'conector', rotulo: 'Não carrega direito' },
  { id: 'camera', rotulo: 'Câmera com problema' },
  { id: 'traseira', rotulo: 'Vidro de trás quebrado' },
  { id: 'placa', rotulo: 'Não liga / reinicia' },
  { id: 'agua', rotulo: 'Caiu na água' },
  { id: 'audio', rotulo: 'Som ou microfone' },
  { id: 'outro', rotulo: 'Outro problema' },
] as const

export type IdSintoma = (typeof SINTOMAS_RAPIDOS)[number]['id']

/** A mensagem que o diagnóstico rápido deixa escrita. */
export function mensagemDiagnostico(dados: {
  marca: string
  modelo: string
  sintomas: IdSintoma[]
  detalhe: string
}): string {
  const aparelho = [dados.marca, dados.modelo.trim()].filter(Boolean).join(' ') || 'um celular'
  const lista = dados.sintomas
    .map((id) => SINTOMAS_RAPIDOS.find((s) => s.id === id)?.rotulo.toLowerCase())
    .filter(Boolean)
  const partes = [`Olá, Smarthere! Tenho ${aparelho}`]
  partes[0] += lista.length ? ` com: ${lista.join(', ')}.` : '.'
  if (dados.detalhe.trim()) partes.push(`Detalhes: ${dados.detalhe.trim()}`)
  partes.push('Podem me passar uma estimativa?')
  return partes.join('\n')
}

/* ── Primeiros socorros (fato, com fonte) ────────────────────────────── */

export type Socorro = { titulo: string; passos: string[]; fonte?: { rotulo: string; url: string } }

export const SOCORROS: Socorro[] = [
  {
    titulo: 'Caiu na água',
    passos: [
      'Desligue e não carregue até secar: corrente elétrica com umidade é o que oxida a placa.',
      'Seque por fora e deixe a porta de carga virada para baixo, em lugar ventilado.',
      'Não coloque no arroz: pequenas partículas podem entrar no aparelho e danificá-lo.',
    ],
    fonte: {
      rotulo: 'Apple · Se um alerta de detecção de líquido for exibido no iPhone',
      url: 'https://support.apple.com/pt-br/102643',
    },
  },
  {
    titulo: 'Bateria estufada',
    passos: [
      'Pare de usar e de carregar.',
      'Não aperte, não fure, não tente "desamassar" a tampa ou a tela.',
      'Guarde longe de calor e traga para a troca.',
    ],
  },
  {
    titulo: 'Tela trincada',
    passos: [
      'Uma película por cima segura os cacos e protege o dedo até o reparo.',
      'Se o toque começar a falhar sozinho, faça backup já: o próximo passo pode ser a tela apagar.',
    ],
  },
]

/* ── Perguntas frequentes ────────────────────────────────────────────── */

export const FAQ = [
  {
    pergunta: 'Quanto custa o conserto?',
    resposta:
      'Depende do modelo e da peça: uma tela de um aparelho pode custar o triplo da de outro. Mande o modelo e o problema que respondemos com uma estimativa; o valor fechado vem por escrito depois do diagnóstico, antes de qualquer reparo.',
  },
  {
    pergunta: 'Quanto tempo leva?',
    resposta:
      'Depende do reparo e de a peça estar em estoque. O prazo vem junto com o orçamento, com data de início e de término, como a lei pede (CDC, art. 40).',
  },
  {
    pergunta: 'Que peça vocês usam?',
    resposta:
      'Peça nova, original ou que mantenha a especificação técnica do fabricante, como manda o art. 21 do Código de Defesa do Consumidor. Se houver mais de uma opção de peça para o seu modelo, o orçamento mostra as opções e a diferença entre elas.',
  },
  {
    pergunta: 'Vou perder minhas fotos e conversas?',
    resposta:
      'A maioria dos reparos (tela, bateria, conector, câmera) não mexe no armazenamento. Reparo de placa pode mexer: nesses casos avisamos antes e, se o aparelho ainda liga, ajudamos a fazer o backup primeiro.',
  },
  {
    pergunta: 'O conserto tem garantia?',
    resposta:
      'Sim. Pelo Código de Defesa do Consumidor, você tem 90 dias, a partir da entrega, para reclamar de defeito no serviço (art. 26, II). A garantia cobre o serviço feito e a peça trocada, mas não cobre uma queda ou um contato com líquido novos.',
  },
  {
    pergunta: 'Quais marcas vocês atendem?',
    resposta: `${MARCAS.slice(0, -1).join(', ')} e ${MARCAS.at(-1)}. Se o seu não está na lista, pergunte: o diagnóstico dirá se a peça existe para o seu modelo.`,
  },
]

/* ── Privacidade ─────────────────────────────────────────────────────── */

export const PRIVACIDADE = [
  {
    titulo: 'O que o site coleta',
    texto:
      'Nada que identifique você. Não há cadastro, login nem formulário que envie dados para um servidor nosso. O diagnóstico rápido monta a mensagem no seu próprio aparelho.',
  },
  {
    titulo: 'Quando você fala com a gente',
    texto:
      'Ao clicar em "orçamento pelo WhatsApp", o WhatsApp abre com a mensagem já escrita. Você revisa e decide se envia. O que chega até nós é o que você mandou, e só isso.',
  },
  {
    titulo: 'Medição de audiência',
    texto:
      'Se a medição estiver ligada, o site usa o Google Analytics com IP anonimizado, para saber quantas pessoas visitam e quais botões usam. Nenhum dado pessoal é vendido ou repassado.',
  },
  {
    titulo: 'O que fica no seu aparelho',
    texto:
      'Um registro de que a abertura animada já foi vista nesta sessão, para ela não se repetir. Some quando a aba é fechada.',
  },
  {
    titulo: 'Seus direitos',
    texto: `Pela LGPD, você pode pedir a qualquer momento acesso, correção ou exclusão dos dados que tenha nos enviado. Fale com a gente pelo WhatsApp ${EMPRESA.telefone}.`,
  },
]

export const NAO_ENCONTRADA_TEXTO = {
  rotulo: 'Erro 404',
  titulo: 'Essa peça não está aqui.',
  apoio:
    'O endereço que você abriu não existe, ou foi desmontado. Os caminhos abaixo levam ao que costuma ser procurado.',
}
