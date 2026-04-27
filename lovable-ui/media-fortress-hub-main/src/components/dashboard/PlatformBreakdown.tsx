import { motion } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, Tooltip } from "recharts";
import { platformBreakdown } from "@/lib/mock-data";

export function PlatformBreakdown() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={platformBreakdown} layout="vertical" margin={{ left: 20, right: 16, top: 8, bottom: 0 }}>
          <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis
            dataKey="platform"
            type="category"
            stroke="var(--color-muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={80}
          />
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
            {platformBreakdown.map((d, i) => (
              <Cell key={i} fill={`var(--color-chart-${(i % 5) + 1})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PlatformBreakdownAnimated() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
      <PlatformBreakdown />
    </motion.div>
  );
}
