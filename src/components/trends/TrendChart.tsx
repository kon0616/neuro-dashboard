import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { DayRecord } from '../../types/day';
import { formatDate } from '../../lib/utils';

interface TrendChartProps {
  title: string;
  records: DayRecord[];
  getValue: (record: DayRecord) => number;
  max?: number;
  color: string;
  unit?: string;
  height?: number;
}

/**
 * 单指标趋势折线图（v2：接受 DayRecord[]）
 */
export function TrendChart({
  title,
  records,
  getValue,
  max,
  color,
  unit = '',
  height = 160,
}: TrendChartProps) {
  const data = records.map((r) => ({
    date: r.date,
    label: formatDate(r.date),
    value: getValue(r),
  }));

  return (
    <div className="rounded-xl border border-panel-border bg-panel-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-xs font-medium text-slate-400">{title}</h4>
        <span className="font-mono text-[10px] text-slate-600">
          {records.length} 天
        </span>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1e2235"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#64748b' }}
            tickLine={false}
            axisLine={{ stroke: '#2a2d3e' }}
          />
          <YAxis
            domain={max ? [0, max] : ['auto', 'auto']}
            tick={{ fontSize: 10, fill: '#64748b' }}
            tickLine={false}
            axisLine={false}
            width={30}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1d2e',
              border: '1px solid #2a2d3e',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#e2e8f0',
            }}
            formatter={(value: number) => [`${value}${unit}`, title]}
            labelFormatter={(label) => `${label}`}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={{ r: 2, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
