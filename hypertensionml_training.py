import numpy as np # linear algebra
import pandas as pd # data processing, CSV file I/O (e.g. pd.read_csv)
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score, KFold, GridSearchCV, StratifiedKFold
from sklearn.metrics import accuracy_score, precision_score, recall_score, classification_report, f1_score, RocCurveDisplay, confusion_matrix
from collections import Counter
from imblearn.under_sampling import RandomUnderSampler
from imblearn.over_sampling import SMOTE
from sklearn.ensemble import RandomForestClassifier
import tensorflow as tf
from tensorflow import keras
from sklearn.preprocessing import MinMaxScaler, OneHotEncoder
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from google import genai

client = genai.Client(api_key="AIzaSyDfCeA7w1nNH4Yiify0tvpgaYixq4eSbx4")

test_data = pd.DataFrame({
    "Country": ["UK", "Canada", "India", "USA", "Germany"],
    "Age": [45, 60, 35, 50, 70],
    "BMI": [28.5, 32.1, 24.3, 29.8, 27.5],
    "Cholesterol": [200, 250, 180, 220, 240],
    "Systolic_BP": [140, 160, 120, 150, 170],
    "Diastolic_BP": [90, 100, 80, 95, 110],
    "Smoking_History": ["Never", "Former", "Current", "Never", "Current"],
    "Alcohol_Intake": [10.5, 15.2, 5.0, 12.0, 8.0],
    "Physical_Activity_Level": ["Moderate", "Low", "High", "Moderate", "Low"],
    "Family_History": ["Yes", "Yes", "No", "Yes", "Yes"],
    "Diabetes": ["No", "Yes", "No", "Yes", "Yes"],
    "Stress_Level": [7, 8, 5, 6, 9],
    "Salt_Intake": [12.5, 14.0, 10.0, 13.0, 15.0],
    "Sleep_Duration": [6.5, 5.0, 7.0, 6.0, 5.5],
    "Heart_Rate": [75, 85, 70, 80, 90],
    "LDL": [120, 140, 110, 130, 150],
    "HDL": [50, 45, 55, 48, 40],
    "Triglycerides": [150, 180, 130, 160, 200],
    "Glucose": [110, 130, 100, 120, 140],
    "Gender": ["Male", "Female", "Male", "Female", "Male"],
    "Education_Level": ["Secondary", "Primary", "Tertiary", "Secondary", "Primary"],
    "Employment_Status": ["Employed", "Retired", "Employed", "Unemployed", "Retired"]
})


def get_gemini_recommendation(risk_level, patient_data):
    global client
    prompt = f"""
    A patient has been classified as {risk_level} risk for diabetes based on their medical data:
    {patient_data}

    Summarize the key lifestyle, diet, and medical factors that influence diabetes risk in a brief educational paragraph.
    """
    # prompt = f"""
    # A patient has been classified as {risk_level} risk for diabetes. Based on their medical data:
    # {patient_data}

    # Please provide specific and actionable lifestyle, diet, and medical recommendations to help them lower their risk.
    # Provide suggestions for exercise, diet plans, and any relevant medical checkups.
    # """
    
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash", 
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"Error in getting recommendation: {str(e)}"


def remove_outliers_iqr(df, columns):
    for col in columns:
        Q1 = df[col].quantile(0.25)  # First quartile (25th percentile)
        Q3 = df[col].quantile(0.75)  # Third quartile (75th percentile)
        IQR = Q3 - Q1  # Interquartile range
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        # Filter the dataframe to remove outliers
        df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]
    return df

def Smote(data, target):
    counter = Counter(target)
    smote = SMOTE()
    data, target = smote.fit_resample(data, target)
    counter = Counter(target)
    return data, target

def fisher_score_manual(X, y, feature_names):
    scores = []
    n_classes = np.unique(y)

    for i in range(X.shape[1]):
        numerator = 0
        denominator = 0
        overall_mean = np.mean(X[:, i])

        for c in n_classes:
            class_samples = X[y == c, i]
            class_mean = np.mean(class_samples)
            class_variance = np.var(class_samples)
            class_count = len(class_samples)

            numerator += class_count * (class_mean - overall_mean) ** 2
            denominator += class_count * class_variance

        score = numerator / (denominator + 1e-10)
        scores.append(score)

    return np.array(scores)

def metrics_calculator(y_test, y_pred, model_name):
    '''
    This function calculates all desired performance metrics for a given model.
    '''
    result = pd.DataFrame(data=[accuracy_score(y_test, y_pred),
                                precision_score(y_test, y_pred, average='macro'),
                                recall_score(y_test, y_pred, average='macro'),
                                f1_score(y_test, y_pred, average='macro')],
                          index=['Accuracy','Precision','Recall','F1-score'],
                          columns = [model_name])
    return result


def predict_ht(test_path):
    data = pd.read_csv("hypertension_dataset.csv")
    categories=['Country','Smoking_History','Physical_Activity_Level','Family_History','Diabetes','Gender','Education_Level','Employment_Status', 'Hypertension']
    numerical_columns = ["Age", "BMI", "Cholesterol", "Systolic_BP", "Diastolic_BP", "Alcohol_Intake", 
                        "Stress_Level", "Salt_Intake", "Sleep_Duration", "Heart_Rate", "LDL", "HDL", 
                        "Triglycerides", "Glucose"]
    df_cleaned = remove_outliers_iqr(data, numerical_columns)
    categorical = df_cleaned[['Country', 'Smoking_History', 'Physical_Activity_Level', 'Family_History', 'Diabetes', 'Gender', 'Education_Level', 'Employment_Status', 'Hypertension']]
    df_cleaned.drop(columns=categories, axis=1, inplace=True)
    categorical = categorical.apply(LabelEncoder().fit_transform)
    newData = pd.concat([df_cleaned, categorical], axis=1)
    corr = newData.corr()

    corr['Hypertension'].sort_values(ascending=False)

    target = newData['Hypertension']
    data = newData.drop(columns=['Hypertension'], axis=1)
    data, target = Smote(data, target)

    X = np.array(data)
    y = np.array(target)

    feature_names = data.columns

    xtrain, xtest, ytrain, ytest = train_test_split(data, target, test_size=0.3, stratify=target)

    scaler = MinMaxScaler()
    xtrain = pd.DataFrame(scaler.fit_transform(xtrain), columns=xtrain.columns)
    xtest = pd.DataFrame(scaler.transform(xtest), columns=xtest.columns)

    RandomForest = RandomForestClassifier()
    RandomForest.fit(xtrain, ytrain)

    kf5 = KFold(n_splits=5)
    cv_scores5 = cross_val_score(RandomForest, xtrain, ytrain, cv=kf5, scoring='accuracy')

    prediction_on_training_data_rf = RandomForest.predict(xtrain)
    metrics_calculator_rf_train = metrics_calculator(ytrain, prediction_on_training_data_rf, 'RandomForest_OnTraining')

    rf_prediction = RandomForest.predict(xtest)
    metrics_calculator_rf_test = metrics_calculator(ytest, rf_prediction, 'RandomForest_OnTesting')

    categories=['Country','Smoking_History','Physical_Activity_Level','Family_History','Diabetes','Gender','Education_Level','Employment_Status']
    categorical = test_path[['Country', 'Smoking_History', 'Physical_Activity_Level', 'Family_History', 'Diabetes', 'Gender', 'Education_Level', 'Employment_Status']]
    test_path.drop(columns=categories, axis=1, inplace=True)
    categorical = categorical.apply(LabelEncoder().fit_transform)
    test_path = pd.concat([test_path, categorical], axis=1)

    # df_cleaned.drop(columns=categories, axis=1, inplace=True)
    # categorical = categorical.apply(LabelEncoder().fit_transform)
    # newData = pd.concat([df_cleaned, categorical], axis=1)

    test_path = test_path[xtrain.columns]
    test_data_scaled = pd.DataFrame(scaler.transform(test_path), columns=xtrain.columns)
    importances = RandomForest.feature_importances_
    feature_importance_df = pd.DataFrame({'Feature': xtrain.columns, 'Importance': importances})
    feature_importance_df = feature_importance_df.sort_values('Importance', ascending=False)
    test_probabilities = RandomForest.predict_proba(test_data_scaled)

    test_percentages = test_probabilities * 100
    results = []

    for i, probs in enumerate(test_percentages):
        # Determine the risk category based on the probability of Class 1 (Hypertension)
        risk_category = "Low Risk" if probs[1] < 40 else "Moderate Risk" if probs[1] < 70 else "High Risk"
        
        # Extract patient data for personalized recommendations
        patient_data = test_path.iloc[i].to_dict()
        gemini_recommendation = get_gemini_recommendation(risk_category, patient_data)

        result_str = (
            f"Test Data Point {i + 1}:\n"
            f"Probability of Class 0 (No Hypertension): {probs[0]:.2f}%\n"
            f"Probability of Class 1 (Hypertension): {probs[1]:.2f}%\n"
            f"Risk Category: {risk_category}\n"
            "Personalized Recommendations:\n"
            f"{gemini_recommendation}\n"
            + "="*50
        )
        results.append(result_str)

    return "\n".join(results)

        
# print(f"Test Data Point {i + 1}:")
# print(f"Probability of Class 0 (No Hypertension): {probs[0]:.2f}%")
# print(f"Probability of Class 1 (Hypertension): {probs[1]:.2f}%")
# print(f"Risk Category: {risk_category}")
# print("Personalized Recommendations:")
# print(gemini_recommendation)
# print("\n" + "="*50 + "\n")



# bins = [0, 20, 40, 60, np.inf]
# labels = ['0-20', '21-40', '41-60', 'upper_61']
# df_cleaned['age_group'] = pd.cut(df_cleaned['Age'], bins=bins, labels=labels, right=False)


# print(newData.dtypes)

# print(newData)

# print(data.shape)
# print(target.shape)


# print('Cv Scores')
# print(cv_scores5)
# print('Cv Scores Accuracy Mean: ', cv_scores5.mean())

# print(metrics_calculator_rf_test)