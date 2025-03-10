
import { useNavigate } from 'react-router-dom';

/**
 * Hook para gerenciar operações relacionadas ao chat
 */
export const useChatManager = () => {
  const navigate = useNavigate();

  // Iniciar chat com um usuário
  const startChat = (chatUserId: string, userName: string, barId: string, barName: string) => {
    if (!barId || !chatUserId) return;
    
    // Store chat info in sessionStorage
    sessionStorage.setItem('chatTarget', JSON.stringify({
      userId: chatUserId,
      userName,
      barId: barId,
      barName: barName
    }));
    
    // Navigate to chat page
    navigate(`/bar/${barId}/chat/${chatUserId}`);
  };

  return { startChat };
};
