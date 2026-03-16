import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface PredictionResult {
  willChurn: boolean;
  probability: number;
}

const selectOptions = {
  gender: ["Male", "Female"],
  yesNo: ["Yes", "No"],
  contract: ["Month-to-month", "One year", "Two year"],
  paymentMethod: ["Electronic check", "Mailed check", "Bank transfer (automatic)", "Credit card (automatic)"],
  internetService: ["DSL", "Fiber optic", "No"],
};

const PredictPage = () => {
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [formData, setFormData] = useState({
    gender: "Male",
    seniorCitizen: "No",
    partner: "No",
    dependents: "No",
    tenure: 12,
    contract: "Month-to-month",
    paperlessBilling: "Yes",
    paymentMethod: "Electronic check",
    phoneService: "Yes",
    multipleLines: "No",
    internetService: "Fiber optic",
    onlineSecurity: "No",
    onlineBackup: "No",
    deviceProtection: "No",
    techSupport: "No",
    streamingTV: "No",
    streamingMovies: "No",
    monthlyCharges: 70,
    totalCharges: 840,
  });

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePredict = async () => {
    try {
      // 1. Send the form data to our FastAPI backend
      const response = await fetch("https://customer-churn-prediction-3qtx.onrender.com/api/predict/single/api/predict/single", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // 2. Check if the request was successful
      if (!response.ok) {
        console.error("Backend returned an error:", response.statusText);
        // Optional: You could add a toast notification here later to alert the user
        return;
      }

      // 3. Parse the JSON response from the backend
      const data = await response.json();

      // 4. Update the React state with the REAL prediction!
      setResult({
        willChurn: data.willChurn,
        probability: data.probability,
      });

    } catch (error) {
      console.error("Failed to connect to the backend:", error);
    }
  };

  const SelectField = ({ label, field, options }: { label: string; field: string; options: string[] }) => (
    <div className="space-y-2">
      <label className="font-heading text-sm font-semibold text-muted-foreground">{label}</label>
      <select
        value={(formData as any)[field]}
        onChange={(e) => handleChange(field, e.target.value)}
        className="w-full rounded-lg border border-border bg-muted/50 px-4 py-2.5 font-body text-sm text-foreground outline-none transition-all focus:border-primary focus:shadow-[0_0_15px_hsl(265_100%_76%/0.2)]"
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-card text-foreground">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  const NumberField = ({ label, field, min, max }: { label: string; field: string; min?: number; max?: number }) => (
    <div className="space-y-2">
      <label className="font-heading text-sm font-semibold text-muted-foreground">{label}</label>
      <input
        type="number"
        value={(formData as any)[field]}
        onChange={(e) => handleChange(field, Number(e.target.value))}
        min={min}
        max={max}
        className="w-full rounded-lg border border-border bg-muted/50 px-4 py-2.5 font-body text-sm text-foreground outline-none transition-all focus:border-primary focus:shadow-[0_0_15px_hsl(265_100%_76%/0.2)]"
      />
    </div>
  );

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="col-span-full mb-2 mt-4 first:mt-0">
      <h3 className="font-display text-sm font-bold uppercase tracking-widest text-primary glow-text-primary">
        {children}
      </h3>
      <div className="neon-line mt-2" />
    </div>
  );

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Individual <span className="text-primary glow-text-primary">Churn Prediction</span>
          </h1>
          <p className="mt-2 font-body text-muted-foreground">
            Enter customer details to predict churn probability.
          </p>
        </div>

        {/* Form */}
        <div className="glow-card p-6 md:p-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <SectionTitle>Demographics</SectionTitle>
            <SelectField label="Gender" field="gender" options={selectOptions.gender} />
            <SelectField label="Senior Citizen" field="seniorCitizen" options={selectOptions.yesNo} />
            <SelectField label="Partner" field="partner" options={selectOptions.yesNo} />
            <SelectField label="Dependents" field="dependents" options={selectOptions.yesNo} />

            <SectionTitle>Account Information</SectionTitle>
            <NumberField label="Tenure (months)" field="tenure" min={0} max={72} />
            <SelectField label="Contract Type" field="contract" options={selectOptions.contract} />
            <SelectField label="Paperless Billing" field="paperlessBilling" options={selectOptions.yesNo} />
            <SelectField label="Payment Method" field="paymentMethod" options={selectOptions.paymentMethod} />

            <SectionTitle>Services</SectionTitle>
            <SelectField label="Phone Service" field="phoneService" options={selectOptions.yesNo} />
            <SelectField label="Multiple Lines" field="multipleLines" options={selectOptions.yesNo} />
            <SelectField label="Internet Service" field="internetService" options={selectOptions.internetService} />

            <SectionTitle>Internet Services</SectionTitle>
            <SelectField label="Online Security" field="onlineSecurity" options={selectOptions.yesNo} />
            <SelectField label="Online Backup" field="onlineBackup" options={selectOptions.yesNo} />
            <SelectField label="Device Protection" field="deviceProtection" options={selectOptions.yesNo} />
            <SelectField label="Tech Support" field="techSupport" options={selectOptions.yesNo} />
            <SelectField label="Streaming TV" field="streamingTV" options={selectOptions.yesNo} />
            <SelectField label="Streaming Movies" field="streamingMovies" options={selectOptions.yesNo} />

            <SectionTitle>Charges</SectionTitle>
            <NumberField label="Monthly Charges ($)" field="monthlyCharges" min={0} />
            <NumberField label="Total Charges ($)" field="totalCharges" min={0} />
          </div>

          <div className="mt-8">
            <Button variant="hero" size="xl" className="w-full" onClick={handlePredict}>
              <Zap className="mr-2 h-5 w-5" />
              Predict Churn
            </Button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className={`mt-8 glow-card p-8 border ${result.willChurn ? "border-accent/40" : "border-secondary/40"}`}>
            <div className="text-center">
              <div className={`mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full ${result.willChurn ? "bg-accent/20" : "bg-secondary/20"}`}>
                {result.willChurn ? (
                  <XCircle className="h-10 w-10 text-accent" />
                ) : (
                  <CheckCircle className="h-10 w-10 text-secondary" />
                )}
              </div>
              <h2 className="mb-2 font-display text-2xl font-bold text-foreground">
                Prediction Result
              </h2>
              <p className={`mb-4 font-heading text-3xl font-bold ${result.willChurn ? "text-accent" : "text-secondary"}`}>
                {result.willChurn ? "Customer Will Churn" : "Customer Will Not Churn"}
              </p>
              <div className="mx-auto max-w-xs">
                <div className="mb-2 flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Churn Probability</span>
                  <span className={result.willChurn ? "text-accent" : "text-secondary"}>{result.probability}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${result.willChurn ? "bg-gradient-to-r from-neon-coral to-neon-lavender" : "bg-gradient-to-r from-neon-cyan to-neon-lavender"}`}
                    style={{ width: `${result.probability}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictPage;
