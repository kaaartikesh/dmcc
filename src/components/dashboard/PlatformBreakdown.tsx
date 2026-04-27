import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PlatformPoint } from "@/lib/frontend-data";

export function PlatformBreakdown({ data }: { data: PlatformPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 16, top: 8, bottom: 0 }}>
          <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis dataKey="platform" type="category" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={90} />
          <Tooltip
            cursor={{ fill: "var(--color-secondary)" }}
            contentStyle={{
              background: "var(--color-popover)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} animationDuration={900}>
            {data.map((_, index) => (
              <Cell key={index} fill={`var(--color-chart-${(index % 5) + 1})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
