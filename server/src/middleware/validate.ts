import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Zod 请求参数校验中间件
 * 支持校验 body / query / params
 */
export function validate(schema: ZodSchema, target: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      _res.status(400).json({
        error: 'ValidationError',
        message: '请求参数校验失败',
        details: errors,
      });
      return;
    }
    // 用解析后的数据替换原始数据（去除多余字段、应用默认值）
    (req as any)[target] = result.data;
    next();
  };
}