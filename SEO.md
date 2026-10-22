# SEO da Smarthere

Ranquear não depende só de palavra-chave. O Google e os buscadores de IA olham cinco frentes: técnica (o site abre rápido e é fácil de ler por robôs), conteúdo (responde de verdade o que a pessoa buscou), entidade (sabem exatamente quem é a empresa), local (a empresa existe num lugar, com dados iguais em todo canto) e autoridade (outros sites e pessoas falam dela). O site cuida das três primeiras; a parte local e a autoridade dependem de ações fora dele, listadas no fim.

## O que está no site

**Conteúdo**
- Uma página por serviço em `/conserto/<slug>`, com o que a pessoa digita no Google: troca de tela, bateria, conector de carga, câmera, tampa traseira, reparo de placa, áudio, botões e carcaça, celular molhado.
- Novas em 22/10/2026: `/conserto/conserto-de-iphone`, `/conserto/conserto-de-celular-samsung`, `/conserto/conserto-de-celular-motorola` (por marca, sem dizer "autorizada") e `/conserto/backup-e-transferencia-de-dados-do-celular`.
- Cada página: sinais, por que acontece, como é o reparo, cuidados até o conserto, perguntas frequentes e links para todas as outras. O conteúdo mora em `src/lib/paginas.ts`.

**Para robôs que não executam JavaScript** (Bing e os robôs do ChatGPT, Claude e Perplexity)
- O corpo do site é montado pelo React. Cada página agora leva o próprio conteúdo completo dentro do `<noscript>`: H1 da página, texto, perguntas e links. Antes, esses robôs viam o mesmo resumo genérico, com o mesmo H1, em todas as páginas. Com JavaScript ligado nada muda na tela.

**Entidade (dados estruturados JSON-LD)**
- Um `@graph` por página com `@id` estáveis: a empresa (`#smarthere`, com logo, WhatsApp como ponto de contato e catálogo de serviços), o site, um `WebPage` por URL, `Service` + `FAQPage` nas páginas de serviço, trilha (Início / Serviços / página, igual à da tela) e, na home, a lista das páginas de serviço.
- Enquanto não houver endereço, a empresa é `Organization`, não loja física: nada inventado. Quando `EMPRESA.endereco` for preenchido em `src/lib/business.ts`, ela vira `LocalBusiness` sozinha.

**Técnico**
- Arte de compartilhamento própria para cada página de serviço (`public/og-conserto-*.jpg`, gerada por `npm run brand`).
- `sitemap.xml` com data do último commit, `robots.txt` liberando também os robôs de IA, `llms.txt` e `llms-full.txt` (com o passo a passo de cada reparo).
- IndexNow: chave em `public/c95539dafea5b22e192541e0989a51c4.txt`; `bash ../_infra-smarthere/indexnow.sh` avisa Bing e Yandex depois de cada deploy.
- Nenhum travessão no texto (testado em `tests/unit/seo.test.ts`).

**Conferência**
```bash
npm run test                       # inclui as regras de SEO
npm run build && node scripts/validar-seo.mjs   # JSON-LD, @id, H1, title, description, alt, travessão
npm run e2e
```
Lighthouse mobile em 22/10/2026: páginas de serviço com desempenho 96, SEO 100, acessibilidade 100, boas práticas 100. A home fica em torno de 40 de desempenho por causa do celular 3D (o mesmo número de antes destas mudanças); melhorar isso é um trabalho à parte no 3D.

## O que só a loja pode fazer

Lista viva: marque `[x]` quando fizer. Em ordem de impacto.

### Primeiro: os dados da loja (destrava todo o SEO local)
- [ ] **Endereço, cidade, horário e Instagram.** Hoje o site não publica cidade nenhuma, então o Google não tem como mostrar a Smarthere para "conserto de celular perto de mim" ou "conserto de celular em <cidade>". Com os dados, preenchemos `src/lib/business.ts` e o site passa a declarar loja física com endereço, horário, mapa e as páginas ganham a cidade no título.
- [x] **WhatsApp (64) 99973-0616** com 9 dígitos em todo o site (22/10/2026).

### Logo depois
- [ ] **Perfil da Empresa no Google (Google Meu Negócio).** É o que mais pesa para conserto de celular, que é uma busca local. Categoria "Assistência técnica de celulares", nome exatamente "Smarthere", o mesmo telefone e o site https://smarthere.com.br, horário, fotos da loja e da bancada, serviços com os mesmos nomes do site.
- [ ] **Google Search Console.** O arquivo de verificação `google306e90c4318f5ca7.html` já está no ar. Verificar, enviar `sitemap.xml` e pedir indexação das páginas principais em **Inspeção de URL** (o Google limita a uns 10 por dia):
  - https://smarthere.com.br/
  - https://smarthere.com.br/conserto/troca-de-tela-de-celular
  - https://smarthere.com.br/conserto/troca-de-bateria-de-celular
  - https://smarthere.com.br/conserto/conserto-de-iphone
  - https://smarthere.com.br/conserto/conserto-de-celular-samsung
  - https://smarthere.com.br/conserto/conserto-de-celular-motorola
  - https://smarthere.com.br/conserto/celular-molhado
- [ ] **Bing Webmaster Tools.** Importar do Search Console. O Bing alimenta o ChatGPT e o Copilot.

### Sempre
- [ ] **Avaliações no Google.** Pedir a cada cliente uma avaliação com texto (o serviço e o modelo do aparelho aparecendo naturalmente ajudam). Responder todas.
- [ ] **Mesmos dados em todo lugar (NAP).** Nome, telefone, endereço e site idênticos no Google, Instagram, Facebook e diretórios (Apontador, Guia Mais). Divergência confunde o Google.
- [ ] **Backlinks.** Associações comerciais da cidade, parceiros (lojas de acessórios, operadoras), imprensa local.
- [ ] **Fotos reais da loja e dos reparos** no Perfil da Empresa e no Instagram, com frequência.
- [ ] **Olhar o Search Console uma vez por mês**: as buscas que já trazem gente viram ideia de página nova ou de pergunta frequente.

### Já feito
- [x] Arquivo de verificação do Google no ar.
- [x] Páginas por marca e de backup, conteúdo para robôs sem JavaScript, JSON-LD com WebPage e trilha, artes de compartilhamento, llms-full.txt, IndexNow (22/10/2026).
