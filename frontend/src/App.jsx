import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Painel from './pages/Painel'
import CadastroProduto from './pages/CadastroProduto'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/painel" element={<Painel />} />
        <Route path="/cadastro" element={<CadastroProduto />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App