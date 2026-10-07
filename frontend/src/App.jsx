import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Painel from './pages/Painel'
import CadastroProduto from './pages/CadastroProduto'
import PainelAdmin from './pages/PainelAdmin'
import ProdutosAdmin from './pages/ProdutosAdmin'
import ProdutoresAdmin from './pages/ProdutoresAdmin'
import RelatoriosAdmin from './pages/RelatoriosAdmin'
import PrimeiroAcesso from './pages/PrimeiroAcesso'
import Solicitacoes from './pages/Solicitacoes'
import MeuPerfil from './pages/MeuPerfil'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/painel" element={<Painel />} />
        <Route path="/cadastro" element={<CadastroProduto />} />
        <Route path="/solicitacoes" element={<Solicitacoes />} />
        <Route path="/perfil" element={<MeuPerfil />} />

        <Route path="/admin" element={<PainelAdmin />} />
        <Route path="/admin/produtos" element={<ProdutosAdmin />} />
        <Route path="/admin/produtores" element={<ProdutoresAdmin />} />
        <Route path="/admin/relatorios" element={<RelatoriosAdmin />} />

        <Route
          path="/primeiro-acesso"
          element={<PrimeiroAcesso />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App