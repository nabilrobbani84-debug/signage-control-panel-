import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { env } from './config/env';
import { authRouter } from './modules/auth/auth.router';
import { devicesRouter } from './modules/devices/devices.router';
import { contentsRouter } from './modules/contents/contents.router';
import { SocketGateway } from './socket/socket.gateway';
import { errorHandler, notFound } from './middleware/errorHandler';
import { prisma } from './lib/prisma';

async function bootstrap() {
  const app = express();
  const httpServer = http.createServer(app);

  // ── Global Middleware ──────────────────────────────────
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

  // ── Health Check ───────────────────────────────────────
  app.get('/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        version: '1.0.0',
      });
    } catch {
      res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
    }
  });

  // ── API Routes ─────────────────────────────────────────
  app.use('/api/auth', authRouter);
  app.use('/api/devices', devicesRouter);
  app.use('/api/contents', contentsRouter);

  // ── 404 Handler ────────────────────────────────────────
  app.use(notFound);

  // ── Global Error Handler ───────────────────────────────
  app.use(errorHandler);

  // ── Socket.io ─────────────────────────────────────────
  const gateway = SocketGateway.getInstance();
  gateway.initialize(httpServer);

  // ── Start Listening ────────────────────────────────────
  httpServer.listen(env.PORT, () => {
    console.log('');
    console.log('  ╔════════════════════════════════════════╗');
    console.log('  ║   Signage Control Panel — Server       ║');
    console.log('  ╚════════════════════════════════════════╝');
    console.log(`  🚀 HTTP Server  : http://localhost:${env.PORT}`);
    console.log(`  🔌 Socket.io   : ws://localhost:${env.PORT}`);
    console.log(`  🌍 Environment : ${env.NODE_ENV}`);
    console.log('');
  });

  // ── Graceful Shutdown ──────────────────────────────────
  const shutdown = async (signal: string) => {
    console.log(`\n[Server] Received ${signal} — shutting down gracefully...`);
    httpServer.close(async () => {
      await prisma.$disconnect();
      console.log('[Server] Database connection closed. Goodbye.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});
