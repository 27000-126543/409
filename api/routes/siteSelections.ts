import { Router, type Request, type Response } from 'express'
import { dataStore } from '../store/dataStore.js'

const router = Router()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const selections = dataStore.getSiteSelections()
    res.status(200).json({
      success: true,
      data: selections,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取选址申请列表失败',
    })
  }
})

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const selection = dataStore.getSiteSelectionById(req.params.id)
    if (!selection) {
      res.status(404).json({
        success: false,
        error: '选址申请不存在',
      })
      return
    }
    res.status(200).json({
      success: true,
      data: selection,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取选址申请详情失败',
    })
  }
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const selection = dataStore.createSiteSelection(req.body)
    res.status(201).json({
      success: true,
      data: selection,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '创建选址申请失败',
    })
  }
})

router.post('/:id/approve', async (req: Request, res: Response): Promise<void> => {
  try {
    const { stage, status, approver, comment } = req.body
    const selection = dataStore.approveSiteSelection(req.params.id, stage, status, approver, comment)
    if (!selection) {
      res.status(404).json({
        success: false,
        error: '选址申请不存在',
      })
      return
    }
    res.status(200).json({
      success: true,
      data: selection,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '审批选址申请失败',
    })
  }
})

export default router
