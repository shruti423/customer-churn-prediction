import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download, ArrowLeft, Users, TrendingDown, DollarSign, Brain, AlertTriangle, Lightbulb, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import KpiCard from "@/components/dashboard/KpiCard";
import ChurnHeatmap from "@/components/dashboard/ChurnHeatmap";
import CustomerTable from "@/components/dashboard/CustomerTable";

// Define the exact structure we expect from our FastAPI backend
interface CustomerData {
  id: string;
  tenure: number;
  monthlyCharges: number;
  contract: string;
  churnProbability: number;
  willChurn: boolean;
  riskLevel: string;
}

interface DashboardData {
  totalCustomers: number;
  churnRate: number;
  revenueAtRisk: number;
  customers: CustomerData[];
}

const featureImportance = [
  { feature: "Contract Type", importance: 0.89, fill: "#B983FF" },
  { feature: "Tenure", importance: 0.76, fill: "#22D3EE" },
  { feature: "Monthly Charges", importance: 0.68, fill: "#B983FF" },
  { feature: "Internet Service", importance: 0.54, fill: "#22D3EE" },
  { feature: "Payment Method", importance: 0.42, fill: "#FF6B6B" },
];

const DashboardPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      // 1. Package the file for the backend
      const formData = new FormData();
      formData.append("file", file);

      // 2. Send to our new bulk prediction API
      const response = await fetch("https://customer-churn-prediction-3qtx.onrender.com", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.error("Backend error:", response.statusText);
        alert("Failed to process the CSV file. Please check the backend terminal for errors.");
        setIsLoading(false);
        return;
      }

      // 3. Receive the real AI data and update the dashboard!
      const resultData = await response.json();
      setData(resultData);
    } catch (error) {
      console.error("Failed to connect to the backend:", error);
      alert("Failed to connect to the backend server. Is Uvicorn running?");
    } finally {
      setIsLoading(false);
    }
  };

  // Tenure segmentation
  const tenureSegments = data
    ? [
        { name: "Newbies\n(0-12mo)", value: data.customers.filter((c) => c.tenure <= 12).length, fill: "#FF6B6B" },
        { name: "Established\n(13-60mo)", value: data.customers.filter((c) => c.tenure > 12 && c.tenure <= 60).length, fill: "#B983FF" },
        { name: "Veterans\n(60+mo)", value: data.customers.filter((c) => c.tenure > 60).length, fill: "#22D3EE" },
      ]
    : [];

  // Probability distribution
  const probDistribution = data
    ? [
        { range: "0-20%", count: data.customers.filter((c) => c.churnProbability <= 20).length, fill: "#22D3EE" },
        { range: "20-40%", count: data.customers.filter((c) => c.churnProbability > 20 && c.churnProbability <= 40).length, fill: "#22D3EE" },
        { range: "40-60%", count: data.customers.filter((c) => c.churnProbability > 40 && c.churnProbability <= 60).length, fill: "#B983FF" },
        { range: "60-80%", count: data.customers.filter((c) => c.churnProbability > 60 && c.churnProbability <= 80).length, fill: "#FF6B6B" },
        { range: "80-100%", count: data.customers.filter((c) => c.churnProbability > 80).length, fill: "#FF6B6B" },
      ]
    : [];

  // --- NEW DYNAMIC INSIGHTS LOGIC ---
  const generateDynamicInsights = () => {
    if (!data || data.customers.length === 0) return [];

    const churners = data.customers.filter(c => c.willChurn);
    if (churners.length === 0) return []; // No churners, no warnings needed!

    const insights = [];

    // 1. Analyze Contracts
    const m2mChurners = churners.filter(c => c.contract === "Month-to-month" || c.contract === "N/A").length;
    const m2mPct = (m2mChurners / churners.length) * 100;
    
    if (m2mPct > 50) {
      insights.push({
        id: 1,
        title: "High Risk Alert",
        text: `${m2mPct.toFixed(0)}% of predicted churners are on Month-to-Month contracts. Consider deploying aggressive annual upgrade incentives.`,
        Icon: AlertTriangle,
        colorClass: "text-accent",
        bgClass: "bg-accent/5",
        borderClass: "border-accent/20"
      });
    }

    // 2. Analyze Tenure
    const newChurners = churners.filter(c => c.tenure <= 12).length;
    const newPct = (newChurners / churners.length) * 100;

    if (newPct > 40) {
      insights.push({
        id: 2,
        title: "Onboarding Suggestion",
        text: `${newPct.toFixed(0)}% of at-risk customers are in their first 12 months. Your early-stage retention strategy needs review.`,
        Icon: Lightbulb,
        colorClass: "text-secondary",
        bgClass: "bg-secondary/5",
        borderClass: "border-secondary/20"
      });
    }

    // 3. Analyze Revenue Impact
    if (data.revenueAtRisk > 5000) {
      insights.push({
        id: 3,
        title: "Revenue Insight",
        text: `Severe revenue volume ($${data.revenueAtRisk.toLocaleString()}) is at risk. Prioritize calling the High Risk Customers in the Action Center immediately.`,
        Icon: Brain,
        colorClass: "text-primary",
        bgClass: "bg-primary/5",
        borderClass: "border-primary/20"
      });
    }

    // Fallback if no specific thresholds are met
    if (insights.length === 0) {
       insights.push({
        id: 4,
        title: "General Insight",
        text: "Churn risk is distributed evenly. Focus on standard loyalty programs.",
        Icon: Brain,
        colorClass: "text-primary",
        bgClass: "bg-primary/5",
        borderClass: "border-primary/20"
      });
    }

    return insights;
  };

  const dynamicInsights = generateDynamicInsights();

  const handleDownloadPDF = () => {
    if (!data) return;
    const report = `AI Customer Churn Intelligence Report
=====================================
Generated: ${new Date().toLocaleString()}

Total Customers Analyzed: ${data.totalCustomers}
Predicted Churn Rate: ${data.churnRate}%
Total Revenue at Risk: $${data.revenueAtRisk.toLocaleString()}/mo

Top Features Driving Churn:
${featureImportance.map((f) => `  - ${f.feature}: ${(f.importance * 100).toFixed(0)}%`).join("\n")}

Recommendations:
  - Offer loyalty discounts to customers with tenure < 12 months
  - Migrate month-to-month users to annual contracts
  - Improve fiber optic service quality
`;
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "churn-report.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!data) {
    return (
      <div className="min-h-screen pt-16">
        <div className="container mx-auto flex flex-col items-center justify-center px-4 py-32">
          <div className="glow-card max-w-lg p-12 text-center">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary/20 shadow-[0_0_30px_hsl(188_85%_53%/0.2)]">
              <Upload className="h-10 w-10 text-secondary" />
            </div>
            <h1 className="mb-3 font-display text-2xl font-bold text-foreground">Upload CSV Dataset</h1>
            <p className="mb-8 font-body text-muted-foreground">
              Upload your Telco Customer Churn dataset to generate a full AI-powered analytics dashboard.
            </p>
            <label className={`cursor-pointer ${isLoading ? 'pointer-events-none opacity-80' : ''}`}>
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={isLoading} />
              <Button variant="neon-secondary" size="xl" className="w-full" disabled={isLoading} asChild>
                <span>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing CSV...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Upload CSV File
                    </>
                  )}
                </span>
              </Button>
            </label>
          </div>
        </div>
      </div>
    );
  }

  const highRiskCustomers = data.customers
    .filter((c) => c.churnProbability > 50)
    .sort((a, b) => b.monthlyCharges - a.monthlyCharges)
    .slice(0, 5);

  return (
    <div className="min-h-screen pt-16">
      <button
        onClick={handleDownloadPDF}
        className="fixed right-6 top-20 z-40 flex items-center gap-2 rounded-lg border border-primary/30 bg-card/90 px-4 py-2 font-heading text-sm font-semibold text-primary backdrop-blur transition-all hover:border-primary hover:shadow-[0_0_20px_hsl(265_100%_76%/0.3)]"
      >
        <Download className="h-4 w-4" />
        Download Report
      </button>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Bulk Analysis <span className="text-secondary glow-text-secondary">Dashboard</span>
          </h1>
        </div>

        {/* ROW 1 - KPIs */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <KpiCard icon={Users} label="Total Customers Analyzed" value={data.totalCustomers.toLocaleString()} subtitle="Customers" color="primary" />
          <KpiCard icon={TrendingDown} label="Predicted Churn Rate" value={`${data.churnRate}%`} subtitle="Will Churn" color="accent" />
          <KpiCard icon={DollarSign} label="Revenue at Risk" value={`$${data.revenueAtRisk.toLocaleString()}`} subtitle="Monthly" color="secondary" />
        </div>

        {/* ROW 2 - Heatmap + Feature Importance */}
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <div className="glow-card p-6">
            <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-primary">Risk Heatmap</h3>
            <ChurnHeatmap customers={data.customers} />
          </div>

          <div className="glow-card p-6">
            <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-primary">Feature Importance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={featureImportance} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 25%)" />
                <XAxis type="number" domain={[0, 1]} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis type="category" dataKey="feature" tick={{ fill: "#f1f5f9", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#f1f5f9" }} formatter={(value: number) => [`${(value * 100).toFixed(0)}%`, "Importance"]} />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                  {featureImportance.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROW 3 - Segments, Distribution, Recommendations */}
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          {/* Tenure Segmentation */}
          <div className="glow-card p-6">
            <h3 className="mb-4 font-display text-xs font-bold uppercase tracking-widest text-primary">Customer Tenure Segmentation</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={tenureSegments} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {tenureSegments.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#f1f5f9" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex justify-center gap-4">
              {tenureSegments.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: s.fill }} />
                  {s.name.split("\n")[0]}
                </div>
              ))}
            </div>
          </div>

          {/* Probability Distribution */}
          <div className="glow-card p-6">
            <h3 className="mb-4 font-display text-xs font-bold uppercase tracking-widest text-primary">Churn Probability Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={probDistribution} margin={{ top: 30, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 25%)" />
                <XAxis dataKey="range" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#f1f5f9" }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {probDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* AI Recommendations */}
          <div className="glow-card p-6">
            <h3 className="mb-4 font-display text-xs font-bold uppercase tracking-widest text-primary">
              <Brain className="mr-2 inline h-4 w-4" /> AI Recommendations
            </h3>
            <div className="space-y-4">
              {dynamicInsights.map((insight) => (
                <div key={insight.id} className={`rounded-lg border ${insight.borderClass} ${insight.bgClass} p-3`}>
                  <div className="mb-1 flex items-center gap-2">
                    <insight.Icon className={`h-3.5 w-3.5 ${insight.colorClass}`} />
                    <span className={`font-heading text-sm font-semibold ${insight.colorClass}`}>
                      {insight.title}
                    </span>
                  </div>
                  <p className="font-body text-xs text-muted-foreground">
                    {insight.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROW 4 - Action Center */}
        <div className="glow-card p-6">
          <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-primary">Action Center — High Risk Customers</h3>
          <CustomerTable customers={highRiskCustomers} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
