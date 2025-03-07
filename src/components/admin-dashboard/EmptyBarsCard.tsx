
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const EmptyBarsCard = () => {
  return (
    <Card className="bg-bar-bg/50 backdrop-blur-sm border-primary/20 shadow-lg">
      <CardContent className="p-4 md:p-6">
        <p className="text-center text-primary/70">Nenhum bar cadastrado ainda.</p>
      </CardContent>
    </Card>
  );
};

export default EmptyBarsCard;
