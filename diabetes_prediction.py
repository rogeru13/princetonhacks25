import requests
import json
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Add these at the top of the file
load_dotenv()

class DiabetesRiskPredictor:
    def __init__(self):
        self.API_URL = "https://api-inference.huggingface.co/models/shabari-vignesh8/Diabetes-prediction"
        self.headers = {"Authorization": f"Bearer {os.getenv('HUGGING_FACE_API_KEY')}"}
        
    def predict_future_risk(self, 
                          current_data: Dict[str, float],
                          historical_data: Optional[List[Dict]] = None,
                          prediction_window_months: int = 12) -> Dict:
        """
        Predicts future diabetes risk based on current stats and historical trends
        
        Args:
            current_data: Current health measurements
            historical_data: List of previous measurements with timestamps
            prediction_window_months: How far into the future to predict
        """
        # Get current diabetes status
        current_risk = self._get_current_risk(current_data)
        
        # Analyze trends if historical data is available
        trend_risk = self._analyze_trends(historical_data) if historical_data else None
        
        # Identify pre-diabetic indicators
        pre_diabetic_risk = self._analyze_pre_diabetic_indicators(current_data)
        
        # Combine all risk factors
        overall_risk = self._calculate_overall_risk(
            current_risk=current_risk,
            trend_risk=trend_risk,
            pre_diabetic_risk=pre_diabetic_risk
        )
        
        return {
            "risk_level": overall_risk["level"],
            "time_to_risk": self._estimate_time_to_diabetes(overall_risk["score"]),
            "contributing_factors": overall_risk["factors"],
            "preventative_actions": self._get_preventative_actions(overall_risk),
            "estimated_cost_savings": self._calculate_cost_savings(overall_risk)
        }

    def _get_current_risk(self, data: Dict) -> Dict:
        """Get current diabetes risk from model"""
        formatted_data = [[
            data["Pregnancies"],
            data["Glucose"],
            data["BloodPressure"],
            data["SkinThickness"],
            data["Insulin"],
            data["BMI"],
            data["DiabetesPedigreeFunction"],
            data["Age"]
        ]]
        
        try:
            print(f"Sending request to model with headers: {self.headers}")
            print(f"Input data: {formatted_data}")
            
            response = requests.post(
                self.API_URL, 
                headers=self.headers, 
                json={"inputs": formatted_data}
            )
            
            print(f"Response status code: {response.status_code}")
            print(f"Response content: {response.text}")
            
            if response.status_code != 200:
                raise Exception(f"API request failed with status {response.status_code}: {response.text}")
                
            return {"current_prediction": response.json()}
            
        except Exception as e:
            print(f"Error making prediction: {str(e)}")
            return {"current_prediction": None, "error": str(e)}

    def _analyze_trends(self, historical_data: List[Dict]) -> Dict:
        """Analyze trends in vital measurements over time"""
        if not historical_data:
            return None
            
        trends = {
            "glucose_trend": self._calculate_trend([d["Glucose"] for d in historical_data]),
            "bmi_trend": self._calculate_trend([d["BMI"] for d in historical_data]),
            "blood_pressure_trend": self._calculate_trend([d["BloodPressure"] for d in historical_data])
        }
        
        return trends

    def _analyze_pre_diabetic_indicators(self, data: Dict) -> Dict:
        """Analyze pre-diabetic risk factors"""
        risk_factors = []
        
        # Check glucose levels (pre-diabetic range)
        if 100 <= data["Glucose"] < 126:
            risk_factors.append(("glucose", "elevated", "high"))
            
        # Check BMI (overweight or obese)
        if data["BMI"] >= 25:
            risk_factors.append(("bmi", "elevated", "medium"))
            
        # Family history
        if data["DiabetesPedigreeFunction"] > 0.5:
            risk_factors.append(("genetic", "significant", "high"))
            
        return {"risk_factors": risk_factors}

    def _calculate_overall_risk(self, current_risk: Dict, 
                              trend_risk: Optional[Dict], 
                              pre_diabetic_risk: Dict) -> Dict:
        """Combine all risk factors into overall future risk assessment"""
        risk_score = 0
        factors = []
        
        # Current diabetes prediction contributes 40% of total risk
        if current_risk["current_prediction"] == 1:
            risk_score += 0.4
            factors.append("Current measurements indicate high risk")
            
        # Trends contribute up to 50% of total risk
        if trend_risk:
            # Rising glucose adds 30%
            if trend_risk["glucose_trend"] > 0:
                risk_score += 0.3
                factors.append("Rising glucose levels")
            # Rising BMI adds 20%
            if trend_risk["bmi_trend"] > 0:
                risk_score += 0.2
                factors.append("Rising BMI")
                
        # Pre-diabetic indicators can add up to 10% each
        for factor, status, severity in pre_diabetic_risk["risk_factors"]:
            if severity == "high":
                risk_score += 0.1
            factors.append(f"Pre-diabetic {factor}")
            
        return {
            "score": risk_score,
            "level": self._score_to_risk_level(risk_score),
            "factors": factors
        }

    def _score_to_risk_level(self, score: float) -> str:
        if score >= 0.7:       # 70%+ = HIGH risk
            return "HIGH"
        elif score >= 0.4:     # 40-69% = MODERATE risk
            return "LOW"
        return "LOW"          # Below 40% = LOW risk

    def _estimate_time_to_diabetes(self, risk_score: float) -> int:
        """Estimate months until potential diabetes development based on risk score"""
        if risk_score >= 0.7:
            return 12  # High risk: within a year
        elif risk_score >= 0.4:
            return 24  # Moderate risk: within 2 years
        return 60  # Low risk: 5+ years

    def _calculate_trend(self, values: List[float]) -> float:
        """Calculate trend direction and magnitude"""
        if len(values) < 2:
            return 0
        return (values[-1] - values[0]) / len(values)

    def _get_preventative_actions(self, risk_assessment: Dict) -> List[str]:
        """Get preventative actions based on risk level"""
        if risk_assessment["level"] == "HIGH":
            return ["Consult a healthcare provider", "Schedule regular check-ups"]
        elif risk_assessment["level"] == "MODERATE":
            return ["Monitor blood sugar levels closely", "Aim for 150 minutes of moderate exercise weekly"]
        return ["No immediate preventative actions needed"]

    def _calculate_cost_savings(self, risk_assessment: Dict) -> float:
        """Calculate potential cost savings from preventative measures"""
        annual_diabetes_cost = 9600  # Average annual cost of diabetes treatment
        preventative_program_cost = 1200  # Annual cost of prevention program
        
        if risk_assessment["level"] == "HIGH":
            return annual_diabetes_cost - preventative_program_cost
        elif risk_assessment["level"] == "MODERATE":
            return (annual_diabetes_cost - preventative_program_cost) / 2
        return 0

# Test usage
if __name__ == "__main__":
    predictor = DiabetesRiskPredictor()
    
    # Current data point
    current_data = {
        "Pregnancies": 8,
        "Glucose": 180,  # Pre-diabetic range
        "BloodPressure": 85,
        "SkinThickness": 40,
        "Insulin": 130,
        "BMI": 35.0,  # Overweight range
        "DiabetesPedigreeFunction": 0.8,
        "Age": 55
    }
    
    # Example historical data (3 months)
    historical_data = [
        {**current_data, "Glucose": 105, "timestamp": "2024-01-01"},
        {**current_data, "Glucose": 108, "timestamp": "2024-02-01"},
        {**current_data, "Glucose": 110, "timestamp": "2024-03-01"}
    ]
    
    result = predictor.predict_future_risk(current_data, historical_data)
    print("\nRisk Assessment Results:")
    print(f"Risk Level: {result['risk_level']}")
    print(f"Estimated Time to Risk: {result['time_to_risk']} months")
    print(f"Contributing Factors: {result['contributing_factors']}")
    print(f"Recommended Actions: {result['preventative_actions']}")
    print(f"Potential Cost Savings: ${result['estimated_cost_savings']}") 