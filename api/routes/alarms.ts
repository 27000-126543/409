import { Router, type Request, type Response } from 'express'
import { dataStore } from '../store/dataStore.js'

const router = Router()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const handledParam = req.query.handled as string | undefined
    const handled = handledParam !== undefined ? handledParam === 'true' : undefined
    const alarms = dataStore.getAlarms(handled)
    res.status(200).json({
      success: true,
      data: alarms,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取告警列表失败',
    })
  }
})

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const alarm = dataStore.getAlarmById(req.params.id)
    if (!alarm) {
      res.status(404).json({
        success: false,
        error: '告警不存在',
      })
      return
    }
    res.status(200).json({
      success: true,
      data: alarm,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取告警详情失败',
    })
  }
})

router.post('/:id/handle', async (req: Request, res: Response): Promise<void> => {
  try {
    const alarm = dataStore.handleAlarm(req.params.id)
    if (!alarm) {
      res.status(404).json({
        success: false,
        error: '告警不存在',
      })
      return
    }
    res.status(200).json({
      success: true,
      data: alarm,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '处理告警失败',
    })
  }
})

export default router
