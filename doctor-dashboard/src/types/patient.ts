export interface Patient {
  id: string;
  country: string;
  age: number;
  bmi: number;
  cholesterol: number;
  systolic_bp: number;
  diastolic_bp: number;
  smoking_status: string;
  alcohol_intake: string;
  physical_activity_level: string;
  family_history: boolean;
  diabetes: boolean;
  stress_level: number;
  salt_intake: string;
  sleep_duration: number;
  heart_rate: number;
  ldl: number;
  hdl: number;
  triglycerides: number;
  glucose: number;
  gender: string;
  education_level: string;
  employment_status: string;
}

export interface DailyMetrics {
  id: string;
  patient_id: string;
  date: string;
  blood_glucose_level: number;
  hba1c_level: number;
}