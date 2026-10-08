import { useEffect, useRef, useState } from 'react'
import { EMPRESA } from '@/lib/business'
import { cn } from '@/lib/utils'
import { BotaoContato } from './Contato'
import { IconeInstagram } from './Icones'
import { Logo } from './Logo'

/**
 * Cabeçalho fixo e o menu em tela cheia.
 *
 * · Encolhe e ganha vidro ao sair do topo; some ao rolar para baixo e volta
 *   ao primeiro gesto para cima — o celular 3D precisa da tela inteira.
 * · O menu abre com `clip-path` circular a partir do botão e cada link entra
 *   escalonado por `--i`. A saída é o mesmo círculo ao contrário.
 * · É diálogo modal de verdade: foco preso, Esc fecha, foco volta ao botão.
 */
type Props = {
  aoNavegar: (destino: string) => void
  aoSecao: (id: string) => void
}

const LINKS = [
  { rotulo: 'Por dentro', destino: '#por-dentro' },
  { rotulo: 'Serviços', destino: '#servicos' },
  { rotulo: 'Como funciona', destino: '#como-funciona' },
  { rotulo: 'Seus direitos', destino: '#direitos' },
  { rotulo: 'Dúvidas', destino: '#duvidas' },
] as const

export function Nav({ aoNavegar, aoSecao }: Props) {
  const [aberto, setAberto] = useState(false)
  const [montado, setMontado] = useState(false)
  const [encolhido, setEncolhido] = useState(false)
  const [escondido, setEscondido] = useState(false)
  const botaoRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let anterior = window.scrollY
    let acumulado = 0
    const aoRolar = () => {
      const y = window.scrollY
      setEncolhido(y > 24)
      const mov = y - anterior
      anterior = y
      // Histerese: só esconde/mostra depois de ~28 px na mesma direção, para
      // o cabeçalho não piscar no tremor natural do trackpad.
      if (Math.sign(mov) !== Math.sign(acumulado)) acumulado = 0
      acumulado += mov
      if (acumulado > 28) setEscondido(y > 320)
      else if (acumulado < -28) setEscondido(false)
    }
    aoRolar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [])

  // Monta ao abrir; ao fechar, espera a animação de saída terminar.
  useEffect(() => {
    if (aberto) {
      setMontado(true)
      return
    }
    const t = window.setTimeout(() => setMontado(false), 450)
    return () => window.clearTimeout(t)
  }, [aberto])

  useEffect(() => {
    if (!aberto) return
    const botao = botaoRef.current
    const focaveis = () => [
      ...(botao ? [botao] : []),
      ...document.querySelectorAll<HTMLElement>('#menu-completo a'),
    ]
    requestAnimationFrame(() => focaveis()[1]?.focus())
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberto(false)
      if (e.key !== 'Tab') return
      const lista = focaveis()
      if (!lista.length) return
      const i = lista.indexOf(document.activeElement as HTMLElement)
      const proximo = e.shiftKey ? (i <= 0 ? lista.length - 1 : i - 1) : (i + 1) % lista.length
      e.preventDefault()
      lista[proximo].focus()
    }
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', aoTeclar)
    return () => {
      document.body.style.overflow = anterior
      window.removeEventListener('keydown', aoTeclar)
      botao?.focus()
    }
  }, [aberto])

  const ir = (destino: string) => {
    setAberto(false)
    if (destino.startsWith('#')) aoSecao(destino.slice(1))
    else aoNavegar(destino)
  }

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[200] text-gelo transition-[transform,background-color,padding,border-color] duration-500 ease-[var(--ease-sh)]',
          encolhido && !aberto
            ? 'border-b border-gelo/8 bg-breu/70 py-2.5 backdrop-blur-xl'
            : 'border-b border-transparent py-5',
          escondido && !aberto && '-translate-y-full',
        )}
      >
        <div className="container-x flex items-center justify-between gap-6">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault()
              ir('/')
            }}
            aria-label={`${EMPRESA.nome} — início`}
          >
            <Logo />
          </a>

          <nav aria-label="Principal" className="hidden items-center gap-8 lg:flex">
            {LINKS.map((l) => (
              <a
                key={l.rotulo}
                href={`/${l.destino}`}
                onClick={(e) => {
                  e.preventDefault()
                  ir(l.destino)
                }}
                className="group relative text-[0.9rem] font-medium text-aco hover:text-gelo"
              >
                {l.rotulo}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-sinal transition-transform duration-500 ease-[var(--ease-sh)] group-hover:origin-left group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <BotaoContato
              origem="cabecalho"
              className="botao-gelo hidden min-h-10 px-5 text-sm sm:inline-flex"
            >
              Pedir orçamento
            </BotaoContato>
            <button
              ref={botaoRef}
              type="button"
              onClick={() => setAberto((v) => !v)}
              aria-expanded={aberto}
              aria-controls="menu-completo"
              aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
              className="relative grid h-11 w-11 place-items-center rounded-full border border-gelo/25 lg:hidden"
            >
              <span
                className={cn(
                  'absolute h-px w-4 bg-current transition-transform duration-500 ease-[var(--ease-sh)]',
                  aberto ? 'rotate-45' : '-translate-y-[3px]',
                )}
              />
              <span
                className={cn(
                  'absolute h-px w-4 bg-current transition-transform duration-500 ease-[var(--ease-sh)]',
                  aberto ? '-rotate-45' : 'translate-y-[3px]',
                )}
              />
            </button>
          </div>
        </div>
      </header>

      {montado && (
        <div
          id="menu-completo"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={cn(
            'menu-painel grade fixed inset-0 z-[190] flex flex-col bg-breu pt-28 pb-10 text-gelo',
            !aberto && 'menu-saindo',
          )}
        >
          <div className="container-x flex flex-1 flex-col justify-between gap-10">
            <nav aria-label="Menu completo">
              <ul className="flex flex-col gap-3">
                {LINKS.map((l, i) => (
                  <li key={l.rotulo} className="menu-item" style={{ ['--i' as string]: i }}>
                    <a
                      href={`/${l.destino}`}
                      onClick={(e) => {
                        e.preventDefault()
                        ir(l.destino)
                      }}
                      className="titulo flex items-baseline gap-4 text-[2rem] leading-[1.15]"
                    >
                      <span className="font-mono text-xs text-sinal">0{i + 1}</span>
                      {l.rotulo}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div
              className="menu-item flex flex-col gap-4"
              style={{ ['--i' as string]: LINKS.length }}
            >
              <BotaoContato origem="menu" className="botao-sinal w-full" icone />
              {EMPRESA.instagram && (
                <a
                  href={`https://www.instagram.com/${EMPRESA.instagram}/`}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 text-sm text-nevoa"
                >
                  <IconeInstagram className="h-4 w-4" /> @{EMPRESA.instagram}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
