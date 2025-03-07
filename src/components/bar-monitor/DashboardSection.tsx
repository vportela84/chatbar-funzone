
import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ChevronDown, ChevronUp } from 'lucide-react';
import AdminDashboard from '@/components/AdminDashboard';

interface DashboardSectionProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const DashboardSection = ({ isExpanded, onToggle }: DashboardSectionProps) => {
  return (
    <Card className="bg-bar-bg/50 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader 
        className="bg-black/20 rounded-t-lg p-3 md:p-6 cursor-pointer" 
        onClick={onToggle}
      >
        <div className="flex justify-between items-center">
          <CardTitle className="text-primary flex items-center text-lg md:text-2xl">
            <Users className="mr-2 h-5 w-5" /> Dashboard de Usuários
          </CardTitle>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-primary" />
          ) : (
            <ChevronDown className="h-5 w-5 text-primary" />
          )}
        </div>
      </CardHeader>
      
      {isExpanded && (
        <AdminDashboard />
      )}
    </Card>
  );
};

export default DashboardSection;
