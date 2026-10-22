/**
 * O conteúdo das páginas de serviço (/conserto/<slug>) — par de business.ts:
 * texto que o visitante lê não fica em componente.
 *
 * Uma página por serviço: é o que alguém digita no Google ("troca de tela de
 * celular", "celular caiu na água o que fazer") e uma home não responde bem.
 * Cada página tem conteúdo próprio — sinais, causas, o reparo, os cuidados e
 * perguntas específicas —, nada de texto repetido com o nome trocado. Sem
 * preço e sem prazo prometido: os dois saem no orçamento, por escrito.
 */

export type PaginaServico = {
  slug: string
  /** O nome curto — trilha, menus, links. */
  nome: string
  /** O <title> (com " · Smarthere", até 70 caracteres). */
  titulo: string
  /** A meta description (80 a 200 caracteres). */
  descricao: string
  h1: string
  /** O primeiro parágrafo: a resposta direta, em duas ou três frases. */
  resumo: string
  /** Como a pessoa percebe o defeito. */
  sinais: string[]
  /** Por que acontece — o que costuma causar. */
  causas: string
  /** O reparo, em passos. */
  reparo: string[]
  /** O que fazer (e não fazer) até chegar à loja. */
  cuidados: string[]
  perguntas: { pergunta: string; resposta: string }[]
  mensagem: string
}

export const PAGINAS: PaginaServico[] = [
  {
    slug: 'troca-de-tela-de-celular',
    nome: 'Troca de tela',
    titulo: 'Troca de tela de celular · Smarthere',
    descricao:
      'Vidro trincado, toque falhando, manchas ou tela preta? Veja quando a troca de tela resolve, como é o reparo e peça o orçamento por escrito pelo WhatsApp.',
    h1: 'Troca de tela de celular',
    resumo:
      'Nos celulares atuais, o vidro e o display vêm colados de fábrica: quando um quebra, a troca é do conjunto. Antes de orçar, conferimos se o defeito é mesmo da tela: toque falhando também pode ser conector solto ou placa.',
    sinais: [
      'Vidro trincado ou estilhaçado',
      'Toque que não responde em uma parte da tela, ou que toca sozinho ("toque fantasma")',
      'Manchas, linhas coloridas, pontos verdes ou roxos',
      'Tela preta com o aparelho ligado (vibra, toca, mas não mostra nada)',
      'Brilho piscando ou cores lavadas',
    ],
    causas:
      'Queda é a causa mais comum, mas não a única: pressão no bolso, umidade e bateria estufada empurrando o painel por trás também danificam a tela. Por isso, quando há bateria estufada, ela é tratada junto, senão a tela nova volta a quebrar.',
    reparo: [
      'Teste do aparelho: toque, imagem, sensor de proximidade e biometria, quando houver.',
      'Abertura com calor controlado, para soltar o adesivo sem trincar a moldura.',
      'Troca do conjunto vidro + display e da fita de vedação.',
      'Testes de toque, brilho, cores, proximidade e câmera frontal, na sua frente.',
    ],
    cuidados: [
      'Cole uma película ou fita transparente por cima dos cacos: protege o dedo e segura o vidro.',
      'Se o toque começar a falhar sozinho, faça backup já: o próximo passo pode ser a tela apagar.',
      'Evite expor o celular à umidade com a tela trincada: a água entra pelas trincas.',
    ],
    perguntas: [
      {
        pergunta: 'Dá para trocar só o vidro?',
        resposta:
          'Na maioria dos aparelhos atuais, não: vidro e display são colados na fábrica, e separar os dois arrisca o painel. Quando o modelo permite e o display está perfeito, o orçamento mostra essa opção.',
      },
      {
        pergunta: 'Perco meus dados na troca de tela?',
        resposta:
          'Não. A troca de tela não mexe no armazenamento. Mesmo assim, se o aparelho ainda liga, um backup antes é sempre uma boa ideia.',
      },
      {
        pergunta: 'A tela nova é original?',
        resposta:
          'O Código de Defesa do Consumidor (art. 21) exige peça original nova ou com as especificações técnicas do fabricante. Quando há mais de uma opção para o seu modelo, o orçamento mostra as opções e a diferença entre elas.',
      },
    ],
    mensagem: 'Olá, Smarthere! Quero um orçamento de troca de tela.',
  },
  {
    slug: 'troca-de-bateria-de-celular',
    nome: 'Troca de bateria',
    titulo: 'Troca de bateria de celular · Smarthere',
    descricao:
      'Celular descarregando rápido, desligando com carga ou com a bateria estufada? Veja os sinais, o que fazer até o reparo e peça o orçamento pelo WhatsApp.',
    h1: 'Troca de bateria de celular',
    resumo:
      'Bateria de celular é peça de desgaste: perde capacidade a cada ciclo de carga. Quando ela já não segura o dia ou desliga com carga sobrando, a troca devolve a autonomia. E, se estiver estufada, é questão de segurança.',
    sinais: [
      'Descarrega muito mais rápido do que antes',
      'Desliga sozinho com 20%, 30% de carga',
      'Esquenta parado ou carregando',
      'Tela ou tampa traseira levantando (bateria estufada)',
      'Só funciona ligado no carregador',
    ],
    causas:
      'O desgaste é natural: as baterias de íons de lítio perdem capacidade com os ciclos de carga e com o calor. Carregar no sol, no carro ou jogando enquanto carrega acelera o processo. A bateria estufa quando a célula se degrada e gera gás por dentro.',
    reparo: [
      'Leitura da saúde da bateria e teste de consumo, para confirmar que o problema é ela.',
      'Abertura do aparelho e remoção da bateria pelas abas de adesivo, sem alavancar a célula.',
      'Instalação da bateria nova e do adesivo de fixação.',
      'Teste de carga, de descarga e de temperatura antes da entrega.',
    ],
    cuidados: [
      'Bateria estufada: pare de usar e de carregar, não aperte, não fure e mantenha longe de calor.',
      'Não use carregador de procedência duvidosa enquanto espera a troca.',
      'Se o aparelho desliga com carga, mantenha o backup em dia.',
    ],
    perguntas: [
      {
        pergunta: 'Bateria estufada é perigosa?',
        resposta:
          'Pode ser. A célula estufada está degradada e, se for perfurada ou aquecida, pode pegar fogo. Pare de usar e de carregar o aparelho e traga para a troca.',
      },
      {
        pergunta: 'Como sei se é a bateria ou o carregador?',
        resposta:
          'Se o aparelho carrega normalmente mas descarrega rápido, costuma ser a bateria. Se demora a carregar ou só carrega numa posição, o suspeito é o conector de carga. O diagnóstico na bancada separa os dois.',
      },
      {
        pergunta: 'Preciso deixar o celular na loja?',
        resposta:
          'Depende do modelo e de a bateria estar em estoque. O prazo vem junto com o orçamento, por escrito.',
      },
    ],
    mensagem: 'Olá, Smarthere! Quero um orçamento de troca de bateria.',
  },
  {
    slug: 'conector-de-carga-de-celular',
    nome: 'Conector de carga',
    titulo: 'Conector de carga de celular: limpeza e troca · Smarthere',
    descricao:
      'Celular só carrega numa posição, com o cabo frouxo ou não aparece no computador? Muitas vezes é sujeira na porta. Veja quando limpar, quando trocar e peça orçamento.',
    h1: 'Conector de carga de celular: limpeza ou troca',
    resumo:
      'Na maioria das vezes, o "conector com defeito" é poeira de bolso compactada no fundo da porta, que impede o cabo de encaixar. A limpeza resolve sem troca de peça. Quando o conector está mesmo danificado, ele é trocado.',
    sinais: [
      'Carrega só com o cabo numa certa posição',
      'O cabo fica frouxo ou não encaixa até o fim',
      'Carregamento lento mesmo com carregador bom',
      'Não aparece no computador',
      'Aviso de líquido ou de acessório não suportado',
    ],
    causas:
      'Fiapos de roupa e poeira entram na porta e são prensados a cada encaixe do cabo. Com o tempo, viram uma camada dura no fundo. Puxar o cabo de lado, quedas com o cabo conectado e oxidação por umidade danificam os contatos de verdade.',
    reparo: [
      'Inspeção da porta com lupa e iluminação.',
      'Limpeza com ferramenta própria, sem metal raspando os contatos.',
      'Teste de carga e de dados. Se resolver, o serviço termina aqui.',
      'Se não resolver: troca do conector (ou da sub-placa onde ele fica soldado) e novo teste.',
    ],
    cuidados: [
      'Não enfie palito de metal, agulha ou clipe na porta: risca e entorta os contatos.',
      'Evite usar o celular conectado dobrando o cabo.',
      'Se apareceu aviso de líquido, desconecte e deixe secar antes de carregar.',
    ],
    perguntas: [
      {
        pergunta: 'Posso limpar a porta em casa?',
        resposta:
          'Com cuidado, um palito de madeira fino e seco tira a sujeira solta. Metal, não. Se a sujeira está compactada, vale trazer: a limpeza é rápida e evita a troca.',
      },
      {
        pergunta: 'O carregamento sem fio ainda funciona?',
        resposta:
          'Em geral, sim: a bobina de carga sem fio é outra peça. É um bom teste para saber se o problema está mesmo na porta.',
      },
      {
        pergunta: 'Quanto custa?',
        resposta:
          'Depende do modelo e de ser limpeza ou troca. A limpeza é testada primeiro; a troca só entra no orçamento se ela não resolver.',
      },
    ],
    mensagem: 'Olá, Smarthere! Meu celular está com problema para carregar.',
  },
  {
    slug: 'conserto-de-camera-de-celular',
    nome: 'Câmera',
    titulo: 'Conserto de câmera de celular · Smarthere',
    descricao:
      'Foto embaçada, mancha, câmera tremendo ou tela preta ao abrir a câmera? Veja quando é só o vidro da lente, quando é o módulo, e peça o orçamento pelo WhatsApp.',
    h1: 'Conserto de câmera de celular',
    resumo:
      'Muitas vezes, quem quebrou foi só o vidrinho que protege a lente, e ele se troca sozinho, sem mexer no módulo. Quando o problema é o módulo, dizemos qual das câmeras (principal, ultra-angular, zoom ou frontal) e por quê.',
    sinais: [
      'Foto embaçada ou com mancha que não sai limpando',
      'Câmera "tremendo" ou fazendo barulho ao abrir',
      'Tela preta ao abrir a câmera',
      'Foco que não acerta',
      'Uma das lentes não funciona ao trocar o zoom',
    ],
    causas:
      'O vidro da lente trinca em quedas e com chaves no bolso. O estabilizador óptico (a peça que faz a lente "flutuar") é sensível a impacto e a vibração forte: celular no suporte de moto é causa conhecida. Umidade dentro do módulo deixa a imagem leitosa.',
    reparo: [
      'Teste de cada câmera, do foco e do estabilizador.',
      'Se for só o vidro: remoção do vidro quebrado, limpeza e vidro novo.',
      'Se for o módulo: abertura do aparelho e troca do módulo da câmera afetada.',
      'Teste de foto, vídeo, foco e troca de lentes antes da entrega.',
    ],
    cuidados: [
      'Vidro da lente trincado deixa entrar poeira: cubra com fita até o reparo.',
      'Evite usar o celular no suporte de moto até o conserto: a vibração piora o estabilizador.',
    ],
    perguntas: [
      {
        pergunta: 'A câmera treme sozinha. O que é?',
        resposta:
          'Geralmente é o estabilizador óptico danificado. O módulo precisa ser trocado; limpar ou "calibrar" não resolve.',
      },
      {
        pergunta: 'Dá para trocar só o vidro da lente?',
        resposta: 'Sim, quando o módulo está bom. É o reparo mais simples e o mais comum.',
      },
    ],
    mensagem: 'Olá, Smarthere! Quero um orçamento de reparo de câmera.',
  },
  {
    slug: 'troca-de-tampa-traseira-de-celular',
    nome: 'Tampa traseira',
    titulo: 'Troca de tampa traseira (vidro traseiro) · Smarthere',
    descricao:
      'Vidro traseiro do celular trincado ou descolando? Veja como é a troca da tampa traseira, o que vai junto (fita de vedação) e peça o orçamento pelo WhatsApp.',
    h1: 'Troca da tampa traseira do celular',
    resumo:
      'Nos aparelhos com traseira de vidro, a tampa protege a bobina de carga sem fio, as câmeras e a vedação contra água. Trincada, ela deixa entrar umidade e corta a mão. Em muitos modelos ela é colada direto no chassi; antes de começar, explicamos como ela sai no seu.',
    sinais: [
      'Vidro de trás trincado ou estilhaçado',
      'Tampa descolando ou com fresta na borda',
      'Lascas na ilha das câmeras',
      'Carregamento sem fio falhando depois de uma queda',
    ],
    causas:
      'Queda de costas é a causa clássica. Bateria estufada também empurra a tampa para fora e descola a borda. Nesse caso, a bateria é tratada junto.',
    reparo: [
      'Avaliação de como a tampa é presa no seu modelo (adesivo ou colada no chassi).',
      'Remoção do vidro quebrado e limpeza completa do adesivo antigo.',
      'Tampa nova com fita de vedação nova.',
      'Teste da carga sem fio, das câmeras e do flash.',
    ],
    cuidados: [
      'Cubra o vidro trincado com fita até o reparo: os cacos cortam e se soltam.',
      'Evite água, chuva e banheiro com vapor: a vedação está comprometida.',
    ],
    perguntas: [
      {
        pergunta: 'A tampa trincada atrapalha o funcionamento?',
        resposta:
          'Não de imediato, mas a vedação contra água fica comprometida e a carga sem fio pode falhar. E os cacos cortam.',
      },
      {
        pergunta: 'O celular continua resistente à água depois?',
        resposta:
          'A fita de vedação é trocada junto, mas nenhum reparo devolve a certificação de fábrica. Trate o aparelho como não resistente à água.',
      },
    ],
    mensagem: 'Olá, Smarthere! Quero um orçamento de troca da tampa traseira.',
  },
  {
    slug: 'reparo-de-placa-de-celular',
    nome: 'Reparo de placa',
    titulo: 'Reparo de placa de celular (não liga) · Smarthere',
    descricao:
      'Celular não liga, reinicia sozinho ou ficou sem sinal? Reparo de placa com microscópio e estação de solda, no componente que falhou. Peça o diagnóstico pelo WhatsApp.',
    h1: 'Reparo de placa de celular',
    resumo:
      'Quando o celular não liga, reinicia sozinho ou perde o sinal, o defeito costuma estar na placa lógica. Com microscópio e estação de solda, o reparo é no componente que falhou (um capacitor, um CI), e não na troca da placa inteira, que custa quase um aparelho novo.',
    sinais: [
      'Não liga, nem no carregador',
      'Reinicia sozinho ou fica preso no logo',
      'Sem sinal, sem Wi-Fi ou sem Bluetooth',
      'Esquenta muito parado',
      'Parou depois de cair na água',
    ],
    causas:
      'Quedas trincam soldas por baixo dos chips; umidade oxida componentes; carregadores ruins queimam o circuito de carga. Às vezes um único capacitor em curto derruba o aparelho inteiro.',
    reparo: [
      'Medição de consumo na fonte de bancada, para localizar o curto ou o circuito parado.',
      'Inspeção no microscópio e medição dos componentes suspeitos.',
      'Troca do componente com estação de solda (ou ressolda do chip).',
      'Teste completo e, se o aparelho liga, ajuda com o backup.',
    ],
    cuidados: [
      'Não fique colocando para carregar um aparelho que não liga: pode agravar o curto.',
      'Se ainda liga às vezes, aproveite para fazer backup.',
    ],
    perguntas: [
      {
        pergunta: 'Vale a pena consertar a placa?',
        resposta:
          'Quando o defeito é em componente, geralmente sim: é bem mais barato que trocar a placa. O diagnóstico diz o que falhou antes de qualquer reparo, e você decide.',
      },
      {
        pergunta: 'Meus dados ficam salvos?',
        resposta:
          'Os dados ficam no chip de armazenamento, na placa. Se ele está bom, o reparo devolve o aparelho com tudo. Avisamos antes se houver risco.',
      },
    ],
    mensagem: 'Olá, Smarthere! Meu celular não liga / tem problema na placa.',
  },
  {
    slug: 'alto-falante-e-microfone-de-celular',
    nome: 'Áudio e vibração',
    titulo: 'Alto-falante e microfone de celular · Smarthere',
    descricao:
      'Não ouve nem é ouvido na ligação, som baixo ou chiando, vibração fraca? Muitas vezes é sujeira na grade. Veja o que resolve e peça o orçamento pelo WhatsApp.',
    h1: 'Conserto de alto-falante, microfone e vibração',
    resumo:
      'Som baixo ou abafado costuma ser poeira e oleosidade na grade do alto-falante, e a limpeza resolve. Quando a peça falhou, trocamos o alto-falante, o microfone ou o motor de vibração.',
    sinais: [
      'Não ouve a pessoa na ligação (alto-falante de ouvido)',
      'A pessoa não ouve você (microfone)',
      'Som do viva-voz baixo, chiando ou estourado',
      'Vibração fraca ou fazendo barulho',
    ],
    causas:
      'A grade do alto-falante junta pó e gordura da pele. Água e umidade danificam a membrana. Quedas soltam o motor de vibração.',
    reparo: [
      'Teste de cada saída e entrada de áudio e da vibração.',
      'Limpeza das grades e dos furos de microfone.',
      'Se não resolver: troca da peça afetada.',
      'Teste em ligação, viva-voz e gravação.',
    ],
    cuidados: ['Não sopre nem enfie objetos nos furos do microfone.'],
    perguntas: [
      {
        pergunta: 'Só eu não ouço na ligação, no viva-voz funciona. O que é?',
        resposta:
          'É o alto-falante de ouvido, no alto da tela, uma peça diferente do alto-falante de baixo. Muitas vezes, só a grade dele está entupida.',
      },
    ],
    mensagem: 'Olá, Smarthere! Meu celular está com problema de som.',
  },
  {
    slug: 'botoes-e-carcaca-de-celular',
    nome: 'Botões e carcaça',
    titulo: 'Botões e carcaça de celular · Smarthere',
    descricao:
      'Botão afundado ou sem clique, carcaça empenada ou gaveta do chip presa? Veja como é o reparo e por que o chassi importa antes de trocar a tela.',
    h1: 'Conserto de botões e carcaça de celular',
    resumo:
      'Botão sem clique, afundado ou que não responde costuma ser o flex dos botões ou sujeira no mecanismo. E o chassi é a espinha do aparelho: se ele empenou numa queda, a tela nova também trinca. Por isso conferimos o alinhamento antes de instalar qualquer peça.',
    sinais: [
      'Botão de volume ou liga/desliga sem clique ou afundado',
      'Botão que funciona às vezes',
      'Carcaça amassada ou empenada',
      'Gaveta do chip presa',
    ],
    causas: 'Quedas de quina, sujeira acumulada e o uso repetido desgastam o flex dos botões.',
    reparo: [
      'Teste dos botões e inspeção do chassi.',
      'Limpeza do mecanismo ou troca do flex dos botões.',
      'Para carcaça empenada: avaliação do alinhamento e, se preciso, troca do chassi.',
    ],
    cuidados: ['Não force a gaveta do chip com objeto que não seja o ejetor.'],
    perguntas: [
      {
        pergunta: 'O botão de ligar parou. Dá para usar o celular até o reparo?',
        resposta:
          'Dá: os sistemas têm botão virtual na tela, nas opções de acessibilidade. Evite deixar a bateria acabar, porque ligar de novo depende do botão.',
      },
    ],
    mensagem: 'Olá, Smarthere! Quero um orçamento de botões/carcaça.',
  },
  {
    slug: 'celular-molhado',
    nome: 'Celular molhado',
    titulo: 'Celular caiu na água: o que fazer · Smarthere',
    descricao:
      'Celular molhou? Desligue, não carregue e não coloque no arroz. Veja o que fazer nas primeiras horas e como é a limpeza da placa contra oxidação.',
    h1: 'Celular caiu na água: o que fazer',
    resumo:
      'Desligue e não carregue: corrente elétrica com umidade é o que oxida a placa. Seque por fora e não coloque no arroz: o próprio fabricante desaconselha. Quanto antes a placa for limpa, maior a chance de salvar o aparelho.',
    sinais: [
      'Caiu na água, na piscina ou no mar',
      'Aviso de líquido detectado no conector',
      'Tela com manchas ou som abafado depois de molhar',
      'Funcionou depois de molhar, mas começou a falhar dias depois',
    ],
    causas:
      'A água em si não é o problema maior: o que estraga é a oxidação, quando a umidade fica nos contatos com o aparelho ligado. Água salgada e de piscina oxidam mais rápido. Por isso um aparelho que "voltou a funcionar" pode falhar dias depois.',
    reparo: [
      'Abertura do aparelho e desconexão da bateria, sem ligar.',
      'Limpeza da placa em banho de ultrassom e secagem controlada.',
      'Inspeção no microscópio dos pontos de oxidação e troca do que foi afetado.',
      'Teste completo antes de devolver.',
    ],
    cuidados: [
      'Desligue e não tente ligar para "ver se funciona".',
      'Não carregue até secar e, de preferência, até a placa ser limpa.',
      'Não coloque no arroz: pequenas partículas podem entrar no aparelho e danificá-lo.',
      'Não use secador de cabelo: o calor danifica a tela e a bateria.',
    ],
    perguntas: [
      {
        pergunta: 'O arroz funciona?',
        resposta:
          'Não, e pode atrapalhar: pó e grãos entram pelas portas. A própria Apple recomenda não colocar o iPhone no arroz. Deixe secar em lugar ventilado, com a porta virada para baixo, e traga para a limpeza.',
      },
      {
        pergunta: 'Meu celular é resistente à água. Preciso me preocupar?',
        resposta:
          'A resistência à água diminui com o tempo, com quedas e com reparos anteriores, e não cobre água salgada nem de piscina. Se apareceu aviso de líquido ou algo mudou, vale a revisão.',
      },
      {
        pergunta: 'Ele voltou a funcionar. Está salvo?',
        resposta:
          'Nem sempre: a oxidação continua por dentro e o defeito pode aparecer dias depois. A limpeza da placa interrompe o processo.',
      },
    ],
    mensagem: 'Olá, Smarthere! Meu celular molhou. O que eu faço?',
  },
  // ── Por marca: o que as pessoas digitam junto com o nome do aparelho ──
  // Sem "autorizada": a Smarthere é assistência independente, e diz isso.
  {
    slug: 'conserto-de-iphone',
    nome: 'Conserto de iPhone',
    titulo: 'Conserto de iPhone: tela, bateria e câmera · Smarthere',
    descricao:
      'Tela, bateria, câmera, conector e vidro traseiro de iPhone. Veja como é o reparo, o que muda entre as opções de peça e peça o orçamento por escrito pelo WhatsApp.',
    h1: 'Conserto de iPhone',
    resumo:
      'Tela trincada, bateria fraca, câmera falhando ou vidro traseiro quebrado: os defeitos mais comuns do iPhone têm reparo, peça por peça. Antes de qualquer reparo, você recebe o orçamento por escrito com a peça, a mão de obra e o prazo.',
    sinais: [
      'Tela trincada, com manchas ou com o toque falhando',
      'Bateria que não segura o dia, ou aviso de manutenção em Ajustes > Bateria',
      'Câmera embaçada, tremendo ou abrindo com a tela preta',
      'Só carrega numa posição do cabo',
      'Vidro traseiro trincado',
      'Não liga ou reinicia sozinho',
    ],
    causas:
      'No iPhone, algumas peças são reconhecidas pelo sistema. Depois da troca de tela, bateria ou câmera, o iOS pode mostrar uma mensagem sobre a peça, e recursos como o True Tone ou a leitura da saúde da bateria podem mudar conforme a opção escolhida. O aparelho continua funcionando; por isso o orçamento explica, para o seu modelo, o que acontece com cada opção antes de você aprovar.',
    reparo: [
      'Diagnóstico com o modelo exato e o defeito, na bancada.',
      'Orçamento por escrito com as opções de peça para o seu iPhone e a diferença entre elas.',
      'Abertura com calor controlado, troca da peça e nova fita de vedação.',
      'Testes de toque, câmeras, carga, áudio e biometria, na sua frente.',
    ],
    cuidados: [
      'Se o aparelho ainda liga, faça o backup no iCloud ou no computador antes de trazer.',
      'Anote o modelo exato (Ajustes > Geral > Sobre): com ele, a estimativa já vem certa.',
      'Com a tela trincada, uma película por cima segura os cacos até o reparo.',
    ],
    perguntas: [
      {
        pergunta: 'A Smarthere é assistência autorizada Apple?',
        resposta:
          'Não. A Smarthere é uma assistência técnica independente. O reparo segue o Código de Defesa do Consumidor (art. 21): peça original nova ou com a especificação técnica do fabricante, e o orçamento diz qual é a peça antes do reparo.',
      },
      {
        pergunta: 'O iPhone vai mostrar aviso de peça depois do conserto?',
        resposta:
          'Pode mostrar, dependendo do modelo e da peça. O aviso não impede o uso. O orçamento explica, para o seu aparelho, o que muda com cada opção de peça, para você decidir antes.',
      },
      {
        pergunta: 'Vou perder minhas fotos?',
        resposta:
          'Tela, bateria, conector e câmera não mexem no armazenamento. Reparo de placa pode mexer: nesse caso, avisamos antes e, se o aparelho ainda liga, ajudamos a fazer o backup primeiro.',
      },
      {
        pergunta: 'Vocês atendem o meu modelo?',
        resposta:
          'Mande o modelo pelo WhatsApp. O diagnóstico diz se a peça existe para ele e quais são as opções disponíveis.',
      },
    ],
    mensagem: 'Olá, Smarthere! Quero um orçamento de conserto de iPhone. Meu modelo é:',
  },
  {
    slug: 'conserto-de-celular-samsung',
    nome: 'Conserto de Samsung',
    titulo: 'Conserto de celular Samsung Galaxy · Smarthere',
    descricao:
      'Tela, bateria, conector de carga e câmera de celulares Samsung Galaxy das linhas A, M e S. Veja como é o reparo e peça o orçamento por escrito pelo WhatsApp.',
    h1: 'Conserto de celular Samsung',
    resumo:
      'Galaxy A, M ou S: troca de tela e de bateria, conector de carga e câmera são os reparos mais procurados. O diagnóstico diz o que falhou, e o orçamento vem por escrito antes de qualquer reparo.',
    sinais: [
      'Tela trincada, apagada ou com linhas verdes, rosas ou manchas',
      'Bateria descarregando rápido, esquentando ou estufada',
      'Não carrega, ou só carrega numa posição do cabo',
      'Câmera embaçada ou sem foco',
      'Tampa traseira descolando',
    ],
    causas:
      'Muitos Galaxy usam tela AMOLED, que pode mostrar linhas e manchas depois de uma queda mesmo sem o vidro trincar. A porta USB-C junta poeira de bolso e se desgasta com o uso. E a bateria, como em qualquer celular, perde capacidade a cada ciclo de carga.',
    reparo: [
      'Diagnóstico na bancada: separar defeito de tela, de conector e de placa.',
      'Orçamento por escrito, com a peça, a mão de obra e o prazo.',
      'Troca da peça e da fita de vedação, quando o modelo tem.',
      'Testes de toque, cores, carga, câmeras e áudio, na sua frente.',
    ],
    cuidados: [
      'Se o aparelho ainda liga, faça o backup pela conta Samsung ou Google antes de trazer.',
      'Com linhas ou manchas na tela, evite apertar o painel: o dano pode aumentar.',
      'Bateria estufada: pare de usar e de carregar e traga logo.',
    ],
    perguntas: [
      {
        pergunta: 'A Smarthere é assistência autorizada Samsung?',
        resposta:
          'Não. A Smarthere é uma assistência técnica independente. A peça é original nova ou com a especificação técnica do fabricante (CDC, art. 21), e o orçamento diz qual é antes do reparo.',
      },
      {
        pergunta: 'Linha verde na tela tem conserto?',
        resposta:
          'Linha ou mancha no AMOLED costuma ser dano no painel, e o reparo é a troca do conjunto da tela. Às vezes é o conector da tela na placa: o diagnóstico separa um caso do outro antes do orçamento.',
      },
      {
        pergunta: 'Perco meus dados?',
        resposta:
          'Tela, bateria, conector e câmera não mexem no armazenamento. Reparo de placa pode mexer: nesse caso, avisamos antes e ajudamos com o backup, se o aparelho ainda liga.',
      },
    ],
    mensagem: 'Olá, Smarthere! Quero um orçamento de conserto do meu Samsung. Modelo:',
  },
  {
    slug: 'conserto-de-celular-motorola',
    nome: 'Conserto de Motorola',
    titulo: 'Conserto de celular Motorola Moto G e Edge · Smarthere',
    descricao:
      'Tela, bateria, conector de carga e câmera de Motorola Moto G, Moto E e Edge. Veja como é o reparo e peça o orçamento por escrito pelo WhatsApp, antes de qualquer serviço.',
    h1: 'Conserto de celular Motorola',
    resumo:
      'Moto G, Moto E ou Edge: troca de tela e de bateria, limpeza ou troca do conector de carga e reparo de câmera. O orçamento vem por escrito, com a peça e o prazo, antes de qualquer reparo.',
    sinais: [
      'Tela trincada, com toque falhando ou apagada',
      'Bateria que não dura o dia ou desliga com carga sobrando',
      'Cabo frouxo ou carregando só numa posição',
      'Câmera embaçada ou tremendo',
      'Som baixo na ligação ou no alto-falante',
    ],
    causas:
      'O conector de carga é um dos reparos mais comuns em qualquer marca, Motorola incluída: poeira de bolso compactada e uso com o cabo torto desgastam a porta. Telas e baterias seguem o desgaste comum a qualquer celular: quedas, calor e ciclos de carga.',
    reparo: [
      'Diagnóstico na bancada, começando pelo mais simples: no conector, a limpeza vem antes da troca.',
      'Orçamento por escrito, com a peça, a mão de obra e o prazo.',
      'Troca da peça com a especificação técnica do fabricante.',
      'Testes de carga, toque, câmeras e áudio, na sua frente.',
    ],
    cuidados: [
      'Se o aparelho ainda liga, faça o backup na conta Google antes de trazer.',
      'Não force o cabo na porta para "achar a posição": isso piora o conector.',
      'Bateria estufada: pare de usar e de carregar e traga logo.',
    ],
    perguntas: [
      {
        pergunta: 'A Smarthere é assistência autorizada Motorola?',
        resposta:
          'Não. A Smarthere é uma assistência técnica independente. A peça é original nova ou com a especificação técnica do fabricante (CDC, art. 21), e o orçamento diz qual é antes do reparo.',
      },
      {
        pergunta: 'Meu Motorola só carrega numa posição. É o conector?',
        resposta:
          'Muitas vezes é sujeira compactada no fundo da porta. Limpamos e testamos primeiro; a troca do conector só entra no orçamento se a limpeza não resolver.',
      },
      {
        pergunta: 'Perco meus dados?',
        resposta:
          'Tela, bateria, conector e câmera não mexem no armazenamento. Reparo de placa pode mexer: nesse caso, avisamos antes e ajudamos com o backup, se o aparelho ainda liga.',
      },
    ],
    mensagem: 'Olá, Smarthere! Quero um orçamento de conserto do meu Motorola. Modelo:',
  },
  {
    slug: 'backup-e-transferencia-de-dados-do-celular',
    nome: 'Backup e transferência de dados',
    titulo: 'Backup e transferência de dados do celular · Smarthere',
    descricao:
      'Backup de fotos, contatos e conversas, transferência para o celular novo e atualização ou restauração do sistema, com você acompanhando cada passo. Peça pelo WhatsApp.',
    h1: 'Backup e transferência de dados do celular',
    resumo:
      'Fotos, conversas e contatos são o que mais pesa num celular. Ajudamos a fazer o backup, a passar tudo para o aparelho novo e a atualizar ou restaurar o sistema, com você acompanhando cada passo.',
    sinais: [
      'Trocou de celular e quer levar fotos, contatos e conversas',
      'O aparelho vai para o conserto e você quer garantir os dados antes',
      'Memória cheia e celular lento',
      'Atualização travada ou aparelho reiniciando sem parar',
    ],
    causas:
      'O que mais se perde num conserto ou numa troca de aparelho é o que não tinha backup. E nem tudo vai junto: o WhatsApp, por exemplo, guarda as conversas à parte das fotos e precisa de backup próprio, ativado nas configurações dele.',
    reparo: [
      'Conferência do que precisa ser salvo: fotos, contatos, conversas e arquivos.',
      'Backup na nuvem da sua conta ou no computador, conforme o aparelho.',
      'Transferência para o aparelho novo e conferência, item por item.',
      'Atualização ou restauração do sistema, quando é o caso.',
    ],
    cuidados: [
      'Tenha à mão as senhas da sua conta Google ou ID Apple: quem digita é você.',
      'Confira se o backup do WhatsApp está ligado nas configurações do próprio WhatsApp.',
      'Não formate nem restaure o aparelho antes de ter um backup completo.',
    ],
    perguntas: [
      {
        pergunta: 'Vocês precisam da minha senha?',
        resposta:
          'As senhas das suas contas são digitadas por você. A transferência usa as ferramentas do próprio sistema e do próprio WhatsApp.',
      },
      {
        pergunta: 'Dá para recuperar os dados de um celular que não liga?',
        resposta:
          'Às vezes. Se o defeito é na tela, na bateria ou no conector, resolvido o problema, os dados continuam lá. Se é na placa, o reparo do componente pode trazer o aparelho de volta o suficiente para o backup. O diagnóstico diz qual é o caso.',
      },
      {
        pergunta: 'Dá para passar as conversas do Android para o iPhone?',
        resposta:
          'O WhatsApp tem uma ferramenta própria para isso, que pede o aparelho novo recém-configurado. Ajudamos a seguir o processo; o que pode ser levado depende do que o WhatsApp permite.',
      },
    ],
    mensagem: 'Olá, Smarthere! Preciso de ajuda com backup/transferência de dados.',
  },
]

export const paginaDe = (slug: string) => PAGINAS.find((p) => p.slug === slug)
