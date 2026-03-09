import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subtitle: string;
  color: "primary" | "secondary" | "accent";
}

const colorMap = {
  primary: {
    iconBg: "bg-primary/20",
    iconText: "text-primary",
    glow: "shadow-[0_0_30px_hsl(265_100%_76%/0.15)]",
    border: "border-primary/20 hover:border-primary/40",
    valueBg: "text-primary",
  },
  secondary: {
    iconBg: "bg-secondary/20",
    iconText: "text-secondary",
    glow: "shadow-[0_0_30px_hsl(188_85%_53%/0.15)]",
    border: "border-secondary/20 hover:border-secondary/40",
    valueBg: "text-secondary",
  },
  accent: {
    iconBg: "bg-accent/20",
    iconText: "text-accent",
    glow: "shadow-[0_0_30px_hsl(0_100%_71%/0.15)]",
    border: "border-accent/20 hover:border-accent/40",
    valueBg: "text-accent",
  },
};

const KpiCard = ({ icon: Icon, label, value, subtitle, color }: KpiCardProps) => {
  const c = colorMap[color];
  return (
    <div className={`glow-card p-6 transition-all duration-300 ${c.border} ${c.glow}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className={`mt-2 font-display text-3xl font-bold ${c.valueBg}`}>{value}</p>
          <p className="mt-1 font-body text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.iconBg}`}>
          <Icon className={`h-6 w-6 ${c.iconText}`} />
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
