import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, BarChart3, Brain, Sparkles, Activity, TrendingDown, Shield, ArrowRight } from "lucide-react";

// Generate stars
const stars = Array.from({ length: 25 }).map((_, i) => ({
  id: i,
  x: (i * 29 + 7) % 95 + 2,
  y: (i * 37 + 13) % 85 + 5,
  size: 1.5 + (i % 3),
  delay: i * 0.3,
  duration: 3 + (i % 4),
}));

// A few glowing dots
const glowingDots = [
  { x: 15, y: 20, color: 'primary' },
  { x: 78, y: 35, color: 'secondary' },
  { x: 45, y: 70, color: 'accent' },
  { x: 88, y: 75, color: 'primary' },
];

const HomePage = () => {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        {/* Grid background */}
        <div className="absolute inset-0 grid-bg opacity-50" />

        {/* Stars SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          {stars.map((star) => (
            <circle
              key={star.id}
              cx={`${star.x}%`}
              cy={`${star.y}%`}
              r={star.size}
              fill="hsl(var(--primary))"
              opacity="0.4"
              className="animate-twinkle"
              style={{
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
              }}
            />
          ))}
        </svg>

        {/* Glowing dots */}
        {glowingDots.map((dot, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse-glow"
            style={{
              width: '8px',
              height: '8px',
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              background: `hsl(var(--${dot.color}))`,
              boxShadow: `0 0 12px 4px hsl(var(--${dot.color}) / 0.5), 0 0 24px 8px hsl(var(--${dot.color}) / 0.2)`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}

        {/* Floating orbs */}
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-secondary/5 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-3xl animate-pulse-glow" />

        <div className="container relative mx-auto px-4 text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-body text-sm text-primary">Powered by AI</span>
          </div>

          {/* Title */}
          <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl leading-tight overflow-visible">
            <span className="block">AI Customer Churn</span>
            <span className="block bg-gradient-to-r from-neon-lavender via-neon-cyan to-neon-coral bg-clip-text text-transparent pb-2 leading-relaxed">
              Intelligence
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-4 max-w-2xl font-body text-lg text-muted-foreground md:text-xl">
            Predict customer churn before it happens using machine learning insights.
          </p>

          {/* Stats bar */}
          <div className="mx-auto mb-16 flex max-w-xl items-center justify-center gap-8">
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-secondary">80%</p>
              <p className="font-body text-xs text-muted-foreground">High Catch-Rate</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-primary">7K+</p>
              <p className="font-body text-xs text-muted-foreground">Predictions</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-accent">24/7</p>
              <p className="font-body text-xs text-muted-foreground">Monitoring</p>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            {/* Card 1 */}
            <div className="group relative rounded-2xl border border-primary/20 bg-card/80 p-8 backdrop-blur transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_40px_hsl(265_100%_76%/0.15)]">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20 shadow-[0_0_20px_hsl(265_100%_76%/0.2)]">
                  <Zap className="h-7 w-7 text-primary" />
                </div>
                <h2 className="mb-3 font-display text-xl font-bold text-foreground">
                  Individual Churn Predictor
                </h2>
                <p className="mb-6 font-body text-muted-foreground">
                  Predict churn probability for a single telecom customer with detailed analysis.
                </p>
                <Link to="/predict">
                  <Button variant="neon" size="lg" className="w-full">
                    Start Prediction <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative rounded-2xl border border-secondary/20 bg-card/80 p-8 backdrop-blur transition-all duration-500 hover:border-secondary/50 hover:shadow-[0_0_40px_hsl(188_85%_53%/0.15)]">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-secondary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/20 shadow-[0_0_20px_hsl(188_85%_53%/0.2)]">
                  <BarChart3 className="h-7 w-7 text-secondary" />
                </div>
                <h2 className="mb-3 font-display text-xl font-bold text-foreground">
                  Bulk CSV Analysis
                </h2>
                <p className="mb-6 font-body text-muted-foreground">
                  Upload a dataset to analyze churn patterns across many customers at once.
                </p>
                <Link to="/dashboard">
                  <Button variant="neon-secondary" size="lg" className="w-full">
                    Upload CSV <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom features strip */}
      <section className="border-t border-border/50 bg-card/30 py-12">
        <div className="container mx-auto grid grid-cols-2 gap-6 px-4 md:grid-cols-4">
          {[
            { icon: Brain, label: "ML Powered", color: "text-primary" },
            { icon: TrendingDown, label: "Churn Detection", color: "text-accent" },
            { icon: Shield, label: "Data Secure", color: "text-secondary" },
            { icon: Activity, label: "Real-time", color: "text-primary" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <item.icon className={`h-5 w-5 ${item.color}`} />
              <span className="font-heading text-lg font-semibold text-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
