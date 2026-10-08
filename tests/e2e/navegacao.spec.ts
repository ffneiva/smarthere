import { expect, test } from '@playwright/test'
import { EMPRESA, PASSOS, SERVICOS } from '../../src/lib/business'
import { ROTAS } from '../../src/lib/routes'

/**
 * Navegação e HTML por rota — contra o build de produção, que é onde os HTML
 * por rota existem. O dev server serviria o mesmo index.html para tudo.
 */

for (const rota of ROTAS) {
  test(`${rota.path} chega com título, canonical e um único h1`, async ({ page, request }) => {
    const html = await (await request.get(rota.path)).text()
    expect(html).toContain(`<title>${rota.titulo.replace(/&/g, '&amp;')}</title>`)
    expect(html).toMatch(/<link rel="canonical" href="https:\/\/smarthere\.com\.br[^"]*"/)
    expect(html).toContain('application/ld+json')

    await page.goto(rota.path)
    await expect(page.locator('h1')).toHaveCount(1)
  })
}

test('endereço inexistente mostra a página de 404 com noindex', async ({ page }) => {
  const resposta = await page.goto('/uma-rota-que-nao-existe')
  expect(resposta?.status()).toBe(404)
  await expect(page.locator('h1')).toContainText('Essa peça não está aqui')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
})

test('link interno navega sem recarregar a página', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    ;(window as unknown as { marcador: boolean }).marcador = true
  })
  await page.locator('footer').getByRole('link', { name: 'Política de privacidade' }).click()
  await expect(page).toHaveURL(/\/politica-de-privacidade$/)
  await expect(page.locator('h1')).toContainText('seus dados')
  expect(await page.evaluate(() => (window as unknown as { marcador?: boolean }).marcador)).toBe(
    true,
  )
})

test('todo contato vai para o WhatsApp da loja, com mensagem', async ({ page }) => {
  await page.goto('/')
  await page.locator('#servicos').waitFor()
  expect(await page.locator('a[href^="mailto:"]').count()).toBe(0)
  const hrefs = await page
    .locator('a[href^="https://wa.me/"]')
    .evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? ''))
  expect(hrefs.length).toBeGreaterThan(10)
  for (const h of hrefs) expect(h).toContain(`wa.me/${EMPRESA.whatsapp}?text=`)
})

test('cada serviço abre o contato já com a mensagem dele', async ({ page }) => {
  await page.goto('/')
  const servico = SERVICOS[1]
  const link = page.getByRole('link', { name: `Orçar ${servico.nome.toLowerCase()} pelo WhatsApp` })
  const href = (await link.getAttribute('href')) ?? ''
  expect(new URL(href).searchParams.get('text')).toBe(servico.mensagem)
})

test('o raio-x traz um cartão por peça, cada um com o seu orçamento', async ({ page }) => {
  await page.goto('/')
  const passos = page.locator('#por-dentro [data-passo]')
  await expect(passos).toHaveCount(PASSOS.length)
  for (const p of PASSOS) await expect(page.locator('#por-dentro')).toContainText(p.peca)
})

test('o diagnóstico rápido monta a mensagem antes de enviar', async ({ page }) => {
  await page.goto('/')
  const secao = page.locator('#diagnostico')
  await secao.scrollIntoViewIfNeeded()
  const botao = secao.locator('a[aria-disabled]')
  await expect(botao).toHaveAttribute('aria-disabled', 'true')
  // O HTML vem pré-renderizado: um clique antes de o React assumir a página
  // se perde. Com a máquina ocupada (CI, testes em paralelo) isso acontece;
  // então a interação se repete até a mensagem aparecer.
  await expect(async () => {
    await secao.getByRole('button', { name: 'Samsung' }).click()
    await secao.getByPlaceholder(/Modelo/).fill('S23')
    await secao.getByRole('button', { name: 'Caiu na água' }).click()
    await expect(secao.locator('output')).toContainText('Tenho Samsung S23 com: caiu na água.', {
      timeout: 2000,
    })
  }).toPass({ timeout: 20_000 })
  await expect(botao).toHaveAttribute('aria-disabled', 'false')
  const href = (await botao.getAttribute('href')) ?? ''
  expect(new URL(href).searchParams.get('text')).toContain('Samsung S23')
})

test('nenhum preço aparece na página', async ({ page }) => {
  await page.goto('/')
  await page.locator('#duvidas').waitFor()
  const texto = await page.locator('body').innerText()
  expect(texto).not.toMatch(/R\$\s?\d/)
})

test('os direitos linkam o texto do CDC no Planalto', async ({ page }) => {
  await page.goto('/')
  // A seção vem no chunk de baixo (sob demanda): espera ela existir.
  await page.locator('#direitos').waitFor()
  await expect(page.locator('#direitos a[href*="planalto.gov.br"]')).toHaveCount(1)
  await expect(page.locator('#direitos blockquote')).toHaveCount(3)
})

test('o manual da marca oferece os arquivos para baixar, e eles existem', async ({
  page,
  request,
}) => {
  await page.goto('/marca')
  // A página do manual chega sob demanda (lazy): espera o primeiro link.
  await page.locator('a[download]').first().waitFor()
  const hrefs = await page
    .locator('a[download]')
    .evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? ''))
  expect(hrefs.length).toBe(6)
  for (const h of hrefs) expect((await request.get(h)).status(), h).toBe(200)
})

test('o JSON-LD traz a empresa', async ({ request }) => {
  const html = await (await request.get('/')).text()
  const json = JSON.parse(
    html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1],
  )
  const empresas = json['@graph'].filter((n: { '@type': string }) => n['@type'] === 'Organization')
  expect(empresas).toHaveLength(1)
  expect(empresas[0].name).toBe(EMPRESA.nome)
})

/**
 * Sair da home depois de rolar até o meio — com a cena 3D montada. Desmontar
 * a home desfaz o contexto WebGL e os gatilhos do GSAP; um erro ali
 * derrubaria o React na troca de rota.
 */
test('da home para a privacidade depois de rolar a página', async ({ page }) => {
  const erros: string[] = []
  page.on('pageerror', (e) => erros.push(e.message))
  await page.goto('/')
  await page.waitForTimeout(2500)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 4))
  await page.waitForTimeout(1000)
  await page.evaluate(() => {
    const a = document.createElement('a')
    a.href = '/politica-de-privacidade'
    document.body.appendChild(a)
    a.click()
  })
  await expect(page).toHaveURL(/\/politica-de-privacidade$/)
  await expect(page.locator('h1')).not.toContainText('travou')
  await page.waitForTimeout(500)
  expect(erros).toEqual([])
})
