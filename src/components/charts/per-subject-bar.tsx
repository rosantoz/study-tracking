"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@/components/theme-provider";

type Datum = { subjectName: string; minutes: number };

export function PerSubjectBar({ data }: { data: Datum[] }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const grid = isDark ? "#1e293b" : "#e2e8f0";
  const axis = isDark ? "#94a3b8" : "#64748b";
  const cursor = isDark ? "#1e293b" : "#f1f5f9";
  const bar = isDark ? "#818cf8" : "#4f46e5";
  const tooltipBg = isDark ? "#0f172a" : "#ffffff";
  const tooltipText = isDark ? "#f8fafc" : "#0f172a";

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted">
        No data yet — log a session to see it here.
      </div>
    );
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
          <XAxis dataKey="subjectName" fontSize={12} stroke={axis} />
          <YAxis fontSize={12} stroke={axis} />
          <Tooltip
            cursor={{ fill: cursor }}
            formatter={(value) => [`${Number(value)} min`, "Minutes"]}
            contentStyle={{
              borderRadius: 8,
              border: `1px solid ${grid}`,
              backgroundColor: tooltipBg,
              color: tooltipText,
            }}
            labelStyle={{ color: tooltipText }}
          />
          <Bar dataKey="minutes" fill={bar} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
