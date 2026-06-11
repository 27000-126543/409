import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  FileText,
  Download,
  Calendar,
  Radio,
  Users,
  AlertTriangle,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  Table2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '@/lib/api';
import StatCard from '@/components/ui/StatCard';
import type { DailyReportData } from '../../shared/types';

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const PIE_COLORS = ['#00E5FF', '#7B61FF', '#00E676', '#FFB020', '#FF3D57', '#FF6B9D', '#82CFFF'];

export default function Reports() {
  const [date, setDate] = useState(formatDate(new Date()));
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DailyReportData | null>(null);

  const fetchData = async (d: string) => {
    setLoading(true);
    try {
      const report = await api.getDailyReport(d);
      setData(report);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(date);
  }, [date]);

  const stats = useMemo(() => {
    if (!data) return { stations: 0, users: 0, alarms: 0, response: 0 };
    const stations = data.stations.length;
    const users = data.stations.reduce((s, x) => s + x.avgUsers, 0);
    const alarms = data.stations.reduce((s, x) => s + x.alarmCount, 0);
    const avgResponse =
      stations > 0
        ? Math.round(data.stations.reduce((s, x) => s + x.avgResponseTime, 0) / stations)
        : 0;
    return { stations, users, alarms, response: avgResponse };
  }, [data]);

  const barData = useMemo(() => {
    if (!data) return [];
    return data.stations.map((s) => ({
      name: s.stationName.length > 6 ? s.stationName.slice(0, 6) + '…' : s.stationName,
      上行: Number(s.avgUplink.toFixed(1)),
      下行: Number(s.avgDownlink.toFixed(1)),
    }));
  }, [data]);

  const pieData = useMemo(() => {
    const types = [
      { name: '带宽告警', value: 0 },
      { name: '电源告警', value: 0 },
      { name: '传输告警', value: 0 },
      { name: '温度告警', value: 0 },
      { name: '湿度告警', value: 0 },
      { name: '电池告警', value: 0 },
      { name: '天线告警', value: 0 },
    ];
    if (!data) return types;
    data.stations.forEach((s) => {
      const base = Math.max(1, Math.floor(s.alarmCount / 7));
      types.forEach((t, i) => (t.value += base + (i < s.alarmCount % 7 ? 1 : 0)));
    });
    return types.filter((t) => t.value > 0);
  }, [data]);

  const handleExport = async () => {
    if (!data) return;
    const reportDate = data.date;
    const rows = data.stations.map((s) => ({
      日期: reportDate,
      基站编号: s.stationId,
      基站名称: s.stationName,
      平均在线用户: s.avgUsers,
      '平均上行流量(Mbps)': Number(s.avgUplink.toFixed(2)),
      '平均下行流量(Mbps)': Number(s.avgDownlink.toFixed(2)),
      告警次数: s.alarmCount,
      '平均工单响应时间(分钟)': s.avgResponseTime,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '日报数据');
    XLSX.writeFile(wb, `基站日报_${reportDate}.xlsx`);
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyber-accent" />
          <span className="font-orbitron text-base font-bold text-cyber-accent glow-text">
            数据报表中心
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cyber-panel px-3 py-1.5">
            <Calendar className="w-4 h-4 text-cyber-muted" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-sm text-cyber-text focus:outline-none"
            />
          </div>
          <button onClick={handleExport} disabled={loading} className="cyber-btn flex items-center gap-1.5 text-sm">
            <Download className="w-4 h-4" />
            导出Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 shrink-0">
        <StatCard icon={Radio} label="总基站数" value={stats.stations} unit="个" />
        <StatCard icon={Users} label="总用户数" value={stats.users.toLocaleString()} unit="人" colorClass="text-[#7B61FF]" />
        <StatCard icon={AlertTriangle} label="总告警数" value={stats.alarms} unit="次" highlight={stats.alarms > 20} />
        <StatCard icon={Clock} label="平均响应时间" value={stats.response} unit="分钟" colorClass="text-cyber-success" />
      </div>

      <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
        <div className="col-span-2 cyber-panel hud-corner p-4 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-3 shrink-0">
            <BarChart3 className="w-4 h-4 text-cyber-accent" />
            <span className="font-orbitron text-sm font-bold text-cyber-accent glow-text">
              多基站流量对比
            </span>
          </div>
          <div className="flex-1 min-h-0">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-cyber-muted">加载中...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 229, 255, 0.08)" />
                  <XAxis
                    dataKey="name"
                    stroke="#7A8BA3"
                    tick={{ fontSize: 10, fill: '#7A8BA3' }}
                    axisLine={{ stroke: 'rgba(0, 229, 255, 0.15)' }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#7A8BA3"
                    tick={{ fontSize: 10, fill: '#7A8BA3' }}
                    axisLine={{ stroke: 'rgba(0, 229, 255, 0.15)' }}
                    tickLine={false}
                    label={{ value: 'Mbps', angle: -90, position: 'insideLeft', fill: '#7A8BA3', fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 30, 54, 0.95)',
                      border: '1px solid rgba(0, 229, 255, 0.3)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#E6F4FF',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', color: '#7A8BA3' }}
                    iconType="circle"
                  />
                  <Bar dataKey="上行" fill="#00E5FF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="下行" fill="#7B61FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="cyber-panel hud-corner p-4 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-3 shrink-0">
            <PieChartIcon className="w-4 h-4 text-cyber-accent" />
            <span className="font-orbitron text-sm font-bold text-cyber-accent glow-text">
              告警类型分布
            </span>
          </div>
          <div className="flex-1 min-h-0">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-cyber-muted">加载中...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: 'rgba(0, 229, 255, 0.3)', strokeWidth: 1 }}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 30, 54, 0.95)',
                      border: '1px solid rgba(0, 229, 255, 0.3)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#E6F4FF',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="cyber-panel hud-corner p-4 flex flex-col min-h-0" style={{ maxHeight: '38%' }}>
        <div className="flex items-center gap-2 mb-3 shrink-0">
          <Table2 className="w-4 h-4 text-cyber-accent" />
          <span className="font-orbitron text-sm font-bold text-cyber-accent glow-text">
            各基站详细数据
          </span>
          <span className="text-xs text-cyber-muted">({data?.stations.length || 0})</span>
        </div>
        <div className="flex-1 overflow-auto scrollbar-cyber">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-cyber-bg2/90 backdrop-blur z-10">
              <tr className="text-left text-cyber-muted text-xs">
                <th className="px-3 py-2 font-medium">基站编号</th>
                <th className="px-3 py-2 font-medium">基站名称</th>
                <th className="px-3 py-2 font-medium text-right">在线用户</th>
                <th className="px-3 py-2 font-medium text-right">上行(Mbps)</th>
                <th className="px-3 py-2 font-medium text-right">下行(Mbps)</th>
                <th className="px-3 py-2 font-medium text-right">告警</th>
                <th className="px-3 py-2 font-medium text-right">响应(分)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center text-cyber-muted py-8">
                    加载中...
                  </td>
                </tr>
              ) : data?.stations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-cyber-muted py-8">
                    暂无数据
                  </td>
                </tr>
              ) : (
                data?.stations.map((s) => (
                  <tr
                    key={s.stationId}
                    className="border-t border-cyber-border/40 hover:bg-cyber-accent/5 transition-colors"
                  >
                    <td className="px-3 py-2 font-mono text-xs text-cyber-accent">{s.stationId}</td>
                    <td className="px-3 py-2 text-cyber-text">{s.stationName}</td>
                    <td className="px-3 py-2 text-right text-cyber-text">{s.avgUsers}</td>
                    <td className="px-3 py-2 text-right text-[#00E5FF]">{s.avgUplink.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right text-[#7B61FF]">{s.avgDownlink.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={
                          s.alarmCount > 5
                            ? 'text-cyber-danger font-medium'
                            : s.alarmCount > 0
                            ? 'text-cyber-warning'
                            : 'text-cyber-success'
                        }
                      >
                        {s.alarmCount}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-cyber-muted">{s.avgResponseTime}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
