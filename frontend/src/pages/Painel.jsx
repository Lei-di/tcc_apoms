import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function Painel() {
  const [produtos, setProdutos] = useState([])
  const navigate = useNavigate()
  const nome = localStorage.getItem('nome')

  useEffect(() => {
    buscarProdutos()
  }, [])

  const buscarProdutos = async () => {
    try {
      const resposta = await api.get('/produtos')
      setProdutos(resposta.data)
    } catch (err) {
      navigate('/')
    }
  }

  const sair = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('nome')
    navigate('/')
  }

  return (
    <div className="painel-container">
      <div className="painel-header">
        <h2>Olá, {nome}!</h2>
        <button onClick={sair}>Sair</button>
      </div>

      <h3>Meus Produtos</h3>
      <button onClick={() => navigate('/cadastro')}>Cadastrar novo produto</button>

      {produtos.length === 0 ? (
        <p>Nenhum produto cadastrado ainda.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Validade</th>
              <th>Preço</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.id}>
                <td>{p.nome_produto}</td>
                <td>{p.quantidade}</td>
                <td>{new Date(p.data_validade).toLocaleDateString('pt-BR')}</td>
                <td>R$ {parseFloat(p.preco).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Painel