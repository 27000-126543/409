import { Router, type Request, type Response } from 'express'
import { dataStore } from '../store/dataStore.js'

const router = Router()

router.get('/routes', async (req: Request, res: Response): Promise<void> => {
  try {
    const routes = dataStore.getDroneRoutes()
    res.status(200).json({
      success: true,
      data: routes,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取无人机航线失败',
    })
  }
})

router.get('/inspections', async (req: Request, res: Response): Promise<void> => {
  try {
    const inspections = dataStore.getDroneInspections()
    res.status(200).json({
      success: true,
      data: inspections,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取巡检记录失败',
    })
  }
})

router.post('/inspections', async (req: Request, res: Response): Promise<void> => {
  try {
    const { routeId } = req.body
    const inspection = dataStore.createDroneInspection(routeId)
    res.status(201).json({
      success: true,
      data: inspection,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '创建巡检任务失败',
    })
  }
})

export default router
