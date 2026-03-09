import { useMemo, useState } from "react";

interface Customer {
  tenure: number;
  contract: string;
  willChurn: boolean;
  churnProbability: number;
}

interface ChurnHeatmapProps {
  customers: Customer[];
}

const tenureBuckets = ["0-6", "7-12", "13-24", "25-36", "37-48", "49-60", "60+"];
const contracts = ["Month-to-month", "One year", "Two year"];

const ChurnHeatmap = ({ customers }: ChurnHeatmapProps) => {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number; count: number; total: number } | null>(null);

  const heatmapData = useMemo(() => {
    const grid: number[][] = [];
    const totals: number[][] = [];

    contracts.forEach((contract, ci) => {
      grid[ci] = [];
      totals[ci] = [];
      tenureBuckets.forEach((bucket, bi) => {
        const [min, max] = bucket.includes("+")
          ? [60, 999]
          : bucket.split("-").map(Number);
        const matching = customers.filter(
          (c) =>
            c.contract === contract &&
            c.tenure >= min &&
            c.tenure <= max
        );
        const churners = matching.filter((c) => c.willChurn).length;
        grid[ci][bi] = churners;
        totals[ci][bi] = matching.length;
      });
    });

    return { grid, totals };
  }, [customers]);

  const maxChurn = Math.max(...heatmapData.grid.flat());

  const getColor = (count: number) => {
    const intensity = maxChurn > 0 ? count / maxChurn : 0;
    if (intensity > 0.75) return "bg-primary/80";
    if (intensity > 0.5) return "bg-primary/50";
    if (intensity > 0.25) return "bg-primary/30";
    if (intensity > 0) return "bg-primary/15";
    return "bg-muted/30";
  };

  return (
    <div className="relative">
      {/* Column labels */}
      <div className="mb-2 ml-28 grid grid-cols-7 gap-1">
        {tenureBuckets.map((b) => (
          <div key={b} className="text-center font-body text-[10px] text-muted-foreground">{b}</div>
        ))}
      </div>

      {/* Rows */}
      {contracts.map((contract, ci) => (
        <div key={contract} className="mb-1 flex items-center gap-2">
          <div className="w-28 text-right font-body text-xs text-muted-foreground truncate">{contract}</div>
          <div className="grid flex-1 grid-cols-7 gap-1">
            {tenureBuckets.map((_, bi) => (
              <div
                key={bi}
                className={`aspect-square rounded-sm transition-all duration-200 cursor-pointer hover:ring-1 hover:ring-primary/50 ${getColor(heatmapData.grid[ci][bi])}`}
                onMouseEnter={() => setHoveredCell({ row: ci, col: bi, count: heatmapData.grid[ci][bi], total: heatmapData.totals[ci][bi] })}
                onMouseLeave={() => setHoveredCell(null)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Tooltip */}
      {hoveredCell && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-lg border border-border bg-card px-3 py-1.5 font-body text-xs text-foreground shadow-lg">
          {hoveredCell.count} churners / {hoveredCell.total} total
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-1">
        <span className="mr-1 font-body text-[10px] text-muted-foreground">Less</span>
        {["bg-muted/30", "bg-primary/15", "bg-primary/30", "bg-primary/50", "bg-primary/80"].map((c, i) => (
          <div key={i} className={`h-3 w-3 rounded-sm ${c}`} />
        ))}
        <span className="ml-1 font-body text-[10px] text-muted-foreground">More</span>
      </div>
    </div>
  );
};

export default ChurnHeatmap;
