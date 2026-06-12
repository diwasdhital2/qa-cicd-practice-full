/**
 * Minimal test HTTP client — replaces supertest with zero npm dependencies.
 * Usage:  const api = require('../helpers/client'); const res = await api(app).get('/health');
 */

import http from 'http';

type ApiResponse = {
  status: number;
  body: any;
};

type ApiClient = {
  get(path: string): Promise<ApiResponse>;
  post(path: string, body?: any): Promise<ApiResponse>;
  put(path: string, body?: any): Promise<ApiResponse>;
  delete(path: string): Promise<ApiResponse>;
  close(): Promise<void>;
};

function client(app: { listen(port: number, callback: () => void): any }): ApiClient {
  let server: ReturnType<typeof app.listen> | null = null;
  let port: number;

  function ensureServer() {
    if (server) return Promise.resolve();
    return new Promise<void>(resolve => {
      server = app.listen(0, () => {             // OS picks a free port
        const address = server?.address();
        port = typeof address === 'object' && address ? address.port as number : 0;
        resolve();
      });
    });
  }

  function request(method: string, path: string, body?: any): Promise<ApiResponse> {
    return ensureServer().then(() => {
      return new Promise<ApiResponse>((resolve, reject) => {
        const bodyStr = body ? JSON.stringify(body) : null;
        const options = {
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
            let body = null;
            try { body = JSON.parse(data); } catch { body = data; }
            resolve({ status: res.statusCode ?? 0, body });
          });
        });

        req.on('error', reject);
        if (bodyStr) req.write(bodyStr);
        req.end();
      });
    });
  }

  const api: ApiClient = {
    get:    path        => request('GET',    path),
    post:   (path, b)  => request('POST',   path, b),
    put:    (path, b)  => request('PUT',    path, b),
    delete: path        => request('DELETE', path),
    close:  ()         => new Promise(resolve => server ? server.close(resolve) : resolve()),
  };

  return api;
}

export default client;
