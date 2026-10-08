import { type ReactNode, type RefObject, useEffect, useRef, useState } from 'react'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import type { CenaBase, OpcoesCena } from '@/scene/base'

/**
 * Uma cena three.js na página — carregada sob demanda, pausada fora da tela.
 *
 * · **Depois do primeiro paint.** O chunk do three.js só é pedido quando o
 *   palco chega perto da tela; até lá (e para sempre, se falhar) aparece a
 *   `reserva`: a versão estática em SVG ou foto.
 * · **Monta uma vez.** O que liga e desliga é o laço de render, não o
 *   contexto WebGL.
 * · **Celular também.** Com `compacto` (menos geometria, DPR ≤ 1,5, sem
 *   antialias). Só não existe sem WebGL.
 * · **Arrastar gira.** `touch-action: pan-y`: o dedo na horizontal gira a
 *   peça, na vertical continua rolando a página.
 */
let suporte: boolean | null = null

function suportaWebGL(): boolean {
  if (suporte !== null) return suporte
  try {
    const canvas = document.createElement('canvas')
    suporte = Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    suporte = false
  }
  return suporte
}

/**
 * A cena 3D existe? Basta ter WebGL — em qualquer tela.
 *
 * NÃO depende de "reduzir movimento": no Windows, "Efeitos de animação"
 * desligado (comum em PC de empresa, em "melhor desempenho", em máquina
 * virtual) liga essa preferência sem a pessoa saber, e o site mostrava só
 * as fotos. Com a preferência, a cena existe em modo calmo — anda só quando
 * a própria pessoa rola; nada se mexe sozinho (ver CenaCelular).
 */
export function usePode3D(): boolean {
  return typeof window !== 'undefined' && suportaWebGL()
}

type Fabrica = (canvas: HTMLCanvasElement, opcoes: OpcoesCena) => CenaBase

type Props = {
  /** Import dinâmico da cena: `() => import('@/scene/x').then((m) => (c, o) => new m.X(c, o))`. */
  carregar: () => Promise<Fabrica>
  /** Elemento cuja presença na tela liga a cena. */
  palco: RefObject<HTMLElement | null>
  /** 0…1 — o avanço da rolagem que a cena acompanha. */
  progresso?: () => number
  arrastavel?: boolean
  /** Recebe a cena assim que ela nasce — para a seção ligar callbacks nela. */
  aoMontar?: (cena: CenaBase) => void
  /** O que aparece até a cena pintar o primeiro quadro (e se ela não vier). */
  reserva?: ReactNode
  className?: string
}

export function Cena3D({
  carregar,
  palco,
  progresso,
  arrastavel,
  aoMontar,
  reserva,
  className,
}: Props) {
  const caixaRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cenaRef = useRef<CenaBase | null>(null)
  const progressoRef = useRef(progresso)
  progressoRef.current = progresso
  const carregarRef = useRef(carregar)
  const aoMontarRef = useRef(aoMontar)
  aoMontarRef.current = aoMontar
  const desktop = useIsDesktop()
  const [pintou, setPintou] = useState(false)

  useEffect(() => {
    const caixa = caixaRef.current
    const canvas = canvasRef.current
    const alvo = palco.current
    if (!caixa || !canvas || !alvo) return

    let cancelado = false
    let visivel = false
    let limpar: (() => void) | undefined

    const montar = () => {
      carregarRef
        .current()
        .then((fabrica) => {
          if (cancelado) return
          const cena = fabrica(canvas, { compacto: !desktop })
          cenaRef.current = cena
          aoMontarRef.current?.(cena)

          const medir = () => {
            const { width, height } = caixa.getBoundingClientRect()
            cena.redimensionar(Math.max(1, width), Math.max(1, height))
          }
          medir()
          const ro = new ResizeObserver(medir)
          ro.observe(caixa)

          const aoRolar = () => {
            const fn = progressoRef.current
            if (fn) cena.definirProgresso(fn())
          }
          const aoMover = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse') return
            cena.definirPonteiro(
              (e.clientX / window.innerWidth) * 2 - 1,
              (e.clientY / window.innerHeight) * 2 - 1,
            )
          }
          aoRolar()
          window.addEventListener('scroll', aoRolar, { passive: true })
          window.addEventListener('pointermove', aoMover, { passive: true })

          // Shaders compilados em paralelo antes do primeiro quadro: a reserva
          // fica na tela até lá, e a página não trava no primeiro desenho.
          cena
            .preparar()
            .catch(() => {})
            .then(() => {
              if (cancelado) return
              if (visivel) cena.iniciar()
              requestAnimationFrame(() =>
                requestAnimationFrame(() => {
                  if (!cancelado) setPintou(true)
                }),
              )
            })

          limpar = () => {
            ro.disconnect()
            window.removeEventListener('scroll', aoRolar)
            window.removeEventListener('pointermove', aoMover)
            cena.destruir()
            cenaRef.current = null
          }
        })
        .catch(() => {
          // Chunk bloqueado: fica a reserva.
        })
    }

    let montado = false
    const io = new IntersectionObserver(
      ([entrada]) => {
        visivel = entrada.isIntersecting
        if (visivel && !montado) {
          montado = true
          montar()
        }
        if (visivel) cenaRef.current?.iniciar()
        else cenaRef.current?.pausar()
      },
      { rootMargin: '300px 0px' },
    )
    io.observe(alvo)

    const aoTrocarAba = () => {
      if (document.hidden) cenaRef.current?.pausar()
      else if (visivel) cenaRef.current?.iniciar()
    }
    document.addEventListener('visibilitychange', aoTrocarAba)

    return () => {
      cancelado = true
      io.disconnect()
      document.removeEventListener('visibilitychange', aoTrocarAba)
      limpar?.()
    }
  }, [palco, desktop])

  // Arrasto: ponteiro capturado no canvas; o delta vira giro, com inércia.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !arrastavel) return
    let ultimoX = 0
    let ultimoY = 0
    let ultimoT = 0
    let ativo = false
    const baixo = (e: PointerEvent) => {
      ativo = true
      ultimoX = e.clientX
      ultimoY = e.clientY
      ultimoT = performance.now()
      canvas.setPointerCapture(e.pointerId)
    }
    const mover = (e: PointerEvent) => {
      if (!ativo) return
      const agora = performance.now()
      cenaRef.current?.arrastar(
        e.clientX - ultimoX,
        e.pointerType === 'mouse' ? e.clientY - ultimoY : 0,
        (agora - ultimoT) / 1000,
      )
      ultimoX = e.clientX
      ultimoY = e.clientY
      ultimoT = agora
    }
    const cima = () => {
      ativo = false
      cenaRef.current?.soltar()
    }
    canvas.addEventListener('pointerdown', baixo)
    canvas.addEventListener('pointermove', mover)
    canvas.addEventListener('pointerup', cima)
    canvas.addEventListener('pointercancel', cima)
    return () => {
      canvas.removeEventListener('pointerdown', baixo)
      canvas.removeEventListener('pointermove', mover)
      canvas.removeEventListener('pointerup', cima)
      canvas.removeEventListener('pointercancel', cima)
    }
  }, [arrastavel])

  return (
    <div ref={caixaRef} className={cn('relative', className)}>
      {reserva && (
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 grid place-items-center transition-opacity duration-700',
            pintou ? 'opacity-0' : 'opacity-100',
          )}
        >
          {reserva}
        </div>
      )}
      <canvas
        ref={canvasRef}
        aria-hidden
        data-cursor={arrastavel ? 'Girar' : undefined}
        className={cn(
          'relative h-full w-full transition-opacity duration-[1400ms] ease-[var(--ease-sh)]',
          pintou ? 'opacity-100' : 'opacity-0',
          arrastavel
            ? 'pointer-events-auto cursor-grab touch-pan-y active:cursor-grabbing'
            : 'pointer-events-none',
        )}
      />
    </div>
  )
}
