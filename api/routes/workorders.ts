import { Router, type Request, type Response } from 'express'
import { dataStore } from '../store/dataStore.js'
import type { WorkOrderStatus } from '../../shared/types.js'

const router = Router()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const status = req.query.status as WorkOrderStatus | undefined
    const orders = dataStore.getWorkOrders(status)
    res.status(200).json({
      success: true,
      data: orders,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取工单列表失败',
    })
  }
})

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const order = dataStore.getWorkOrderById(req.params.id)
    if (!order) {
      res.status(404).json({
        success: false,
        error: '工单不存在',
      })
      return
    }
    res.status(200).json({
      success: true,
      data: order,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取工单详情失败',
    })
  }
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const order = dataStore.createWorkOrder(req.body)
    res.status(201).json({
      success: true,
      data: order,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '创建工单失败',
    })
  }
})

router.put('/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, maintainerId } = req.body
    const order = dataStore.updateWorkOrderStatus(req.params.id, status, maintainerId)
    if (!order) {
      res.status(404).json({
        success: false,
        error: '工单不存在',
      })
      return
    }
    res.status(200).json({
      success: true,
      data: order,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '更新工单状态失败',
    })
  }
})

router.post('/:id/complete', async (req: Request, res: Response): Promise<void> => {
  try {
    const order = dataStore.completeWorkOrder(req.params.id)
    if (!order) {
      res.status(404).json({
        success: false,
        error: '工单不存在',
      })
      return
    }
    res.status(200).json({
      success: true,
      data: order,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '完成工单失败',
    })
  }
})

export default router
