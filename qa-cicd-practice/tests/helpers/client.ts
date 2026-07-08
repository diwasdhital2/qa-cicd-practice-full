/**
 * Minimal test HTTP client — replaces supertest with zero npm dependencies.
 * Usage:  const api = require('../helpers/client'); const res = await api(app).get('/health');
 */

import http, { Server } from 'http';
import { Server as HttpServer } from 'http';

interface ApiResponse {
  status: number;
  body: any;
}

interface TestClient {
  get: (path: string) => Promise<ApiResponse>;
  post: (path: string, body?: unknown) => Promise<ApiResponse>;
  put: (path: string, body?: unknown) => Promise<ApiResponse>;
  delete: (path: string) => Promise<ApiResponse>;
  close: () => Promise<void>;
}

// Minimal shape needed from an Express-like app (avoids hard dependency on express types)
type Listenable = {
  listen: (port: number, callback: () => void) => HttpServer;
};

function client(app: Listenable): TestClient {
  let server: HttpServer | undefined;
  let port: number;

  function ensureServer(): Promise<void> {
    if (server) return Promise.resolve();
    return new Promise<void>(resolve => {
      server = app.listen(0, () => {             // OS picks a free port
        const address = server!.address();
        port = typeof address === 'object' && address !== null ? address.port : 0;
        resolve();
      });
    });
  }

  function request(method: string, path: string, body?: unknown): Promise<ApiResponse> {
    return ensureServer().then(() => {
      return new Promise<ApiResponse>((resolve, reject) => {
        const bodyStr = body ? JSON.stringify(body) : null;
        const options: http.RequestOptions = {
          hostname: '127.0.0.1',
          port,
          path,
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
          },
        };

        const req = http.request(options, res => {
          let data = '';
          res.on('data', chunk => { data += chunk; });
          res.on('end', () => {
            let parsedBody: any = null;
            try { parsedBody = JSON.parse(data); } catch { parsedBody = data; }
            resolve({ status: res.statusCode ?? 0, body: parsedBody });
          });
        });

        req.on('error', reject);
        if (bodyStr) req.write(bodyStr);
        req.end();
      });
    });
  }

  const api: TestClient = {
    get:    (path: string) => request('GET', path),
    post:   (path: string, b?: unknown) => request('POST', path, b),
    put:    (path: string, b?: unknown) => request('PUT', path, b),
    delete: (path: string) => request('DELETE', path),
    close:  () => new Promise<void>(resolve => server ? server.close(() => resolve()) : resolve()),
  };

  return api;
}

export default client;