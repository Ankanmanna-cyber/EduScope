import { PieChart, Pie, Cell } from "recharts";

const COLORS = {
  "Highly Engaged":      "#22c55e",
  "Moderately Engaged":  "#eab308",
  "Low Engagement":      "#f97316",
  "Disengaged":          "#ef4444"
};

export default function EngagementGauge({ score, label }) {
  const color = COLORS[label] || "#6b7280";
  const data  = [{ value: score }, { value: 100 - score }];

  return (
    <div style={{ textAlign: "center" }}>
      <PieChart width={200} height={120}>
        <Pie
          data={data}
          cx={100} cy={100}
          startAngle={180} endAngle={0}
          innerRadius={60} outerRadius={90}
          dataKey="value"
        >
          <Cell fill={color} />
          <Cell fill="#e5e7eb" />
        </Pie>
      </PieChart>
      <div style={{ fontSize: "2rem", fontWeight: "bold", color }}>
        {score}
      </div>
      <div style={{ color: "#374151" }}>{label}</div>
    </div>
  );
}