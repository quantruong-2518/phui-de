export interface Field {
  id: string;
  name: string;
  address: string | null;
  google_maps_url: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_name_2: string | null;
  contact_phone_2: string | null;
  pitch_count: number;
  has_camera: boolean;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type FieldInput = {
  name: string;
  address?: string | null;
  google_maps_url?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_name_2?: string | null;
  contact_phone_2?: string | null;
  pitch_count: number;
  has_camera: boolean;
  notes?: string | null;
};
