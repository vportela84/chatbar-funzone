
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-bar-bg to-black text-bar-text p-6">
      <main className="w-full max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">Bar Match</h1>
        <p className="text-xl mb-8">A plataforma de socialização para bares e restaurantes</p>
      </main>
    </div>
  );
};

export default Index;
