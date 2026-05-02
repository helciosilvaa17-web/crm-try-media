import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SidebarProvider } from './contexts/SidebarContext'

import AppLayout    from './layouts/AppLayout'
import Login        from './pages/Login'
import CriarConta   from './pages/CriarConta'
import RecuperarSenha from './pages/RecuperarSenha'
import Dashboard    from './pages/Dashboard'
import Pipeline     from './pages/Pipeline'
import FichaCliente from './pages/FichaCliente'
import Reunioes     from './pages/Reunioes'
import Relatorios   from './pages/Relatorios'
import Configuracoes from './pages/Configuracoes'
import Perfil       from './pages/Perfil'
import NotFound     from './pages/NotFound'

// Rota protegida — redireciona para login se não autenticado
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/login" replace />
}

// Rota de admin — redireciona para dashboard se não for admin
function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin()) return <Navigate to="/dashboard" replace />
  return children
}

// Rota pública — redireciona para dashboard se já autenticado
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <BrowserRouter>
          <Routes>

            {/* Rotas públicas (sem layout) */}
            <Route path="/login" element={
              <PublicRoute><Login /></PublicRoute>
            } />
            <Route path="/criar-conta" element={
              <AdminRoute><CriarConta /></AdminRoute>
            } />
            <Route path="/recuperar-senha" element={
              <PublicRoute><RecuperarSenha /></PublicRoute>
            } />

            {/* Rotas protegidas (com layout) */}
            <Route path="/" element={
              <PrivateRoute><AppLayout /></PrivateRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard"     element={<Dashboard />} />
              <Route path="pipeline"      element={<Pipeline />} />
              <Route path="cliente/:id"   element={<FichaCliente />} />
              <Route path="reunioes"      element={<Reunioes />} />
              <Route path="perfil"        element={<Perfil />} />

              {/* Só Admin */}
              <Route path="relatorios" element={
                <AdminRoute><Relatorios /></AdminRoute>
              } />
              <Route path="configuracoes" element={
                <AdminRoute><Configuracoes /></AdminRoute>
              } />
            </Route>

            {/* Raiz → dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </AuthProvider>
  )
}
