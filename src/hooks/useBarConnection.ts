
import { useBarSession } from './useBarSession';
import { useBarUsers } from './useBarUsers';
import { useProfileActions } from './useProfileActions';

export const useBarConnection = (barId?: string, tableId?: string) => {
  const { barInfo, userProfile, userId, setUserProfile } = useBarSession(barId, tableId);
  const { connectedUsers, isLoading } = useBarUsers(barInfo, userId);
  const { createProfile, startChat, leaveBar } = useProfileActions(barInfo, userId, setUserProfile);

  return {
    barInfo,
    userProfile,
    userId,
    connectedUsers,
    isLoading,
    createProfile,
    startChat,
    leaveBar
  };
};
