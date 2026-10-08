import { D_SIMBOLO, NOME, QUADRO_SIMBOLO } from '@/lib/marca'
import { cn } from '@/lib/utils'

/**
 * A marca em SVG, a partir do caminho de lib/marca.ts.
 *
 * O símbolo herda a cor do texto (`currentColor`), a menos que `cor` mande
 * outra; o nome é texto de verdade, em Unbounded — "smart" no tom do texto e
 * "here" na cor de sinal.
 */
type PropsSimbolo = { className?: string; titulo?: string; cor?: string }

export function Simbolo({ className, titulo, cor = 'currentColor' }: PropsSimbolo) {
  return (
    <svg
      viewBox={`0 0 ${QUADRO_SIMBOLO.w} ${QUADRO_SIMBOLO.h}`}
      className={className}
      role={titulo ? 'img' : undefined}
      aria-hidden={titulo ? undefined : true}
      aria-label={titulo}
    >
      <path d={D_SIMBOLO} fill={cor} fillRule="evenodd" />
    </svg>
  )
}

export function Nome({ className }: { className?: string }) {
  return (
    <span className={cn('font-display font-medium tracking-[-0.03em]', className)}>
      {NOME.inicio}
      <span className="text-sinal">{NOME.fim}</span>
    </span>
  )
}

/** Símbolo + nome, em linha: o cabeçalho e o rodapé. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Simbolo className="h-8 w-auto text-sinal" />
      <Nome className="text-[1.2rem] leading-none" />
    </span>
  )
}
