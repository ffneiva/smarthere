import type { ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import { useEntrou } from './Reveal'

type Props = {
  rotulo: string
  /** O título; a parte em `enfase` sai mais leve e na cor de sinal, depois dele. */
  titulo: string
  enfase?: string
  apoio?: ReactNode
  className?: string
  nivel?: 1 | 2
  centro?: boolean
}

/**
 * Cabeçalho de seção: rótulo em mono com o ponto de leitura piscando, título
 * em Unbounded e, quando há, uma ênfase em peso leve na cor de sinal.
 *
 * A entrada é a varredura de um scanner: um feixe verde atravessa o título da
 * esquerda para a direita e o texto aparece exatamente atrás dele (o
 * `clip-path` e o feixe usam a mesma curva e a mesma duração). Os dois só
 * animam `clip-path` num retângulo e `transform` — nada de layout.
 *
 * O estado escondido só existe enquanto o título não entrou na tela, e só
 * com IntersectionObserver e movimento liberado (ver `useEntrou`).
 */
export function Titulo({
  rotulo,
  titulo,
  enfase,
  apoio,
  className,
  nivel = 2,
  centro = false,
}: Props) {
  const Tag = nivel === 1 ? 'h1' : 'h2'
  const reduzido = useReducedMotion()
  const { ref, visivel } = useEntrou(reduzido)

  return (
    <header className={cn('relative', centro && 'text-center', className)}>
      <p
        className={cn('rotulo mb-6 flex items-center gap-3 text-sinal', centro && 'justify-center')}
      >
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-current"
          style={{ animation: 'pisca 1.6s steps(2) infinite' }}
        />
        {rotulo}
      </p>
      <Tag
        ref={ref as React.RefObject<HTMLHeadingElement>}
        data-corte={reduzido ? undefined : visivel ? 'feito' : 'armado'}
        className={cn(
          'corte titulo max-w-[20ch] text-[clamp(2rem,4.8vw,4.2rem)]',
          centro && 'mx-auto',
        )}
      >
        <span className="corte-texto block">
          {titulo}
          {enfase && (
            <>
              {' '}
              <span className="enfase">{enfase}</span>
            </>
          )}
        </span>
        <span aria-hidden className="corte-trilho">
          <span className="corte-lamina" />
        </span>
      </Tag>
      {apoio && (
        <div
          className={cn(
            'mt-7 max-w-[54ch] text-[1.05rem] leading-relaxed text-nevoa',
            centro && 'mx-auto',
          )}
        >
          {apoio}
        </div>
      )}
    </header>
  )
}
