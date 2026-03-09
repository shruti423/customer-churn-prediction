import { Link } from "react-router-dom";
import { Activity, Brain, Zap, BarChart3, Shield, TrendingUp } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <Brain className="h-6 w-6 text-primary" />
            <div className="absolute inset-0 rounded-lg animate-pulse-glow bg-primary/10" />
          </div>
          <span className="font-display text-sm font-bold tracking-wider text-foreground">
            CHURN<span className="text-primary">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-body text-muted-foreground transition-colors hover:text-primary"
          >
            <Activity className="h-4 w-4" />
            Home
          </Link>
          <Link
            to="/predict"
            className="flex items-center gap-2 text-sm font-body text-muted-foreground transition-colors hover:text-primary"
          >
            <Zap className="h-4 w-4" />
            Predict
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm font-body text-muted-foreground transition-colors hover:text-primary"
          >
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
