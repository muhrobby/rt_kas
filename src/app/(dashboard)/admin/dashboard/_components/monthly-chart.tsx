"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BULAN_NAMES, formatRupiah } from "@/lib/utils";

interface ChartDataPoint {
  bulan: number;
  masuk: number;
  keluar: number;
}

interface MonthlyChartProps {
  data: ChartDataPoint[];
  tahun: number;
}

export function MonthlyChart({ data, tahun }: MonthlyChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    name: BULAN_NAMES[d.bulan - 1]?.slice(0, 3) ?? `B${d.bulan}`,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Grafik Kas Bulanan {tahun}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatRupiah(value),
                name === "masuk" ? "Pemasukan" : "Pengeluaran",
              ]}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="masuk" name="masuk" fill="var(--color-green-500, #22c55e)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="keluar" name="keluar" fill="var(--color-red-400, #f87171)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 flex items-center justify-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-500" />
            Pemasukan
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-400" />
            Pengeluaran
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
