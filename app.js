import express from 'express';
import { logger } from './utils/logger.js';
import routes from './routes/index.js';

const app = express();

// Middlewares básicos
app.use(express.json());

// Carregar rotas principais da aplicação
app.use('/api', routes);

// Rota de teste/status básica
app.get('/', (req, res) => {
  res.json({ status: 'online', message: 'WhatsApp Bot Backend (MVC) a funcionar com sucesso!' });
});

export default app;