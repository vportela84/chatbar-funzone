
export interface BarInfo {
  barId: string;
  barName: string;
  tableNumber: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  photo?: string;
  interest: string;
}

export interface ConnectedUser {
  id: string;
  name: string;
  table_id: string;
  photo?: string;
  interest: string;
  online?: boolean; // New field to track online status
}

export interface PresenceState {
  userId: string;
  status: 'online' | 'offline';
  lastSeen?: string;
  name?: string;
  presence_ref?: string;
}
