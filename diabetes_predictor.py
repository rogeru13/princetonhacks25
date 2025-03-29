import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier  # Better than SVM for this case
import joblib
from typing import Dict, List

class DiabetesPredictor:
    def __init__(self):
        """Initialize the diabetes predictor"""
        try:
            # Try to load existing model
            print("Loading existing model...")
            self.model = joblib.load('diabetes_model.joblib')
            self.scaler = joblib.load('scaler.joblib')
            self.label_encoders = joblib.load('label_encoders.joblib')
            print("Model loaded successfully!")
        except:
            print("Training new model...")
            self.train_new_model()
    
    def train_new_model(self):
        """Train a new model on the dataset"""
        # Load and preprocess data
        df = pd.read_csv("diabetes_prediction_dataset.csv")
        print(f"Training on {len(df)} patients")
        
        # Prepare features
        self.label_encoders = {}
        X = self._preprocess_features(df)
        y = df['diabetes']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate
        train_score = self.model.score(X_train_scaled, y_train)
        test_score = self.model.score(X_test_scaled, y_test)
        print(f"Training accuracy: {train_score:.2%}")
        print(f"Testing accuracy: {test_score:.2%}")
        
        # Save model
        joblib.dump(self.model, 'diabetes_model.joblib')
        joblib.dump(self.scaler, 'scaler.joblib')
        joblib.dump(self.label_encoders, 'label_encoders.joblib')
    
    def _preprocess_features(self, df: pd.DataFrame) -> np.ndarray:
        """Preprocess features for prediction"""
        # Encode categorical variables
        categorical_columns = ['gender', 'smoking_history']
        for column in categorical_columns:
            self.label_encoders[column] = LabelEncoder()
            df[column] = self.label_encoders[column].fit_transform(df[column])
        
        # Select features
        feature_columns = [
            'gender', 'age', 'hypertension', 'heart_disease',
            'smoking_history', 'bmi', 'HbA1c_level', 'blood_glucose_level'
        ]
        
        return df[feature_columns]
    
    def predict_risk(self, patient_data: Dict) -> Dict:
        """Predict diabetes risk for a patient"""
        try:
            # Prepare input data
            input_df = pd.DataFrame([patient_data])
            
            # Encode categorical variables
            for column, encoder in self.label_encoders.items():
                input_df[column] = encoder.transform(input_df[column])
            
            # Scale features
            input_scaled = self.scaler.transform(input_df)
            
            # Get prediction and probability
            prediction = self.model.predict(input_scaled)[0]
            probability = self.model.predict_proba(input_scaled)[0][1]
            
            # Analyze risk factors
            risk_factors = self._analyze_risk_factors(patient_data)
            
            return {
                "has_diabetes": bool(prediction),
                "probability": float(probability),
                "risk_level": self._get_risk_level(probability),
                "risk_factors": risk_factors,
                "recommendations": self._get_recommendations(patient_data, probability)
            }
        
        except Exception as e:
            print(f"Error in prediction: {str(e)}")
            return {"error": str(e)}
    
    def _analyze_risk_factors(self, data: Dict) -> List[str]:
        """Analyze patient's risk factors"""
        factors = []
        
        if data['blood_glucose_level'] > 140:
            factors.append("High blood glucose level")
        if data['HbA1c_level'] > 6.5:
            factors.append("Elevated HbA1c")
        if data['bmi'] >= 30:
            factors.append("Obesity")
        if data['hypertension']:
            factors.append("Hypertension")
        if data['heart_disease']:
            factors.append("Heart disease")
        if data['age'] > 45:
            factors.append("Age over 45")
        if data['smoking_history'] == 'current':
            factors.append("Current smoker")
            
        return factors
    
    def _get_risk_level(self, probability: float) -> str:
        """Convert probability to risk level"""
        if probability >= 0.7:
            return "HIGH"
        elif probability >= 0.3:
            return "MODERATE"
        return "LOW"
    
    def _get_recommendations(self, data: Dict, probability: float) -> List[str]:
        """Get personalized recommendations"""
        recommendations = []
        
        if probability >= 0.7:
            recommendations.extend([
                "Consult a healthcare provider immediately",
                "Monitor blood glucose regularly",
                "Start a diabetes prevention program"
            ])
        elif probability >= 0.3:
            recommendations.extend([
                "Schedule a check-up with your doctor",
                "Consider lifestyle modifications",
                "Monitor blood glucose periodically"
            ])
        
        if data['bmi'] >= 25:
            recommendations.append("Consider a weight management program")
        if data['smoking_history'] == 'current':
            recommendations.append("Consider smoking cessation program")
            
        return recommendations

# Test the predictor
if __name__ == "__main__":
    predictor = DiabetesPredictor()
    
    # Multiple test cases
    test_patients = [
        {
            "gender": "Female",
            "age": 54.0,
            "hypertension": 0,
            "heart_disease": 0,
            "smoking_history": "never",
            "bmi": 27.32,
            "HbA1c_level": 6.6,
            "blood_glucose_level": 140
        },
        {
            "gender": "Male",
            "age": 42.0,
            "hypertension": 1,
            "heart_disease": 1,
            "smoking_history": "current",
            "bmi": 31.0,
            "HbA1c_level": 7.2,
            "blood_glucose_level": 180
        },
        {
            "gender": "Female",
            "age": 28.0,
            "hypertension": 0,
            "heart_disease": 0,
            "smoking_history": "never",
            "bmi": 23.5,
            "HbA1c_level": 5.2,
            "blood_glucose_level": 90
        }
    ]
    
    # Test each patient
    for i, patient in enumerate(test_patients, 1):
        print(f"\nPatient {i} Assessment:")
        print("-" * 50)
        print(f"Patient Details: {patient}")
        
        result = predictor.predict_risk(patient)
        
        print("\nRisk Assessment Results:")
        print(f"Diabetes Risk: {'Positive' if result['has_diabetes'] else 'Negative'}")
        print(f"Probability: {result['probability']:.1%}")
        print(f"Risk Level: {result['risk_level']}")
        print(f"Risk Factors: {result['risk_factors']}")
        print(f"Recommendations: {result['recommendations']}") 