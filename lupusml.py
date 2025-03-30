import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score, KFold, GridSearchCV, StratifiedKFold
from sklearn.metrics import accuracy_score, precision_score, recall_score, classification_report, f1_score, RocCurveDisplay, confusion_matrix
from collections import Counter
from sklearn.ensemble import RandomForestClassifier
from imblearn.over_sampling import SMOTE
import tensorflow as tf
from tensorflow import keras
# from google import genai

# client = genai.Client(api_key="AIzaSyDfCeA7w1nNH4Yiify0tvpgaYixq4eSbx4")

data = pd.read_csv('realistic_lupus_dataset.csv')

def predict_lupus(features):
    importance_scores = {
        'Renal': 0.5,
        'Age': 0.4,
        'Alopecia': 0.3,
        'ACL': 0.3,
        'Hemolytic anemia': 0.4,
        'Disease duration': 0.4,
        'PROV': 0.3,
        'Neurologic': 0.5,
        'Fever': 0.2,
        'Oral UI': 0.3,
        'Leukopaenia': 0.1,
        'Serositis': 0.0,
        'Proteinuria': 0.0,
    }
    
    # Calculate weighted sum
    risk_score = sum(features[key] * importance_scores[key] for key in features)
    
    # Apply a threshold to predict lupus (you can adjust the threshold)
    return 1 if risk_score >= 1.5 else 0

def calculate_risk_scores(row):
    # Extract features for the current row
    features = row.to_dict()
    return predict_lupus(features)

X = data.drop(columns=['Lupus Diagnosis'])  # Features
y = data['Lupus Diagnosis']  # Target

data['predicted_lupus'] = X.apply(calculate_risk_scores, axis=1)

# Print the first few rows of the dataset with predictions
data['Predicted Lupus'] = X.apply(calculate_risk_scores, axis=1)

true_labels = data['Lupus Diagnosis']
predicted_labels = data['Predicted Lupus']

print("\nDetailed Predicted Results:")
for index, row in data.iterrows():
    print(f"Row {index + 1}:")
    print(f"  Actual Lupus Diagnosis: {row['Lupus Diagnosis']}")
    print(f"  Predicted Lupus Diagnosis: {row['Predicted Lupus']}")
    print()

accuracy = (true_labels == predicted_labels).mean()
print(f"Accuracy: {accuracy:.2f}")