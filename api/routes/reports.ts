import { Router, type Request, type Response } from 'express'
import { dataStore } from '../store/dataStore.js'
import type { StationType } from '../../shared/types.js'

const router = Router()

router.get('/daily', async (req: Request, res: Response): Promise<void> => {
  try {
    const date = req.query.date as string | undefined
    const report = dataStore.getDailyReport(date)
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

router.get('/trend', async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string }
    const typesParam = req.query.types as string | undefined
    const types = typesParam ? (typesParam.split(',') as StationType[]) : undefined
    const report = dataStore.getTrendReport(startDate, endDate, types)
    res.status(200).json({
      success: true,
      data: report,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取趋势数据失败',
    })
  }
})

export default router
