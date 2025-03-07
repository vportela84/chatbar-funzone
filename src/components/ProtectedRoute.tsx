
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    // Renderizar um loading enquanto verifica a autenticação
    return (
      <div className="min-h-screen bg-gradient-to-b from-bar-bg to-black flex items-center justify-center">
        <p className="text-primary">Carregando...</p>
      </div>
    );
  }

  // Se não estiver autenticado, redireciona para o login
  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  // Se estiver autenticado, renderiza o conteúdo protegido
  return <>{children}</>;
};

export default ProtectedRoute;
