import joblib
import pandas as pd
import numpy as np
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "model_artifacts", "xgboost_churn_model.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "..", "model_artifacts", "churn_scaler.pkl")

class ChurnModelService:
    def __init__(self):
        self.model = joblib.load(MODEL_PATH)
        self.scaler = joblib.load(SCALER_PATH)
        
        self.model_columns = [
            'SeniorCitizen', 'tenure', 'MonthlyCharges', 'TotalCharges',
            'gender_Male', 'Partner_Yes', 'Dependents_Yes', 'PhoneService_Yes',
            'MultipleLines_No phone service', 'MultipleLines_Yes',
            'InternetService_Fiber optic', 'InternetService_No',
            'OnlineSecurity_No internet service', 'OnlineSecurity_Yes',
            'OnlineBackup_No internet service', 'OnlineBackup_Yes',
            'DeviceProtection_No internet service', 'DeviceProtection_Yes',
            'TechSupport_No internet service', 'TechSupport_Yes',
            'StreamingTV_No internet service', 'StreamingTV_Yes',
            'StreamingMovies_No internet service', 'StreamingMovies_Yes',
            'Contract_One year', 'Contract_Two year', 'PaperlessBilling_Yes',
            'PaymentMethod_Credit card (automatic)', 'PaymentMethod_Electronic check',
            'PaymentMethod_Mailed check',
            'Tenure_Bucket_Established (13-60m)', 'Tenure_Bucket_Veteran(60m+)'
        ]

    def preprocess_input(self, data: dict):
        encoded_df = pd.DataFrame(0, index=[0], columns=self.model_columns)

        tenure = data.get('tenure', 0)
        encoded_df['tenure'] = tenure
        encoded_df['MonthlyCharges'] = data.get('monthlyCharges', 0.0)
        encoded_df['TotalCharges'] = data.get('totalCharges', 0.0)
        
        if 12 < tenure <= 60:
            encoded_df['Tenure_Bucket_Established (13-60m)'] = 1
        elif tenure > 60:
            encoded_df['Tenure_Bucket_Veteran(60m+)'] = 1

        encoded_df['SeniorCitizen'] = 1 if data.get('seniorCitizen') == 'Yes' else 0

        if data.get('gender') == 'Male': encoded_df['gender_Male'] = 1
        if data.get('partner') == 'Yes': encoded_df['Partner_Yes'] = 1
        if data.get('dependents') == 'Yes': encoded_df['Dependents_Yes'] = 1
        if data.get('phoneService') == 'Yes': encoded_df['PhoneService_Yes'] = 1
        
        if data.get('multipleLines') == 'Yes': 
            encoded_df['MultipleLines_Yes'] = 1
        elif data.get('multipleLines') == 'No phone service': 
            encoded_df['MultipleLines_No phone service'] = 1

        internet = data.get('internetService')
        if internet == 'Fiber optic': encoded_df['InternetService_Fiber optic'] = 1
        if internet == 'No': encoded_df['InternetService_No'] = 1
        
        def set_service(col_prefix, frontend_val):
            if internet == 'No':
                encoded_df[f'{col_prefix}_No internet service'] = 1
            elif frontend_val == 'Yes':
                encoded_df[f'{col_prefix}_Yes'] = 1

        set_service('OnlineSecurity', data.get('onlineSecurity'))
        set_service('OnlineBackup', data.get('onlineBackup'))
        set_service('DeviceProtection', data.get('deviceProtection'))
        set_service('TechSupport', data.get('techSupport'))
        set_service('StreamingTV', data.get('streamingTV'))
        set_service('StreamingMovies', data.get('streamingMovies'))

        if data.get('contract') == 'One year': encoded_df['Contract_One year'] = 1
        if data.get('contract') == 'Two year': encoded_df['Contract_Two year'] = 1
        if data.get('paperlessBilling') == 'Yes': encoded_df['PaperlessBilling_Yes'] = 1
        
        payment = data.get('paymentMethod')
        if payment == 'Credit card (automatic)': encoded_df['PaymentMethod_Credit card (automatic)'] = 1
        if payment == 'Electronic check': encoded_df['PaymentMethod_Electronic check'] = 1
        if payment == 'Mailed check': encoded_df['PaymentMethod_Mailed check'] = 1

        num_cols = ['tenure', 'MonthlyCharges', 'TotalCharges']
        encoded_df[num_cols] = self.scaler.transform(encoded_df[num_cols])
        
        return encoded_df

    def predict(self, features: dict):
        processed_data = self.preprocess_input(features)
        prob = self.model.predict_proba(processed_data)[0][1]
        prediction = int(self.model.predict(processed_data)[0])
        
        return {
            "willChurn": bool(prediction == 1),
            "probability": round(float(prob) * 100, 1)
        }

    def predict_bulk(self, df: pd.DataFrame):
        """
        Takes a raw Pandas DataFrame directly from a CSV upload.
        Fast-processes thousands of rows and returns predictions.
        """
        encoded_df = pd.DataFrame(0, index=df.index, columns=self.model_columns)

        encoded_df['tenure'] = pd.to_numeric(df.get('tenure', 0), errors='coerce').fillna(0)
        encoded_df['MonthlyCharges'] = pd.to_numeric(df.get('MonthlyCharges', 0.0), errors='coerce').fillna(0)
        
        total_charges = pd.to_numeric(df.get('TotalCharges', 0.0), errors='coerce')
        encoded_df['TotalCharges'] = total_charges.fillna(encoded_df['MonthlyCharges'] * encoded_df['tenure'])

        encoded_df.loc[(encoded_df['tenure'] > 12) & (encoded_df['tenure'] <= 60), 'Tenure_Bucket_Established (13-60m)'] = 1
        encoded_df.loc[encoded_df['tenure'] > 60, 'Tenure_Bucket_Veteran(60m+)'] = 1

        if 'SeniorCitizen' in df.columns:
            encoded_df['SeniorCitizen'] = pd.to_numeric(df['SeniorCitizen'], errors='coerce').fillna(0)

        if 'gender' in df.columns: encoded_df.loc[df['gender'] == 'Male', 'gender_Male'] = 1
        if 'Partner' in df.columns: encoded_df.loc[df['Partner'] == 'Yes', 'Partner_Yes'] = 1
        if 'Dependents' in df.columns: encoded_df.loc[df['Dependents'] == 'Yes', 'Dependents_Yes'] = 1
        if 'PhoneService' in df.columns: encoded_df.loc[df['PhoneService'] == 'Yes', 'PhoneService_Yes'] = 1
        
        if 'MultipleLines' in df.columns:
            encoded_df.loc[df['MultipleLines'] == 'Yes', 'MultipleLines_Yes'] = 1
            encoded_df.loc[df['MultipleLines'] == 'No phone service', 'MultipleLines_No phone service'] = 1

        if 'InternetService' in df.columns:
            encoded_df.loc[df['InternetService'] == 'Fiber optic', 'InternetService_Fiber optic'] = 1
            encoded_df.loc[df['InternetService'] == 'No', 'InternetService_No'] = 1

        services = ['OnlineSecurity', 'OnlineBackup', 'DeviceProtection', 'TechSupport', 'StreamingTV', 'StreamingMovies']
        for srv in services:
            if srv in df.columns:
                encoded_df.loc[df[srv] == 'Yes', f'{srv}_Yes'] = 1
                encoded_df.loc[df[srv] == 'No internet service', f'{srv}_No internet service'] = 1

        if 'Contract' in df.columns:
            encoded_df.loc[df['Contract'] == 'One year', 'Contract_One year'] = 1
            encoded_df.loc[df['Contract'] == 'Two year', 'Contract_Two year'] = 1
        if 'PaperlessBilling' in df.columns:
            encoded_df.loc[df['PaperlessBilling'] == 'Yes', 'PaperlessBilling_Yes'] = 1
            
        if 'PaymentMethod' in df.columns:
            encoded_df.loc[df['PaymentMethod'] == 'Credit card (automatic)', 'PaymentMethod_Credit card (automatic)'] = 1
            encoded_df.loc[df['PaymentMethod'] == 'Electronic check', 'PaymentMethod_Electronic check'] = 1
            encoded_df.loc[df['PaymentMethod'] == 'Mailed check', 'PaymentMethod_Mailed check'] = 1

        num_cols = ['tenure', 'MonthlyCharges', 'TotalCharges']
        encoded_df[num_cols] = self.scaler.transform(encoded_df[num_cols])

        probabilities = self.model.predict_proba(encoded_df)[:, 1]
        predictions = self.model.predict(encoded_df)

        df_results = df.copy()
        df_results['churnProbability'] = (probabilities * 100).round(1)
        df_results['willChurn'] = predictions == 1
        
        return df_results

model_service = ChurnModelService()