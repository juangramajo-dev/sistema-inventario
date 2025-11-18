/**
 * Archivo: src/components/movements-chart.tsx
 *
 * Componente de cliente ("use client") para renderizar el gráfico.
 * Recibe los datos ya procesados desde el Server Component.
 */

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// Definimos el tipo de datos que esperamos
type ChartData = {
  date: string; // ej: "18/11"
  ENTRADA: number;
  SALIDA: number;
};

interface MovementsChartProps {
  data: ChartData[];
}

export function MovementsChart({ data }: MovementsChartProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Movimientos de los Últimos 7 Días</CardTitle>
        <CardDescription>
          Un resumen de las entradas y salidas de stock.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 'ResponsiveContainer' hace que el gráfico se adapte al tamaño de la Card */}
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`} // Formato simple
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "1px solid #ccc",
                borderRadius: "0.5rem",
              }}
            />
            <Legend />
            <Bar
              dataKey="ENTRADA"
              fill="#22c55e" // Verde
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="SALIDA"
              fill="#ef4444" // Rojo
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
