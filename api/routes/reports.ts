import { Router, type Request, type Response } from 'express'
import { dataStore } from '../store/dataStore.js'

const router = Router()

router.get('/daily', async (req: Request, res: Response): Promise<void> => {
  try {
    const report = dataStore.getDailyReport()
    res.status(200).json({
      success: true,
      data: report,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取日报数据失败',
    })
  }
})

export default router
