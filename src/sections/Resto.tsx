import { ComoFunciona } from './ComoFunciona'
import { Diagnostico } from './Diagnostico'
import { Direitos } from './Direitos'
import { Fecho, SecaoPerguntas } from './Fecho'
import { Servicos } from './Servicos'

/**
 * Tudo o que vem depois do raio-x, num chunk próprio.
 *
 * O herói (e o cabeçalho) pintam com o bundle principal; este chunk é pedido
 * no mesmo instante, em paralelo, e chega antes de a pessoa rolar.
 *
 * A ordem é o argumento:
 *   Serviços      — depois de ver as peças, a lista completa
 *   ComoFunciona  — o caminho do conserto, sem surpresa
 *   Diagnóstico   — a mensagem pronta, em três perguntas
 *   Direitos      — o que a lei garante, e o que fazer antes de chegar
 *   Perguntas     — o resto das dúvidas
 *   Fecho         — smart. here.
 */
export default function Resto() {
  return (
    <>
      <Servicos />
      <ComoFunciona />
      <Diagnostico />
      <Direitos />
      <SecaoPerguntas />
      <Fecho />
    </>
  )
}
