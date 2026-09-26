import compression from 'compression';
import { Express, Request, Response } from 'express';

// Enable gzip compression
export function setupCompression(app: Express) {
  app.use(compression());
}

// Caching headers
export function setCacheHeaders(req: Request, res: Response, next: Function) {
  if (req.path.match(/\.(jpg|jpeg|png|gif|css|js|woff|woff2|ttf|svg)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
  } else {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  next();
}

// Query optimization helpers
export function buildPaginationQuery(page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;
  return { offset, limit };
}

export function getCacheBuster() {
  return new Date().toISOString().split('T')[0];
}
