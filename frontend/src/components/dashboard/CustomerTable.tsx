interface Customer {
  id: string;
  tenure: number;
  monthlyCharges: number;
  churnProbability: number;
  riskLevel: string;
}

interface CustomerTableProps {
  customers: Customer[];
}

const riskColors: Record<string, string> = {
  Critical: "bg-accent/20 text-accent",
  High: "bg-accent/10 text-accent/80",
  Medium: "bg-primary/20 text-primary",
  Low: "bg-secondary/20 text-secondary",
};

const CustomerTable = ({ customers }: CustomerTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border">
            {["Customer ID", "Tenure", "Monthly Charges", "Churn Probability", "Risk Level"].map((h) => (
              <th key={h} className="px-4 py-3 font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="border-b border-border/50 transition-colors hover:bg-muted/20">
              <td className="px-4 py-3 font-body text-sm font-semibold text-foreground">{c.id}</td>
              <td className="px-4 py-3 font-body text-sm text-muted-foreground">{c.tenure} mo</td>
              <td className="px-4 py-3 font-body text-sm text-muted-foreground">${c.monthlyCharges.toFixed(2)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-neon-coral to-neon-lavender"
                      style={{ width: `${c.churnProbability}%` }}
                    />
                  </div>
                  <span className="font-body text-xs text-muted-foreground">{c.churnProbability}%</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-block rounded-full px-2.5 py-0.5 font-heading text-xs font-semibold ${riskColors[c.riskLevel] || ""}`}>
                  {c.riskLevel}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTable;
