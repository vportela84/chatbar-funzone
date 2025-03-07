
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, BarChart2 } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import BarRegistrationForm from '@/components/admin/BarRegistrationForm';

const Admin = () => {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  const goToMonitoring = () => {
    navigate('/barmonitor');
  };

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bar-bg to-black text-bar-text p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center mb-10 animate-fadeIn">
          <h1 className="text-4xl font-bold text-primary mb-2">Bar Match</h1>
          <p className="text-2xl text-bar-text/80">Área Administrativa</p>
        </header>

        <div className="flex justify-between mb-4">
          <Button onClick={goToMonitoring} variant="outline" className="bg-primary/10">
            <BarChart2 className="mr-2 h-4 w-4" /> Monitorar Bares
          </Button>
          <Button onClick={handleLogout} variant="outline" className="bg-primary/10">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <BarRegistrationForm />
        </div>
      </div>
    </div>
  );
};

export default Admin;
