import { Router, type Request, type Response } from 'express'
import { dataStore } from '../store/dataStore.js'

const router = Router()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const maintainers = dataStore.getMaintainers()
    res.status(200).json({
      success: true,
      data: maintainers,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取维护人员列表失败',
    })
  }
})

export default router
