"use client";

import dynamic from "next/dynamic";

interface ChartDataPoint {
  bulan: number;
  masuk: number;
  keluar: number;
}

interface MonthlyChartClientProps {
  data: ChartDataPoint[];
  tahun: number;
}

const MonthlyChart = dynamic(() => import("./monthly-chart").then((module) => module.MonthlyChart), {
  ssr: false,
});

export function MonthlyChartClient({ data, tahun }: MonthlyChartClientProps) {
  return <MonthlyChart data={data} tahun={tahun} />;
}
