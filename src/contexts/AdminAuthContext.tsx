
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há um usuário na sessão
    const checkSession = () => {
      const sessionUser = localStorage.getItem('admin_user');
      if (sessionUser) {
        try {
          setAdminUser(JSON.parse(sessionUser));
        } catch (error) {
          console.error('Erro ao parsear usuário da sessão:', error);
          localStorage.removeItem('admin_user');
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.rpc('authenticate_admin', {
        email_input: email,
        password_input: password
      });

      if (error) {
        toast({
          title: "Erro de autenticação",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      // Corrigindo o erro TS2352 - Convertendo data explicitamente para o tipo esperado após verificar que é um objeto
      if (!data || typeof data !== 'object') {
        toast({
          title: "Erro de autenticação",
          description: "Resposta inválida do servidor",
          variant: "destructive"
        });
        return false;
      }
      
      // Validação segura dos dados recebidos
      const authData = data as any;
      if (!authData.authenticated) {
        toast({
          title: "Credenciais inválidas",
          description: "Email ou senha incorretos",
          variant: "destructive"
        });
        return false;
      }

      // Usuário autenticado com sucesso
      const user = authData.user;
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Não foi possível obter os dados do usuário",
          variant: "destructive"
        });
        return false;
      }
      
      // Garantir que user tem a estrutura esperada
      const adminUser: AdminUser = {
        id: user.id,
        email: user.email,
        role: user.role
      };
      
      setAdminUser(adminUser);
      
      // Salvar na sessão
      localStorage.setItem('admin_user', JSON.stringify(adminUser));
      
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo, ${adminUser.email}!`
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast({
        title: "Erro de autenticação",
        description: "Ocorreu um erro ao tentar fazer login",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAdminUser(null);
    localStorage.removeItem('admin_user');
    toast({
      title: "Logout realizado",
      description: "Você saiu do sistema"
    });
  };

  return (
    <AdminAuthContext.Provider value={{ 
      adminUser, 
      isLoading, 
      login, 
      logout,
      isAuthenticated: !!adminUser && adminUser.role === 'admin'
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth deve ser usado dentro de um AdminAuthProvider');
  }
  return context;
};
