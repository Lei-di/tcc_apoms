import { useLayoutEffect, useRef } from 'react'

export default function useValorAtual(valor) {
  const referencia = useRef(valor)
  useLayoutEffect(() => {
    referencia.current = valor
  }, [valor])
  return referencia
}
