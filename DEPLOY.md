# Deploy

- **Endereço:** https://smarthere.com.br (e www) — domínio da marca
- **Origem:** S3 privado + CloudFront (Origin Access Control)
- **CI/CD:** GitHub Actions com OIDC — nenhum segredo de longa duração

Os scripts de provisionamento e os valores reais (conta, ARN, bucket,
distribuição) ficam **fora deste repositório**, que é público, em
`../_infra-smarthere`.

---

## Primeira vez

1. `bash ../_infra-smarthere/aws-setup.sh` — cria bucket, certificado (raiz +
   www), OAC, CloudFront Function, cabeçalhos de segurança, distribuição e a
   role OIDC. Grava o resumo em `../_infra-smarthere/DEPLOY-SECRETS.txt`.
2. `bash ../_infra-smarthere/deploy-local.sh` — publica da máquina local. O
   site já funciona no endereço `*.cloudfront.net` impresso no passo 1.
3. **DNS de smarthere.com.br** — os CNAMEs de validação do certificado, `www`
   em CNAME para o CloudFront e a raiz em ALIAS/ANAME. O DNS do Registro.br
   não aceita ALIAS na raiz: aponte o domínio para a Cloudflare (gratuito) ou
   o Route 53 e crie lá os registros.
4. `bash ../_infra-smarthere/aws-attach-domain.sh` — espera o certificado e
   anexa os dois nomes à distribuição.
5. GitHub (repositório `ffneiva/smarthere`) → Settings → Variables:
   `AWS_REGION`, `AWS_ROLE_ARN`, `S3_BUCKET_NAME`, `CLOUDFRONT_DISTRIBUTION_ID`;
   e Environments → criar `production`.

## Dia a dia

```bash
git push origin main      # o deploy.yml testa, constrói, publica e confere
```

### Mudar texto, serviço, contato

Tudo em [`src/lib/business.ts`](src/lib/business.ts). Trocar o WhatsApp é
mudar `whatsapp` e `telefone` ali: todos os botões acompanham.

### Mexeu no celular 3D

`npm run fotos` refaz as fotos de reserva; `npm run brand` refaz a arte de
compartilhamento (que usa a foto).

---

## Pendências — confirmar com o dono da Smarthere

Dados que não existem ainda (o site se adapta enquanto forem `null`):

- **WhatsApp** `(64) 9973-0616` (provisório, passado em 06/10/2026). Tem 8
  dígitos depois do DDD: se a conta foi criada com o 9 na frente, trocar em
  `business.ts` para `5564999730616`. A empresa não tem e-mail.
- **Endereço, cidade e horário.** Com endereço, o JSON-LD vira `LocalBusiness`
  e o rodapé mostra onde fica.
- **Instagram** e demais redes.
- **CNPJ / razão social**, se quiser no rodapé.

Propostas que o site promete (posicionamento sugerido — validar antes de
divulgar):

- Orçamento **por escrito**, com prazo, antes de qualquer reparo (é o que a
  lei já exige — art. 40 do CDC).
- **Peça trocada devolvida** ao cliente, se ele quiser ver.
- **Teste na frente do cliente** na entrega (tela, toque, carga, câmeras,
  áudio, sinal).
- **Limpeza antes da troca** no conector de carga e no alto-falante.
- **Reparo de placa com microssoldagem** (microscópio + estação de solda). Se
  a loja só trocar módulos, reescrever a nota do passo 06.
- **Marcas atendidas:** iPhone, Samsung, Motorola, Xiaomi, Realme, Asus,
  Google Pixel.

## Quando algo dá errado

| Sintoma | Causa |
|---|---|
| Action falha com *Not authorized to perform sts:AssumeRoleWithWebIdentity* | O environment `production` não existe, ou o nome do repositório difere do da trust policy |
| Certificado preso em `PENDING_VALIDATION` | Os CNAMEs de validação não foram criados (são dois: raiz e www) |
| `/marca` devolve a home | CloudFront Function não publicada (ficou em DEVELOPMENT) |
| A raiz não abre, o www abre | Falta o ALIAS/ANAME da raiz — o Registro.br não tem; use Cloudflare ou Route 53 |
