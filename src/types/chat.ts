
export interface Message {
  id: string;
  text: string;
  sender: string;
  sender_profile_id: string;
  receiver_profile_id: string;
  table: string;
  timestamp: Date;
  likes: number;
}

export interface Profile {
  name: string;
  phone: string;
  tableId: string;
  barId?: string;
}
