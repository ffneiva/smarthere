import { IconeDownload } from '@/components/Icones'
import { Nome, Simbolo } from '@/components/Logo'
import { Reveal } from '@/components/Reveal'
import { TopoPagina } from '@/components/TopoPagina'
import { CORES, D_CAMERA, D_EXTERNO, D_INTERNO, MEDIDAS, QUADRO_SIMBOLO } from '@/lib/marca'
import { cn } from '@/lib/utils'

/**
 * O manual da marca — a Smarthere chegou só com o nome; esta página é a
 * marca entregue: o símbolo e a ideia por trás dele, a construção, as
 * versões, as cores, as fontes, as regras e os arquivos.
 *
 * Tudo sai de lib/marca.ts: se o símbolo mudar lá, muda aqui, no favicon e
 * nos arquivos para baixar (scripts/make-brand.mjs).
 */
const PALETA: { nome: string; hex: string; papel: string; claro?: boolean }[] = [
  {
    nome: 'Sinal',
    hex: CORES.sinal,
    papel: 'A cor da marca. Botão, ponto, palavra de ênfase.',
    claro: true,
  },
  { nome: 'Breu', hex: CORES.breu, papel: 'O fundo. O vidro de um celular apagado.' },
  { nome: 'Grafite', hex: CORES.grafite, papel: 'Fundo de seção alternada.' },
  { nome: 'Chumbo', hex: CORES.chumbo, papel: 'Fios, bordas, divisões.' },
  { nome: 'Névoa', hex: CORES.nevoa, papel: 'Texto secundário.' },
  { nome: 'Aço', hex: CORES.aco, papel: 'Texto de apoio; o alumínio do chassi.', claro: true },
  { nome: 'Gelo', hex: CORES.gelo, papel: 'Texto principal.', claro: true },
  {
    nome: 'Cobre',
    hex: CORES.cobre,
    papel: 'Só em detalhe: o âmbar do flex e do cobre.',
    claro: true,
  },
]

const rgb = (hex: string) =>
  [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16)).join(' · ')

const ARQUIVOS = [
  { arquivo: 'smarthere-simbolo.svg', rotulo: 'Símbolo · SVG' },
  { arquivo: 'smarthere-simbolo-1024.png', rotulo: 'Símbolo · PNG 1024' },
  { arquivo: 'smarthere-logo-escuro.png', rotulo: 'Logo horizontal · fundo escuro' },
  { arquivo: 'smarthere-logo-claro.png', rotulo: 'Logo horizontal · fundo claro' },
  { arquivo: 'smarthere-logo-sinal.png', rotulo: 'Logo horizontal · fundo sinal' },
  { arquivo: 'smarthere-perfil.png', rotulo: 'Foto de perfil (Instagram, WhatsApp)' },
]

export default function Marca() {
  return (
    <>
      <TopoPagina
        rotulo="Manual da marca"
        titulo="smart + here."
        apoio="O nome junta duas palavras; o símbolo, duas formas. O contorno de um celular cuja base afina até virar a ponta de um pin de localização — e o furo do pin é a câmera frontal. Conserto inteligente, aqui."
      />

      {/* O símbolo e a construção */}
      <section className="bg-grafite py-24 sm:py-32">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal className="grade relative grid aspect-square place-items-center overflow-hidden rounded-3xl border border-gelo/10 bg-breu">
            <svg
              viewBox={`-20 -20 ${QUADRO_SIMBOLO.w + 40} ${QUADRO_SIMBOLO.h + 40}`}
              className="h-[78%] w-auto"
              role="img"
              aria-label="Construção do símbolo: contorno, vão interno e câmera"
            >
              <rect
                x={0}
                y={0}
                width={QUADRO_SIMBOLO.w}
                height={QUADRO_SIMBOLO.h}
                fill="none"
                stroke="rgba(242,244,247,0.18)"
                strokeDasharray="2 2"
                strokeWidth={0.4}
              />
              <line
                x1={QUADRO_SIMBOLO.w / 2}
                y1={-12}
                x2={QUADRO_SIMBOLO.w / 2}
                y2={QUADRO_SIMBOLO.h + 12}
                stroke="rgba(200,255,46,0.5)"
                strokeWidth={0.4}
              />
              <line
                x1={-12}
                y1={MEDIDAS.ombro}
                x2={QUADRO_SIMBOLO.w + 12}
                y2={MEDIDAS.ombro}
                stroke="rgba(255,138,61,0.55)"
                strokeWidth={0.4}
                strokeDasharray="3 2"
              />
              <line
                x1={-12}
                y1={MEDIDAS.camera.y}
                x2={QUADRO_SIMBOLO.w + 12}
                y2={MEDIDAS.camera.y}
                stroke="rgba(242,244,247,0.25)"
                strokeWidth={0.4}
                strokeDasharray="1 2"
              />
              <path
                d={`${D_EXTERNO}${D_INTERNO}`}
                fill="rgba(200,255,46,0.12)"
                fillRule="evenodd"
                stroke="#c8ff2e"
                strokeWidth={0.6}
              />
              <path d={D_CAMERA} fill="#c8ff2e" />
              <circle
                cx={QUADRO_SIMBOLO.w / 2}
                cy={MEDIDAS.camera.y}
                r={MEDIDAS.raio}
                fill="none"
                stroke="rgba(242,244,247,0.2)"
                strokeWidth={0.4}
              />
            </svg>
            <span className="rotulo absolute bottom-5 left-5 text-nevoa">
              {QUADRO_SIMBOLO.w} × {QUADRO_SIMBOLO.h} · eixo em x = {QUADRO_SIMBOLO.w / 2}
            </span>
          </Reveal>
          <div className="self-center">
            <p className="rotulo mb-5 text-sinal">O símbolo</p>
            <h2 className="titulo text-[clamp(1.8rem,3.4vw,3rem)]">
              Um aparelho que aponta para um lugar.
            </h2>
            <dl className="mt-10 grid gap-6 text-[0.98rem] leading-relaxed">
              {[
                [
                  'Corpo',
                  `Retângulo de ${MEDIDAS.largura} de largura com cantos de raio ${MEDIDAS.raio} — a proporção de um celular visto de frente.`,
                ],
                [
                  'Ombro',
                  `Na altura ${MEDIDAS.ombro} (linha âmbar), os lados retos viram curvas e convergem no eixo: é a ponta do pin.`,
                ],
                [
                  'Traço',
                  `Espessura ${MEDIDAS.traco} em toda a volta; na diagonal a ponta recua mais, para o traço parecer igual ao olho.`,
                ],
                [
                  'Câmera',
                  `Círculo de raio ${MEDIDAS.camera.r} na altura ${MEDIDAS.camera.y}: o furo do pin e a câmera frontal ao mesmo tempo.`,
                ],
              ].map(([t, d]) => (
                <div
                  key={t}
                  className="grid gap-1 border-t border-chumbo pt-5 sm:grid-cols-[8rem_1fr] sm:gap-6"
                >
                  <dt className="rotulo pt-1 text-gelo">{t}</dt>
                  <dd className="text-nevoa">{d}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Versões */}
      <section className="bg-breu py-24 sm:py-32">
        <div className="container-x">
          <p className="rotulo mb-5 text-sinal">Versões</p>
          <h2 className="titulo max-w-[20ch] text-[clamp(1.8rem,3.4vw,3rem)]">
            O nome sempre em minúsculas. O <span className="enfase">here</span> sempre em destaque.
          </h2>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              {
                fundo: 'bg-breu border border-gelo/10',
                texto: 'text-gelo',
                simbolo: 'text-sinal',
                nome: 'Principal · fundo escuro',
              },
              {
                fundo: 'bg-gelo',
                texto: 'text-breu',
                simbolo: 'text-breu',
                nome: 'Fundo claro',
                claro: true,
              },
              {
                fundo: 'bg-sinal',
                texto: 'text-breu',
                simbolo: 'text-breu',
                nome: 'Fundo sinal',
                sinal: true,
              },
            ].map((v) => (
              <Reveal
                key={v.nome}
                className={cn(
                  'flex aspect-[4/3] flex-col justify-between rounded-3xl p-7',
                  v.fundo,
                )}
              >
                <span className={cn('rotulo', v.claro || v.sinal ? 'text-breu/60' : 'text-nevoa')}>
                  {v.nome}
                </span>
                <span className="inline-flex items-center gap-3 self-center">
                  <Simbolo className={cn('h-10 w-auto sm:h-14', v.simbolo)} />
                  <span
                    className={cn(
                      'font-display text-[1.5rem] sm:text-[2.1rem] font-medium tracking-[-0.03em]',
                      v.texto,
                    )}
                  >
                    smart
                    <span className={v.claro || v.sinal ? 'font-semibold' : 'text-sinal'}>
                      here
                    </span>
                  </span>
                </span>
                <span />
              </Reveal>
            ))}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                titulo: 'Área de proteção',
                texto: 'Em volta do logo, deixe livre no mínimo a altura do furo da câmera × 3.',
              },
              {
                titulo: 'Tamanho mínimo',
                texto: 'Logo horizontal: 96 px (ou 20 mm) de largura. Símbolo sozinho: 16 px.',
              },
              {
                titulo: 'Não faça',
                texto:
                  'Não escreva SMARTHERE em caixa alta, não separe "smart here" com espaço, não gire o símbolo.',
              },
              {
                titulo: 'Não faça',
                texto:
                  'Não use o sinal em texto corrido nem sobre fundo claro sem contorno — ele some.',
              },
            ].map((r) => (
              <div key={r.texto} className="rounded-3xl border border-gelo/10 p-6">
                <p className={cn('rotulo', r.titulo === 'Não faça' ? 'text-cobre' : 'text-sinal')}>
                  {r.titulo}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-nevoa">{r.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cores */}
      <section className="bg-grafite py-24 sm:py-32">
        <div className="container-x">
          <p className="rotulo mb-5 text-sinal">Cores</p>
          <h2 className="titulo max-w-[22ch] text-[clamp(1.8rem,3.4vw,3rem)]">
            Uma bancada vista de perto: preto fosco, alumínio e{' '}
            <span className="enfase">a luz do laser.</span>
          </h2>
          <ul className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-4">
            {PALETA.map((c) => (
              <li
                key={c.nome}
                className="overflow-hidden rounded-3xl border border-gelo/10 bg-breu"
              >
                <div className="aspect-[4/3]" style={{ background: c.hex }} />
                <div className="p-5">
                  <p className="font-display text-lg font-medium">{c.nome}</p>
                  <p className="mt-1 font-mono text-xs text-aco uppercase">{c.hex}</p>
                  <p className="font-mono text-[0.68rem] text-nevoa">RGB {rgb(c.hex)}</p>
                  <p className="mt-3 text-xs leading-relaxed text-nevoa">{c.papel}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Tipografia */}
      <section className="bg-breu py-24 sm:py-32">
        <div className="container-x">
          <p className="rotulo mb-5 text-sinal">Tipografia</p>
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              {
                familia: 'Unbounded',
                uso: 'Títulos e o nome',
                classe: 'font-display font-semibold tracking-[-0.04em]',
                amostra: 'Aa',
              },
              { familia: 'Geist', uso: 'Texto corrido', classe: 'font-sans', amostra: 'Aa' },
              {
                familia: 'Geist Mono',
                uso: 'Rótulos, números, leituras',
                classe: 'font-mono',
                amostra: '01',
              },
            ].map((f) => (
              <div key={f.familia} className="rounded-3xl border border-gelo/10 p-8">
                <p className={cn('text-[6rem] leading-none text-gelo', f.classe)}>{f.amostra}</p>
                <p className="mt-6 font-display text-xl font-medium">{f.familia}</p>
                <p className="mt-1 text-sm text-nevoa">
                  {f.uso} · Google Fonts, licença SIL Open Font
                </p>
                <p className={cn('mt-6 text-sm leading-relaxed break-all text-aco', f.classe)}>
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 ãçéêõ
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Arquivos */}
      <section className="bg-grafite py-24 sm:py-32">
        <div className="container-x">
          <p className="rotulo mb-5 text-sinal">Arquivos</p>
          <h2 className="titulo text-[clamp(1.8rem,3.4vw,3rem)]">Para baixar.</h2>
          <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ARQUIVOS.map((a) => (
              <li key={a.arquivo}>
                <a
                  href={`/marca/${a.arquivo}`}
                  download
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-gelo/10 bg-breu px-5 py-4 transition-colors hover:border-sinal"
                >
                  <span>
                    <span className="block text-[0.98rem] text-gelo">{a.rotulo}</span>
                    <span className="block font-mono text-[0.7rem] text-nevoa">{a.arquivo}</span>
                  </span>
                  <IconeDownload className="h-5 w-5 text-nevoa transition-colors group-hover:text-sinal" />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-10 flex items-center gap-3 text-sm text-nevoa">
            <Simbolo className="h-5 w-auto text-sinal" />
            <Nome className="text-gelo" /> · marca criada em outubro de 2026 junto com o site.
          </p>
        </div>
      </section>
    </>
  )
}
