import { useEffect } from 'react'
import { carregarMotor } from '@/lib/movimento'
import { prefersReducedMotion } from '@/lib/utils'

/**
 * Scroll suave (Lenis), ligado ao ScrollTrigger.
 *
 * · **Lenis por import dinâmico, só com mouse.** No toque, o scroll nativo
 *   já tem inércia, e sequestrá-lo só piora. Quem abre no celular — a
 *   maioria de quem chega pelo Instagram — nunca baixa esse código.
 *
 * · **Um relógio só.** O Lenis rola a janela de verdade; a cada quadro dele,
 *   o ScrollTrigger é avisado. Sem essa ligação, os parallax leem a posição
 *   um quadro atrasada e "tremem" contra a rolagem suavizada.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    let cancelado = false
    let destruir: (() => void) | undefined

    import('lenis').then(({ default: LenisCtor }) => {
      if (cancelado) return

      const lenis = new LenisCtor({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
        smoothWheel: true,
        syncTouch: false,
      })

      let frame = 0
      const raf = (time: number) => {
        lenis.raf(time)
        frame = requestAnimationFrame(raf)
      }
      frame = requestAnimationFrame(raf)

      carregarMotor()
        .then(({ ScrollTrigger }) => {
          if (!cancelado) lenis.on('scroll', ScrollTrigger.update)
        })
        .catch(() => {})

      destruir = () => {
        cancelAnimationFrame(frame)
        lenis.destroy()
      }
    })

    return () => {
      cancelado = true
      destruir?.()
    }
  }, [])
}

/** Rola até um id da página respeitando o Lenis (que ignora o hash nativo). */
export function scrollToSection(id: string) {
  const alvo = document.getElementById(id)
  if (!alvo) return
  alvo.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
}
