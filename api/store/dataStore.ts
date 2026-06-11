import type {
  User,
  BaseStation,
  Maintainer,
  Alarm,
  WorkOrder,
  SiteSelection,
  DroneRoute,
  DroneInspection,
  OperationLog,
  TrafficDataPoint,
  FaultRecord,
  DailyReportData,
  WorkOrderStatus,
  ApprovalStatus,
} from '../../shared/types.js'
import {
  generateUsers,
  generateStations,
  generateMaintainers,
  generate24HourTraffic,
  generateFaultRecords,
  generateAlarms,
  generateWorkOrders,
  generateSiteSelections,
  generateDroneRoutes,
  generateDroneInspections,
  generateOperationLogs,
  generateDailyReport,
  randomInRange,
  randomInt,
  randomChoice,
  formatTime,
  generateId,
} from '../data/mockData.js'

class DataStore {
  private users: User[] = []
  private stations: BaseStation[] = []
  private maintainers: Maintainer[] = []
  private alarms: Alarm[] = []
  private workOrders: WorkOrder[] = []
  private siteSelections: SiteSelection[] = []
  private droneRoutes: DroneRoute[] = []
  private droneInspections: DroneInspection[] = []
  private operationLogs: OperationLog[] = []
  private faultRecords: FaultRecord[] = []
  private trafficCache: Map<string, TrafficDataPoint[]> = new Map()
  private dailyReport: DailyReportData | null = null
  private currentUser: User | null = null

  constructor() {
    this.init()
    this.startRealTimeUpdates()
  }

  private init(): void {
    this.users = generateUsers()
    this.stations = generateStations()
    this.maintainers = generateMaintainers()
    this.faultRecords = generateFaultRecords(this.stations)
    this.alarms = generateAlarms(this.stations)
    this.workOrders = generateWorkOrders(this.stations, this.maintainers)
    this.siteSelections = generateSiteSelections()
    this.droneRoutes = generateDroneRoutes(this.stations)
    this.droneInspections = generateDroneInspections(this.droneRoutes, this.stations)
    this.operationLogs = generateOperationLogs(this.users)
    this.dailyReport = generateDailyReport(this.stations, this.workOrders, this.alarms)

    for (const station of this.stations) {
      this.trafficCache.set(station.id, generate24HourTraffic(station.id))
    }
  }

  private startRealTimeUpdates(): void {
    setInterval(() => {
      this.updateStationMetrics()
      this.updateMaintainerPositions()
      this.updateDroneInspections()
    }, 5000)

    setInterval(() => {
      this.updateTrafficData()
    }, 60000)
  }

  private updateStationMetrics(): void {
    for (const station of this.stations) {
      station.onlineUsers = Math.max(0, station.onlineUsers + randomInt(-20, 20))
      station.uplinkTraffic = Math.max(1, station.uplinkTraffic + randomInRange(-20, 20))
      station.downlinkTraffic = Math.max(10, station.downlinkTraffic + randomInRange(-50, 50))
      station.uplinkBandwidthUsage = Math.max(10, Math.min(99, station.uplinkBandwidthUsage + randomInRange(-3, 3)))
      station.temperature = Math.max(15, Math.min(80, station.temperature + randomInRange(-1, 1)))
      station.humidity = Math.max(20, Math.min(90, station.humidity + randomInRange(-2, 2)))
      station.batteryLevel = Math.max(0, Math.min(100, station.batteryLevel + randomInRange(-0.5, 0.5)))

      if (Math.random() < 0.02) {
        if (station.alarmStatus === 'normal') {
          station.alarmStatus = randomChoice(['warning', 'critical'])
          this.addNewAlarm(station)
        } else if (station.alarmStatus === 'warning' && Math.random() < 0.3) {
          station.alarmStatus = 'normal'
        }
      }
    }
  }

  private addNewAlarm(station: BaseStation): void {
    const alarmTypes: Alarm['type'][] = ['bandwidth', 'power', 'transmission', 'temperature', 'humidity', 'battery', 'antenna']
    const alarmMessages: Record<Alarm['type'], string> = {
      bandwidth: '带宽使用率超过阈值',
      power: '电源异常，切换至备用电池',
      transmission: '传输链路中断',
      temperature: '设备温度过高',
      humidity: '环境湿度异常',
      battery: '电池电量过低',
      antenna: '天线倾角异常',
    }
    const type = randomChoice(alarmTypes)
    this.alarms.unshift({
      id: generateId('alarm'),
      stationId: station.id,
      stationName: station.name,
      type,
      level: station.alarmStatus === 'critical' ? 'critical' : 'warning',
      message: alarmMessages[type],
      time: formatTime(new Date()),
      handled: false,
    })
  }

  private updateMaintainerPositions(): void {
    for (const m of this.maintainers) {
      if (m.status === 'busy') {
        m.position.x = Math.max(-80, Math.min(80, m.position.x + randomInRange(-2, 2)))
        m.position.z = Math.max(-80, Math.min(80, m.position.z + randomInRange(-2, 2)))
      }
    }
  }

  private updateDroneInspections(): void {
    for (const inspection of this.droneInspections) {
      if (inspection.status === 'flying' && Math.random() < 0.1) {
        inspection.status = 'completed'
        inspection.endTime = formatTime(new Date())
      } else if (inspection.status === 'scheduled' && Math.random() < 0.05) {
        inspection.status = 'flying'
      }
    }
  }

  private updateTrafficData(): void {
    for (const station of this.stations) {
      const data = this.trafficCache.get(station.id)
      if (data && data.length > 0) {
        data.shift()
        const now = new Date()
        const hour = now.getHours()
        const peakFactor = (hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 21) ? 2.5 : (hour >= 12 && hour <= 14) ? 1.8 : 1
        data.push({
          time: `${String(hour).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
          uplink: randomInRange(20, 100) * peakFactor,
          downlink: randomInRange(100, 500) * peakFactor,
        })
      }
    }
  }

  getUsers(): User[] {
    return this.users
  }

  login(userId: string): User | null {
    const user = this.users.find((u) => u.id === userId) || this.users[0]
    this.currentUser = user
    this.addLog(user, '登录系统', '用户通过认证进入系统')
    return user
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  logout(): void {
    if (this.currentUser) {
      this.addLog(this.currentUser, '退出系统', '用户安全退出系统')
    }
    this.currentUser = null
  }

  getStations(type?: BaseStation['type']): BaseStation[] {
    if (type) {
      return this.stations.filter((s) => s.type === type)
    }
    return this.stations
  }

  getStationById(id: string): BaseStation | undefined {
    return this.stations.find((s) => s.id === id)
  }

  updateStation(id: string, updates: Partial<BaseStation>): BaseStation | undefined {
    const station = this.stations.find((s) => s.id === id)
    if (station) {
      Object.assign(station, updates)
      if (this.currentUser) {
        this.addLog(this.currentUser, '修改基站参数', `更新基站 ${station.name} 参数`)
      }
    }
    return station
  }

  getTrafficData(stationId: string): TrafficDataPoint[] {
    return this.trafficCache.get(stationId) || []
  }

  getFaultRecords(stationId?: string): FaultRecord[] {
    if (stationId) {
      return this.faultRecords.filter((f) => f.stationId === stationId)
    }
    return this.faultRecords
  }

  getAlarms(handled?: boolean): Alarm[] {
    if (handled !== undefined) {
      return this.alarms.filter((a) => a.handled === handled)
    }
    return this.alarms
  }

  getAlarmById(id: string): Alarm | undefined {
    return this.alarms.find((a) => a.id === id)
  }

  handleAlarm(id: string): Alarm | undefined {
    const alarm = this.alarms.find((a) => a.id === id)
    if (alarm) {
      alarm.handled = true
      if (this.currentUser) {
        this.addLog(this.currentUser, '处理告警', `处理告警: ${alarm.message} (${alarm.stationName})`)
      }
    }
    return alarm
  }

  getWorkOrders(status?: WorkOrderStatus): WorkOrder[] {
    if (status) {
      return this.workOrders.filter((w) => w.status === status)
    }
    return this.workOrders
  }

  getWorkOrderById(id: string): WorkOrder | undefined {
    return this.workOrders.find((w) => w.id === id)
  }

  createWorkOrder(data: Omit<WorkOrder, 'id' | 'createTime' | 'status'>): WorkOrder {
    const order: WorkOrder = {
      ...data,
      id: generateId('wo'),
      createTime: formatTime(new Date()),
      status: 'pending',
    }
    this.workOrders.unshift(order)
    if (this.currentUser) {
      this.addLog(this.currentUser, '创建工单', `创建工单 ${order.id}: ${order.faultType}`)
    }
    return order
  }

  updateWorkOrderStatus(id: string, status: WorkOrderStatus, maintainerId?: string): WorkOrder | undefined {
    const order = this.workOrders.find((w) => w.id === id)
    if (order) {
      order.status = status
      if (maintainerId) {
        const maintainer = this.maintainers.find((m) => m.id === maintainerId)
        order.maintainerId = maintainerId
        order.maintainerName = maintainer?.name
        order.maintainerPosition = maintainer?.position
        order.assignTime = formatTime(new Date())
        order.responseTime = randomInt(5, 60)
      }
      if (this.currentUser) {
        this.addLog(this.currentUser, '更新工单', `工单 ${order.id} 状态更新为: ${status}`)
      }
    }
    return order
  }

  getMaintainers(): Maintainer[] {
    return this.maintainers
  }

  getSiteSelections(): SiteSelection[] {
    return this.siteSelections
  }

  getSiteSelectionById(id: string): SiteSelection | undefined {
    return this.siteSelections.find((s) => s.id === id)
  }

  createSiteSelection(data: Omit<SiteSelection, 'id' | 'applyTime' | 'planningApproval' | 'constructionApproval' | 'operationApproval'>): SiteSelection {
    const selection: SiteSelection = {
      ...data,
      id: generateId('site'),
      applyTime: formatTime(new Date()),
      planningApproval: 'pending',
      constructionApproval: 'pending',
      operationApproval: 'pending',
    }
    this.siteSelections.unshift(selection)
    if (this.currentUser) {
      this.addLog(this.currentUser, '创建选址申请', `创建选址申请 ${selection.id}`)
    }
    return selection
  }

  approveSiteSelection(
    id: string,
    stage: 'planning' | 'construction' | 'operation',
    status: ApprovalStatus,
    approver: string,
    comment: string,
  ): SiteSelection | undefined {
    const selection = this.siteSelections.find((s) => s.id === id)
    if (selection) {
      if (stage === 'planning') {
        selection.planningApproval = status
        selection.planningApprover = approver
        selection.planningComment = comment
      } else if (stage === 'construction') {
        selection.constructionApproval = status
        selection.constructionApprover = approver
        selection.constructionComment = comment
      } else {
        selection.operationApproval = status
        selection.operationApprover = approver
        selection.operationComment = comment
      }
      if (this.currentUser) {
        this.addLog(this.currentUser, '审批选址', `${stage}审批: ${status} - ${comment}`)
      }
    }
    return selection
  }

  getDroneRoutes(): DroneRoute[] {
    return this.droneRoutes
  }

  getDroneInspections(): DroneInspection[] {
    return this.droneInspections
  }

  createDroneInspection(routeId: string): DroneInspection {
    const inspection: DroneInspection = {
      id: generateId('inspection'),
      routeId,
      startTime: formatTime(new Date()),
      status: 'scheduled',
      photos: [],
    }
    this.droneInspections.unshift(inspection)
    if (this.currentUser) {
      this.addLog(this.currentUser, '创建巡检任务', `创建无人机巡检 ${inspection.id}, 航线: ${routeId}`)
    }
    return inspection
  }

  getDailyReport(): DailyReportData {
    if (!this.dailyReport) {
      this.dailyReport = generateDailyReport(this.stations, this.workOrders, this.alarms)
    }
    return this.dailyReport
  }

  getOperationLogs(): OperationLog[] {
    return this.operationLogs
  }

  addLog(user: User, action: string, detail: string): void {
    this.operationLogs.unshift({
      id: generateId('log'),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      detail,
      time: formatTime(new Date()),
    })
    if (this.operationLogs.length > 500) {
      this.operationLogs = this.operationLogs.slice(0, 500)
    }
  }
}

export const dataStore = new DataStore()
export default dataStore
