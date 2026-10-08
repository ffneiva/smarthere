import { BotaoContato } from '@/components/Contato'
import { IconeCheck, IconeSetaDiagonal } from '@/components/Icones'
import { Perguntas } from '@/components/Perguntas'
import { Reveal } from '@/components/Reveal'
import { TopoPagina } from '@/components/TopoPagina'
import { EMPRESA } from '@/lib/business'
import { PAGINAS, paginaDe } from '@/lib/paginas'

/**
 * Página de serviço (/conserto/<slug>) — a resposta para quem chega do
 * Google com um problema específico.
 *
 * A ordem segue a pergunta de quem procura: "é isso que eu tenho?" (sinais),
 * "por quê?" (causas), "o que vocês fazem?" (o reparo), "o que eu faço até
 * lá?" (cuidados), as dúvidas — e o botão já com a mensagem do serviço. No
 * pé, os outros serviços: links internos que levam o Google (e a pessoa)
 * pelo resto do site.
 */
export default function Servico({ slug }: { slug: string }) {
  const p = paginaDe(slug)
  if (!p) return null
  const outros = PAGINAS.filter((x) => x.slug !== slug)

  return (
    <>
      <TopoPagina rotulo="Conserto de celular" titulo={p.h1} apoio={p.resumo}>
        <nav aria-label="Trilha" className="mt-8 font-mono text-xs text-nevoa">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <a href="/" className="hover:text-gelo">
                Início
              </a>
            </li>
            <li aria-hidden>/</li>
            <li>
              <a href="/#servicos" className="hover:text-gelo">
                Serviços
              </a>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-sinal">
              {p.nome}
            </li>
          </ol>
        </nav>
        <div className="mt-10 flex flex-wrap gap-3">
          <BotaoContato
            origem={`pagina-${p.slug}`}
            mensagem={p.mensagem}
            className="botao-sinal"
            icone
          />
          <a href="/#diagnostico" className="botao botao-linha">
            Diagnóstico rápido
          </a>
        </div>
      </TopoPagina>

      <section className="bg-grafite py-20 sm:py-28">
        <div className="container-x grid gap-16 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <h2 className="titulo text-[clamp(1.6rem,3vw,2.4rem)]">Como saber se é isso</h2>
            <ul className="mt-8 grid gap-3">
              {p.sinais.map((s) => (
                <li
                  key={s}
                  className="flex items-start gap-3 rounded-2xl border border-gelo/10 bg-breu/60 px-5 py-4 text-[1rem] text-aco"
                >
                  <IconeCheck className="mt-0.5 h-5 w-5 shrink-0 text-sinal" />
                  {s}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="titulo text-[clamp(1.6rem,3vw,2.4rem)]">Por que acontece</h2>
            <p className="mt-8 text-[1.05rem] leading-relaxed text-aco">{p.causas}</p>
            <div className="mt-10 rounded-3xl border border-cobre/25 bg-gradient-to-b from-cobre/[0.07] to-transparent p-6">
              <p className="rotulo text-cobre">Até chegar aqui</p>
              <ul className="mt-4 grid gap-3">
                {p.cuidados.map((c) => (
                  <li key={c} className="text-[0.98rem] leading-relaxed text-aco">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-breu py-20 sm:py-28">
        <div className="container-x">
          <h2 className="titulo text-[clamp(1.6rem,3vw,2.4rem)]">Como é o reparo</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {p.reparo.map((r, i) => (
              <Reveal
                as="li"
                key={r}
                delay={i * 0.06}
                className="rounded-3xl border border-gelo/10 bg-grafite p-6"
              >
                <span className="font-mono text-sm text-sinal">0{i + 1}</span>
                <p className="mt-3 text-[1rem] leading-relaxed text-aco">{r}</p>
              </Reveal>
            ))}
          </ol>
          <p className="mt-8 max-w-[62ch] text-sm leading-relaxed text-nevoa">
            O orçamento vem por escrito, com peça, mão de obra e prazo, antes de qualquer reparo —
            como manda o{' '}
            <a
              href="/#direitos"
              className="text-gelo underline decoration-gelo/30 underline-offset-4"
            >
              Código de Defesa do Consumidor
            </a>
            . O serviço tem a garantia legal de 90 dias.
          </p>
        </div>
      </section>

      <section className="bg-grafite py-20 sm:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:gap-20">
          <h2 className="titulo text-[clamp(1.6rem,3vw,2.4rem)]">
            Perguntas sobre {p.nome.toLowerCase()}
          </h2>
          <Perguntas itens={p.perguntas} />
        </div>
      </section>

      <section className="bg-breu py-20 sm:py-24">
        <div className="container-x">
          <div className="flex flex-col gap-6 rounded-3xl border border-sinal/25 bg-gradient-to-br from-sinal/[0.08] to-transparent p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <p className="titulo text-[clamp(1.4rem,2.6vw,2rem)]">Mande o modelo e o problema.</p>
              <p className="mt-2 text-aco">
                O WhatsApp abre com a mensagem pronta · {EMPRESA.telefone}
              </p>
            </div>
            <BotaoContato
              origem={`pagina-${p.slug}-fim`}
              mensagem={p.mensagem}
              className="botao-sinal w-fit"
              icone
            />
          </div>

          <h2 className="rotulo mt-20 text-nevoa">Outros serviços</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {outros.map((o) => (
              <li key={o.slug}>
                <a
                  href={`/conserto/${o.slug}`}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-gelo/10 px-5 py-4 transition-colors hover:border-sinal"
                >
                  <span className="text-[0.98rem] text-gelo">{o.h1}</span>
                  <IconeSetaDiagonal className="h-4 w-4 shrink-0 text-nevoa group-hover:text-sinal" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
