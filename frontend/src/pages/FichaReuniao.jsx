import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import './FichaCliente.css'

export default function FichaReuniao() {

  const { id } = useParams()
  const navigate = useNavigate()

  const [reuniao, setReuniao] = useState(null)

  useEffect(() => {
    carregar()
  }, [id])

  async function carregar() {
    const dados = await api.get(`/reunioes/${id}`)
    setReuniao(dados)
  }

  if (!reuniao) {
    return <div>A carregar...</div>
  }

  return (
    <div className="ficha-page">

      <button
        className="btn-voltar"
        onClick={() => navigate('/reunioes')}
      >
        Voltar
      </button>

      <h1>{reuniao.titulo}</h1>

      <div className="card">
        <p><strong>Cliente:</strong> {reuniao.cliente_nome}</p>
        <p><strong>Data:</strong> {new Date(reuniao.data_hora).toLocaleString()}</p>
        <p><strong>Tipo:</strong> {reuniao.tipo}</p>
        <p><strong>Estado:</strong> {reuniao.estado}</p>
        <p><strong>Formato:</strong> {reuniao.formato}</p>
        <p><strong>Responsável:</strong> {reuniao.responsavel_trymedia_nome}</p>
        <p><strong>Notas:</strong></p>
        <p>{reuniao.notas || 'Sem notas.'}</p>
      </div>

    </div>
  )
}