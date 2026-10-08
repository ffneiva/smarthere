import { TopoPagina } from '@/components/TopoPagina'
import { PRIVACIDADE } from '@/lib/business'

/**
 * Política de privacidade — curta, porque o site coleta pouco, e escrita para
 * ser lida. O texto vive em business.ts, como todo texto do site.
 */
export default function Privacidade() {
  return (
    <>
      <TopoPagina rotulo="Privacidade" titulo="O que este site faz com os seus dados." />
      <section className="bg-grafite py-20 sm:py-28">
        <div className="container-x grid max-w-[64rem] gap-12">
          {PRIVACIDADE.map((b) => (
            <div key={b.titulo} className="grid gap-3 sm:grid-cols-[16rem_1fr] sm:gap-10">
              <h2 className="titulo text-[1.2rem] leading-tight">{b.titulo}</h2>
              <p className="text-[1.02rem] leading-relaxed text-nevoa">{b.texto}</p>
            </div>
          ))}
          <p className="font-mono text-xs text-nevoa">Atualizada em outubro de 2026.</p>
        </div>
      </section>
    </>
  )
}
