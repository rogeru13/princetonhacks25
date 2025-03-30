import pandas as pd
from hypertensionml_training import predict_ht
from diabetesml import predict_db


def load_patient(inputfile, headers):
    patient_data = pd.read_csv(inputfile)
    patient_data = patient_data[headers]
    return patient_data

def main():
    print("Welcome to the Disease Prediction System!")
    print("Select a disease prediction model:")
    print("1. Hypertension")
    print("2. Diabetes")
    choice = input("Enter your choice (1/2): ")

    if choice == "1":
        disease = "Hypertension"
        model_function = predict_ht
        required_headers = ["Country", "Age", "BMI", "Cholesterol", "Systolic_BP", "Diastolic_BP",
                             "Smoking_History", "Alcohol_Intake", "Physical_Activity_Level",
                             "Family_History", "Diabetes", "Stress_Level", "Salt_Intake",
                             "Sleep_Duration", "Heart_Rate", "LDL", "HDL", "Triglycerides",
                             "Glucose", "Gender", "Education_Level", "Employment_Status", "Hypertension"]
    elif choice == "2":
        disease = "Diabetes"
        model_function = predict_db
        required_headers = ["BMI", "Blood_Glucose_Level", "HbA1c_Level", "Hypertension",
                             "Heart_Disease", "Age"]
    else:
        print("invalid choice. exiting...")
        return
    
    file_path = input("Enter path to CSV patient data: ")
    patient_data = load_patient(file_path, required_headers)
    if patient_data is None:
        return
    
    print(f"Running {disease} prediction model...")
    report = model_function(patient_data)
    print(report)

if __name__ == "__main__":
    main()