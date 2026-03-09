from pydantic import BaseModel

class CustomerFeatures(BaseModel):
    gender: str
    seniorCitizen: str
    partner: str
    dependents: str
    tenure: int
    contract: str
    paperlessBilling: str
    paymentMethod: str
    phoneService: str
    multipleLines: str
    internetService: str
    onlineSecurity: str
    onlineBackup: str
    deviceProtection: str
    techSupport: str
    streamingTV: str
    streamingMovies: str
    monthlyCharges: float
    totalCharges: float

class PredictionResponse(BaseModel):
    willChurn: bool
    probability: float