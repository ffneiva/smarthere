import type { gsap as Gsap } from 'gsap'
import type { ScrollTrigger as ScrollTriggerT } from 'gsap/ScrollTrigger'

/**
 * O motor dos parallax: GSAP + ScrollTrigger, carregados sob demanda.
 *
 * São ~45 kB comprimidos que NÃO entram no caminho crítico: a página pinta,
 * fica interativa, e só então o motor chega e "arma" as cenas. Até lá — e
 * para sempre, se o chunk falhar ou a pessoa pedir movimento reduzido — cada
 * seção é uma composição estática completa. Nenhuma cena esconde conteúdo
 * antes de o motor existir.
 *
 * Uma promessa só: vinte seções pedindo o motor recebem a mesma instância.
 */
export type Motor = { gsap: typeof Gsap; ScrollTrigger: typeof ScrollTriggerT }

let promessa: Promise<Motor> | null = null

export function carregarMotor(): Promise<Motor> {
  promessa ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
    ([{ gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger)
      // No celular, a barra de endereço aparece e some a cada gesto e muda a
      // altura da janela: sem isto, cada vez o ScrollTrigger recalcula todos
      // os pins e a página dá um tranco no meio da rolagem.
      ScrollTrigger.config({ ignoreMobileResize: true })
      // Recalcula as posições quando as fontes e as imagens terminam de
      // chegar: sem isto, um pin medido antes da fonte trocar começa e
      // termina alguns pixels fora do lugar.
      document.fonts?.ready.then(() => ScrollTrigger.refresh())
      window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true })
      return { gsap, ScrollTrigger }
    },
  )
  return promessa
}

/**
 * Parallax declarativo: todo elemento com `data-velocidade` dentro do escopo
 * desliza em relação à rolagem. Positivo = mais lento que a página (fica
 * "atrás"); negativo = mais rápido (vem "para a frente").
 *
 * A distância é uma fração da altura da janela, e não do elemento: assim uma
 * foto pequena e um título enorme com a mesma velocidade parecem estar no
 * mesmo plano de profundidade — que é o que o olho entende como parallax.
 */
export function parallaxDeclarativo({ gsap }: Motor, escopo: HTMLElement) {
  for (const el of escopo.querySelectorAll<HTMLElement>('[data-velocidade]')) {
    const v = Number(el.dataset.velocidade)
    if (!v) continue
    const gatilho = el.closest<HTMLElement>('[data-cena]') ?? el
    gsap.fromTo(
      el,
      { y: () => -v * window.innerHeight * 0.5 },
      {
        y: () => v * window.innerHeight * 0.5,
        ease: 'none',
        scrollTrigger: {
          trigger: gatilho,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    )
  }
}
