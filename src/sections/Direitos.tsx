import { IconeSetaDiagonal } from '@/components/Icones'
import { Reveal } from '@/components/Reveal'
import { Titulo } from '@/components/Titulo'
import { CDC_URL, DIREITOS, SOCORROS } from '@/lib/business'
import { ESTADO } from '@/lib/estados'

/**
 * Seus direitos no conserto — e o que fazer antes de chegar aqui.
 *
 * As duas metades são fato com fonte: os artigos do Código de Defesa do
 * Consumidor, citados literalmente e com link para o texto no Planalto, e os
 * primeiros socorros, com a página de suporte do fabricante quando há.
 * Uma loja que explica o direito do cliente é a prova de que vai cumpri-lo.
 */
export function Direitos() {
  return (
    <section id="direitos" className="relative py-28 sm:py-36">
      <div className="container-x">
        {/* O marcador da cena fica no título (e não na seção, que é alta):
            o aparelho chega ao lado dele, no espaço livre à direita. */}
        <div data-s={ESTADO.secao('direitos')}>
          <Titulo
            rotulo="Seus direitos"
            titulo="O que a lei garante"
            enfase="em qualquer conserto."
            apoio={
              <>
                Vale aqui e em qualquer assistência. Está no Código de Defesa do Consumidor (Lei
                8.078/1990) —{' '}
                <a
                  href={CDC_URL}
                  target="_blank"
                  rel="noopener"
                  className="text-gelo underline decoration-gelo/30 underline-offset-4 hover:decoration-sinal"
                >
                  leia o texto completo no Planalto
                </a>
                .
              </>
            }
          />
        </div>

        <div className="mt-16 grid gap-4 lg:grid-cols-3">
          {DIREITOS.map((d, i) => (
            <Reveal
              as="article"
              key={d.artigo}
              delay={i * 0.08}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-gelo/10 bg-grafite p-7 sm:p-8"
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sinal/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
              <p className="rotulo text-sinal">CDC · {d.artigo}</p>
              <h3 className="titulo mt-4 text-[1.6rem] leading-[1.12]">{d.titulo}</h3>
              <p className="mt-4 text-[1rem] leading-relaxed text-aco">{d.texto}</p>
              <blockquote
                cite={CDC_URL}
                className="mt-6 border-l border-sinal/50 pl-4 text-[0.88rem] leading-relaxed text-nevoa italic"
              >
                “{d.citacao}”
              </blockquote>
            </Reveal>
          ))}
        </div>

        {/* Antes de chegar aqui. */}
        <div className="mt-28">
          <p className="rotulo mb-6 flex items-center gap-3 text-cobre">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
            Antes de chegar aqui
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {SOCORROS.map((s, i) => (
              <Reveal
                as="article"
                key={s.titulo}
                delay={i * 0.08}
                className="rounded-3xl border border-cobre/20 bg-gradient-to-b from-cobre/[0.06] to-transparent p-7"
              >
                <h3 className="titulo text-[1.35rem]">{s.titulo}</h3>
                <ol className="mt-5 grid gap-3">
                  {s.passos.map((p, k) => (
                    <li
                      key={p}
                      className="grid grid-cols-[1.5rem_1fr] gap-2 text-[0.95rem] leading-relaxed text-aco"
                    >
                      <span className="font-mono text-xs leading-[1.6rem] text-cobre">
                        0{k + 1}
                      </span>
                      {p}
                    </li>
                  ))}
                </ol>
                {s.fonte && (
                  <a
                    href={s.fonte.url}
                    target="_blank"
                    rel="noopener"
                    className="mt-5 inline-flex items-start gap-1.5 text-xs leading-relaxed text-nevoa underline decoration-nevoa/30 underline-offset-4 hover:text-gelo"
                  >
                    Fonte: {s.fonte.rotulo}
                    <IconeSetaDiagonal className="mt-0.5 h-3 w-3 shrink-0" />
                  </a>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
