
export interface Profile {
  name: string;
  phone: string;
  tableId: string;
  barId: string;
  photo?: string;
  interest?: string;
  isOnline?: boolean;
}

export interface Bar {
  id: string;
  name: string;
  profiles: Profile[];
}
