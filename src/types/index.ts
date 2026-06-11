export interface Medication {
  id: string; // internal React key only
  name: string;
  presentation: string;
  quantity: string;
  posology: string;
  instructions: string;
}

export interface Profile {
  id: string;
  full_name: string;
  specialty: string;
  phone: string;
  role: 'doctor' | 'admin';
  updated_at?: string;
}

export interface Prescription {
  id: string;
  user_id: string;
  patient_name: string;
  date: string;
  medications: Omit<Medication, 'id'>[];
  instructions: string;
  next_appointment: string;
  created_at: string;
}

export interface Template {
  id: string;
  user_id: string;
  template_name: string;
  medications: Omit<Medication, 'id'>[];
  instructions: string;
  created_at: string;
}

export interface PrescriptionFormState {
  patientName: string;
  date: string;
  medications: Medication[];
  instructions: string;
  nextAppointment: string;
}

export const PRESENTATION_OPTIONS = [
  'mg comprimidos',
  'mg cápsulas',
  'mg tabletas',
  'comprimidos',
  'cápsulas',
  'tabletas',
  'mg/5ml jarabe',
  'mg/ml solución oral',
  'mg inyectable',
  'mg/ml inyectable',
  'UI inyectable',
  'mcg inhalador',
  'UI/dosis inhalador',
  '% crema',
  '% ungüento',
  '% gel',
  '% solución oftálmica',
  'gotas',
  'supositorios',
  'parches',
  'sachets',
  'sobres',
];

export const POSOLOGY_PRESETS = [
  'Cada 4 horas',
  'Cada 6 horas',
  'Cada 8 horas',
  'Cada 12 horas',
  'Cada 24 horas',
  '1 vez al día',
  '2 veces al día',
  '3 veces al día',
  '4 veces al día',
  'Según necesidad',
  'En ayunas',
];

// Inventory
export const INVENTORY_CATEGORIES = ['Medicamentos', 'Insumos', 'Limpieza', 'Otros'] as const;
export type InventoryCategory = typeof INVENTORY_CATEGORIES[number];

export const INVENTORY_UNITS = ['unidad', 'caja', 'frasco', 'ampolla', 'par', 'paquete', 'rollo', 'litro', 'sobre'] as const;
export type InventoryUnit = typeof INVENTORY_UNITS[number];

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  unit: InventoryUnit;
  min_stock: number;
  created_at: string;
  created_by: string;
}

export interface InventoryMovement {
  id: string;
  item_id: string;
  type: 'entrada' | 'salida';
  quantity: number;
  notes: string | null;
  created_at: string;
  created_by: string;
}

export interface InventoryItemWithStock extends InventoryItem {
  current_stock: number;
  last_restock: string | null;
}
