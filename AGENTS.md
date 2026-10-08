# AGENTS.md

Instruções para qualquer agente de IA — de qualquer modelo — que for trabalhar
neste repositório. Também servem para humanos; são as mesmas regras.

> Este arquivo é a fonte. `CLAUDE.md` apenas aponta para cá.

---

## 1. O fluxo é Issue → branch → PR → merge

**Nenhuma mudança entra na `main` direto.**

```
1. Abra uma Issue (templates em .github/ISSUE_TEMPLATE).
2. Branch a partir da main:  fix/12-foco-da-camera · content/13-whatsapp-da-loja
3. Commits em Conventional Commits (seção 2).
4. PR mencionando a Issue:   "Closes #12"
5. CI verde. Squash merge.
```

## 2. Commits

`tipo(escopo): descrição no imperativo, minúscula, sem ponto final`

**Tipos:** `feat`, `fix`, `content`, `refactor`, `perf`, `style`, `test`,
`docs`, `build`, `ci`, `chore`, `revert`.

**Escopos:** `heroi`, `secoes`, `servicos`, `raiox`, `diagnostico`,
`parallax`, `direitos`, `seo`, `marca`, `3d`, `a11y`, `infra`, `ci`, `deps`,
`docs`, `testes`.

```
content(servicos): acrescenta troca de lente da câmera
fix(3d): bateria tampava a placa no foco do passo 06
perf(3d): bobina com 10 espiras no celular
```

## 3. Onde as coisas moram

```
src/lib/business.ts   ← TODO o conteúdo: empresa, peças do tour, serviços, etapas, direitos, FAQ
src/lib/marca.ts      ← o símbolo (geometria) e a paleta — fonte do SVG, do favicon e da cena
src/lib/movimento.ts  ← o motor (GSAP + ScrollTrigger sob demanda) e o parallax declarativo
src/hooks/useCena.ts  ← arma uma cena de rolagem numa seção, e desfaz ao sair
src/lib/routes.ts     ← rotas e o <head> de cada uma
src/lib/seo.ts        ← JSON-LD (Organization → LocalBusiness quando houver endereço) e llms.txt
src/scene/base.ts     ← o que as cenas 3D têm em comum (estúdio de luz, laço, arrasto)
src/scene/modelo.ts   ← o celular, peça por peça, em geometria procedural
src/scene/texturas.ts ← placa, bateria, tela, grades — desenhadas em canvas
src/scene/celular.ts  ← os estados (peças soltas → montagem → pronto → seções) e a câmera
src/lib/estados.ts    ← o contrato de estados entre as seções (data-s) e a cena
src/sections/         ← seções da home, na ordem em que aparecem
src/pages/Marca.tsx   ← o manual da marca (/marca)
scripts/              ← fontes, fotos do aparelho, marca (favicon, OG, kit), smoke do dev
tests/unit/           ← Vitest — lógica pura
tests/e2e/            ← Playwright — contra o build de produção
```

**Regra dura:** texto que o visitante lê não fica em componente. Fica em
`business.ts`.

## 4. Regras de conteúdo

- **Nenhum preço no site.** O valor depende de modelo e peça e sai no
  orçamento. O teste `nenhum preço` quebra se um `R$` aparecer.
- **Nada inventado.** Nenhum depoimento, nenhuma nota, nenhum "+mil
  aparelhos". A loja ainda não abriu; não existe prova social para mostrar.
- **Fato tem fonte na tela.** Os artigos do CDC são citados literalmente, com
  link para o Planalto; o aviso do arroz linka a página de suporte da Apple.
- **Proposta é marcada.** O jeito de trabalhar que o site promete (orçamento
  por escrito, peça devolvida, teste na entrega) está como `CONFIRMAR` em
  `business.ts` e listado no DEPLOY.md, para o dono validar.
- **Dado que não existe fica `null`** — WhatsApp, telefone, endereço,
  horário, Instagram. O site se adapta: sem WhatsApp, o contato é e-mail.
- **O celular 3D é genérico.** Nenhuma marca de fabricante, nenhum desenho
  reconhecível de modelo. Nomes de marca aparecem só como texto, na lista de
  marcas atendidas.

## 5. Movimento e acessibilidade

1. **Estado escondido nunca sobrevive a uma falha.** Cena só esconde algo
   dentro do `useCena` (com o motor presente). Sem JS ou sem GSAP, tudo visível.
2. **`prefers-reduced-motion` desliga o que não é essencial:** abertura,
   cursor, cena 3D (ficam as fotos do aparelho), parallax, scroll suave.
3. **Anime `transform` e `opacity`.** Altura: `grid-template-rows: 0fr → 1fr`.
4. **O celular atravessa a página, sem pin.** O canvas é fixo atrás da home
   inteira (`components/Palco3D.tsx`) e o texto rola por cima; cada bloco ou
   seção marca um estado com `data-s` (o contrato está em `lib/estados.ts`).
   Os cartões são conteúdo real — existem e se leem sem a cena. As seções da
   home têm fundo transparente (ou quase), para o aparelho aparecer no lado
   livre de cada uma; no celular, depois da montagem, ele vira fundo.
5. **A cena roda no celular**, em modo `compacto` (menos passivos na placa,
   menos espiras na bobina, DPR ≤ 1,5, sem antialias).

Um `<h1>` por página, todo botão com nome acessível, foco visível, região viva
anunciando troca de rota. O menu é diálogo modal de verdade.

## 6. Desempenho

O CI falha se o caminho crítico passar de **170 kB comprimidos**.

Carregado sob demanda, e precisa continuar sendo: tudo abaixo do herói
(`sections/Resto.tsx`), `three` e a cena (quando o palco chega perto da
tela), `gsap`, `lenis` (só com mouse), `web-vitals`, `@sentry/react`, a
privacidade e o manual da marca.

## 7. Antes de abrir o PR

```bash
npm run lint && npx tsc -b && npm run test && npm run knip
npm run check:dev && npm run build && npm run e2e
```

Mexeu no modelo 3D? `npm run fotos` (refaz as fotos de reserva) e
`npm run brand` (a arte de compartilhamento usa a foto).

## 8. Publicação

Arquivos estáticos numa CDN (S3 + CloudFront). **Custo operacional próximo de
zero é restrição do projeto.** Nada de servidor, banco ou mensalidade.

**Nunca comite chave, ARN, ID de conta ou nome de bucket** — o repositório é
público. O `deploy.yml` lê tudo de `vars.*`.

## 9. Estilo de código

- **Português** em nomes e comentários.
- Comentário explica o **porquê**.
- Sem `any`, sem `console.log`.
- Aspas simples, sem ponto e vírgula, vírgula final, 100 colunas. O Biome cuida.
