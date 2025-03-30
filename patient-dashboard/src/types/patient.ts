export type Gender = 'male' | 'female' | 'other';
export type SmokingHistory = 'never' | 'former' | 'current';

export interface PatientProfile {
    name: string;
    firstName: string;
    lastName: string;
    email?: string;
    dob: string;
    gender: string;
    country: string;
    hypertension: boolean;
    heart_disease: boolean;
    diabetes: boolean;
    pre_diabetic: boolean;
    obesity: boolean;
    asthma: boolean;
    family_history: boolean;
}

export interface DailyMetrics {
    date: string;
    hbA1c_level: number;
    blood_glucose_level: number;
}

export type Patient = {
  id: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  country: string | null;
  age: number | null;
  bmi: number | null;
  cholesterol: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  smoking_status: string | null;
  alcohol_intake: string | null;
  physical_activity_level: string | null;
  family_history: boolean | null;
  diabetes: boolean | null;
  stress_level: number | null;
  salt_intake: string | null;
  sleep_duration: number | null;
  heart_rate: number | null;
  ldl: number | null;
  hdl: number | null;
  triglycerides: number | null;
  glucose: number | null;
  gender: string | null;
  education_level: string | null;
  employment_status: string | null;
}; 