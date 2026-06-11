import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import type { TrafficDataPoint } from '../../../shared/types';

interface TrafficChartProps {
  data: TrafficDataPoint[];
  bandwidthThreshold?: number;
}

export default function TrafficChart({
  data,
  bandwidthThreshold = 400,
}: TrafficChartProps) {
  const threshold = bandwidthThreshold * 0.8;

  return (
    <div className="w-full bg-cyber-bg2/50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-cyber-muted">24小时流量趋势</div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
            <span className="text-cyber-muted">上行</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7B61FF] shadow-[0_0_6px_#7B61FF]" />
            <span className="text-cyber-muted">下行</span>
          </div>
        </div>
      </div>
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="uplinkGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="downlinkGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7B61FF" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#7B61FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 229, 255, 0.08)" />
            <XAxis
              dataKey="time"
              stroke="#7A8BA3"
              tick={{ fontSize: 10, fill: '#7A8BA3' }}
              axisLine={{ stroke: 'rgba(0, 229, 255, 0.15)' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#7A8BA3"
              tick={{ fontSize: 10, fill: '#7A8BA3' }}
              axisLine={{ stroke: 'rgba(0, 229, 255, 0.15)' }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(15, 30, 54, 0.95)',
                border: '1px solid rgba(0, 229, 255, 0.3)',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#E6F4FF',
              }}
              labelStyle={{ color: '#7A8BA3', marginBottom: '4px' }}
              itemStyle={{ padding: '2px 0' }}
              formatter={(value: number, name: string) => [
                `${value} Mbps`,
                name === 'uplink' ? '上行流量' : '下行流量',
              ]}
            />
            <ReferenceLine
              y={threshold}
              stroke="#FFB020"
              strokeDasharray="5 5"
              strokeWidth={1}
              label={{
                value: '80%阈值',
                position: 'right',
                fill: '#FFB020',
                fontSize: 10,
              }}
            />
            <Area
              type="monotone"
              dataKey="downlink"
              stroke="#7B61FF"
              strokeWidth={2}
              fill="url(#downlinkGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#7B61FF', stroke: '#fff', strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="uplink"
              stroke="#00E5FF"
              strokeWidth={2}
              fill="url(#uplinkGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#00E5FF', stroke: '#fff', strokeWidth: 1 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
