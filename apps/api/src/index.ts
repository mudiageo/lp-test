import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { toNodeHandler } from 'better-auth/node';
import swaggerUi from 'swagger-ui-express';
import { auth } from './lib/auth';
import apiRouter from './routes';
import { errorHandler } from './middleware/error.middleware';
import { generateCombinedSpec } from './docs/generate-spec';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));

// better-auth handler
app.all('/api/auth/*', toNodeHandler(auth));

app.use(express.json());

// Swagger docs — spec is generated lazily from Valibot schemas + better-auth plugin
app.use('/api/docs', swaggerUi.serve);
app.get('/api/docs', async (_req, res, next) => {
  try {
    const spec = await generateCombinedSpec();
    const handler = swaggerUi.setup(spec as Parameters<typeof swaggerUi.setup>[0]);
    handler(_req, res, next);
  } catch (err) {
    next(err);
  }
});

// Raw OpenAPI JSON endpoint
app.get('/api/docs-json', async (_req, res, next) => {
  try {
    const spec = await generateCombinedSpec();
    res.json(spec);
  } catch (err) {
    next(err);
  }
});

// API routes
app.use('/api', apiRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
  console.log(`API docs: http://localhost:${PORT}/api/docs`);
});

export default app;
