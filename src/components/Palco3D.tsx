import { type RefObject, useCallback, useEffect, useRef } from 'react'
import { PASSOS } from '@/lib/business'
import { ESTADO, estadoDaRolagem, PASSOS_3D, SECOES, TOTAL_ESTADOS } from '@/lib/estados'
import type { CenaBase } from '@/scene/base'
import type { CenaCelular, Leitura } from '@/scene/celular'
import { Cena3D } from './Cena3D'

/**
 * O palco do celular: um canvas fixo atrás da home inteira.
 *
 * O aparelho não mora numa seção — ele atravessa a página. Cada seção marca
 * a sua posição com `data-s` (ver lib/estados.ts) e a cena interpola entre
 * as poses. O conteúdo rola por cima; as seções têm fundo transparente para
 * que o aparelho apareça no lado livre de cada uma.
 *
 * No celular, depois da montagem, o aparelho vira fundo (opacidade baixa):
 * a tela estreita não tem um "lado livre", e o texto vem primeiro. Ele
 * volta inteiro no fecho.
 */

/** As fontes que a cena usa nas texturas (tela, placa, bateria). */
function fontesProntas(): Promise<unknown> {
  if (!document.fonts) return Promise.resolve()
  return Promise.all(
    [
      '600 40px Unbounded',
      '300 40px Unbounded',
      '500 40px Geist',
      '400 40px Geist',
      '500 20px "Geist Mono"',
      '600 20px "Geist Mono"',
    ].map((f) => document.fonts.load(f).catch(() => undefined)),
  )
}

const carregarCelular = () =>
  Promise.all([import('@/scene/celular'), fontesProntas()]).then(
    ([{ CenaCelular }]) =>
      (canvas: HTMLCanvasElement, opcoes: { compacto?: boolean }) =>
        new CenaCelular(canvas, {
          ...opcoes,
          passos: PASSOS_3D,
          secoes: SECOES.length,
          calmo: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        }),
  )

export function Palco3D({ palco }: { palco: RefObject<HTMLElement | null> }) {
  const caixaRef = useRef<HTMLDivElement>(null)
  const marcadorRef = useRef<HTMLDivElement>(null)
  const nomeRef = useRef<HTMLSpanElement>(null)
  const cenaRef = useRef<CenaCelular | null>(null)

  /** A rolagem → o estado contínuo da cena, normalizado em 0…1. */
  const progresso = useCallback(() => {
    const raiz = palco.current
    if (!raiz) return 0
    const s = estadoDaRolagem(raiz, window.innerHeight / 2)
    // No celular, o aparelho vira fundo (40%) entre a montagem e o fecho.
    const caixa = caixaRef.current
    if (caixa) {
      const estreito = window.innerWidth / window.innerHeight < 0.85
      const fundo = estreito && s > ESTADO.pronto + 0.4 && s < ESTADO.secao('fecho') - 0.4
      caixa.style.opacity = fundo ? '0.4' : '1'
    }
    return s / TOTAL_ESTADOS
  }, [palco])

  // O marcador que acompanha a peça na mão: posição direto no estilo, sem
  // passar pelo React (60 vezes por segundo).
  const aoMontar = useCallback((cena: CenaBase) => {
    cenaRef.current = cena as CenaCelular
    let passo = -2
    ;(cena as CenaCelular).aoQuadro = (l: Leitura) => {
      const m = marcadorRef.current
      if (!m) return
      m.style.transform = `translate3d(${l.x}px, ${l.y}px, 0)`
      m.style.opacity = String(Math.max(0, (l.foco - 0.55) / 0.45))
      // Perto da borda direita, o nome vai para o lado esquerdo do anel.
      const nome = nomeRef.current
      if (nome) {
        const esquerda = l.x > window.innerWidth - 190
        nome.style.left = esquerda ? 'auto' : '5rem'
        nome.style.right = esquerda ? '5rem' : 'auto'
      }
      if (l.passo !== passo && nomeRef.current) {
        passo = l.passo
        nomeRef.current.textContent = PASSOS[l.passo]?.peca ?? ''
      }
    }
  }, [])

  useArrastoPelaPagina(cenaRef)

  return (
    <div
      ref={caixaRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-700"
    >
      <div className="grade absolute inset-0 opacity-70" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(34% 50% at 72% 50%, rgba(200,255,46,0.08), transparent 70%), radial-gradient(50% 40% at 70% 100%, rgba(255,138,61,0.05), transparent 70%)',
        }}
      />
      <div className="absolute inset-0">
        <Cena3D
          carregar={carregarCelular}
          palco={palco}
          progresso={progresso}
          arrastavel
          aoMontar={aoMontar}
          reserva={
            <picture>
              <source srcSet="/images/aparelho-aberto.avif" type="image/avif" />
              <img
                src="/images/aparelho-aberto.webp"
                width={1400}
                height={1100}
                alt=""
                className="w-[96vw] max-w-none -translate-y-[24%] lg:w-[56vw] lg:translate-x-[34%] lg:translate-y-0"
              />
            </picture>
          }
          className="h-full w-full"
        />
      </div>
      {/* O marcador da peça na mão: um anel de mira e o nome. */}
      <div ref={marcadorRef} className="absolute top-0 left-0 opacity-0 will-change-transform">
        <span className="absolute -top-7 -left-7 h-14 w-14 rounded-full border border-sinal/80" />
        <span className="absolute -top-1 -left-1 h-2 w-2 rounded-full bg-sinal" />
        <span className="absolute -top-px left-8 h-px w-10 bg-sinal/70" />
        <span
          ref={nomeRef}
          className="rotulo absolute -top-[0.45rem] left-20 whitespace-nowrap text-sinal"
        />
      </div>
    </div>
  )
}

/** O que nunca vira arrasto: o que já tem função ao clicar ou ao selecionar. */
const INTERATIVO =
  'a, button, input, textarea, select, label, summary, [role="button"], [contenteditable]'

/**
 * Girar o aparelho de qualquer ponto da página, com o mouse.
 *
 * O canvas fica atrás do conteúdo — e o conteúdo, por cima, recebe os
 * cliques. Então o arrasto é escutado na janela: se o botão desce sobre a
 * área do aparelho (a cena informa onde ele está, em pixels) e não sobre um
 * link, botão ou campo, o gesto vira giro nos dois eixos. Sobre a área, o
 * cursor vira a "mão" de agarrar. No toque, quem gira é o próprio canvas,
 * onde ele está descoberto (ver Cena3D).
 */
function useArrastoPelaPagina(cenaRef: RefObject<CenaCelular | null>) {
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    let ativo = false
    let ux = 0
    let uy = 0
    let ut = 0
    const sobre = (e: PointerEvent) => {
      const cena = cenaRef.current
      if (!cena || (e.target as Element | null)?.closest(INTERATIVO)) return false
      const { x, y, r } = cena.area
      return Math.hypot(e.clientX - x, e.clientY - y) < r
    }
    const baixo = (e: PointerEvent) => {
      // Direto no canvas, quem gira é o próprio Cena3D.
      if (e.button !== 0 || e.target instanceof HTMLCanvasElement || !sobre(e)) return
      ativo = true
      ux = e.clientX
      uy = e.clientY
      ut = performance.now()
      document.documentElement.style.cursor = 'grabbing'
      e.preventDefault()
    }
    const mover = (e: PointerEvent) => {
      if (!ativo) {
        document.documentElement.style.cursor = sobre(e) ? 'grab' : ''
        return
      }
      const agora = performance.now()
      cenaRef.current?.arrastar(e.clientX - ux, e.clientY - uy, (agora - ut) / 1000)
      ux = e.clientX
      uy = e.clientY
      ut = agora
    }
    const cima = () => {
      if (!ativo) return
      ativo = false
      document.documentElement.style.cursor = ''
      cenaRef.current?.soltar()
    }
    window.addEventListener('pointerdown', baixo)
    window.addEventListener('pointermove', mover, { passive: true })
    window.addEventListener('pointerup', cima)
    window.addEventListener('pointercancel', cima)
    return () => {
      window.removeEventListener('pointerdown', baixo)
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('pointerup', cima)
      window.removeEventListener('pointercancel', cima)
      document.documentElement.style.cursor = ''
    }
  }, [cenaRef])
}
