import { create } from 'zustand';
import type {
  BaseStation, Alarm, WorkOrder, Maintainer, User,
  SiteSelection, DroneRoute, DroneInspection, TrafficDataPoint, FaultRecord
} from '../../shared/types';
import { api } from '@/lib/api';

interface AppState {
  user: User | null;
  stations: BaseStation[];
  alarms: Alarm[];
  workOrders: WorkOrder[];
  maintainers: Maintainer[];
  siteSelections: SiteSelection[];
  droneRoutes: DroneRoute[];
  droneInspections: DroneInspection[];
  selectedStationId: string | null;
  selectedStationTraffic: TrafficDataPoint[];
  selectedStationFaults: FaultRecord[];
  activeWorkOrderPaths: { orderId: string; from: { x: number; y: number; z: number }; to: { x: number; y: number; z: number } }[];
  planningMode: boolean;
  candidatePosition: { x: number; y: number; z: number } | null;

  setUser: (user: User | null) => void;
  setSelectedStationId: (id: string | null) => void;
  setPlanningMode: (v: boolean) => void;
  setCandidatePosition: (p: { x: number; y: number; z: number } | null) => void;

  loadAll: () => Promise<void>;
  loadStationDetail: (id: string) => Promise<void>;
  handleAlarm: (id: string) => Promise<void>;
  createWorkOrder: (data: Partial<WorkOrder>) => Promise<void>;
  updateWorkOrderStatus: (id: string, status: string, maintainerId?: string) => Promise<void>;
  approveSiteSelection: (id: string, stage: string, status: string, approver: string, comment?: string) => Promise<void>;
  createSiteSelection: (data: Partial<SiteSelection>) => Promise<void>;
  startDroneInspection: (routeId: string) => Promise<void>;
  loadDroneData: () => Promise<void>;
  startPolling: () => () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  stations: [],
  alarms: [],
  workOrders: [],
  maintainers: [],
  siteSelections: [],
  droneRoutes: [],
  droneInspections: [],
  selectedStationId: null,
  selectedStationTraffic: [],
  selectedStationFaults: [],
  activeWorkOrderPaths: [],
  planningMode: false,
  candidatePosition: null,

  setUser: (user) => set({ user }),
  setSelectedStationId: (id) => set({ selectedStationId: id }),
  setPlanningMode: (v) => set({ planningMode: v, candidatePosition: null }),
  setCandidatePosition: (p) => set({ candidatePosition: p }),

  loadAll: async () => {
    try {
      const [stations, alarms, workOrders, maintainers, siteSelections, droneRoutes, droneInspections] = await Promise.all([
        api.getStations(),
        api.getAlarms(),
        api.getWorkOrders(),
        api.getMaintainers(),
        api.getSiteSelections(),
        api.getDroneRoutes(),
        api.getDroneInspections(),
      ]);
      const paths = workOrders
        .filter(w => w.status === 'assigned' || w.status === 'processing')
        .filter(w => w.maintainerPosition)
        .map(w => {
          const station = stations.find(s => s.id === w.stationId);
          return station && w.maintainerPosition ? {
            orderId: w.id,
            from: w.maintainerPosition,
            to: station.position,
          } : null;
        })
        .filter(Boolean) as any[];
      set({ stations, alarms, workOrders, maintainers, siteSelections, droneRoutes, droneInspections, activeWorkOrderPaths: paths });
    } catch (e) {
      console.error('loadAll error', e);
    }
  },

  loadStationDetail: async (id) => {
    try {
      const [traffic, faults] = await Promise.all([
        api.getStationTraffic(id),
        api.getStationFaults(id),
      ]);
      set({ selectedStationTraffic: traffic, selectedStationFaults: faults });
    } catch (e) {
      console.error(e);
    }
  },

  handleAlarm: async (id) => {
    try {
      await api.handleAlarm(id);
      await get().loadAll();
    } catch (e) { console.error(e); }
  },

  createWorkOrder: async (data) => {
    try {
      await api.createWorkOrder(data);
      await get().loadAll();
    } catch (e) { console.error(e); }
  },

  updateWorkOrderStatus: async (id, status, maintainerId) => {
    try {
      await api.updateWorkOrderStatus(id, status, maintainerId);
      await get().loadAll();
    } catch (e) { console.error(e); }
  },

  approveSiteSelection: async (id, stage, status, approver, comment) => {
    try {
      await api.approveSiteSelection(id, stage, status, approver, comment);
      await get().loadAll();
    } catch (e) { console.error(e); }
  },

  createSiteSelection: async (data) => {
    try {
      await api.createSiteSelection(data);
      await get().loadAll();
    } catch (e) { console.error(e); }
  },

  startDroneInspection: async (routeId) => {
    try {
      await api.createDroneInspection(routeId);
      await get().loadDroneData();
    } catch (e) { console.error(e); }
  },

  loadDroneData: async () => {
    try {
      const [droneRoutes, droneInspections] = await Promise.all([
        api.getDroneRoutes(),
        api.getDroneInspections(),
      ]);
      set({ droneRoutes, droneInspections });
    } catch (e) { console.error(e); }
  },

  startPolling: () => {
    const interval = setInterval(() => {
      get().loadAll();
      const sel = get().selectedStationId;
      if (sel) get().loadStationDetail(sel);
    }, 3000);
    return () => clearInterval(interval);
  },
}));
