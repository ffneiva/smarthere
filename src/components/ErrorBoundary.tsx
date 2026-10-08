import { Component, type ErrorInfo, type ReactNode } from 'react'
import { linkContato } from '@/lib/business'

/**
 * Rede de segurança contra erro de render.
 *
 * Sem isto, uma exceção em qualquer componente derruba a árvore inteira e o
 * visitante fica com uma tela preta — sem WhatsApp, sem saída. Um horário a
 * menos na agenda.
 *
 * O fallback é deliberadamente pobre em recursos: HTML e estilo inline, sem
 * depender de nenhum componente do site. Se o que quebrou foi o sistema de
 * design, um fallback bonito quebraria junto.
 */
type Props = { children: ReactNode }
type State = { erro: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { erro: null }

  static getDerivedStateFromError(erro: Error): State {
    return { erro }
  }

  componentDidCatch(erro: Error, info: ErrorInfo) {
    // O Sentry, quando configurado, captura isto pelo handler global. O console
    // continua sendo o caminho de diagnóstico em desenvolvimento e para quem
    // abrir o inspetor em produção.
    console.error('[render]', erro, info.componentStack)
  }

  render() {
    if (!this.state.erro) return this.props.children

    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.5rem',
          background: '#07080a',
          color: '#c7cdd6',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '32rem' }}>
          <p
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#c8ff2e',
              margin: '0 0 1rem',
            }}
          >
            Algo quebrou aqui
          </p>
          <h1 style={{ fontSize: '1.7rem', margin: '0 0 1rem', color: '#f2f4f7' }}>
            O site travou. O seu celular a gente ainda conserta.
          </h1>
          <p style={{ margin: '0 0 2rem', lineHeight: 1.6, color: '#8a93a3' }}>
            Recarregue a página ou fale direto com a gente.
          </p>
          <a
            href={linkContato()}
            style={{
              display: 'inline-block',
              padding: '0.9rem 1.9rem',
              borderRadius: '999px',
              background: '#c8ff2e',
              color: '#07080a',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Pedir orçamento
          </a>
        </div>
      </div>
    )
  }
}
