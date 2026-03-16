from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io

from schemas import CustomerFeatures, PredictionResponse
from ml_service import model_service

app = FastAPI(
    title="Customer Churn Intelligence API",
    description="Backend for telecom customer churn predictions and analytics",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

@app.get("/")
def health_check():
    return {"message": "Welcome to the Churn Prediction API! The backend is running smoothly."}

# --- WORKFLOW 1: SINGLE PREDICTION ---
@app.post("/api/predict/single", response_model=PredictionResponse)
def predict_single_customer(features: CustomerFeatures):
    data_dict = features.model_dump()
    return model_service.predict(data_dict)


# --- WORKFLOW 2: BULK CSV ANALYSIS ---
@app.post("/api/predict/bulk")
async def predict_bulk_customers(file: UploadFile = File(...)):
    """
    Receives a CSV file, runs batch predictions, and returns 
    the exact JSON structure required by the React dashboard.
    """
    # 1. Read the uploaded file into a Pandas DataFrame
    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode("utf-8")))

    # 2. Pass the entire DataFrame to our ML engine
    results_df = model_service.predict_bulk(df)

    # 3. Calculate Dashboard KPIs
    total_customers = len(results_df)
    
    # Filter only the customers predicted to churn
    churners = results_df[results_df['willChurn'] == True]
    
    # Calculate Churn Rate (%)
    churn_rate = round((len(churners) / total_customers) * 100, 1) if total_customers > 0 else 0
    
    # Calculate Total Revenue at Risk (Sum of monthly charges of churners)
    revenue_at_risk = round(churners['MonthlyCharges'].sum(), 2)

    # 4. Format the customer array for the frontend table
    customers_list = []
    for index, row in results_df.iterrows():
        prob = row['churnProbability']
        
        # Calculate the Risk Level tag
        if prob > 75:
            risk_level = "Critical"
        elif prob > 50:
            risk_level = "High"
        elif prob > 30:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        # The Telco dataset uses 'customerID', but we generate a fallback if it's missing
        cust_id = row.get('customerID', f"CUST-{str(index + 1).zfill(4)}")

        # Build the exact dictionary the React UI expects
        customers_list.append({
            "id": cust_id,
            "tenure": int(row.get('tenure', 0)),
            "monthlyCharges": float(row.get('MonthlyCharges', 0.0)),
            "contract": str(row.get('Contract', "N/A")),
            "churnProbability": float(prob),
            "willChurn": bool(row['willChurn']),
            "riskLevel": risk_level
        })

    # 5. Return the final JSON payload
    return {
        "totalCustomers": total_customers,
        "churnRate": churn_rate,
        "revenueAtRisk": revenue_at_risk,
        "customers": customers_list
    }
