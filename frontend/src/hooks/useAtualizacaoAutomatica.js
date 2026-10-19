import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { assinarAtualizacoes } from '../services/atualizacoes'

export default function useAtualizacaoAutomatica(atualizar) {
  const [estado, setEstado] = useState({ carregando: true, carregado: false, erro: '' })
  const tentar = useRef(null)
  const executar = useEffectEvent(atualizar)
  useEffect(() => {
    const controlador = new AbortController()
    let ativo = true
    let executando = false
    let pendente = false
    const carregar = async () => {
      if (!ativo) return
      if (executando) {
        pendente = true
        return
      }
      executando = true
      try {
        do {
          pendente = false
          try {
            const resultados = await executar(controlador.signal)
            if (!ativo) return
            const falha = (Array.isArray(resultados) ? resultados : [resultados])
              .find(resultado => resultado?.erro)?.erro
            if (falha) throw falha
            setEstado({ carregando: false, carregado: true, erro: '' })
          } catch (erro) {
            if (!ativo) return
            const mensagem = !erro.response || erro.response.status >= 500
              ? 'Sistema indisponível. Não foi possível carregar os dados. Tente novamente.'
              : 'Não foi possível carregar os dados. Tente novamente ou entre novamente no sistema.'
            setEstado(anterior => ({ ...anterior, carregando: false, erro: mensagem }))
          }
        } while (ativo && pendente)
      } finally {
        executando = false
      }
    }
    const cancelar = assinarAtualizacoes(carregar)
    tentar.current = carregar
    carregar()
    return () => {
      ativo = false
      controlador.abort()
      tentar.current = null
      cancelar()
    }
  }, [])
  return { ...estado, tentarNovamente: () => tentar.current?.() }
}
