import { useEffect, useRef, useState } from 'react'
import { BotaoContato } from '@/components/Contato'
import { IconeSeta } from '@/components/Icones'
import { useCena } from '@/hooks/useCena'
import { EMPRESA, PASSOS } from '@/lib/business'
import { ESTADO } from '@/lib/estados'
import { cn } from '@/lib/utils'

/**
 * O herói e a montagem — o texto por cima do celular 3D.
 *
 * O aparelho em si mora no palco fixo da home (components/Palco3D.tsx);
 * aqui ficam só os blocos de texto, cada um marcando um estado da cena com
 * `data-s`: o herói (peças soltas), um cartão por passo da montagem (a peça
 * da vez "na mão") e o "pronto" (montado e testado).
 *
 * Os cartões são o conteúdo — legíveis, selecionáveis, indexáveis — e
 * existem com ou sem a cena. Sem ela (sem WebGL, movimento reduzido), as
 * duas fotos do mesmo aparelho tomam o lugar do 3D.
 */
export function Aparelho({ pronto, com3D }: { pronto: boolean; com3D: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [armado, setArmado] = useState(false)
  const [ativo, setAtivo] = useState(-1)

  // Arma só no cliente: o HTML estático nasce sem a classe, e o título visível.
  useEffect(() => setArmado(true), [])

  // Qual passo está no meio da tela — acende o cartão dele.
  useEffect(() => {
    const el = ref.current
    if (!el || !com3D) return
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) setAtivo(Number((e.target as HTMLElement).dataset.indice))
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    for (const p of el.querySelectorAll('[data-passo]')) io.observe(p)
    return () => io.disconnect()
  }, [com3D])

  // O texto do herói sobe e some enquanto as peças começam a se juntar.
  useCena(ref, ({ gsap }) => {
    gsap.to('[data-heroi-texto]', {
      yPercent: -18,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: '[data-heroi]', start: 'top top', end: 'bottom 30%', scrub: true },
    })
    return undefined
  })

  return (
    <div
      ref={ref}
      className={cn('relative', com3D && 'pointer-events-none')}
      {...(com3D ? { 'data-raiox-armado': '' } : {})}
    >
      {/* Herói */}
      <section
        id="topo"
        data-heroi
        data-s={ESTADO.heroi}
        className={cn(
          'relative flex min-h-[100svh] items-end pt-28 pb-14 sm:pb-20 lg:items-center lg:pb-0',
          armado && 'heroi-armado',
          armado && pronto && 'heroi-pronto',
        )}
      >
        {!com3D && (
          <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
            <div className="grade absolute inset-0 opacity-70" />
            <ImagemAparelho
              tipo="aberto"
              className="absolute top-20 left-1/2 w-[92vw] max-w-none -translate-x-1/2 lg:top-1/2 lg:left-auto lg:right-[2vw] lg:w-[54vw] lg:translate-x-0 lg:-translate-y-1/2"
            />
          </div>
        )}
        {/* No celular, as peças ocupam a metade de cima; o degradê dá leitura
            ao texto que fica embaixo delas. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 -z-[1] h-[46%] bg-gradient-to-b from-transparent via-breu/45 to-breu/85 lg:hidden"
        />
        <div data-heroi-texto className="container-x relative">
          <div className="legivel pointer-events-auto max-w-[40rem] lg:max-w-[44vw]">
            <p
              data-surge
              style={{ ['--i' as string]: 0 }}
              className="rotulo mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sinal sm:mb-6"
            >
              <span aria-hidden className="pulso relative h-1.5 w-1.5 rounded-full bg-current" />
              Assistência técnica de celulares
            </p>

            <h1 className="titulo text-[clamp(1.9rem,8.4vw,3.4rem)] sm:text-[clamp(3rem,6.4vw,4.6rem)] lg:text-[clamp(2.6rem,3.9vw,4.4rem)]">
              <span data-linha className="block overflow-hidden pt-[0.08em] pb-[0.04em]">
                <span className="block" style={{ ['--i' as string]: 0 }}>
                  Conserto de celular
                </span>
              </span>
              <span data-linha className="block overflow-hidden pt-[0.08em] pb-[0.04em]">
                <span className="aluminio block" style={{ ['--i' as string]: 1 }}>
                  que mostra o que
                </span>
              </span>
              <span data-linha className="block overflow-hidden pt-[0.08em] pb-[0.1em]">
                <span className="block" style={{ ['--i' as string]: 2 }}>
                  tem <span className="enfase">dentro.</span>
                </span>
              </span>
            </h1>

            <p
              data-surge
              style={{ ['--i' as string]: 1 }}
              className="mt-5 max-w-[42ch] text-[0.98rem] leading-relaxed text-aco sm:mt-7 sm:text-[1.15rem]"
            >
              Diagnóstico na bancada, orçamento por escrito antes de qualquer reparo e teste na sua
              frente na entrega. Role a página: o aparelho se monta, peça por peça.
            </p>

            <div
              data-surge
              style={{ ['--i' as string]: 2 }}
              className="mt-7 flex flex-wrap items-center gap-3 sm:mt-9"
            >
              <BotaoContato origem="heroi" className="botao-sinal" />
              <a href="#por-dentro" className="botao botao-linha">
                Ver por dentro <IconeSeta className="h-4 w-4 rotate-90" />
              </a>
            </div>

            <ul
              data-surge
              style={{ ['--i' as string]: 3 }}
              className="mt-11 hidden flex-wrap gap-x-6 gap-y-2 font-mono text-[0.7rem] tracking-[0.08em] text-nevoa uppercase sm:flex"
            >
              <li>Orçamento por escrito · CDC art. 40</li>
              <li>Garantia legal de 90 dias</li>
            </ul>
          </div>
        </div>

        {/* A deixa para rolar. */}
        <div
          aria-hidden
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 lg:flex"
        >
          <span className="rotulo text-[0.6rem] text-nevoa">Role para montar</span>
          <span className="relative h-10 w-px overflow-hidden bg-gelo/15">
            <span
              className="absolute inset-x-0 top-0 h-1/2 bg-sinal"
              style={{ animation: 'flutua 1.8s var(--ease-corte) infinite' }}
            />
          </span>
        </div>
      </section>

      {/* A montagem */}
      <section id="por-dentro" aria-labelledby="por-dentro-titulo" className="relative">
        <div className="flex min-h-[60svh] items-end pb-[8svh] lg:items-center lg:pb-0">
          <div className="container-x">
            <div className="pointer-events-auto max-w-[34rem] legivel rounded-3xl bg-breu/35 p-5 backdrop-blur-[2px] sm:p-8 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
              <p className="rotulo mb-5 text-sinal">Montagem · {PASSOS.length} peças</p>
              <h2 id="por-dentro-titulo" className="titulo text-[clamp(2rem,4.4vw,3.8rem)]">
                Quase todo defeito mora numa <span className="enfase">destas peças.</span>
              </h2>
              <p className="mt-6 max-w-[44ch] text-[1.05rem] leading-relaxed text-aco">
                Um celular é uma pilha de camadas coladas e parafusadas. Da tampa traseira até a
                tela, cada peça entra no lugar com o sintoma que dá quando falha — e o que a gente
                faz.
              </p>
              {!com3D && <ImagemAparelho tipo="frente" className="mt-8 h-[60svh] w-auto" />}
            </div>
          </div>
        </div>

        <ol className="relative">
          {PASSOS.map((p, i) => (
            <li
              key={p.id}
              data-s={ESTADO.passo(i)}
              data-passo
              data-indice={i}
              {...(ativo === i ? { 'data-ativo': '' } : {})}
              className="flex min-h-[100svh] items-end pb-[6svh] lg:items-center lg:pb-0"
            >
              <div className="container-x">
                <article className="pointer-events-auto max-w-[31rem] legivel rounded-3xl border border-gelo/10 bg-breu/45 p-5 backdrop-blur-[3px] sm:p-8 lg:bg-breu/55 lg:backdrop-blur-xl">
                  <header className="flex items-baseline justify-between gap-4">
                    <p className="rotulo text-sinal">
                      Peça {p.numero} / {String(PASSOS.length).padStart(2, '0')}
                    </p>
                    <p className="rotulo text-nevoa">{p.servico}</p>
                  </header>
                  <h3 className="titulo mt-4 text-[clamp(1.7rem,3vw,2.5rem)]">{p.peca}</h3>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {p.sintomas.map((s) => (
                      <li
                        key={s}
                        className="rounded-full border border-gelo/15 px-3 py-1 text-[0.82rem] text-aco"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 text-[0.98rem] leading-relaxed text-nevoa">{p.nota}</p>
                  <BotaoContato
                    origem={`montagem-${p.id}`}
                    mensagem={p.mensagem}
                    className="botao-linha mt-6 min-h-11 px-5 text-sm"
                  >
                    Orçar {p.servico.toLowerCase()}
                  </BotaoContato>
                </article>
              </div>
            </li>
          ))}
        </ol>

        <div
          data-s={ESTADO.pronto}
          className="flex min-h-[110svh] items-end pb-[8svh] lg:items-center lg:pb-0"
        >
          <div className="container-x">
            <div className="pointer-events-auto max-w-[34rem] legivel rounded-3xl bg-breu/35 p-5 backdrop-blur-[2px] sm:p-8 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
              <p className="rotulo mb-5 text-sinal">Montado</p>
              <p className="titulo max-w-[16ch] text-[clamp(2rem,4.4vw,3.8rem)]">
                Fechado, testado <span className="enfase">e na sua mão.</span>
              </p>
              <p className="mt-6 max-w-[44ch] text-[1.05rem] leading-relaxed text-aco">
                Tela, toque, carga, câmeras, áudio e sinal conferidos na entrega, na sua frente. O
                serviço sai com a garantia legal de 90 dias.
              </p>
              <div className="mt-8">
                <BotaoContato origem="montagem-fim" className="botao-sinal" />
              </div>
              <p className="mt-4 text-xs text-nevoa">{EMPRESA.assinatura}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

/**
 * O aparelho em imagem — o mesmo modelo 3D, fotografado
 * (scripts/fotografar-aparelho.mjs). É o aparelho de quem não tem WebGL ou
 * pediu movimento reduzido.
 */
function ImagemAparelho({ tipo, className }: { tipo: 'frente' | 'aberto'; className?: string }) {
  const dims = tipo === 'frente' ? { w: 900, h: 1400 } : { w: 1400, h: 1100 }
  return (
    <picture>
      <source srcSet={`/images/aparelho-${tipo}.avif`} type="image/avif" />
      <img
        src={`/images/aparelho-${tipo}.webp`}
        width={dims.w}
        height={dims.h}
        alt={
          tipo === 'frente'
            ? 'Celular montado, de frente, com a tela de reparo concluído'
            : 'O mesmo celular desmontado em camadas: vidro, tela, chassi, placa, bateria, câmeras, bobina e tampa'
        }
        loading={tipo === 'aberto' ? 'eager' : 'lazy'}
        decoding="async"
        className={className}
      />
    </picture>
  )
}
