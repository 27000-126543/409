export type StationType = 'macro' | 'micro' | 'indoor' | 'core';
export type AlarmStatus = 'normal' | 'warning' | 'critical' | 'offline';
export type UserRole = 'engineer' | 'director' | 'admin';
export type WorkOrderStatus = 'pending' | 'assigned' | 'processing' | 'completed' | 'escalated';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface BaseStation {
  id: string;
  name: string;
  type: StationType;
  position: Vec3;
  onlineUsers: number;
  uplinkTraffic: number;
  downlinkTraffic: number;
  uplinkBandwidthUsage: number;
  alarmStatus: AlarmStatus;
  antennaTilt: number;
  targetAntennaTilt: number;
  currentFrequency: string;
  temperature: number;
  humidity: number;
  batteryLevel: number;
  powerSource: 'grid' | 'battery';
  airConditioning: boolean;
}

export interface TrafficDataPoint {
  time: string;
  uplink: number;
  downlink: number;
}

export interface FaultRecord {
  id: string;
  stationId: string;
  time: string;
  type: string;
  result: string;
  duration: number;
}

export interface WorkOrder {
  id: string;
  stationId: string;
  stationName: string;
  faultType: string;
  createTime: string;
  assignTime?: string;
  responseTime?: number;
  status: WorkOrderStatus;
  priority: 'normal' | 'high' | 'urgent';
  maintainerId?: string;
  maintainerName?: string;
  maintainerPosition?: Vec3;
}

export interface Maintainer {
  id: string;
  name: string;
  phone: string;
  position: Vec3;
  status: 'idle' | 'busy';
}

export interface Alarm {
  id: string;
  stationId: string;
  stationName: string;
  type: 'bandwidth' | 'power' | 'transmission' | 'temperature' | 'humidity' | 'battery' | 'antenna';
  level: 'warning' | 'critical';
  message: string;
  time: string;
  handled: boolean;
}

export interface SiteSelection {
  id: string;
  position: Vec3;
  applicant: string;
  applyTime: string;
  planningApproval: ApprovalStatus;
  planningApprover?: string;
  planningComment?: string;
  constructionApproval: ApprovalStatus;
  constructionApprover?: string;
  constructionComment?: string;
  operationApproval: ApprovalStatus;
  operationApprover?: string;
  operationComment?: string;
  coverageRadius: number;
}

export interface DroneRoute {
  id: string;
  name: string;
  waypoints: Vec3[];
}

export interface DroneInspection {
  id: string;
  routeId: string;
  startTime: string;
  endTime?: string;
  status: 'scheduled' | 'flying' | 'completed';
  photos: { stationId: string; url: string; issue: string; time: string }[];
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  faceId: string;
}

export interface OperationLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  detail: string;
  time: string;
}

export interface DailyReportData {
  date: string;
  stations: {
    stationId: string;
    stationName: string;
    avgUsers: number;
    avgUplink: number;
    avgDownlink: number;
    alarmCount: number;
    avgResponseTime: number;
  }[];
}
