export type HealthStatus = 'excellent' | 'good' | 'fair' | 'poor';

export interface Plant {
  id?: string;
  name: string;
  species: string;
  location: string;
  watering_frequency: number; // Frecuencia en días
  fertilizer_frequency: number; // Frecuencia en días
  health_status: HealthStatus;
  qr_code_url?: string;
  created_at: number;
}

export type ActionType = 'water' | 'fertilize' | 'sprout' | 'health_update';

export interface PlantLog {
  id?: string;
  plantId: string;
  date: number;
  action: ActionType;
  note?: string;
}
