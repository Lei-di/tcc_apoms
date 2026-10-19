import { useLayoutEffect } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'

let entradas = []
let posicao = -1

export function useRegistrarNavegacao() {
  const local = useLocation()
  const acao = useNavigationType()

  useLayoutEffect(() => {
    if (entradas[posicao]?.key === local.key) return
    const entrada = { key: local.key, caminho: local.pathname }
    const existente = entradas.findIndex(item => item.key === local.key)

    if (acao === 'POP' && existente >= 0) {
      posicao = existente
    } else if (acao === 'REPLACE' && posicao >= 0) {
      entradas[posicao] = entrada
    } else if (acao === 'PUSH') {
      entradas = entradas.slice(0, posicao + 1)
      entradas.push(entrada)
      posicao = entradas.length - 1
    } else {
      entradas = [entrada]
      posicao = 0
    }
  }, [local.key, local.pathname, acao])
}

export function useVoltar(ehAdmin) {
  const navigate = useNavigate()
  return () => {
    const anterior = entradas[posicao - 1]?.caminho
    const paginasProdutor = ['/painel', '/cadastro', '/solicitacoes', '/perfil']
    const paginasAdmin = ['/admin', '/admin/painel', '/admin/produtos', '/admin/produtores', '/admin/relatorios']
    const paginas = ehAdmin ? paginasAdmin : paginasProdutor

    if (anterior && paginas.includes(anterior)) {
      navigate(-1)
    } else {
      navigate(ehAdmin ? '/admin/painel' : '/painel', { replace: true })
    }
  }
}
