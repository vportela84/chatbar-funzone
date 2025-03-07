
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw, LayoutDashboard, LogOut, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  isRefreshing: boolean;
  onRefresh: () => void;
  onNavigateToAdmin: () => void;
  onLogout: () => void;
}

const Header = ({ isRefreshing, onRefresh, onNavigateToAdmin, onLogout }: HeaderProps) => {
  return (
    <header className="bg-black/30 backdrop-blur-md rounded-xl p-3 md:p-6 shadow-lg border border-primary/10 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-center mb-2 md:mb-4">
        <div className="mb-3 md:mb-0 text-center md:text-left">
          <h1 className="text-2xl md:text-4xl font-bold text-primary">Bar Match</h1>
          <p className="text-sm md:text-xl text-bar-text/80">Monitoramento de Bares</p>
        </div>
        
        {/* Menu para dispositivos móveis */}
        <div className="flex md:hidden w-full justify-center mt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto bg-primary text-black hover:bg-primary/80">
                <Menu className="mr-2 h-4 w-4" /> Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-black/90 border-primary/20">
              <DropdownMenuLabel className="text-primary">Ações</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-primary/20" />
              <DropdownMenuItem 
                className="text-primary hover:bg-primary/10 cursor-pointer"
                onClick={onRefresh}
              >
                <RefreshCcw className="mr-2 h-4 w-4" /> Atualizar
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-primary hover:bg-primary/10 cursor-pointer"
                onClick={onNavigateToAdmin}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" /> Cadastrar Bar
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-primary hover:bg-primary/10 cursor-pointer"
                onClick={onLogout}
              >
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Botões para desktop */}
        <div className="hidden md:flex flex-wrap gap-2 justify-center md:justify-end">
          <Button 
            onClick={onRefresh} 
            variant="outline" 
            className="bg-primary text-black hover:bg-primary/80 transition-all"
            disabled={isRefreshing}
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> 
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
          <Button 
            onClick={onNavigateToAdmin} 
            variant="outline" 
            className="bg-primary text-black hover:bg-primary/80 transition-all"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" /> Cadastrar Bar
          </Button>
          <Button 
            onClick={onLogout} 
            variant="outline" 
            className="bg-primary text-black hover:bg-primary/80 transition-all"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
