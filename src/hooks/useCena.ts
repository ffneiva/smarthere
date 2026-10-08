import { type RefObject, useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useMediaQuery'
import { carregarMotor, type Motor, parallaxDeclarativo } from '@/lib/movimento'

type Montar = (motor: Motor, el: HTMLElement) => undefined | (() => void)

/**
 * Arma uma cena de rolagem numa seção.
 *
 * · Espera o motor (GSAP) chegar; até lá a seção é estática e completa.
 * · Tudo o que a cena cria vive num `gsap.context` com escopo na seção, e é
 *   desfeito no desmontar — inclusive os pins, que sem isso deixariam
 *   espaçadores fantasmas na página.
 * · Marca a seção com `data-armada` quando a cena existe: é o gancho do CSS
 *   para estados que só fazem sentido com a animação ligada.
 * · Movimento reduzido: não arma nada.
 *
 * `montar` é lido por referência: trocar a função entre renders não recria a
 * cena (recriar pins no meio da rolagem faz a página pular).
 */
export function useCena(ref: RefObject<HTMLElement | null>, montar: Montar, chave = '') {
  const reduzido = useReducedMotion()
  const montarRef = useRef(montar)
  montarRef.current = montar

  // biome-ignore lint/correctness/useExhaustiveDependencies: `chave` é o gatilho explícito de recriação
  useEffect(() => {
    const el = ref.current
    if (!el || reduzido) return
    let cancelado = false
    let desfazer: (() => void) | undefined

    carregarMotor()
      .then((motor) => {
        if (cancelado) return
        const ctx = motor.gsap.context(() => {
          parallaxDeclarativo(motor, el)
          return montarRef.current(motor, el)
        }, el)
        el.dataset.armada = ''
        desfazer = () => {
          ctx.revert()
          delete el.dataset.armada
        }
      })
      .catch(() => {
        // Sem o motor, a seção fica como está: estática e legível.
      })

    return () => {
      cancelado = true
      desfazer?.()
    }
  }, [reduzido, ref, chave])
}
