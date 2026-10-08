import { BotaoContato } from '@/components/Contato'
import { IconeSetaDiagonal } from '@/components/Icones'
import { Marquee } from '@/components/Marquee'
import { Reveal } from '@/components/Reveal'
import { Titulo } from '@/components/Titulo'
import { registrar } from '@/lib/analytics'
import { linkContato, MARCAS, SERVICOS } from '@/lib/business'
import { ESTADO } from '@/lib/estados'

/**
 * A lista de consulta — todos os serviços, cada linha já abre o contato com
 * o nome dele. É informação de consulta: lista parada, sem carrossel.
 * Antes dela, a faixa das marcas atendidas corre (essa sim é de passeio).
 * O celular 3D, de costas e girando, ocupa o espaço embaixo do título.
 */
export function Servicos() {
  return (
    <section
      id="servicos"
      data-s={ESTADO.secao('servicos')}
      className="relative overflow-hidden bg-grafite/35 pt-6 pb-28 sm:pb-36"
    >
      <div className="border-y border-chumbo py-5">
        <Marquee duracao={38}>
          {MARCAS.map((m) => (
            <span key={m} className="flex items-center gap-10">
              <span className="titulo text-[clamp(1.4rem,3vw,2.4rem)] text-gelo/80">{m}</span>
              <span aria-hidden className="h-2 w-2 rounded-full bg-sinal" />
            </span>
          ))}
        </Marquee>
      </div>

      <div className="container-x mt-24 grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Titulo
            rotulo="Serviços"
            titulo="O que a gente"
            enfase="conserta."
            apoio="Sem tabela de preço: o valor depende do modelo e da peça, e sai no orçamento por escrito. Toque no nome para o guia completo, ou na seta para pedir o orçamento com a mensagem já escrita."
          />
          <BotaoContato origem="servicos" className="botao-sinal mt-10" />
        </div>

        <ul className="border-t border-chumbo">
          {SERVICOS.map((s, i) => (
            <Reveal
              as="li"
              key={s.nome}
              delay={Math.min(i, 6) * 0.04}
              className="border-b border-chumbo"
            >
              {/* O nome leva à página do serviço (o guia completo); a seta abre
                  o WhatsApp com a mensagem pronta. */}
              <div className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-6 transition-colors duration-300 hover:bg-gelo/[0.025] sm:grid-cols-[3.5rem_1fr_auto] sm:py-7">
                <span className="font-mono text-xs text-nevoa transition-colors group-hover:text-sinal">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>
                  {s.slug ? (
                    <a
                      href={`/conserto/${s.slug}`}
                      className="block font-display text-[1.15rem] font-medium tracking-[-0.02em] underline decoration-transparent underline-offset-4 transition-colors hover:decoration-sinal sm:text-[1.45rem]"
                    >
                      {s.nome}
                    </a>
                  ) : (
                    <span className="block font-display text-[1.15rem] font-medium tracking-[-0.02em] sm:text-[1.45rem]">
                      {s.nome}
                    </span>
                  )}
                  <span className="mt-1.5 block text-sm leading-relaxed text-nevoa">
                    {s.detalhe}
                  </span>
                </span>
                <a
                  href={linkContato(s.mensagem)}
                  target="_blank"
                  rel="noopener"
                  aria-label={`Orçar ${s.nome.toLowerCase()} pelo WhatsApp`}
                  onClick={() => registrar('servico_clique', { servico: s.nome })}
                  data-cursor="Orçar"
                  className="grid h-10 w-10 place-items-center rounded-full border border-gelo/15 transition-[background-color,border-color,color,transform] duration-500 ease-[var(--ease-sh)] hover:-rotate-45 hover:border-sinal hover:bg-sinal hover:text-breu"
                >
                  <IconeSetaDiagonal className="h-4 w-4 rotate-45" />
                </a>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
