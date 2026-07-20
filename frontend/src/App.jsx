import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Painel from './pages/Painel'
import CadastroProduto from './pages/CadastroProduto'
import PainelAdmin from './pages/PainelAdmin'
import PrimeiroAcesso from './pages/PrimeiroAcesso'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/painel" element={<Painel />} />
        <Route path="/cadastro" element={<CadastroProduto />} />
        <Route path="/admin" element={<PainelAdmin />} />
        <Route path="/primeiro-acesso" element={<PrimeiroAcesso />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App