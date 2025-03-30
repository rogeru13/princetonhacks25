import pandas as pd
from hypertensionml_training import predict_ht
from diabetesml import predict_db
from google import genai

client = genai.Client(api_key="AIzaSyDfCeA7w1nNH4Yiify0tvpgaYixq4eSbx4")

def get_gemini_recommendation(risk_level_ht, risk_level_db, patient_data_ht, patient_data_db, percent_ht, percent_db):
    global client
    prompt = f"""
    A patient has been classified as {risk_level_ht} risk for hypertension with a {percent_ht}% likelihood 
    and {risk_level_db} risk for diabetes with a {percent_db}% likelihood based on their medical data.

    Hypertension-related patient data:
    {patient_data_ht}

    Diabetes-related patient data:
    {patient_data_db}

    Summarize the key lifestyle, diet, and medical factors that influence diabetes or hypertensionrisk in a brief educational paragraph.
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash", 
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"Error in getting recommendation: {str(e)}"


def load_patient(inputfile, headers):
    patient_data = pd.read_csv(inputfile)
    patient_data = patient_data[headers]
    return patient_data

def main():
    required_headers_ht = ["Country", "Age", "BMI", "Cholesterol", "Systolic_BP", "Diastolic_BP",
                        "Smoking_History", "Alcohol_Intake", "Physical_Activity_Level",
                        "Family_History", "Diabetes", "Stress_Level", "Salt_Intake",
                        "Sleep_Duration", "Heart_Rate", "LDL", "HDL", "Triglycerides",
                        "Glucose", "Gender", "Education_Level", "Employment_Status", "Hypertension"]
    required_headers_db = ["BMI", "Blood_Glucose_Level", "HbA1c_Level", "Hypertension",
                        "Heart_Disease", "Age"]
    
    file_path = input("Enter path to CSV patient data: ")
    patient_data_ht = load_patient(file_path, required_headers_ht)
    patient_data_db = load_patient(file_path, required_headers_db)
    
    print(f"Running prediction models...")
    risk_ht, percent_ht, report_ht = predict_ht(patient_data_ht)
    risk_db, percent_db, report_db = predict_db(patient_data_db)

    response = get_gemini_recommendation(risk_ht, risk_db, report_ht, report_db, percent_ht, percent_db)
    print(response)


if __name__ == "__main__":
    main()


    # if choice == "1":
    #     disease = "Hypertension"
    #     model_function = predict_ht
    #     required_headers = ["Country", "Age", "BMI", "Cholesterol", "Systolic_BP", "Diastolic_BP",
    #                          "Smoking_History", "Alcohol_Intake", "Physical_Activity_Level",
    #                          "Family_History", "Diabetes", "Stress_Level", "Salt_Intake",
    #                          "Sleep_Duration", "Heart_Rate", "LDL", "HDL", "Triglycerides",
    #                          "Glucose", "Gender", "Education_Level", "Employment_Status", "Hypertension"]
    # elif choice == "2":
    #     disease = "Diabetes"
    #     model_function = predict_db
    #     required_headers = ["BMI", "Blood_Glucose_Level", "HbA1c_Level", "Hypertension",
    #                          "Heart_Disease", "Age"]
    # else:
    #     print("invalid choice. exiting...")
    #     return