import { useEffect, useState } from 'react'
import { registrarContato } from '@/lib/analytics'
import { linkContato, ROTULO_CONTATO } from '@/lib/business'
import { cn } from '@/lib/utils'
import { IconeWhatsApp } from './Icones'

/**
 * O botão flutuante de contato — só depois da primeira dobra. No topo, o
 * herói já tem o botão, e um flutuante sobre o celular 3D competiria com ele.
 */
export function ContatoFab() {
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    const aoRolar = () => setVisivel(window.scrollY > window.innerHeight * 0.8)
    aoRolar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [])

  return (
    <a
      href={linkContato()}
      target="_blank"
      rel="noopener"
      onClick={() => registrarContato('flutuante')}
      aria-label={ROTULO_CONTATO}
      className={cn(
        'fixed right-4 bottom-4 z-[150] grid h-14 w-14 place-items-center rounded-full bg-sinal text-breu shadow-[0_14px_34px_-10px_rgba(200,255,46,0.7)] transition-[opacity,transform] duration-500 ease-[var(--ease-sh)] hover:scale-105 sm:right-6 sm:bottom-6',
        visivel ? 'opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
      )}
    >
      <IconeWhatsApp className="h-6 w-6" />
    </a>
  )
}
