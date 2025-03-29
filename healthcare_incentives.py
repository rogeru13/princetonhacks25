from typing import Dict, List

class HealthcareIncentiveCalculator:
    def __init__(self):
        """Initialize with cost parameters"""
        # Average annual costs in USD
        self.diabetes_treatment_cost = 16752  # Per patient per year with diabetes
        self.normal_healthcare_cost = 7151    # Per patient per year without diabetes
        
        # Incentive program costs and effectiveness
        self.incentive_programs = {
            "daily_steps": {
                "cost": 2.00,  # $ per day for hitting 10k steps
                "risk_reduction": 0.15,  # 15% reduction in diabetes risk
                "description": "10,000 steps daily walking program"
            },
            "nutrition_coaching": {
                "cost": 50.00,  # $ per month
                "risk_reduction": 0.20,  # 20% reduction in diabetes risk
                "description": "Monthly nutrition coaching"
            },
            "gym_membership": {
                "cost": 40.00,  # $ per month
                "risk_reduction": 0.25,  # 25% reduction in diabetes risk
                "description": "Gym membership and fitness tracking"
            },
            "health_monitoring": {
                "cost": 30.00,  # $ per month
                "risk_reduction": 0.10,  # 10% reduction in diabetes risk
                "description": "Regular health monitoring and tracking"
            }
        }

    def calculate_incentives(self, risk_assessment: dict) -> dict:
        """Calculate optimal incentives based on risk assessment"""
        probability = risk_assessment['probability']
        risk_level = risk_assessment['risk_level']
        
        # Calculate potential costs
        expected_cost_without_intervention = self._calculate_expected_cost(probability)
        
        # Calculate ROI for each program
        program_recommendations = []
        for program_name, program in self.incentive_programs.items():
            # Calculate new probability after intervention
            reduced_probability = max(0, probability * (1 - program['risk_reduction']))
            
            # Calculate costs with intervention
            intervention_cost = self._calculate_annual_program_cost(program)
            expected_cost_with_intervention = self._calculate_expected_cost(reduced_probability)
            
            # Calculate savings
            total_cost_with_program = intervention_cost + expected_cost_with_intervention
            potential_savings = expected_cost_without_intervention - total_cost_with_program
            roi = potential_savings / intervention_cost if intervention_cost > 0 else 0
            
            program_recommendations.append({
                "program": program_name,
                "description": program['description'],
                "annual_incentive_cost": intervention_cost,
                "potential_savings": potential_savings,
                "roi": roi,
                "risk_reduction": program['risk_reduction'] * 100,
                "recommended": roi > 0.2  # Recommend if ROI > 20%
            })
        
        # Sort programs by ROI
        program_recommendations.sort(key=lambda x: x['roi'], reverse=True)
        
        return {
            "current_risk_probability": probability,
            "expected_annual_cost_no_intervention": expected_cost_without_intervention,
            "program_recommendations": program_recommendations,
            "summary": self._generate_summary(program_recommendations, risk_level)
        }

    def _calculate_expected_cost(self, probability: float) -> float:
        """Calculate expected annual healthcare cost based on diabetes probability"""
        return (probability * self.diabetes_treatment_cost + 
                (1 - probability) * self.normal_healthcare_cost)

    def _calculate_annual_program_cost(self, program: dict) -> float:
        """Calculate annual cost of incentive program"""
        if 'cost' not in program:
            return 0
        # Convert daily/monthly costs to annual
        if program.get('frequency', 'monthly') == 'daily':
            return program['cost'] * 365
        return program['cost'] * 12

    def _generate_summary(self, recommendations: list, risk_level: str) -> str:
        """Generate a summary of recommendations"""
        recommended_programs = [r for r in recommendations if r['recommended']]
        
        if not recommended_programs:
            return "No cost-effective intervention programs recommended at this time."
        
        total_cost = sum(p['annual_incentive_cost'] for p in recommended_programs)
        total_savings = sum(p['potential_savings'] for p in recommended_programs)
        
        return (
            f"Based on {risk_level} risk level, {len(recommended_programs)} programs recommended. "
            f"Total annual investment: ${total_cost:,.2f}. "
            f"Potential savings: ${total_savings:,.2f}. "
            f"Top program: {recommended_programs[0]['description']}"
        )

    # ... (rest of the HealthcareIncentiveCalculator class methods) 