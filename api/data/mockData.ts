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
  Vec3,
  StationType,
  AlarmStatus,
  UserRole,
  WorkOrderStatus,
  ApprovalStatus,
} from '../../shared/types.js'

const randomInRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min
}

const randomInt = (min: number, max: number): number => {
  return Math.floor(randomInRange(min, max + 1))
}

const randomChoice = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)]
}

const randomPosition = (): Vec3 => ({
  x: randomInRange(-80, 80),
  y: 0,
  z: randomInRange(-80, 80),
})

const formatTime = (date: Date): string => {
  return date.toISOString().replace('T', ' ').substring(0, 19)
}

const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${randomInt(1000, 9999)}`
}

export const generateUsers = (): User[] => {
  return [
    { id: 'user-1', name: '张工程师', role: 'engineer' as UserRole, faceId: 'face-engineer-001' },
    { id: 'user-2', name: '李主任', role: 'director' as UserRole, faceId: 'face-director-001' },
    { id: 'user-3', name: '王管理员', role: 'admin' as UserRole, faceId: 'face-admin-001' },
  ]
}

const stationNameMap: Record<StationType, string[]> = {
  macro: ['中心宏基站', '东城宏基站', '西城宏基站', '南城宏基站', '北城宏基站', '科技园宏基站', '商业中心宏基站', '工业园宏基站', '高新区宏基站', '经开区宏基站', '新区宏基站', '大学城宏基站', '商务区宏基站', '物流园宏基站', '会展中心宏基站'],
  micro: ['花园路微基站', '中山路微基站', '人民路微基站', '解放路微基站', '建设路微基站', '和平路微基站', '文化路微基站', '科技路微基站', '创业路微基站', '创新路微基站', '发展路微基站', '振兴路微基站', '富强路微基站', '文明路微基站', '和谐路微基站', '幸福路微基站', '安康路微基站', '吉祥路微基站', '如意路微基站', '平安路微基站', '光明路微基站', '朝阳路微基站', '青年路微基站', '友谊路微基站', '团结路微基站'],
  indoor: ['商场A室内分布', '商场B室内分布', '写字楼A室内分布', '写字楼B室内分布', '医院室内分布', '学校室内分布', '地铁A室内分布', '地铁B室内分布', '机场室内分布', '高铁站室内分布'],
  core: ['核心机房A', '核心机房B'],
}

const frequencyOptions = ['1.8GHz', '2.1GHz', '2.6GHz', '3.5GHz', '4.9GHz']

export const generateStations = (): BaseStation[] => {
  const stations: BaseStation[] = []
  const typeCounts: Record<StationType, number> = {
    macro: 15,
    micro: 25,
    indoor: 10,
    core: 2,
  }

  let idCounter = 1
  const types: StationType[] = ['macro', 'micro', 'indoor', 'core']

  for (const type of types) {
    const count = typeCounts[type]
    for (let i = 0; i < count; i++) {
      const alarmStatuses: AlarmStatus[] = ['normal', 'normal', 'normal', 'normal', 'warning', 'critical', 'offline']
      stations.push({
        id: `station-${String(idCounter).padStart(3, '0')}`,
        name: stationNameMap[type][i],
        type,
        position: randomPosition(),
        onlineUsers: randomInt(50, type === 'core' ? 5000 : type === 'macro' ? 2000 : 500),
        uplinkTraffic: randomInRange(10, 500),
        downlinkTraffic: randomInRange(50, 2000),
        uplinkBandwidthUsage: randomInRange(20, 95),
        alarmStatus: randomChoice(alarmStatuses),
        antennaTilt: randomInRange(0, 15),
        targetAntennaTilt: randomInRange(0, 15),
        currentFrequency: randomChoice(frequencyOptions),
        temperature: randomInRange(20, 65),
        humidity: randomInRange(30, 80),
        batteryLevel: randomInRange(50, 100),
        powerSource: Math.random() > 0.1 ? 'grid' : 'battery',
        airConditioning: Math.random() > 0.15,
      })
      idCounter++
    }
  }

  return stations
}

const maintainerNames = ['刘师傅', '陈师傅', '赵师傅', '孙师傅', '周师傅', '吴师傅', '郑师傅', '钱师傅']

export const generateMaintainers = (): Maintainer[] => {
  return maintainerNames.map((name, index) => ({
    id: `maintainer-${String(index + 1).padStart(3, '0')}`,
    name,
    phone: `138${String(randomInt(10000000, 99999999))}`,
    position: randomPosition(),
    status: Math.random() > 0.5 ? 'idle' : 'busy',
  }))
}

export const generate24HourTraffic = (stationId: string): TrafficDataPoint[] => {
  const data: TrafficDataPoint[] = []
  const now = new Date()
  now.setMinutes(0, 0, 0)

  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000)
    const hour = time.getHours()
    const peakFactor = (hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 21) ? 2.5 : (hour >= 12 && hour <= 14) ? 1.8 : 1

    data.push({
      time: `${String(hour).padStart(2, '0')}:00`,
      uplink: randomInRange(20, 100) * peakFactor,
      downlink: randomInRange(100, 500) * peakFactor,
    })
  }

  return data
}

const faultTypes = ['信号中断', '电源故障', '传输故障', '天线故障', '温度过高', '湿度异常', '电池告警']
const faultResults = ['已修复', '更换设备', '远程恢复', '待处理']

export const generateFaultRecords = (stations: BaseStation[]): FaultRecord[] => {
  const records: FaultRecord[] = []
  const now = Date.now()

  for (let i = 0; i < 50; i++) {
    const station = randomChoice(stations)
    records.push({
      id: `fault-${String(i + 1).padStart(5, '0')}`,
      stationId: station.id,
      time: formatTime(new Date(now - randomInt(1, 30) * 24 * 60 * 60 * 1000)),
      type: randomChoice(faultTypes),
      result: randomChoice(faultResults),
      duration: randomInt(10, 300),
    })
  }

  return records
}

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

export const generateAlarms = (stations: BaseStation[]): Alarm[] => {
  const alarms: Alarm[] = []
  const now = Date.now()
  let alarmId = 1

  for (const station of stations) {
    if (station.alarmStatus === 'warning' || station.alarmStatus === 'critical') {
      const count = station.alarmStatus === 'critical' ? randomInt(2, 4) : randomInt(1, 2)
      for (let i = 0; i < count; i++) {
        const type = randomChoice(alarmTypes)
        alarms.push({
          id: `alarm-${String(alarmId++).padStart(5, '0')}`,
          stationId: station.id,
          stationName: station.name,
          type,
          level: station.alarmStatus === 'critical' ? 'critical' : 'warning',
          message: alarmMessages[type],
          time: formatTime(new Date(now - randomInt(1, 300) * 60 * 1000)),
          handled: Math.random() > 0.6,
        })
      }
    }
  }

  return alarms
}

const workOrderFaultTypes = ['信号弱', '无法连接', '网速慢', '频繁掉线', '设备故障', '告警处理']
const workOrderStatuses: WorkOrderStatus[] = ['pending', 'assigned', 'processing', 'completed', 'escalated']
const priorities: WorkOrder['priority'][] = ['normal', 'high', 'urgent']

export const generateWorkOrders = (stations: BaseStation[], maintainers: Maintainer[]): WorkOrder[] => {
  const orders: WorkOrder[] = []
  const now = Date.now()

  for (let i = 0; i < 30; i++) {
    const station = randomChoice(stations)
    const status = randomChoice(workOrderStatuses)
    const maintainer = status !== 'pending' ? randomChoice(maintainers) : undefined
    const createTime = new Date(now - randomInt(1, 72) * 60 * 60 * 1000)
    const assignTime = status !== 'pending' ? new Date(createTime.getTime() + randomInt(10, 120) * 60 * 1000) : undefined

    orders.push({
      id: `wo-${String(i + 1).padStart(5, '0')}`,
      stationId: station.id,
      stationName: station.name,
      faultType: randomChoice(workOrderFaultTypes),
      createTime: formatTime(createTime),
      assignTime: assignTime ? formatTime(assignTime) : undefined,
      responseTime: assignTime ? randomInt(5, 60) : undefined,
      status,
      priority: randomChoice(priorities),
      maintainerId: maintainer?.id,
      maintainerName: maintainer?.name,
      maintainerPosition: maintainer?.position,
    })
  }

  return orders
}

export const generateSiteSelections = (): SiteSelection[] => {
  const selections: SiteSelection[] = []
  const applicants = ['张工程师', '李主任', '赵工', '陈工']
  const approvers = ['王管理员', '李主任', '省公司审批']
  const statuses: ApprovalStatus[] = ['pending', 'approved', 'rejected']
  const now = Date.now()

  for (let i = 0; i < 10; i++) {
    selections.push({
      id: `site-${String(i + 1).padStart(4, '0')}`,
      position: randomPosition(),
      applicant: randomChoice(applicants),
      applyTime: formatTime(new Date(now - randomInt(1, 30) * 24 * 60 * 60 * 1000)),
      planningApproval: randomChoice(statuses),
      planningApprover: randomChoice(approvers),
      planningComment: '符合规划要求',
      constructionApproval: randomChoice(statuses),
      constructionApprover: randomChoice(approvers),
      constructionComment: '施工条件满足',
      operationApproval: randomChoice(statuses),
      operationApprover: randomChoice(approvers),
      operationComment: '运营方案可行',
      coverageRadius: randomInRange(200, 800),
    })
  }

  return selections
}

export const generateDroneRoutes = (stations: BaseStation[]): DroneRoute[] => {
  const routes: DroneRoute[] = []
  const routeNames = ['东区巡检航线', '西区巡检航线', '南区巡检航线', '北区巡检航线', '核心区巡检航线']

  for (let i = 0; i < 5; i++) {
    const waypointCount = randomInt(4, 8)
    const waypoints: Vec3[] = []
    for (let j = 0; j < waypointCount; j++) {
      const station = randomChoice(stations)
      waypoints.push({
        x: station.position.x,
        y: randomInRange(10, 30),
        z: station.position.z,
      })
    }
    routes.push({
      id: `route-${String(i + 1).padStart(3, '0')}`,
      name: routeNames[i],
      waypoints,
    })
  }

  return routes
}

export const generateDroneInspections = (routes: DroneRoute[], stations: BaseStation[]): DroneInspection[] => {
  const inspections: DroneInspection[] = []
  const statuses: DroneInspection['status'][] = ['scheduled', 'flying', 'completed']
  const now = Date.now()

  for (let i = 0; i < 8; i++) {
    const route = randomChoice(routes)
    const status = randomChoice(statuses)
    const startTime = new Date(now - randomInt(1, 24) * 60 * 60 * 1000)
    const photos: DroneInspection['photos'] = []

    if (status === 'completed' || status === 'flying') {
      const photoCount = randomInt(2, 5)
      for (let j = 0; j < photoCount; j++) {
        const station = randomChoice(stations)
        photos.push({
          stationId: station.id,
          url: `/photos/drone-${i}-${j}.jpg`,
          issue: Math.random() > 0.7 ? '设备外观正常' : randomChoice(['天线松动', '外壳有积尘', '线缆完好']),
          time: formatTime(new Date(startTime.getTime() + randomInt(5, 60) * 60 * 1000)),
        })
      }
    }

    inspections.push({
      id: `inspection-${String(i + 1).padStart(4, '0')}`,
      routeId: route.id,
      startTime: formatTime(startTime),
      endTime: status === 'completed' ? formatTime(new Date(startTime.getTime() + randomInt(30, 120) * 60 * 1000)) : undefined,
      status,
      photos,
    })
  }

  return inspections
}

const logActions = ['登录系统', '查看基站详情', '修改天线倾角', '处理告警', '创建工单', '分配工单', '审批选址', '启动无人机巡检', '导出报表', '修改基站参数']
const logDetails = ['用户通过认证进入系统', '查看基站实时运行数据', '调整天线下倾角优化覆盖', '确认告警并采取措施', '创建故障处理工单', '将工单分配给维护人员', '审核通过新站选址方案', '调度无人机执行巡检任务', '导出月度运营报表', '更新基站配置参数']

export const generateOperationLogs = (users: User[]): OperationLog[] => {
  const logs: OperationLog[] = []
  const now = Date.now()

  for (let i = 0; i < 100; i++) {
    const user = randomChoice(users)
    const actionIndex = randomInt(0, logActions.length - 1)
    logs.push({
      id: `log-${String(i + 1).padStart(6, '0')}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: logActions[actionIndex],
      detail: logDetails[actionIndex],
      time: formatTime(new Date(now - randomInt(1, 72) * 60 * 60 * 1000)),
    })
  }

  return logs
}

export const generateDailyReport = (stations: BaseStation[], workOrders: WorkOrder[], alarms: Alarm[]): DailyReportData => {
  const today = new Date()
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const stationReports = stations.slice(0, 10).map((station) => {
    const stationAlarms = alarms.filter((a) => a.stationId === station.id)
    const stationOrders = workOrders.filter((w) => w.stationId === station.id)
    const avgResponseTime = stationOrders.length > 0
      ? stationOrders.reduce((sum, w) => sum + (w.responseTime || 0), 0) / stationOrders.length
      : 0

    return {
      stationId: station.id,
      stationName: station.name,
      stationType: station.type,
      avgUsers: Math.round(station.onlineUsers * randomInRange(0.8, 1.2)),
      avgUplink: Math.round(station.uplinkTraffic * randomInRange(0.8, 1.2)),
      avgDownlink: Math.round(station.downlinkTraffic * randomInRange(0.8, 1.2)),
      alarmCount: stationAlarms.length,
      avgResponseTime: Math.round(avgResponseTime),
    }
  })

  const totalAvgUsers = stationReports.reduce((sum, s) => sum + s.avgUsers, 0)
  const totalAvgUplink = stationReports.reduce((sum, s) => sum + s.avgUplink, 0)
  const totalAvgDownlink = stationReports.reduce((sum, s) => sum + s.avgDownlink, 0)
  const totalAlarmCount = stationReports.reduce((sum, s) => sum + s.alarmCount, 0)
  const avgResponseTime = stationReports.length > 0
    ? Math.round(stationReports.reduce((sum, s) => sum + s.avgResponseTime, 0) / stationReports.length)
    : 0

  return {
    date,
    stations: stationReports,
    summary: {
      totalAvgUsers,
      totalAvgUplink,
      totalAvgDownlink,
      totalAlarmCount,
      avgResponseTime,
    },
  }
}

export { randomInRange, randomInt, randomChoice, randomPosition, formatTime, generateId }
