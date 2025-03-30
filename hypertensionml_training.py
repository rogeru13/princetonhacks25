import numpy as np # linear algebra
import pandas as pd # data processing, CSV file I/O (e.g. pd.read_csv)
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score, KFold, GridSearchCV, StratifiedKFold
from sklearn.metrics import accuracy_score, precision_score, recall_score, classification_report, f1_score, RocCurveDisplay, confusion_matrix
from collections import Counter
from imblearn.over_sampling import SMOTE
from sklearn.ensemble import RandomForestClassifier
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler, OneHotEncoder

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

    categories=['Country','Smoking_History','Physical_Activity_Level','Family_History','Diabetes','Gender','Education_Level','Employment_Status', 'Alcohol_Intake']
    categorical = test_path[['Country', 'Smoking_History', 'Physical_Activity_Level', 'Family_History', 'Diabetes', 'Gender', 'Education_Level', 'Employment_Status', 'Alcohol_Intake']]
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
    test_percentages = test_percentages[0]
    risk_category = "Low Risk" if test_percentages[1] < 40 else "Moderate Risk" if test_percentages[1] < 70 else "High Risk"
    patient_data = test_path.iloc[0].to_dict()
    return risk_category, test_percentages[1], patient_data

    # for i, probs in enumerate(test_percentages):
    #     # Determine the risk category based on the probability of Class 1 (Hypertension)
        
        
    #     # Extract patient data for personalized recommendations
    #     patient_data = test_path.iloc[i].to_dict()

    #     result_str = (
    #         f"Test Data Point {i + 1}:\n"
    #         f"Probability of Class 0 (No Hypertension): {probs[0]:.2f}%\n"
    #         f"Probability of Class 1 (Hypertension): {probs[1]:.2f}%\n"
    #         f"Risk Category: {risk_category}\n"
    #         + "="*50
    #     )
    #     results.append(result_str)

    # return "\n".join(results)