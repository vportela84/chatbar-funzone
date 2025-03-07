
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-bar-bg to-black text-bar-text p-6 flex flex-col items-center justify-center">
      <div className="max-w-3xl mx-auto text-center space-y-10">
        <div className="space-y-6 animate-fadeIn">
          <h1 className="text-5xl md:text-6xl font-bold text-primary">Bar Match</h1>
          <p className="text-xl md:text-2xl text-bar-text/80">
            Conheça pessoas interessantes em bares e casas noturnas de forma fácil e divertida.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link to="/admin-login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Acesso Administrativo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
