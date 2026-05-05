// frontend/src/services/api.js

// URL base do backend. Como o Vite tem um proxy configurado,
// usamos apenas o caminho relativo '/api/...' em vez de
// 'http://localhost:3001/api/...'
// Isso evita problemas de CORS em desenvolvimento.
const BASE_URL = '/api'

// Função auxiliar que vai ser usada internamente
// Recebe o caminho (ex: '/dashboard'), o método HTTP,
// e opcionalmente um body para POST/PUT
async function requisicao(caminho, metodo = 'GET', corpo = null) {
  
  // Montamos as opções do fetch
  const opcoes = {
    method: metodo,
    headers: {
      // Dizemos ao servidor que vamos enviar e receber JSON
      'Content-Type': 'application/json',
      // Buscamos o token guardado no login e enviamos em cada pedido
      'Authorization': `Bearer ${localStorage.getItem('crm_token')}`
    }
  }
  
  // Só adicionamos o body se houver dados para enviar
  // (GET e DELETE não têm body)
  if (corpo) {
    opcoes.body = JSON.stringify(corpo)
  }
  
  // Fazemos o pedido
  const resposta = await fetch(`${BASE_URL}${caminho}`, opcoes)
  
  // Tentamos converter a resposta para JSON
  const dados = await resposta.json()
  
  // Se o servidor devolveu um erro (4xx ou 5xx),
  // lançamos um erro com a mensagem do servidor
  // Isso permite capturar no catch() em qualquer componente
  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Erro desconhecido')
  }
  
  return dados
}

// Exportamos métodos para cada tipo de pedido HTTP
// Assim no componente escrevemos: api.get('/dashboard')
// em vez de: requisicao('/dashboard', 'GET')
export const api = {
  get:    (caminho)         => requisicao(caminho, 'GET'),
  post:   (caminho, corpo)  => requisicao(caminho, 'POST', corpo),
  put:    (caminho, corpo)  => requisicao(caminho, 'PUT', corpo),
  delete: (caminho)         => requisicao(caminho, 'DELETE'),
}