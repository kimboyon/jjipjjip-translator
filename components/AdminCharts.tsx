"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export function AdminCharts({
  views,
  posts
}: {
  views: { day: string; count: number }[];
  posts: { category: string; count: number }[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="admin-panel">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Visitor Flow</h2>
          <span className="text-xs text-ink/50">Last 7 days</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={views}>
              <defs>
                <linearGradient id="views" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#541f22" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#541f22" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#eee8df" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#541f22" fill="url(#views)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="admin-panel">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Posts by Category</h2>
          <span className="text-xs text-ink/50">Community</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={posts}>
              <CartesianGrid stroke="#eee8df" vertical={false} />
              <XAxis dataKey="category" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} />
              <Tooltip />
              <Bar dataKey="count" fill="#7d3a3c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
