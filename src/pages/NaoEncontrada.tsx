import { BotaoContato } from '@/components/Contato'
import { TopoPagina } from '@/components/TopoPagina'
import { NAO_ENCONTRADA_TEXTO as T } from '@/lib/business'

/**
 * 404 — servido com status 404 de verdade pelo CloudFront (ver aws-setup.sh).
 * Em vez de um beco sem saída, os caminhos que quase sempre eram o destino.
 */
export function NaoEncontrada() {
  return (
    <TopoPagina rotulo={T.rotulo} titulo={T.titulo} apoio={T.apoio} className="min-h-[80svh]">
      <div className="mt-10 flex flex-wrap gap-3">
        <BotaoContato origem="404" className="botao-sinal" />
        <a href="/#servicos" className="botao botao-linha">
          Ver os serviços
        </a>
        <a href="/" className="botao botao-linha">
          Início
        </a>
      </div>
    </TopoPagina>
  )
}
