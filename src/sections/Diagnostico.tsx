import { useEffect, useId, useState } from 'react'
import { usePode3D } from '@/components/Cena3D'
import { IconeWhatsApp } from '@/components/Icones'
import { Titulo } from '@/components/Titulo'
import { registrar } from '@/lib/analytics'
import {
  EMPRESA,
  type IdSintoma,
  linkContato,
  MARCAS,
  mensagemDiagnostico,
  ROTULO_CONTATO,
  SINTOMAS_RAPIDOS,
} from '@/lib/business'
import { ESTADO } from '@/lib/estados'
import { cn } from '@/lib/utils'

/**
 * Diagnóstico rápido — três perguntas que viram uma mensagem pronta.
 *
 * Nada vai para servidor nenhum: a mensagem é montada no aparelho de quem
 * preenche e aparece ao lado, como a leitura de um instrumento, antes de
 * sair. O botão abre o WhatsApp com ela escrita. Quem chega
 * do outro lado já sabe modelo e sintoma — o orçamento começa adiantado.
 */
export function Diagnostico() {
  const id = useId()
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [sintomas, setSintomas] = useState<IdSintoma[]>([])
  const [detalhe, setDetalhe] = useState('')

  const mensagem = mensagemDiagnostico({ marca, modelo, sintomas, detalhe })
  const com3D = usePode3D()

  // A tela do celular 3D mostra a conversa: cada mudança vai para a cena.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('smarthere:conversa', { detail: mensagem }))
  }, [mensagem])
  const pronto = Boolean(marca || modelo.trim()) && sintomas.length > 0

  const alternar = (s: IdSintoma) =>
    setSintomas((atual) => (atual.includes(s) ? atual.filter((x) => x !== s) : [...atual, s]))

  const chip = (ativo: boolean) =>
    cn(
      'rounded-full border px-4 py-2 text-sm transition-[background-color,border-color,color] duration-300',
      ativo
        ? 'border-sinal bg-sinal text-breu'
        : 'border-gelo/15 text-aco hover:border-gelo/40 hover:text-gelo',
    )

  return (
    <section
      id="diagnostico"
      data-s={ESTADO.secao('diagnostico')}
      className="relative overflow-hidden bg-grafite/35 py-28 sm:py-36"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(40% 50% at 80% 30%, rgba(200,255,46,0.07), transparent 70%)',
        }}
      />
      <div className="container-x relative">
        <Titulo
          rotulo="Diagnóstico rápido"
          titulo="Conte o que houve."
          enfase="A mensagem sai pronta."
          apoio="Três perguntas. Nada é enviado até você tocar no botão — e o que vai é exatamente o texto que aparece ao lado."
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-14">
          <form
            className="grid gap-10"
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            <fieldset>
              <legend className="rotulo mb-4 text-nevoa">
                <span className="text-sinal">01</span> · Qual é o aparelho?
              </legend>
              <div className="flex flex-wrap gap-2">
                {MARCAS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={marca === m}
                    onClick={() => setMarca(marca === m ? '' : m)}
                    className={chip(marca === m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <label htmlFor={`${id}-modelo`} className="sr-only">
                Modelo
              </label>
              <input
                id={`${id}-modelo`}
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                placeholder="Modelo (ex.: 13, S23, Moto G84)"
                autoComplete="off"
                className="mt-4 w-full rounded-2xl border border-gelo/15 bg-breu/60 px-5 py-4 text-gelo outline-none placeholder:text-nevoa/70 focus:border-sinal"
              />
            </fieldset>

            <fieldset>
              <legend className="rotulo mb-4 text-nevoa">
                <span className="text-sinal">02</span> · O que está acontecendo?
              </legend>
              <div className="flex flex-wrap gap-2">
                {SINTOMAS_RAPIDOS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={sintomas.includes(s.id)}
                    onClick={() => alternar(s.id)}
                    className={chip(sintomas.includes(s.id))}
                  >
                    {s.rotulo}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="rotulo mb-4 text-nevoa">
                <span className="text-sinal">03</span> · Algum detalhe? (opcional)
              </legend>
              <label htmlFor={`${id}-detalhe`} className="sr-only">
                Detalhes
              </label>
              <textarea
                id={`${id}-detalhe`}
                value={detalhe}
                onChange={(e) => setDetalhe(e.target.value)}
                rows={3}
                maxLength={400}
                placeholder="Ex.: caiu ontem, a tela acende mas o toque não funciona embaixo."
                className="w-full resize-none rounded-2xl border border-gelo/15 bg-breu/60 px-5 py-4 text-gelo outline-none placeholder:text-nevoa/70 focus:border-sinal"
              />
            </fieldset>
          </form>

          {/* A leitura: a mensagem, como sai. Com a cena 3D, no desktop, quem
              mostra a mensagem é a tela do celular (a conversa no WhatsApp),
              no espaço reservado aqui; o texto continua para leitor de tela. */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {com3D && <div aria-hidden className="hidden h-[58vh] lg:block" />}
            <div
              className={cn(
                'relative overflow-hidden rounded-3xl border border-gelo/10 bg-breu',
                com3D && 'lg:border-0 lg:bg-transparent',
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-between border-b border-gelo/10 px-5 py-3',
                  com3D && 'lg:hidden',
                )}
              >
                <p className="rotulo flex items-center gap-2 text-nevoa">
                  <span
                    aria-hidden
                    className={cn('h-1.5 w-1.5 rounded-full', pronto ? 'bg-sinal' : 'bg-cobre')}
                    style={{ animation: 'pisca 1.6s steps(2) infinite' }}
                  />
                  {pronto ? 'Pronta para enviar' : 'Aguardando aparelho e sintoma'}
                </p>
                <p className="rotulo text-nevoa">WhatsApp {EMPRESA.telefone}</p>
              </div>
              <div className={cn('relative', com3D && 'lg:sr-only')}>
                {/* A varredura do scanner, só decorativa. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-[10%] bg-gradient-to-b from-transparent via-sinal/10 to-transparent motion-reduce:hidden"
                  style={{ animation: 'varre 3.4s linear infinite' }}
                />
                <output
                  htmlFor={`${id}-modelo ${id}-detalhe`}
                  aria-live="polite"
                  className="block min-h-[13rem] px-5 py-6 font-mono text-[0.9rem] leading-relaxed whitespace-pre-wrap text-aco"
                >
                  {mensagem}
                </output>
              </div>
              <div className={cn('border-t border-gelo/10 p-4', com3D && 'lg:border-0 lg:p-0')}>
                <a
                  href={linkContato(mensagem)}
                  target="_blank"
                  rel="noopener"
                  aria-disabled={!pronto}
                  onClick={(e) => {
                    if (!pronto) {
                      e.preventDefault()
                      return
                    }
                    registrar('diagnostico_enviado', { sintomas: sintomas.join(',') })
                  }}
                  className={cn(
                    'botao w-full',
                    pronto ? 'botao-sinal' : 'cursor-not-allowed border border-gelo/10 text-nevoa',
                  )}
                >
                  <IconeWhatsApp className="h-4 w-4" />
                  {pronto ? ROTULO_CONTATO : 'Escolha o aparelho e o sintoma'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
