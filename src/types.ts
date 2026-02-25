export type UserRole = 'admin' | 'operator' | 'user';

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
}

export interface Room {
  id: number;
  code: string;
  name: string;
  pic_name: string;
  description: string;
}

export type ItemCategory = 'umum' | 'tanah' | 'bangunan';
export type ItemCondition = 'baik' | 'rusak_ringan' | 'rusak_berat';
export type ItemStatus = 'aktif' | 'non-aktif';

export interface InventoryItem {
  id: number;
  barcode: string;
  name: string;
  category: ItemCategory;
  brand: string;
  specification: string;
  year_acquired: number;
  source_fund: string;
  price: number;
  condition: ItemCondition;
  status: ItemStatus;
  room_id: number;
  room_name?: string;
  pic_name: string;
  notes: string;
  created_at: string;
}

export interface ProcurementRequest {
  id: number;
  item_name: string;
  quantity: number;
  estimated_price: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requester_id: number;
  requester_name?: string;
  request_date: string;
}

export interface Mutation {
  id: number;
  item_id: number;
  from_room_id: number;
  to_room_id: number;
  mutation_date: string;
  reason: string;
  operator_id: number;
}
