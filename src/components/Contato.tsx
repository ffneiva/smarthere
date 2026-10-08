import type { ReactNode } from 'react'
import { registrarContato } from '@/lib/analytics'
import { linkContato, MENSAGEM_PADRAO, ROTULO_CONTATO } from '@/lib/business'
import { cn } from '@/lib/utils'
import { IconeSetaDiagonal, IconeWhatsApp } from './Icones'

/**
 * O botão de contato — o único caminho de conversão do site: o WhatsApp da
 * loja, com a mensagem já escrita.
 */
type Props = {
  origem: string
  mensagem?: string
  className?: string
  children?: ReactNode
  /** Mostra o ícone do WhatsApp antes do texto (em vez da seta depois). */
  icone?: boolean
  cursor?: string
}

export function BotaoContato({
  origem,
  mensagem = MENSAGEM_PADRAO,
  className,
  children,
  icone = false,
  cursor = 'Orçar',
}: Props) {
  return (
    <a
      href={linkContato(mensagem)}
      target="_blank"
      rel="noopener"
      onClick={() => registrarContato(origem)}
      className={cn('botao', className)}
      data-cursor={cursor}
    >
      {icone && <IconeWhatsApp className="h-4 w-4" />}
      {children ?? ROTULO_CONTATO}
      {!icone && <IconeSetaDiagonal className="h-4 w-4" />}
    </a>
  )
}
