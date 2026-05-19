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

type Datum = { subjectName: string; minutes: number };

export function PerSubjectBar({ data }: { data: Datum[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        No data yet — log a session to see it here.
      </div>
    );
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="subjectName" fontSize={12} stroke="#64748b" />
          <YAxis fontSize={12} stroke="#64748b" />
          <Tooltip
            cursor={{ fill: "#f1f5f9" }}
            formatter={(value) => [`${Number(value)} min`, "Minutes"]}
            contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
          />
          <Bar dataKey="minutes" fill="#4f46e5" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
