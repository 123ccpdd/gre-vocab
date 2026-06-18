import { Request, Response, NextFunction } from 'express';

/**
 * 订阅检查中间件（预留）
 * 当前始终放行，后期接入月卡支付时启用
 */
export function subscriptionMiddleware(req: Request, res: Response, next: NextFunction): void {
  // TODO: 后期检查 req.user 的订阅状态
  // const user = await User.findById(req.user!.userId);
  // if (user.subscription.status !== 'active') {
  //   res.status(403).json({ error: 'SubscriptionRequired', message: '需要订阅月卡' });
  //   return;
  // }
  next();
}