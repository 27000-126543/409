import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  FileText,
  Download,
  Calendar,
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
  Table2,
  BarChart3,
  Zap,
  CheckCircle,
  ArrowRight,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { api } from '@/lib/api';
import StatCard from '@/components/ui/StatCard';
import type { DailyReportData, TrendReportData, StationType, EfficiencyReportData } from '../../shared/types';

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const STATION_TYPES: { value: StationType; label: string; color: string }[] = [
  { value: 'macro', label: '宏基站', color: 'text-[#00E5FF]' },
  { value: 'micro', label: '微基站', color: 'text-[#00E5FF]' },
  { value: 'indoor', label: '室内分布', color: 'text-[#7B61FF]' },
  { value: 'core', label: '核心机房', color: 'text-[#FFD700]' },
];

const ALARM_TYPES: { value: string; label: string }[] = [
  { value: 'bandwidth', label: '带宽' },
  { value: 'power', label: '供电' },
  { value: 'transmission', label: '传输' },
  { value: 'temperature', label: '温度' },
  { value: 'humidity', label: '湿度' },
  { value: 'battery', label: '电池' },
  { value: 'antenna', label: '天线' },
];

const getStationTypeLabel = (type: StationType): string => {
  return STATION_TYPES.find((t) => t.value === type)?.label ?? type;
};

const getStationTypeColor = (type: string): string => {
  return STATION_TYPES.find((t) => t.value === type)?.color ?? 'text-cyber-text';
};

const getAlarmTypeLabel = (type: string): string => {
  const found = ALARM_TYPES.find((t) => t.value === type);
  return found ? found.label + '告警' : type;
};

const addDays = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const chartTooltipStyle = {
  background: 'rgba(15, 30, 54, 0.95)',
  border: '1px solid rgba(0, 229, 255, 0.3)',
  borderRadius: '6px',
  fontSize: '12px',
  color: '#E6F4FF',
};

const axisStroke = '#7A8BA3';
const axisTickStyle = { fontSize: 10, fill: axisStroke };
const axisLineStyle = { stroke: 'rgba(0, 229, 255, 0.15)' };

type TabKey = 'daily' | 'trend' | 'efficiency';

export default function Reports() {
  const [activeTab, setActiveTab] = useState<TabKey>('daily');
  const [selectedTypes, setSelectedTypes] = useState<StationType[]>([
    'macro',
    'micro',
    'indoor',
    'core',
  ]);
  const [selectedAlarmTypes, setSelectedAlarmTypes] = useState<string[]>(
    ALARM_TYPES.map((t) => t.value)
  );

  const [date, setDate] = useState(formatDate(new Date()));
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailyData, setDailyData] = useState<DailyReportData | null>(null);

  const today = new Date();
  const [startDate, setStartDate] = useState(formatDate(addDays(today, -6)));
  const [endDate, setEndDate] = useState(formatDate(today));
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendData, setTrendData] = useState<TrendReportData | null>(null);

  const [efficiencyLoading, setEfficiencyLoading] = useState(false);
  const [efficiencyError, setEfficiencyError] = useState<string | null>(null);
  const [efficiencyData, setEfficiencyData] = useState<EfficiencyReportData | null>(null);

  const toggleType = (type: StationType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleAlarmType = (type: string) => {
    setSelectedAlarmTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const fetchDaily = async (d: string, types: StationType[]) => {
    setDailyLoading(true);
    try {
      const report = await api.getDailyReport(d, types.length > 0 ? types : undefined);
      setDailyData(report);
    } catch (e) {
      console.error(e);
    } finally {
      setDailyLoading(false);
    }
  };

  const fetchTrend = async (start: string, end: string, types: StationType[]) => {
    setTrendLoading(true);
    try {
      const report = await api.getTrendReport(start, end, types.length > 0 ? types : undefined);
      setTrendData(report);
    } catch (e) {
      console.error(e);
    } finally {
      setTrendLoading(false);
    }
  };

  const fetchEfficiency = async (
    start: string,
    end: string,
    stationTypes: StationType[],
    alarmTypes: string[]
  ) => {
    setEfficiencyLoading(true);
    setEfficiencyError(null);
    try {
      const report = await api.getEfficiencyReport(
        start,
        end,
        stationTypes.length > 0 ? stationTypes : undefined,
        alarmTypes.length > 0 ? alarmTypes : undefined
      );
      setEfficiencyData(report);
    } catch (e) {
      console.error(e);
      setEfficiencyError('获取效率分析数据失败');
    } finally {
      setEfficiencyLoading(false);
    }
  };

  useEffect(() => {
    fetchDaily(date, selectedTypes);
  }, [date]);

  useEffect(() => {
    fetchTrend(startDate, endDate, selectedTypes);
  }, [startDate, endDate]);

  useEffect(() => {
    if (activeTab === 'efficiency') {
      fetchEfficiency(startDate, endDate, selectedTypes, selectedAlarmTypes);
    }
  }, [activeTab]);

  const handleDailyQuery = () => {
    fetchDaily(date, selectedTypes);
  };

  const handleTrendQuery = () => {
    fetchTrend(startDate, endDate, selectedTypes);
  };

  const handleEfficiencyQuery = () => {
    fetchEfficiency(startDate, endDate, selectedTypes, selectedAlarmTypes);
  };

  const filteredStations = useMemo(() => {
    if (!dailyData) return [];
    if (selectedTypes.length === 0) return dailyData.stations;
    return dailyData.stations.filter((s) => selectedTypes.includes(s.stationType));
  }, [dailyData, selectedTypes]);

  const dailyStats = useMemo(() => {
    if (dailyData?.summary) {
      return {
        avgUsers: dailyData.summary.totalAvgUsers,
        avgTraffic: dailyData.summary.totalAvgUplink + dailyData.summary.totalAvgDownlink,
        alarmCount: dailyData.summary.totalAlarmCount,
        avgResponseTime: dailyData.summary.avgResponseTime,
      };
    }
    const stations = filteredStations;
    const count = stations.length || 1;
    const avgUsers = Math.round(stations.reduce((s, x) => s + x.avgUsers, 0) / count);
    const avgTraffic = Number(
      (stations.reduce((s, x) => s + x.avgUplink + x.avgDownlink, 0) / count).toFixed(1)
    );
    const alarmCount = stations.reduce((s, x) => s + x.alarmCount, 0);
    const avgResponseTime = Math.round(
      stations.reduce((s, x) => s + x.avgResponseTime, 0) / count
    );
    return { avgUsers, avgTraffic, alarmCount, avgResponseTime };
  }, [dailyData, filteredStations]);

  const handleDailyExport = () => {
    if (!dailyData) return;
    const reportDate = dailyData.date;
    const rows = filteredStations.map((s) => ({
      日期: reportDate,
      基站编号: s.stationId,
      基站名称: s.stationName,
      基站类型: getStationTypeLabel(s.stationType),
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

  const handleTrendExport = () => {
    if (!trendData) return;
    const rows = trendData.points.map((p) => ({
      日期: p.date,
      平均用户数: p.avgUsers,
      '平均上行流量(Mbps)': Number(p.avgUplink.toFixed(2)),
      '平均下行流量(Mbps)': Number(p.avgDownlink.toFixed(2)),
      告警次数: p.alarmCount,
      '平均工单响应时间(分钟)': p.avgResponseTime,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '趋势汇总');
    XLSX.writeFile(wb, `趋势对比_${trendData.startDate}_${trendData.endDate}.xlsx`);
  };

  const handleEfficiencyExport = () => {
    if (!efficiencyData) return;
    const wb = XLSX.utils.book_new();

    const stationTypeRows = Object.entries(efficiencyData.byStationType).map(([type, data]) => ({
      '基站类型': getStationTypeLabel(type as StationType),
      '工单数量': data.totalOrders,
      '平均派单耗时(分钟)': Number(data.avgDispatchMinutes.toFixed(1)),
      '平均到达耗时(分钟)': Number(data.avgArrivalMinutes.toFixed(1)),
      '平均完成耗时(分钟)': Number(data.avgCompleteMinutes.toFixed(1)),
      '超时升级率': `${(data.escalateRate * 100).toFixed(1)}%`,
    }));
    const ws1 = XLSX.utils.json_to_sheet(stationTypeRows);
    XLSX.utils.book_append_sheet(wb, ws1, '按基站类型统计');

    const alarmTypeRows = Object.entries(efficiencyData.byAlarmType).map(([type, data]) => ({
      '告警类型': getAlarmTypeLabel(type),
      '工单数量': data.totalOrders,
      '平均派单耗时(分钟)': Number(data.avgDispatchMinutes.toFixed(1)),
      '平均到达耗时(分钟)': Number(data.avgArrivalMinutes.toFixed(1)),
      '平均完成耗时(分钟)': Number(data.avgCompleteMinutes.toFixed(1)),
      '超时升级率': `${(data.escalateRate * 100).toFixed(1)}%`,
    }));
    const ws2 = XLSX.utils.json_to_sheet(alarmTypeRows);
    XLSX.utils.book_append_sheet(wb, ws2, '按告警类型统计');

    XLSX.writeFile(wb, `闭环效率分析_${efficiencyData.startDate}_${efficiencyData.endDate}.xlsx`);
  };

  const typeFilter = (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs text-cyber-muted">类型筛选：</span>
      {STATION_TYPES.map((t) => {
        const checked = selectedTypes.includes(t.value);
        return (
          <label
            key={t.value}
            className={`cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs transition-all ${
              checked
                ? 'border-cyber-accent bg-cyber-accent/10 text-cyber-accent shadow-[0_0_8px_rgba(0,229,255,0.3)]'
                : 'border-cyber-border/40 text-cyber-muted hover:border-cyber-muted/60'
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggleType(t.value)}
              className="sr-only"
            />
            <span
              className={`w-3.5 h-3.5 flex items-center justify-center rounded-sm border ${
                checked
                  ? 'bg-cyber-accent border-cyber-accent'
                  : 'bg-transparent border-cyber-muted/50'
              }`}
            >
              {checked && (
                <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-cyber-bg" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M2 6l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            {t.label}
          </label>
        );
      })}
    </div>
  );

  const alarmTypeFilter = (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs text-cyber-muted">告警类型：</span>
      {ALARM_TYPES.map((t) => {
        const checked = selectedAlarmTypes.includes(t.value);
        return (
          <label
            key={t.value}
            className={`cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs transition-all ${
              checked
                ? 'border-cyber-accent bg-cyber-accent/10 text-cyber-accent shadow-[0_0_8px_rgba(0,229,255,0.3)]'
                : 'border-cyber-border/40 text-cyber-muted hover:border-cyber-muted/60'
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggleAlarmType(t.value)}
              className="sr-only"
            />
            <span
              className={`w-3.5 h-3.5 flex items-center justify-center rounded-sm border ${
                checked
                  ? 'bg-cyber-accent border-cyber-accent'
                  : 'bg-transparent border-cyber-muted/50'
              }`}
            >
              {checked && (
                <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-cyber-bg" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M2 6l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            {t.label}
          </label>
        );
      })}
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 overflow-hidden">
      <div className="flex items-start justify-between shrink-0 gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyber-accent" />
            <span className="font-orbitron text-base font-bold text-cyber-accent glow-text">
              数据报表中心
            </span>
          </div>
          <div className="flex cyber-panel p-1 rounded-md">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'daily'
                  ? 'bg-cyber-accent/15 text-cyber-accent glow-text shadow-[0_0_10px_rgba(0,229,255,0.25)] border border-cyber-accent/40'
                  : 'text-cyber-muted hover:text-cyber-text'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              日报
            </button>
            <button
              onClick={() => setActiveTab('trend')}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'trend'
                  ? 'bg-cyber-accent/15 text-cyber-accent glow-text shadow-[0_0_10px_rgba(0,229,255,0.25)] border border-cyber-accent/40'
                  : 'text-cyber-muted hover:text-cyber-text'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              趋势对比
            </button>
            <button
              onClick={() => setActiveTab('efficiency')}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'efficiency'
                  ? 'bg-cyber-accent/15 text-cyber-accent glow-text shadow-[0_0_10px_rgba(0,229,255,0.25)] border border-cyber-accent/40'
                  : 'text-cyber-muted hover:text-cyber-text'
              }`}
            >
              <Activity className="w-4 h-4" />
              闭环效率
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          {typeFilter}
          {activeTab === 'efficiency' && alarmTypeFilter}
        </div>
      </div>

      {activeTab === 'daily' && (
        <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden">
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="flex items-center gap-2 cyber-panel px-3 py-1.5">
              <Calendar className="w-4 h-4 text-cyber-muted" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-sm text-cyber-text focus:outline-none"
              />
            </div>
            <button onClick={handleDailyQuery} disabled={dailyLoading} className="cyber-btn flex items-center gap-1.5 text-sm">
              查询
            </button>
            <div className="flex-1" />
            <button onClick={handleDailyExport} disabled={dailyLoading} className="cyber-btn flex items-center gap-1.5 text-sm">
              <Download className="w-4 h-4" />
              导出Excel
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 shrink-0">
            <StatCard
              icon={Users}
              label="平均用户数"
              value={dailyStats.avgUsers.toLocaleString()}
              unit="人"
            />
            <StatCard
              icon={TrendingUp}
              label="平均流量"
              value={dailyStats.avgTraffic}
              unit="Mbps"
              colorClass="text-[#7B61FF]"
            />
            <StatCard
              icon={AlertTriangle}
              label="告警次数"
              value={dailyStats.alarmCount}
              unit="次"
              highlight={dailyStats.alarmCount > 20}
            />
            <StatCard
              icon={Clock}
              label="平均响应时间"
              value={dailyStats.avgResponseTime}
              unit="分钟"
              colorClass="text-cyber-success"
            />
          </div>

          <div className="cyber-panel hud-corner p-4 flex flex-col min-h-0 flex-1">
            <div className="flex items-center gap-2 mb-3 shrink-0">
              <Table2 className="w-4 h-4 text-cyber-accent" />
              <span className="font-orbitron text-sm font-bold text-cyber-accent glow-text">
                各基站详细数据
              </span>
              <span className="text-xs text-cyber-muted">({filteredStations.length})</span>
            </div>
            <div className="flex-1 overflow-auto scrollbar-cyber">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-cyber-bg2/90 backdrop-blur z-10">
                  <tr className="text-cyber-muted text-xs">
                    <th className="px-3 py-2 font-medium text-left">基站编号</th>
                    <th className="px-3 py-2 font-medium text-left">基站名称</th>
                    <th className="px-3 py-2 font-medium text-left">类型</th>
                    <th className="px-3 py-2 font-medium text-right">平均用户</th>
                    <th className="px-3 py-2 font-medium text-right">上行(Mbps)</th>
                    <th className="px-3 py-2 font-medium text-right">下行(Mbps)</th>
                    <th className="px-3 py-2 font-medium text-right">告警</th>
                    <th className="px-3 py-2 font-medium text-right">响应(分)</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyLoading ? (
                    <tr>
                      <td colSpan={8} className="text-center text-cyber-muted py-8">
                        加载中...
                      </td>
                    </tr>
                  ) : filteredStations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center text-cyber-muted py-8">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    filteredStations.map((s) => (
                      <tr
                        key={s.stationId}
                        className="border-t border-cyber-border/40 hover:bg-cyber-accent/5 transition-colors"
                      >
                        <td className="px-3 py-2 font-mono text-xs text-cyber-accent text-left">
                          {s.stationId}
                        </td>
                        <td className="px-3 py-2 text-cyber-text text-left">{s.stationName}</td>
                        <td className="px-3 py-2 text-left">
                          <span className="text-xs px-1.5 py-0.5 rounded border border-cyber-accent/30 text-cyber-accent">
                            {getStationTypeLabel(s.stationType)}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right text-cyber-text">{s.avgUsers}</td>
                        <td className="px-3 py-2 text-right text-[#00E5FF]">
                          {s.avgUplink.toFixed(1)}
                        </td>
                        <td className="px-3 py-2 text-right text-[#7B61FF]">
                          {s.avgDownlink.toFixed(1)}
                        </td>
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
                        <td className="px-3 py-2 text-right text-cyber-muted">
                          {s.avgResponseTime}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trend' && (
        <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden">
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="flex items-center gap-2 cyber-panel px-3 py-1.5">
              <Calendar className="w-4 h-4 text-cyber-muted" />
              <span className="text-xs text-cyber-muted">开始</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-sm text-cyber-text focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 cyber-panel px-3 py-1.5">
              <Calendar className="w-4 h-4 text-cyber-muted" />
              <span className="text-xs text-cyber-muted">结束</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-sm text-cyber-text focus:outline-none"
              />
            </div>
            <button onClick={handleTrendQuery} disabled={trendLoading} className="cyber-btn flex items-center gap-1.5 text-sm">
              查询
            </button>
            <div className="flex-1" />
            <button onClick={handleTrendExport} disabled={trendLoading} className="cyber-btn flex items-center gap-1.5 text-sm">
              <Download className="w-4 h-4" />
              导出Excel
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 shrink-0">
            <div className="cyber-panel hud-corner p-3">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-3.5 h-3.5 text-cyber-accent" />
                <span className="font-orbitron text-xs font-bold text-cyber-accent">
                  平均用户数趋势
                </span>
              </div>
              <div style={{ height: 240 }}>
                {trendLoading ? (
                  <div className="w-full h-full flex items-center justify-center text-cyber-muted text-xs">加载中...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData?.points ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                      <defs>
                        <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#00E5FF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(0, 229, 255, 0.06)" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke={axisStroke}
                        tick={axisTickStyle}
                        axisLine={axisLineStyle}
                        tickLine={false}
                        tickFormatter={(v) => v.slice(5)}
                      />
                      <YAxis
                        stroke={axisStroke}
                        tick={axisTickStyle}
                        axisLine={axisLineStyle}
                        tickLine={false}
                      />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Line
                        type="monotone"
                        dataKey="avgUsers"
                        name="平均用户数"
                        stroke="#00E5FF"
                        strokeWidth={2.5}
                        dot={{ fill: '#00E5FF', r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: '#00E5FF' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="cyber-panel hud-corner p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-cyber-accent" />
                <span className="font-orbitron text-xs font-bold text-cyber-accent">
                  上下行流量趋势
                </span>
              </div>
              <div style={{ height: 240 }}>
                {trendLoading ? (
                  <div className="w-full h-full flex items-center justify-center text-cyber-muted text-xs">加载中...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData?.points ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                      <defs>
                        <linearGradient id="gradUp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#00E5FF" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradDown" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7B61FF" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#7B61FF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(0, 229, 255, 0.06)" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke={axisStroke}
                        tick={axisTickStyle}
                        axisLine={axisLineStyle}
                        tickLine={false}
                        tickFormatter={(v) => v.slice(5)}
                      />
                      <YAxis
                        stroke={axisStroke}
                        tick={axisTickStyle}
                        axisLine={axisLineStyle}
                        tickLine={false}
                        label={{ value: 'Mbps', angle: -90, position: 'insideLeft', fill: axisStroke, fontSize: 10 }}
                      />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: '11px', color: axisStroke }} iconType="circle" />
                      <Line
                        type="monotone"
                        dataKey="avgUplink"
                        name="上行流量"
                        stroke="#00E5FF"
                        strokeWidth={2.5}
                        dot={{ fill: '#00E5FF', r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: '#00E5FF' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="avgDownlink"
                        name="下行流量"
                        stroke="#7B61FF"
                        strokeWidth={2.5}
                        dot={{ fill: '#7B61FF', r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: '#7B61FF' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="cyber-panel hud-corner p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-cyber-warning" />
                <span className="font-orbitron text-xs font-bold text-cyber-accent">
                  告警次数趋势
                </span>
              </div>
              <div style={{ height: 240 }}>
                {trendLoading ? (
                  <div className="w-full h-full flex items-center justify-center text-cyber-muted text-xs">加载中...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData?.points ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                      <defs>
                        <linearGradient id="gradAlarm" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FFB020" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#FFB020" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(0, 229, 255, 0.06)" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke={axisStroke}
                        tick={axisTickStyle}
                        axisLine={axisLineStyle}
                        tickLine={false}
                        tickFormatter={(v) => v.slice(5)}
                      />
                      <YAxis
                        stroke={axisStroke}
                        tick={axisTickStyle}
                        axisLine={axisLineStyle}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Line
                        type="monotone"
                        dataKey="alarmCount"
                        name="告警次数"
                        stroke="#FFB020"
                        strokeWidth={2.5}
                        dot={{ fill: '#FFB020', r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: '#FFB020' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="cyber-panel hud-corner p-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-3.5 h-3.5 text-cyber-success" />
                <span className="font-orbitron text-xs font-bold text-cyber-accent">
                  工单响应时间趋势
                </span>
              </div>
              <div style={{ height: 240 }}>
                {trendLoading ? (
                  <div className="w-full h-full flex items-center justify-center text-cyber-muted text-xs">加载中...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData?.points ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                      <defs>
                        <linearGradient id="gradResp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00E676" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#00E676" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(0, 229, 255, 0.06)" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke={axisStroke}
                        tick={axisTickStyle}
                        axisLine={axisLineStyle}
                        tickLine={false}
                        tickFormatter={(v) => v.slice(5)}
                      />
                      <YAxis
                        stroke={axisStroke}
                        tick={axisTickStyle}
                        axisLine={axisLineStyle}
                        tickLine={false}
                        label={{ value: '分钟', angle: -90, position: 'insideLeft', fill: axisStroke, fontSize: 10 }}
                      />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Line
                        type="monotone"
                        dataKey="avgResponseTime"
                        name="平均响应时间"
                        stroke="#00E676"
                        strokeWidth={2.5}
                        dot={{ fill: '#00E676', r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: '#00E676' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          <div className="cyber-panel hud-corner p-4 flex flex-col min-h-0 flex-1">
            <div className="flex items-center gap-2 mb-3 shrink-0">
              <Table2 className="w-4 h-4 text-cyber-accent" />
              <span className="font-orbitron text-sm font-bold text-cyber-accent glow-text">
                每日汇总数据
              </span>
              <span className="text-xs text-cyber-muted">({trendData?.points.length || 0})</span>
            </div>
            <div className="flex-1 overflow-auto scrollbar-cyber">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-cyber-bg2/90 backdrop-blur z-10">
                  <tr className="text-cyber-muted text-xs">
                    <th className="px-3 py-2 font-medium text-left">日期</th>
                    <th className="px-3 py-2 font-medium text-right">平均用户</th>
                    <th className="px-3 py-2 font-medium text-right">上行(Mbps)</th>
                    <th className="px-3 py-2 font-medium text-right">下行(Mbps)</th>
                    <th className="px-3 py-2 font-medium text-right">告警</th>
                    <th className="px-3 py-2 font-medium text-right">响应(分)</th>
                  </tr>
                </thead>
                <tbody>
                  {trendLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center text-cyber-muted py-8">
                        加载中...
                      </td>
                    </tr>
                  ) : !trendData || trendData.points.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-cyber-muted py-8">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    trendData.points.map((p, idx) => (
                      <tr
                        key={`${p.date}-${idx}`}
                        className="border-t border-cyber-border/40 hover:bg-cyber-accent/5 transition-colors"
                      >
                        <td className="px-3 py-2 text-cyber-text text-left font-mono text-xs">
                          {p.date}
                        </td>
                        <td className="px-3 py-2 text-right text-cyber-text">{p.avgUsers}</td>
                        <td className="px-3 py-2 text-right text-[#00E5FF]">
                          {p.avgUplink.toFixed(1)}
                        </td>
                        <td className="px-3 py-2 text-right text-[#7B61FF]">
                          {p.avgDownlink.toFixed(1)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span
                            className={
                              p.alarmCount > 5
                                ? 'text-cyber-danger font-medium'
                                : p.alarmCount > 0
                                ? 'text-cyber-warning'
                                : 'text-cyber-success'
                            }
                          >
                            {p.alarmCount}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right text-cyber-muted">
                          {p.avgResponseTime}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'efficiency' && (
        <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden">
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="flex items-center gap-2 cyber-panel px-3 py-1.5">
              <Calendar className="w-4 h-4 text-cyber-muted" />
              <span className="text-xs text-cyber-muted">开始</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-sm text-cyber-text focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 cyber-panel px-3 py-1.5">
              <Calendar className="w-4 h-4 text-cyber-muted" />
              <span className="text-xs text-cyber-muted">结束</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-sm text-cyber-text focus:outline-none"
              />
            </div>
            <button onClick={handleEfficiencyQuery} disabled={efficiencyLoading} className="cyber-btn flex items-center gap-1.5 text-sm">
              查询
            </button>
            <div className="flex-1" />
            <button onClick={handleEfficiencyExport} disabled={efficiencyLoading || !efficiencyData} className="cyber-btn flex items-center gap-1.5 text-sm">
              <Download className="w-4 h-4" />
              导出Excel
            </button>
          </div>

          {efficiencyError && (
            <div className="cyber-panel border-cyber-danger/50 p-3 text-center text-cyber-danger text-sm">
              {efficiencyError}
            </div>
          )}

          <div className="grid grid-cols-5 gap-4 shrink-0">
            <StatCard
              icon={FileText}
              label="总工单数"
              value={efficiencyLoading ? '--' : efficiencyData?.overall.totalOrders.toLocaleString() ?? '0'}
              unit="单"
            />
            <StatCard
              icon={Zap}
              label="平均派单耗时"
              value={efficiencyLoading ? '--' : efficiencyData?.overall.avgDispatchMinutes.toFixed(1) ?? '0'}
              unit="分钟"
              colorClass="text-[#00E5FF]"
            />
            <StatCard
              icon={ArrowRight}
              label="平均到达耗时"
              value={efficiencyLoading ? '--' : efficiencyData?.overall.avgArrivalMinutes.toFixed(1) ?? '0'}
              unit="分钟"
              colorClass="text-[#7B61FF]"
            />
            <StatCard
              icon={CheckCircle}
              label="平均完成耗时"
              value={efficiencyLoading ? '--' : efficiencyData?.overall.avgCompleteMinutes.toFixed(1) ?? '0'}
              unit="分钟"
              colorClass="text-cyber-success"
            />
            <StatCard
              icon={AlertTriangle}
              label="超时升级率"
              value={efficiencyLoading ? '--' : `${((efficiencyData?.overall.escalateRate ?? 0) * 100).toFixed(1)}`}
              unit="%"
              highlight={!efficiencyLoading && (efficiencyData?.overall.escalateRate ?? 0) > 0.2}
            />
          </div>

          <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
            <div className="cyber-panel hud-corner p-4 flex flex-col min-h-0 flex-1">
              <div className="flex items-center gap-2 mb-3 shrink-0">
                <Table2 className="w-4 h-4 text-cyber-accent" />
                <span className="font-orbitron text-sm font-bold text-cyber-accent glow-text">
                  按基站类型统计
                </span>
                <span className="text-xs text-cyber-muted">({efficiencyData ? Object.keys(efficiencyData.byStationType).length : 0})</span>
              </div>
              <div className="flex-1 overflow-auto scrollbar-cyber">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-cyber-bg2/90 backdrop-blur z-10">
                    <tr className="text-cyber-muted text-xs">
                      <th className="px-3 py-2 font-medium text-left">类型</th>
                      <th className="px-3 py-2 font-medium text-right">工单数量</th>
                      <th className="px-3 py-2 font-medium text-right">平均派单(分)</th>
                      <th className="px-3 py-2 font-medium text-right">平均到达(分)</th>
                      <th className="px-3 py-2 font-medium text-right">平均完成(分)</th>
                      <th className="px-3 py-2 font-medium text-right">超时升级率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {efficiencyLoading ? (
                      <tr>
                        <td colSpan={6} className="text-center text-cyber-muted py-8">
                          加载中...
                        </td>
                      </tr>
                    ) : !efficiencyData || Object.keys(efficiencyData.byStationType).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-cyber-muted py-8">
                          暂无数据
                        </td>
                      </tr>
                    ) : (
                      Object.entries(efficiencyData.byStationType).map(([type, data]) => (
                        <tr
                          key={type}
                          className="border-t border-cyber-border/40 hover:bg-cyber-accent/5 transition-colors"
                        >
                          <td className="px-3 py-2 text-left">
                            <span className={`font-medium ${getStationTypeColor(type)}`}>
                              {getStationTypeLabel(type as StationType)}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right text-cyber-text">{data.totalOrders}</td>
                          <td className="px-3 py-2 text-right text-cyber-text">{data.avgDispatchMinutes.toFixed(1)}</td>
                          <td className="px-3 py-2 text-right text-cyber-text">{data.avgArrivalMinutes.toFixed(1)}</td>
                          <td className="px-3 py-2 text-right text-cyber-text">{data.avgCompleteMinutes.toFixed(1)}</td>
                          <td className="px-3 py-2 text-right">
                            <span className={data.escalateRate > 0.2 ? 'text-cyber-danger font-medium' : 'text-cyber-muted'}>
                              {(data.escalateRate * 100).toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="cyber-panel hud-corner p-4 flex flex-col min-h-0 flex-1">
              <div className="flex items-center gap-2 mb-3 shrink-0">
                <AlertTriangle className="w-4 h-4 text-cyber-warning" />
                <span className="font-orbitron text-sm font-bold text-cyber-accent glow-text">
                  按告警类型统计
                </span>
                <span className="text-xs text-cyber-muted">({efficiencyData ? Object.keys(efficiencyData.byAlarmType).length : 0})</span>
              </div>
              <div className="flex-1 overflow-auto scrollbar-cyber">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-cyber-bg2/90 backdrop-blur z-10">
                    <tr className="text-cyber-muted text-xs">
                      <th className="px-3 py-2 font-medium text-left">告警类型</th>
                      <th className="px-3 py-2 font-medium text-right">工单数量</th>
                      <th className="px-3 py-2 font-medium text-right">平均派单(分)</th>
                      <th className="px-3 py-2 font-medium text-right">平均到达(分)</th>
                      <th className="px-3 py-2 font-medium text-right">平均完成(分)</th>
                      <th className="px-3 py-2 font-medium text-right">超时升级率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {efficiencyLoading ? (
                      <tr>
                        <td colSpan={6} className="text-center text-cyber-muted py-8">
                          加载中...
                        </td>
                      </tr>
                    ) : !efficiencyData || Object.keys(efficiencyData.byAlarmType).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-cyber-muted py-8">
                          暂无数据
                        </td>
                      </tr>
                    ) : (
                      Object.entries(efficiencyData.byAlarmType).map(([type, data]) => (
                        <tr
                          key={type}
                          className="border-t border-cyber-border/40 hover:bg-cyber-accent/5 transition-colors"
                        >
                          <td className="px-3 py-2 text-left text-cyber-text">
                            {getAlarmTypeLabel(type)}
                          </td>
                          <td className="px-3 py-2 text-right text-cyber-text">{data.totalOrders}</td>
                          <td className="px-3 py-2 text-right text-cyber-text">{data.avgDispatchMinutes.toFixed(1)}</td>
                          <td className="px-3 py-2 text-right text-cyber-text">{data.avgArrivalMinutes.toFixed(1)}</td>
                          <td className="px-3 py-2 text-right text-cyber-text">{data.avgCompleteMinutes.toFixed(1)}</td>
                          <td className="px-3 py-2 text-right">
                            <span className={data.escalateRate > 0.2 ? 'text-cyber-danger font-medium' : 'text-cyber-muted'}>
                              {(data.escalateRate * 100).toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
