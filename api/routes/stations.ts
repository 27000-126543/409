import { Router, type Request, type Response } from 'express'
import { dataStore } from '../store/dataStore.js'
import type { StationType } from '../../shared/types.js'

const router = Router()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const type = req.query.type as StationType | undefined
    const stations = dataStore.getStations(type)
    res.status(200).json({
      success: true,
      data: stations,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取基站列表失败',
    })
  }
})

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const station = dataStore.getStationById(req.params.id)
    if (!station) {
      res.status(404).json({
        success: false,
        error: '基站不存在',
      })
      return
    }
    res.status(200).json({
      success: true,
      data: station,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取基站详情失败',
    })
  }
})

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const station = dataStore.updateStation(req.params.id, req.body)
    if (!station) {
      res.status(404).json({
        success: false,
        error: '基站不存在',
      })
      return
    }
    res.status(200).json({
      success: true,
      data: station,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '更新基站失败',
    })
  }
})

router.get('/:id/traffic', async (req: Request, res: Response): Promise<void> => {
  try {
    const traffic = dataStore.getTrafficData(req.params.id)
    res.status(200).json({
      success: true,
      data: traffic,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取流量数据失败',
    })
  }
})

router.get('/:id/faults', async (req: Request, res: Response): Promise<void> => {
  try {
    const faults = dataStore.getFaultRecords(req.params.id)
    res.status(200).json({
      success: true,
      data: faults,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取故障记录失败',
    })
  }
})

router.get('/faults/list', async (req: Request, res: Response): Promise<void> => {
  try {
    const faults = dataStore.getFaultRecords()
    res.status(200).json({
      success: true,
      data: faults,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取故障记录失败',
    })
  }
})

export default router
