export type Gender = 'male' | 'female' | 'other';
export type SmokingHistory = 'never' | 'former' | 'current';

export interface PatientProfile {
    age: number;
    gender: Gender;
    hasHypertension: boolean;
    hasHeartDisease: boolean;
    smokingHistory: SmokingHistory;
}

export interface DailyMetrics {
    date: string;
    hbA1c_level: number;
    blood_glucose_level: number;
} 