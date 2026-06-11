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
  Vec3,
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

const frequencyOptions = ['1.8GHz', '2.1GHz', '2.6GHz', '3.5GHz', '4.9GHz']

const calcDistance = (a: Vec3, b: Vec3): number => {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.z - b.z, 2))
}

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

  private bandwidthOptimizedStations: Set<string> = new Set()
  private batteryWarnedStations: Set<string> = new Set()
  private acJustActivated: Set<string> = new Set()
  private criticalFaultWorkOrders: Map<string, string> = new Map()
  private droneInspectionIssues: Set<string> = new Set()
  private escalatedWorkOrders: Set<string> = new Set()
  private dailyReportCache: Map<string, DailyReportData> = new Map()

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
      this.updateWorkOrderEscalation()
    }, 5000)

    setInterval(() => {
      this.updateTrafficData()
    }, 60000)
  }

  private addNewAlarm(
    station: BaseStation,
    type: Alarm['type'],
    level: Alarm['level'],
    message: string,
  ): void {
    this.alarms.unshift({
      id: generateId('alarm'),
      stationId: station.id,
      stationName: station.name,
      type,
      level,
      message,
      time: formatTime(new Date()),
      handled: false,
    })
  }

  private findNearestIdleMaintainer(position: Vec3): Maintainer | undefined {
    const idleMaintainers = this.maintainers.filter((m) => m.status === 'idle')
    if (idleMaintainers.length === 0) return undefined

    let nearest = idleMaintainers[0]
    let minDist = calcDistance(position, nearest.position)

    for (const m of idleMaintainers.slice(1)) {
      const dist = calcDistance(position, m.position)
      if (dist < minDist) {
        minDist = dist
        nearest = m
      }
    }
    return nearest
  }

  private autoDispatchWorkOrder(
    station: BaseStation,
    faultType: string,
    alarmType: 'power' | 'transmission',
    alarmMessage: string,
  ): void {
    const dispatchKey = `${station.id}-${alarmType}-${Date.now() - (Date.now() % 60000)}`
    if (this.criticalFaultWorkOrders.has(dispatchKey)) return

    const maintainer = this.findNearestIdleMaintainer(station.position)
    if (!maintainer) return

    station.alarmStatus = 'critical'
    this.addNewAlarm(station, alarmType, 'critical', alarmMessage)

    maintainer.status = 'busy'

    const order: WorkOrder = {
      id: generateId('wo'),
      stationId: station.id,
      stationName: station.name,
      faultType,
      createTime: formatTime(new Date()),
      assignTime: formatTime(new Date()),
      status: 'assigned',
      priority: 'urgent',
      maintainerId: maintainer.id,
      maintainerName: maintainer.name,
      maintainerPosition: { ...maintainer.position },
    }
    this.workOrders.unshift(order)
    this.criticalFaultWorkOrders.set(dispatchKey, order.id)
    this.criticalFaultWorkOrders.set(station.id, order.id)
  }

  private updateStationMetrics(): void {
    for (const station of this.stations) {
      station.onlineUsers = Math.max(0, station.onlineUsers + randomInt(-20, 20))
      station.uplinkTraffic = Math.max(1, station.uplinkTraffic + randomInRange(-20, 20))
      station.downlinkTraffic = Math.max(10, station.downlinkTraffic + randomInRange(-50, 50))
      station.uplinkBandwidthUsage = Math.max(10, Math.min(99, station.uplinkBandwidthUsage + randomInRange(-3, 3)))
      station.temperature = Math.max(15, Math.min(80, station.temperature + randomInRange(-1, 1)))
      station.humidity = Math.max(20, Math.min(95, station.humidity + randomInRange(-2, 2)))

      if (station.powerSource === 'grid') {
        station.batteryLevel = Math.min(100, station.batteryLevel + randomInRange(-0.1, 0.2))
      } else {
        station.batteryLevel = Math.max(0, station.batteryLevel - randomInRange(0.1, 0.5))
      }

      if (station.uplinkBandwidthUsage > 80 && !this.bandwidthOptimizedStations.has(station.id)) {
        if (station.targetAntennaTilt < 8) {
          station.targetAntennaTilt = 12
        } else {
          station.targetAntennaTilt = 5
        }
        const otherFreqs = frequencyOptions.filter((f) => f !== station.currentFrequency)
        station.currentFrequency = randomChoice(otherFreqs)
        station.antennaTilt = station.targetAntennaTilt
        this.addNewAlarm(
          station,
          'bandwidth',
          'warning',
          '上行带宽占用超80%，已自动调整天线倾角并切换备用频段',
        )
        if (station.alarmStatus === 'normal') {
          station.alarmStatus = 'warning'
        }
        this.bandwidthOptimizedStations.add(station.id)
      } else if (station.uplinkBandwidthUsage <= 70 && this.bandwidthOptimizedStations.has(station.id)) {
        this.bandwidthOptimizedStations.delete(station.id)
      }

      const tiltDiff = station.targetAntennaTilt - station.antennaTilt
      if (Math.abs(tiltDiff) > 0.1) {
        station.antennaTilt += tiltDiff * 0.15
      }

      if (station.powerSource === 'battery' && station.batteryLevel < 30 && !this.criticalFaultWorkOrders.has(`${station.id}-power-low`)) {
        this.autoDispatchWorkOrder(
          station,
          '电池电量告警',
          'power',
          '电池电量低于30%，存在断电风险，请立即处理',
        )
        this.criticalFaultWorkOrders.set(`${station.id}-power-low`, '1')
      }

      if (Math.random() < 0.005 && !this.criticalFaultWorkOrders.has(`${station.id}-transmission-${Date.now() - (Date.now() % 300000)}`)) {
        this.autoDispatchWorkOrder(
          station,
          '传输中断',
          'transmission',
          '传输链路中断，请立即处理',
        )
        this.criticalFaultWorkOrders.set(`${station.id}-transmission-${Date.now() - (Date.now() % 300000)}`, '1')
      }

      const prevAC = station.airConditioning
      if (station.temperature > 45 || station.humidity > 90) {
        station.airConditioning = true
      } else if (station.temperature < 35 && station.humidity < 75) {
        station.airConditioning = false
      }

      if (station.airConditioning) {
        station.temperature = Math.max(15, station.temperature - 0.5)
        station.humidity = Math.max(20, station.humidity - 1)
        if (!prevAC && !this.acJustActivated.has(station.id)) {
          if (station.temperature > 45) {
            this.addNewAlarm(station, 'temperature', 'warning', '设备温度过高，已自动开启空调降温')
          } else if (station.humidity > 90) {
            this.addNewAlarm(station, 'humidity', 'warning', '环境湿度过高，已自动开启空调除湿')
          }
          this.acJustActivated.add(station.id)
        }
      } else {
        this.acJustActivated.delete(station.id)
      }

      if (station.batteryLevel < 70) {
        if (station.powerSource === 'grid') {
          station.batteryLevel = Math.min(100, station.batteryLevel + 0.8)
        }
        if (!this.batteryWarnedStations.has(station.id) && station.batteryLevel < 70) {
          this.addNewAlarm(station, 'battery', 'warning', '电池电量低于70%，正在自动充电')
          this.batteryWarnedStations.add(station.id)
        }
      } else if (station.batteryLevel >= 95) {
        this.batteryWarnedStations.delete(station.id)
      }

      if (station.powerSource === 'grid' && Math.random() < 0.003) {
        station.powerSource = 'battery'
        station.alarmStatus = 'critical'
        this.autoDispatchWorkOrder(
          station,
          '市电中断',
          'power',
          '市电中断，已切换至电池供电，请立即处理',
        )
      }

      if (station.powerSource === 'battery' && Math.random() < 0.02) {
        station.powerSource = 'grid'
      }
    }
  }

  private updateWorkOrderEscalation(): void {
    const now = Date.now()
    for (const order of this.workOrders) {
      if (
        (order.status === 'pending' || order.status === 'assigned') &&
        order.createTime &&
        !this.escalatedWorkOrders.has(order.id)
      ) {
        const createTimeMs = Date.parse(order.createTime.replace(' ', 'T'))
        if (!isNaN(createTimeMs) && now - createTimeMs > 30 * 60 * 1000) {
          order.status = 'escalated'
          if (order.priority === 'normal') {
            order.priority = 'high'
          } else if (order.priority === 'high') {
            order.priority = 'urgent'
          }
          const station = this.stations.find((s) => s.id === order.stationId)
          if (station) {
            this.addNewAlarm(
              station,
              'transmission',
              'critical',
              `工单(${order.id})响应超时，已自动升级为${order.priority === 'urgent' ? '紧急' : '高'}优先级`,
            )
          }
          this.escalatedWorkOrders.add(order.id)
        }
      }
    }
  }

  private updateMaintainerPositions(): void {
    for (const m of this.maintainers) {
      if (m.status === 'busy') {
        m.position.x = Math.max(-80, Math.min(80, m.position.x + randomInRange(-2, 2)))
        m.position.z = Math.max(-80, Math.min(80, m.position.z + randomInRange(-2, 2)))
      }
    }
  }

  private findStationNearRoute(routeId: string): BaseStation | undefined {
    const route = this.droneRoutes.find((r) => r.id === routeId)
    if (!route || route.waypoints.length === 0) {
      return randomChoice(this.stations)
    }
    const midpoint = route.waypoints[Math.floor(route.waypoints.length / 2)]
    let nearest = this.stations[0]
    let minDist = calcDistance(midpoint, nearest.position)
    for (const s of this.stations.slice(1)) {
      const dist = calcDistance(midpoint, s.position)
      if (dist < minDist) {
        minDist = dist
        nearest = s
      }
    }
    return nearest
  }

  private updateDroneInspections(): void {
    for (const inspection of this.droneInspections) {
      if (inspection.status === 'flying') {
        if (Math.random() < 0.2 && !this.droneInspectionIssues.has(inspection.id)) {
          const station = this.findStationNearRoute(inspection.routeId)
          if (station) {
            inspection.photos.push({
              stationId: station.id,
              url: `/photos/drone-${inspection.id}-${Date.now()}.jpg`,
              issue: '天线松动，存在脱落风险',
              time: formatTime(new Date()),
            })
            this.addNewAlarm(station, 'antenna', 'warning', '无人机巡检发现天线松动')
            const wo: WorkOrder = {
              id: generateId('wo'),
              stationId: station.id,
              stationName: station.name,
              faultType: '无人机巡检发现天线松动',
              createTime: formatTime(new Date()),
              status: 'pending',
              priority: 'high',
            }
            this.workOrders.unshift(wo)
            this.droneInspectionIssues.add(inspection.id)
          }
        }
        if (Math.random() < 0.1) {
          inspection.status = 'completed'
          inspection.endTime = formatTime(new Date())
          this.droneInspectionIssues.delete(inspection.id)
        }
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

  private hashCode(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash)
  }

  private seededRandom(seed: number): () => number {
    let s = seed
    return () => {
      s = (s * 1664525 + 1013904223) & 0xffffffff
      return (s >>> 0) / 4294967296
    }
  }

  getDailyReport(date?: string): DailyReportData {
    const targetDate = date || (() => {
      const today = new Date()
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    })()

    if (this.dailyReportCache.has(targetDate)) {
      return this.dailyReportCache.get(targetDate)!
    }

    const daySeed = this.hashCode(targetDate)
    const rand = this.seededRandom(daySeed)
    const seededRange = (min: number, max: number) => rand() * (max - min) + min

    const stationReports = this.stations.map((station, idx) => {
      const stationSeed = this.hashCode(targetDate + station.id)
      const sRand = this.seededRandom(stationSeed)
      const sRange = (min: number, max: number) => sRand() * (max - min) + min

      const baseStation = this.stations[idx] || station
      const baseAlarmCount = Math.max(0, Math.round(this.alarms.filter((a) => a.stationId === station.id).length * (0.6 + sRange(0, 0.8))))
      const baseOrders = this.workOrders.filter((w) => w.stationId === station.id)
      const baseResponseTime = baseOrders.length > 0
        ? baseOrders.reduce((sum, w) => sum + (w.responseTime || 0), 0) / baseOrders.length
        : sRange(8, 25)

      return {
        stationId: station.id,
        stationName: station.name,
        avgUsers: Math.max(0, Math.round(baseStation.onlineUsers * (0.85 + sRange(0, 0.35)))),
        avgUplink: Math.max(1, Math.round(baseStation.uplinkTraffic * (0.85 + sRange(0, 0.35)))),
        avgDownlink: Math.max(5, Math.round(baseStation.downlinkTraffic * (0.85 + sRange(0, 0.35)))),
        alarmCount: baseAlarmCount,
        avgResponseTime: Math.round(baseResponseTime),
      }
    })

    const report: DailyReportData = {
      date: targetDate,
      stations: stationReports,
    }

    this.dailyReportCache.set(targetDate, report)
    return report
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
