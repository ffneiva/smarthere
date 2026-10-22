import { registrar } from '@/lib/analytics'
import { EMPRESA, linkContato, SERVICOS } from '@/lib/business'
import { PAGINAS } from '@/lib/paginas'
import { BotaoContato } from './Contato'
import { IconeGithub, IconeInstagram, IconeWhatsApp } from './Icones'
import { Nome, Simbolo } from './Logo'

/**
 * O rodapé: tudo o que se precisa para pedir um orçamento, sem abrir mais
 * nada. Endereço, telefone e Instagram só aparecem quando existirem em
 * business.ts — o rodapé não guarda lugar para dado que não há.
 */
/** As páginas de conserto por marca (/conserto/conserto-de-iphone etc.). */
const MARCA_PAGINA = /^conserto-de-(iphone|celular-)/

export function Footer() {
  const ano = new Date().getFullYear()
  const e = EMPRESA.endereco
  return (
    <footer className="grao relative overflow-hidden bg-breu pt-24 pb-10 text-nevoa">
      {/* O nome gigante, cortado na borda: assinatura, não informação. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-[4.5vw] text-center font-display text-[21vw] leading-none font-semibold tracking-[-0.06em] text-gelo/[0.035] select-none"
      >
        smarthere
      </div>

      <div className="container-x relative">
        <div className="flex flex-col gap-10 border-b border-chumbo pb-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-5">
            <Simbolo className="w-12 shrink-0 text-sinal sm:w-14" titulo={EMPRESA.nome} />
            <div>
              <Nome className="text-[clamp(1.6rem,3.4vw,2.4rem)] text-gelo" />
              <p className="mt-2 max-w-[38ch] text-sm leading-relaxed">{EMPRESA.lema}</p>
            </div>
          </div>
          <BotaoContato origem="rodape" className="botao-sinal w-fit" />
        </div>

        <div className="grid gap-10 py-14 text-sm leading-relaxed sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="rotulo mb-3 text-sinal">Contato</p>
            <a
              href={linkContato()}
              onClick={() => registrar('contato_clique', { origem: 'rodape-contato' })}
              className="inline-flex items-center gap-2 text-gelo"
            >
              <IconeWhatsApp className="h-4 w-4" />
              <span className="tabular">{EMPRESA.telefone}</span>
            </a>
            <p className="mt-2">Orçamento por escrito, antes de qualquer reparo.</p>
          </div>
          <div>
            <p className="rotulo mb-3 text-sinal">Onde</p>
            {e ? (
              <>
                <p>{e.logradouro}</p>
                <p>
                  {e.bairro} · {e.cidade}/{e.uf}
                </p>
                <p className="tabular">CEP {e.cep}</p>
              </>
            ) : (
              <p>A loja está chegando. O endereço aparece aqui na inauguração.</p>
            )}
            {EMPRESA.horario && <p className="mt-2">{EMPRESA.horario}</p>}
          </div>
          <div>
            <p className="rotulo mb-3 text-sinal">Serviços</p>
            <ul className="flex flex-col gap-1">
              {SERVICOS.filter((s) => s.slug).map((s) => (
                <li key={s.nome}>
                  <a href={`/conserto/${s.slug}`} className="hover:text-gelo">
                    {s.nome}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="rotulo mb-3 text-sinal">Mais</p>
            <ul className="flex flex-col gap-1">
              {/* Páginas por marca: o que se digita junto com o nome do aparelho. */}
              {PAGINAS.filter((p) => MARCA_PAGINA.test(p.slug)).map((p) => (
                <li key={p.slug}>
                  <a href={`/conserto/${p.slug}`} className="hover:text-gelo">
                    {p.nome}
                  </a>
                </li>
              ))}
              <li>
                <a href="/#direitos" className="hover:text-gelo">
                  Seus direitos no conserto
                </a>
              </li>
              <li>
                <a href="/marca" className="hover:text-gelo">
                  Manual da marca
                </a>
              </li>
              {EMPRESA.instagram && (
                <li>
                  <a
                    href={`https://www.instagram.com/${EMPRESA.instagram}/`}
                    target="_blank"
                    rel="noopener"
                    onClick={() => registrar('instagram_clique', { origem: 'rodape' })}
                    className="inline-flex items-center gap-2 hover:text-gelo"
                  >
                    <IconeInstagram className="h-4 w-4" />@{EMPRESA.instagram}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-chumbo pt-8 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {ano} {EMPRESA.nome} · {EMPRESA.dominio}. O celular 3D é um aparelho genérico,
            desenhado para este site.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href="/politica-de-privacidade" className="hover:text-gelo">
              Política de privacidade
            </a>
            <a
              href="https://github.com/ffneiva"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 hover:text-gelo"
            >
              <IconeGithub className="h-3.5 w-3.5" />
              Desenvolvido por Felipe Neiva
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
