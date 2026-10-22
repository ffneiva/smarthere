import { useRef } from 'react'
import { Reveal } from '@/components/Reveal'
import { Titulo } from '@/components/Titulo'
import { useCena } from '@/hooks/useCena'
import { ETAPAS } from '@/lib/business'
import { ESTADO } from '@/lib/estados'

/**
 * Como funciona — as cinco etapas, numa linha do tempo vertical.
 *
 * O trilho à esquerda é uma linha de leitura que "carrega" conforme a
 * rolagem (scaleY com scrub), como a barra de um instrumento medindo. Sem o
 * motor, o trilho fica cheio e as etapas, todas visíveis: nada depende dele.
 */
export function ComoFunciona() {
  const ref = useRef<HTMLElement>(null)

  useCena(ref, ({ gsap }, el) => {
    const trilho = el.querySelector('[data-trilho]')
    gsap.fromTo(
      trilho,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el.querySelector('[data-etapas]'),
          start: 'top 70%',
          end: 'bottom 60%',
          scrub: true,
        },
      },
    )
    return undefined
  })

  return (
    <section
      ref={ref}
      id="como-funciona"
      data-s={ESTADO.secao('como-funciona')}
      className="relative py-28 sm:py-36"
    >
      {/* Tudo na coluna da esquerda: a metade direita é do celular 3D,
          entreaberto e grande — o "diagnóstico na bancada". */}
      <div className="container-x relative grid gap-16 lg:max-w-[92rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="grid gap-14">
          <div>
            <Titulo
              rotulo="Como funciona"
              titulo="Nada é trocado"
              enfase="sem você saber."
              apoio="Cinco etapas, do primeiro contato à entrega. Três delas são o que a lei já garante, e a gente faz questão de dizer qual."
            />
          </div>

          <ol data-etapas className="relative pl-10 sm:pl-14">
            <span
              aria-hidden
              className="absolute top-2 bottom-2 left-[0.6rem] w-px bg-chumbo sm:left-4"
            />
            <span
              aria-hidden
              data-trilho
              className="absolute top-2 bottom-2 left-[0.6rem] w-px origin-top bg-sinal shadow-[0_0_12px_rgba(200,255,46,0.6)] sm:left-4"
            />
            {ETAPAS.map((e, i) => (
              <Reveal as="li" key={e.numero} delay={i * 0.05} className="relative pb-14 last:pb-0">
                <span
                  aria-hidden
                  className="absolute top-1.5 -left-10 grid h-5 w-5 place-items-center rounded-full border border-sinal bg-breu sm:-left-[2.85rem]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-sinal" />
                </span>
                <p className="rotulo flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="text-sinal">{e.numero}</span>
                  <span className="text-nevoa">{e.leitura}</span>
                </p>
                <h3 className="titulo mt-3 text-[clamp(1.5rem,2.6vw,2.2rem)]">{e.titulo}</h3>
                <p className="mt-3 max-w-[50ch] text-[1.02rem] leading-relaxed text-nevoa">
                  {e.texto}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
