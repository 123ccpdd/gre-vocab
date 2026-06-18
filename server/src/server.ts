import { config } from './config/index.js';
import app, { connectDB } from './app.js';

async function start() {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`服务器运行在 http://localhost:${config.port}`);
    console.log(`环境: ${config.nodeEnv}`);
  });
}

start();