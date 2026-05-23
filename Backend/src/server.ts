import app from './app.js';
import config from './config/index.js';
import connectDatabase from './config/database.js';

const startServer = async (): Promise<void> => {
  await connectDatabase();

  const server = app.listen(config.port, () => {
    console.log(`server listening on port ${config.port}`);
  });

  const shutdown = (): void => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

startServer().catch((error: Error) => {
  console.error('failed to start server:', error.message);
  process.exit(1);
});
