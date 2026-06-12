/**
 * UNIT TESTS — Products API
 * Layer  : Unit (fastest — runs on EVERY git push)
 * Goal   : Validate each endpoint individually, edge cases, error handling
 * Runtime: ~1–2 seconds
 */

import { beforeAll, afterAll, beforeEach, describe, test, expect } from '@jest/globals';
import { createApp } from '../../app/index';
import client from '../helpers/client';


interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  version?: string;
  timestamp?: string;
  data: T;
}

let app: ReturnType<typeof createApp>;
let api: ReturnType<typeof client>;

beforeAll(() => {
  app = createApp();
  api = client(app);
});

afterAll(() => {
  api.close();
});

beforeEach(async () => {
  await api.post('/test/reset');
});

// ═══════════════════════════════════════════════════════════════════════════
// GET /health
// ═══════════════════════════════════════════════════════════════════════════

describe('GET /health', () => {
  test('returns 200 with status ok', async () => {
    const res = await api.get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.version).toBeDefined();
    expect(res.body.timestamp).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GET /products
// ═══════════════════════════════════════════════════════════════════════════

describe('GET /products', () => {
  test('returns all seed products', async () => {
    const res: { status: number; body: ApiResponse<Product[]> } =
      await api.get('/products');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.count).toBe(3);
  });

  test('filters by category=electronics', async () => {
    const res: { status: number; body: ApiResponse<Product[]> } =
      await api.get('/products?category=electronics');

    expect(res.body.count).toBe(2);

    res.body.data.forEach((product: Product) => {
      expect(product.category).toBe('electronics');
    });
  });

  test('filters by category=furniture', async () => {
    const res: { status: number; body: ApiResponse<Product[]> } =
      await api.get('/products?category=furniture');

    expect(res.body.count).toBe(1);
    expect(res.body.data[0].name).toBe('Desk Chair');
  });

  test('returns empty array for unknown category', async () => {
    const res: { status: number; body: ApiResponse<Product[]> } =
      await api.get('/products?category=unknown');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.count).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GET /products/:id
// ═══════════════════════════════════════════════════════════════════════════

describe('GET /products/:id', () => {
  test('returns product by valid id', async () => {
    const res: { status: number; body: ApiResponse<Product> } =
      await api.get('/products/1');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(1);
    expect(res.body.data.name).toBe('Laptop');
    expect(res.body.data.price).toBe(999.99);
  });

  test('returns 404 for non-existent product', async () => {
    const res = await api.get('/products/9999');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not found/i);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /products
// ═══════════════════════════════════════════════════════════════════════════

describe('POST /products', () => {
  const valid: Omit<Product, 'id'> = {
    name: 'Keyboard',
    price: 79.99,
    stock: 100,
    category: 'electronics',
  };

  test('creates a product and returns 201', async () => {
    const res = await api.post('/products', valid);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Keyboard');
    expect(res.body.data.id).toBeDefined();
  });

  test('created product appears in product list', async () => {
    await api.post('/products', valid);

    const list = await api.get('/products');

    expect(list.body.count).toBe(4);
  });

  test('rejects missing name — 400', async () => {
    const res = await api.post('/products', {
      price: 10,
      stock: 5,
      category: 'tools',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/name/i);
  });

  test('rejects empty name string — 400', async () => {
    const res = await api.post('/products', {
      ...valid,
      name: '   ',
    });

    expect(res.status).toBe(400);
  });

  test('rejects negative price — 400', async () => {
    const res = await api.post('/products', {
      ...valid,
      price: -5,
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/price/i);
  });

  test('accepts price of zero', async () => {
    const res = await api.post('/products', {
      ...valid,
      price: 0,
    });

    expect(res.status).toBe(201);
  });

  test('rejects fractional stock — 400', async () => {
    const res = await api.post('/products', {
      ...valid,
      stock: 1.5,
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/stock/i);
  });

  test('rejects negative stock — 400', async () => {
    const res = await api.post('/products', {
      ...valid,
      stock: -1,
    });

    expect(res.status).toBe(400);
  });

  test('accepts stock of zero', async () => {
    const res = await api.post('/products', {
      ...valid,
      stock: 0,
    });

    expect(res.status).toBe(201);
  });

  test('rejects missing category — 400', async () => {
    const res = await api.post('/products', {
      name: 'X',
      price: 10,
      stock: 5,
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/category/i);
  });
});