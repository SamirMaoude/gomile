"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DataItem = {
  name: string;
  value: number;
};

type SimpleBarChartProps = {
  data: DataItem[];
  valueLabel?: string;
};

const SimpleBarChart = ({
  data,
  valueLabel = "Livraisons",
}: SimpleBarChartProps) => {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "700px",
        height: "min(70vh, 430px)",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 0,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} width={40} />
          <Tooltip formatter={(value) => [value, valueLabel]} />
          <Legend />
          <Bar
            dataKey="value"
            name={valueLabel}
            fill="#2563eb"
            activeBar={{ fill: "#16a34a", stroke: "#166534" }}
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SimpleBarChart;
