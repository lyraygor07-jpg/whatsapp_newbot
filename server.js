import app from './app.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';

const PORT = config.port;

app.listen(PORT, () => {
  logger.success(`Servidor a correr na porta ${PORT}`);
  logger.info(`Aceda a http://localhost:${PORT} para testar.`);
});