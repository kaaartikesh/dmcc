"use client";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { weeklyDetections, platformBreakdown, monthlyTrend } from "@/lib/mockData";
import { CHART_COLORS } from "@/lib/constants";
import { motion } from "framer-motion";

function ChartTooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-xl px-3 py-2 bg-[#14142a] border border-[rgba(255,255,255,0.1)] shadow-lg">
      <p className="text-xs text-[#8888a0] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-medium" style={{ color: p.color }}>
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export function DetectionTrendChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="h-full flex flex-col"
    >
      <h3 className="text-sm font-semibold mb-4">Detection Trend</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyTrend} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <defs>
              <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.secondary} stopOpacity={0.3} />
                <stop offset="100%" stopColor={CHART_COLORS.secondary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#555570", fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#555570", fontSize: 11 }} />
            <Tooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="detections" stroke={CHART_COLORS.primary} fill="url(#gradBlue)" strokeWidth={2} name="Detections" />
            <Area type="monotone" dataKey="resolved" stroke={CHART_COLORS.secondary} fill="url(#gradPurple)" strokeWidth={2} name="Resolved" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export function WeeklyBarChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="h-full flex flex-col"
    >
      <h3 className="text-sm font-semibold mb-4">This Week</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyDetections} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#555570", fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#555570", fontSize: 11 }} />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar dataKey="detections" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} name="Detections" />
            <Bar dataKey="takedowns" fill={CHART_COLORS.tertiary} radius={[4, 4, 0, 0]} name="Takedowns" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export function PlatformPieChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="h-full flex flex-col"
    >
      <h3 className="text-sm font-semibold mb-4">By Platform</h3>
      <div className="flex-1 min-h-0 flex items-center">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={platformBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">
              {platformBreakdown.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {platformBreakdown.map((p) => (
          <div key={p.name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-[10px] text-[#8888a0]">{p.name} ({p.value}%)</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
