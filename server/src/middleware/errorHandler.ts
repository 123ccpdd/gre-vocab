import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  code?: number;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err.message);

  // Mongoose 验证错误
  if (err.name === 'ValidationError') {
    res.status(400).json({
      error: 'ValidationError',
      message: err.message,
    });
    return;
  }

  // Mongoose 重复键
  if (err.code === 11000) {
    res.status(409).json({
      error: 'Conflict',
      message: '该资源已存在',
    });
    return;
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({
      error: 'Unauthorized',
      message: '认证令牌无效或已过期',
    });
    return;
  }

  // 默认服务器错误
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: statusCode === 500 ? 'InternalServerError' : 'Error',
    message: statusCode === 500 ? '服务器内部错误' : err.message,
  });
}