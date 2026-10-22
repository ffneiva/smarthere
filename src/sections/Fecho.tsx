import { usePode3D } from '@/components/Cena3D'
import { BotaoContato } from '@/components/Contato'
import { Simbolo } from '@/components/Logo'
import { Perguntas } from '@/components/Perguntas'
import { Titulo } from '@/components/Titulo'
import { EMPRESA, FAQ } from '@/lib/business'
import { ESTADO } from '@/lib/estados'
import { cn } from '@/lib/utils'

/** As dúvidas que sobram — o mesmo FAQ que o JSON-LD declara. */
export function SecaoPerguntas() {
  return (
    <section id="duvidas" data-s={ESTADO.secao('duvidas')} className="bg-grafite/35 py-28 sm:py-36">
      <div className="container-x grid gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Titulo rotulo="Dúvidas" titulo="Perguntas de quem" enfase="está com o celular na mão." />
        </div>
        <Perguntas itens={FAQ} />
      </div>
    </section>
  )
}

/**
 * O chamado final: o nome da marca partido em "smart." e "here." — a frase
 * que o nome sempre quis dizer — e, ao lado, o celular 3D de frente, com a
 * marca na tela. Sem a cena, o texto volta ao centro.
 */
export function Fecho() {
  const com3D = usePode3D()
  return (
    <section
      data-s={ESTADO.secao('fecho')}
      className={cn(
        'relative isolate flex min-h-[100svh] items-center overflow-hidden py-32 sm:py-44',
        com3D && 'max-lg:items-end max-lg:pt-[52svh] max-lg:pb-16',
      )}
    >
      {!com3D && (
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(45% 55% at 50% 60%, rgba(200,255,46,0.13), transparent 70%)',
          }}
        />
      )}
      <div
        className={cn(
          'container-x flex flex-col',
          com3D ? 'items-start text-left' : 'items-center text-center',
        )}
      >
        <Simbolo className="w-12 text-sinal sm:w-14" />
        <h2 className="titulo mt-8 text-[clamp(3rem,11vw,9rem)] leading-[0.86] tracking-[-0.06em]">
          <span className="block">smart.</span>
          <span className="block text-sinal">here.</span>
        </h2>
        <p className="mt-8 max-w-[40ch] text-[1.1rem] leading-relaxed text-aco">
          {EMPRESA.assinatura} Conte o modelo e o problema: o orçamento vem por escrito, antes de
          qualquer reparo.
        </p>
        <BotaoContato origem="fecho" className="botao-sinal mt-10" icone />
      </div>
    </section>
  )
}
