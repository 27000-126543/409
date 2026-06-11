import { Router, type Request, type Response } from 'express'
import { dataStore } from '../store/dataStore.js'

const router = Router()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = dataStore.getOperationLogs()
    res.status(200).json({
      success: true,
      data: logs,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取操作日志失败',
    })
  }
})

export default router
