import { Router, type Request, type Response } from 'express'
import { dataStore } from '../store/dataStore.js'

const router = Router()

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body
    const user = dataStore.login(userId)
    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '登录失败',
    })
  }
})

router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    dataStore.logout()
    res.status(200).json({
      success: true,
      message: '退出成功',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '退出失败',
    })
  }
})

router.get('/user', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = dataStore.getCurrentUser()
    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取用户信息失败',
    })
  }
})

router.get('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const users = dataStore.getUsers()
    res.status(200).json({
      success: true,
      data: users,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取用户列表失败',
    })
  }
})

export default router
