import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Simbolo } from './Logo'
import { SplitHeading } from './Reveal'

type Props = {
  rotulo: string
  titulo: string
  apoio?: ReactNode
  children?: ReactNode
  className?: string
}

/** O topo das páginas internas: o grafite, a grade de bancada e o símbolo na borda. */
export function TopoPagina({ rotulo, titulo, apoio, children, className }: Props) {
  return (
    <section
      className={cn(
        'grade relative overflow-hidden bg-breu pt-32 pb-14 text-gelo sm:pt-40 sm:pb-18',
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(40% 60% at 85% 20%, rgba(200,255,46,0.12), transparent 70%)',
        }}
      />
      <Simbolo className="absolute top-24 -right-10 w-[clamp(9rem,20vw,17rem)] text-gelo/[0.05] sm:right-6" />
      <div className="container-x relative">
        <p className="rotulo mb-6 flex items-center gap-3 text-sinal">
          <span aria-hidden className="h-px w-8 bg-current" />
          {rotulo}
        </p>
        <h1 className="titulo max-w-[18ch] text-[clamp(2.4rem,7vw,5.6rem)]">
          <SplitHeading text={titulo} />
        </h1>
        {apoio && (
          <div className="mt-7 max-w-[58ch] text-[1.06rem] leading-relaxed text-nevoa">{apoio}</div>
        )}
        {children}
      </div>
    </section>
  )
}
