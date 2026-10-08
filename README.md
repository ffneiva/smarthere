<p align="center">
  <img src="public/og.jpg" alt="Smarthere — a gente mostra o que tem dentro." width="760" />
</p>

# Smarthere

Site da **Smarthere**, assistência técnica de celulares — e a primeira versão
da marca. A empresa chegou com o nome e o domínio `smarthere.com.br`; o
símbolo, as cores, as fontes e o manual saíram junto com o site
([/marca](https://smarthere.com.br/marca)).

## A ideia

Loja de conserto de celular costuma vender com "rapidez" e "preço justo" —
que qualquer uma diz. A Smarthere diz o que dá para mostrar: **o que tem
dentro do aparelho**.

- **O celular 3D se monta com a rolagem — e atravessa a página inteira.** No
  herói, as peças estão soltas, em camadas. Ao rolar, cada uma vem "para a
  mão" (com o sintoma que dá e o serviço que resolve) e encaixa no lugar, da
  tampa traseira até a tela. Montado, ele fecha com o laser e "pronto." na
  tela, e segue a página: de costas nos serviços, entreaberto no "como
  funciona", com a conversa do WhatsApp sendo escrita na tela no
  diagnóstico, e com a marca na tela no fecho.
- **Os direitos do consumidor, citados.** Orçamento prévio (CDC art. 40), peça
  adequada (art. 21) e 90 dias para reclamar (art. 26, II), com o texto literal
  e o link do Planalto.
- **Diagnóstico rápido.** Três perguntas montam a mensagem no aparelho de quem
  preenche; o botão abre o WhatsApp com ela escrita — e a tela do celular 3D
  mostra a conversa sendo escrita.

## O celular

Os modelos gratuitos de celular desmontável que existem (Sketchfab, CGTrader,
TurboSquid) não servem: o melhor deles não permite download, os que permitem
são só a casca externa ou proíbem uso comercial. Por isso o aparelho é
**geometria procedural em three.js**, sem `.glb`:

- placa lógica com SoC + memória empilhada e esferas BGA na borda, UFS, PMIC,
  blindagens estampadas com grafite térmico, conectores placa-a-placa com
  suportes de aço parafusados, conectores de antena U.FL, leitor de chip,
  cristal e ~820 capacitores, resistores e indutores com terminais
  (`InstancedMesh`);
- chassi em titânio escovado, placa média com nervuras e torres de parafuso,
  câmara de vapor de cobre, folha de grafite, gaveta do chip, faixas de antena;
- cabos coaxiais de antena, alto-falante com quadro estampado e molas de
  contato, motor de vibração com rebites, porta USB-C com suporte e vedação;
- trilhas, vias e serigrafia da placa, rótulo da bateria e a tela de
  diagnóstico desenhados em canvas, com as fontes do site;
- bobina de carga sem fio com 24 espiras de cobre, ímã central, anel de ímãs
  e antena NFC;
- câmeras com barril em degraus, placa de sensor e lente de tratamento
  iridescente; flash duplo (frio e quente); cabos flexíveis em fita;
- estúdio de luz cozido em código (`PMREMGenerator`), sem HDRI baixado.

Detalhes em [`src/scene/`](src/scene/).

## Rodar

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # dist/
npm run e2e          # Playwright contra o build
```

Regras de contribuição em [AGENTS.md](AGENTS.md); publicação em
[DEPLOY.md](DEPLOY.md).

## Infraestrutura

```
 visitante ──HTTPS──▶ CloudFront ── HTTP/3, cabeçalhos de segurança, /rota → /rota/index.html
                          │
                          ▼
                    S3 privado (Origin Access Control: só a distribuição lê)
                          ▲
 GitHub Actions ── OIDC ──┘  credencial temporária de 1 h — sem access key em lugar nenhum
```

Push na `main` → lint, testes, build, publicação no S3, invalidação do
CloudFront e smoke test no ar (ver [`DEPLOY.md`](DEPLOY.md)).

## Licença e crédito

O **código** está sob a licença [MIT](LICENSE). A marca, as fotos, os vídeos e
os textos pertencem a **Smarthere** — todos os direitos reservados; não podem
ser reutilizados sem autorização.

Desenvolvido por [Felipe Neiva](https://github.com/ffneiva) ·
[Abram Digital](https://abramdigital.com.br).
