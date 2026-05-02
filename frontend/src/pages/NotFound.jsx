import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  return (
    <div className="notfound-page">
      <div className="notfound-bg" />
      <div className="notfound-content">
        <span className="notfound-code">404</span>
        <h1>Página não encontrada</h1>
        <p>A página que procuras não existe ou foi movida.</p>
        <Link to="/dashboard" className="notfound-btn">
          <i className="bi bi-house-fill"></i> Voltar ao Dashboard
        </Link>
      </div>
    </div>
  )
}
