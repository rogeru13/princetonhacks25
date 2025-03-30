import pandas as pd
import numpy as np
# import matplotlib.pyplot as plt
# import seaborn as sns
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score, KFold, GridSearchCV, StratifiedKFold
# from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, classification_report, f1_score, RocCurveDisplay, confusion_matrix
from collections import Counter
from imblearn.under_sampling import RandomUnderSampler
from imblearn.over_sampling import SMOTE
from sklearn.ensemble import RandomForestClassifier
import tensorflow as tf
from tensorflow import keras
from google import genai

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


    feature_scores = sorted(zip(feature_names, scores), key=lambda x: x[1], reverse=True)

    for name, score in zip(feature_names, scores):
        print(f"Feature: {name}, Fisher Score: {score:.4f}")

    return np.array(scores)

def Smote(data, target):
    counter = Counter(target)
    smote = SMOTE()
    data, target = smote.fit_resample(data, target)
    counter = Counter(target)
    return data, target

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


def predict_db(test_path):
    data = pd.read_csv("diabetes_prediction_dataset.csv")
    data = data[data['Gender'] != 'Other']
    categorical_columns = ['Gender', 'Hypertension', 'Heart_Disease', 'Smoking_History']
    numerical = ['Age', 'BMI', 'Blood_Glucose_Level', 'HbA1c_Level']
    # outliers for bmi
    q1 = np.quantile(data['BMI'], 0.25)
    q3 = np.quantile(data['BMI'], 0.75)
    IQR = q3 - q1
    lower_limit = q1 - (1.5 * IQR)
    upper_limit = q3 + (1.5 * IQR)

    # drop outliers
    outliers = data[(data['BMI'] < lower_limit) | (data['BMI'] > upper_limit)]
    data = data.drop(outliers.index)

    # outliers for blood glucose level
    q1 = np.quantile(data['Blood_Glucose_Level'], 0.25)
    q3 = np.quantile(data['Blood_Glucose_Level'], 0.75)
    IQR = q3 - q1
    lower_limit = q1 - (1.5 * IQR)
    upper_limit = q3 + (1.5 * IQR)

    # drop outliers
    outliers = data[(data['Blood_Glucose_Level'] < lower_limit) | (data['Blood_Glucose_Level'] > upper_limit)]
    data = data.drop(outliers.index)

    # outliers for HbA1c level
    q1 = np.quantile(data['HbA1c_Level'], 0.25)
    q3 = np.quantile(data['HbA1c_Level'], 0.75)
    IQR = q3 - q1
    lower_limit = q1 - (1.5 * IQR)
    upper_limit = q3 + (1.5 * IQR)

    # drop outliers
    outliers = data[(data['HbA1c_Level'] < lower_limit) | (data['HbA1c_Level'] > upper_limit)]
    data = data.drop(outliers.index)

    data.isnull().sum()
    data.drop_duplicates(inplace=True)

    bins = [0, 20, 40, 60, np.inf]
    labels = ['0-20', '21-40', '41-60', 'upper_61']
    data['age_group'] = pd.cut(data['Age'], bins=bins, labels=labels, right=False)

    diabetes_by_age_group = data[data['Diabetes'] == 1].groupby('age_group').size()
    total_by_age_group = data.groupby('age_group').size()

    result = pd.DataFrame({
        'Total': total_by_age_group,
        'Diabetes': diabetes_by_age_group
    }).fillna(0)

    result['Diabetes (%)'] = (result['Diabetes'] / result['Total']) * 100
    data.drop(columns=['Age'], axis=1, inplace=True)

    categorical = data[['Gender', 'Smoking_History', 'age_group']]
    data.drop(columns=['Gender', 'Smoking_History', 'age_group'], axis=1, inplace=True)

    categorical = categorical.apply(LabelEncoder().fit_transform)

    newData = pd.concat([data, categorical], axis=1)

    corr = newData.corr()
    corr['Diabetes'].sort_values(ascending=False)

    target = newData['Diabetes']
    data = newData.drop(columns=['Diabetes'], axis=1)

    X = np.array(data)
    y = np.array(target)
    feature_names = data.columns
    fisher_scores = fisher_score_manual(X, y, feature_names)

    data.drop(columns=['Gender', 'Smoking_History'], axis=1, inplace=True)
    data, target = Smote(data, target)

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

    bins = [0, 20, 40, 60, np.inf]
    labels = ['0-20', '21-40', '41-60', 'upper_61']
    test_path['age_group'] = pd.cut(test_path['Age'], bins=bins, labels=labels, right=False)
    norm_test_path = test_path.copy()
    norm_test_path.drop(columns=['age_group'], axis=1, inplace=True)
    print(norm_test_path)
    print(test_path)
    if 'age_group' not in test_path.columns:
        raise KeyError("The 'age_group' column was not created successfully.")
    test_path['age_group'] = LabelEncoder().fit_transform(test_path['age_group'])

    # Reorder columns to match training data
    test_path = test_path[xtrain.columns]

    # Scale the test data
    test_data_scaled = pd.DataFrame(scaler.transform(test_path), columns=xtrain.columns)
    importances = RandomForest.feature_importances_
    feature_importance_df = pd.DataFrame({'Feature': xtrain.columns, 'Importance': importances})
    feature_importance_df = feature_importance_df.sort_values('Importance', ascending=False)

    test_probabilities = RandomForest.predict_proba(test_data_scaled)

    test_percentages = test_probabilities * 100
    test_percentages = test_percentages[0]
    risk_category = "Low Risk" if test_percentages[1] < 40 else "Moderate Risk" if test_percentages[1] < 70 else "High Risk"
    patient_data = test_path.iloc[0].to_dict()
    return risk_category, test_percentages[1], patient_data



    # print(test_percentages)

    # for i, probs in enumerate(test_percentages):
    #     risk_category = "Low Risk" if probs[1] < 40 else "Moderate Risk" if probs[1] < 70 else "High Risk"
    #     patient_data = norm_test_path.iloc[i].to_dict()

    #     # Generate recommendation using Gemini        
    #     result_str = (
    #         f"Test Data Point {i + 1}:\n"
    #         f"Probability of Class 0 (No Diabetes): {probs[0]:.2f}%\n"
    #         f"Probability of Class 1 (Diabetes): {probs[1]:.2f}%\n"
    #         f"Risk Category: {risk_category}\n"
    #         + "="*50
    #     )
    #     results.append(result_str)

    # return "\n".join(results)