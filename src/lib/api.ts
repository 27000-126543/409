import type {
  BaseStation, TrafficDataPoint, FaultRecord, WorkOrder, Maintainer,
  Alarm, SiteSelection, DroneRoute, DroneInspection, User, OperationLog, DailyReportData, TrendReportData, StationType, EfficiencyReportData
} from '../../shared/types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || '请求失败');
  return json.data as T;
}

export const api = {
  login: (faceId: string, userId?: string) =>
    request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ faceId, userId }),
    }),
  getUsers: () => request<User[]>('/auth/users'),

  getStations: (type?: string) =>
    request<BaseStation[]>(`/stations${type ? `?type=${type}` : ''}`),
  getStation: (id: string) => request<BaseStation>(`/stations/${id}`),
  updateStation: (id: string, data: Partial<BaseStation>) =>
    request<BaseStation>(`/stations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getStationTraffic: (id: string) =>
    request<TrafficDataPoint[]>(`/stations/${id}/traffic`),
  getStationFaults: (id: string) =>
    request<FaultRecord[]>(`/stations/${id}/faults`),
  getFaultRecords: () =>
    request<FaultRecord[]>('/stations/faults/list'),

  getAlarms: (handled?: boolean) =>
    request<Alarm[]>(`/alarms${handled !== undefined ? `?handled=${handled}` : ''}`),
  getAlarmById: (id: string) =>
    request<Alarm>(`/alarms/${id}`),
  handleAlarm: (id: string) =>
    request<Alarm>(`/alarms/${id}/handle`, { method: 'POST' }),

  getWorkOrders: (status?: string) =>
    request<WorkOrder[]>(`/workorders${status ? `?status=${status}` : ''}`),
  getWorkOrderById: (id: string) =>
    request<WorkOrder>(`/workorders/${id}`),
  createWorkOrder: (data: Partial<WorkOrder>) =>
    request<WorkOrder>('/workorders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateWorkOrderStatus: (id: string, status: string, maintainerId?: string) =>
    request<WorkOrder>(`/workorders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, maintainerId }),
    }),
  completeWorkOrder: (id: string) =>
    request<WorkOrder>(`/workorders/${id}/complete`, { method: 'POST' }),

  getMaintainers: () => request<Maintainer[]>('/maintainers'),

  getSiteSelections: () => request<SiteSelection[]>('/site-selections'),
  createSiteSelection: (data: Partial<SiteSelection>) =>
    request<SiteSelection>('/site-selections', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  approveSiteSelection: (id: string, stage: string, status: string, approver: string, comment?: string) =>
    request<SiteSelection>(`/site-selections/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ stage, status, approver, comment }),
    }),

  getDroneRoutes: () => request<DroneRoute[]>('/drone/routes'),
  getDroneInspections: () => request<DroneInspection[]>('/drone/inspections'),
  createDroneInspection: (routeId: string) =>
    request<DroneInspection>('/drone/inspections', {
      method: 'POST',
      body: JSON.stringify({ routeId }),
    }),

  getDailyReport: (date: string, types?: StationType[]) => {
    const qs = [`date=${date}`];
    if (types && types.length) qs.push(`types=${types.join(',')}`);
    return request<DailyReportData>(`/reports/daily?${qs.join('&')}`);
  },
  getTrendReport: (startDate: string, endDate: string, types?: StationType[]) => {
    const qs = [`startDate=${startDate}`, `endDate=${endDate}`];
    if (types && types.length) qs.push(`types=${types.join(',')}`);
    return request<TrendReportData>(`/reports/trend?${qs.join('&')}`);
  },
  getEfficiencyReport: (startDate: string, endDate: string, stationTypes?: StationType[], alarmTypes?: string[]) => {
    const qs = [`startDate=${startDate}`, `endDate=${endDate}`];
    if (stationTypes && stationTypes.length) qs.push(`stationTypes=${stationTypes.join(',')}`);
    if (alarmTypes && alarmTypes.length) qs.push(`alarmTypes=${alarmTypes.join(',')}`);
    return request<EfficiencyReportData>(`/reports/efficiency?${qs.join('&')}`);
  },

  getLogs: () => request<OperationLog[]>('/logs'),
  addLog: (data: Partial<OperationLog>) =>
    request<OperationLog>('/logs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
