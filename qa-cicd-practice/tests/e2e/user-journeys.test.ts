/**
 * E2E TESTS — Complete User Journeys
 * Layer  : End-to-End (runs after deploy to staging on main branch merges)
 * Goal   : Simulate real user workflows from start to finish.
 *          Tests the ENTIRE stack together — no mocking.
 * Runtime: ~5–10 seconds
 */

import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  await request.post('/test/reset');
});

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEY 1: New customer shops
// ═══════════════════════════════════════════════════════════════════════════
test.describe('E2E Journey 1: Customer browses store and places an order', () => {
  test('complete browse → select → order → confirm flow', async ({ request }) => {
    // ── Step 1: Customer opens the store ──────────────────────────────────
    const catalogRes = await request.get('/products');
    expect(catalogRes.status()).toBe(200);
    const catalog = await catalogRes.json();
    expect(catalog.data.length).toBeGreaterThan(0);

    // ── Step 2: Customer filters by electronics ───────────────────────────
    const electronicsRes = await request.get('/products?category=electronics');
    expect(electronicsRes.status()).toBe(200);
    const electronics = await electronicsRes.json();
    const mouse = electronics.data.find((p: any) => p.name === 'Mouse');
    expect(mouse).toBeDefined();
    expect(mouse.price).toBe(29.99);

    // ── Step 3: Customer views product detail ─────────────────────────────
    const detailRes = await request.get(`/products/${mouse.id}`);
    expect(detailRes.status()).toBe(200);
    const detail = await detailRes.json();
    expect(detail.data.stock).toBeGreaterThan(0);

    // ── Step 4: Customer places order ─────────────────────────────────────
    const orderRes = await request.post('/orders', {
      data: { productId: mouse.id, quantity: 3, userId: 'customer-journey-1' },
    });
    expect(orderRes.status()).toBe(201);
    const order = await orderRes.json();
    expect(order.data.status).toBe('confirmed');
    expect(order.data.total).toBe(89.97); // 3 × 29.99

    // ── Step 5: Customer checks their order history ───────────────────────
    const historyRes = await request.get('/orders/customer-journey-1');
    expect(historyRes.status()).toBe(200);
    const history = await historyRes.json();
    expect(history.count).toBe(1);
    expect(history.data[0].productId).toBe(mouse.id);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEY 2: Admin manages product inventory
// ═══════════════════════════════════════════════════════════════════════════
test.describe('E2E Journey 2: Admin manages product catalog', () => {
  test('create → update price → restock → discontinue', async ({ request }) => {
    // ── Step 1: Admin creates a new product ───────────────────────────────
    const createdRes = await request.post('/products', {
      data: { name: 'Standing Desk', price: 599.99, stock: 15, category: 'furniture' },
    });
    expect(createdRes.status()).toBe(201);
    const created = await createdRes.json();
    const productId = created.data.id;

    // ── Step 2: Product appears in the furniture catalog ──────────────────
    const catalogRes = await request.get('/products?category=furniture');
    const catalog = await catalogRes.json();
    const found = catalog.data.find((p: any) => p.id === productId);
    expect(found).toBeDefined();

    // ── Step 3: Admin applies a sale price ────────────────────────────────
    const discountedRes = await request.put(`/products/${productId}`, {
      data: { price: 449.99 },
    });
    expect(discountedRes.status()).toBe(200);
    const discounted = await discountedRes.json();
    expect(discounted.data.price).toBe(449.99);
    expect(discounted.data.name).toBe('Standing Desk'); // name unchanged

    // ── Step 4: Admin restocks ────────────────────────────────────────────
    const restockedRes = await request.put(`/products/${productId}`, {
      data: { stock: 100 },
    });
    expect(restockedRes.status()).toBe(200);
    const restocked = await restockedRes.json();
    expect(restocked.data.stock).toBe(100);

    // ── Step 5: Admin discontinues product ────────────────────────────────
    const deletedRes = await request.delete(`/products/${productId}`);
    expect(deletedRes.status()).toBe(200);

    // ── Step 6: Product no longer in catalog ──────────────────────────────
    const afterDeleteRes = await request.get(`/products/${productId}`);
    expect(afterDeleteRes.status()).toBe(404);

    const catalogAfterRes = await request.get('/products?category=furniture');
    const catalogAfter = await catalogAfterRes.json();
    expect(catalogAfter.data.find((p: any) => p.id === productId)).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEY 3: Multiple customers, isolated orders
// ═══════════════════════════════════════════════════════════════════════════
test.describe('E2E Journey 3: Multiple concurrent customers', () => {
  test('separate customers have independent order histories', async ({ request }) => {
    await Promise.all([
      request.post('/orders', { data: { productId: 1, quantity: 1, userId: 'alice' } }),
      request.post('/orders', { data: { productId: 2, quantity: 2, userId: 'bob' } }),
      request.post('/orders', { data: { productId: 3, quantity: 1, userId: 'carol' } }),
    ]);

    const [aliceRes, bobRes, carolRes] = await Promise.all([
      request.get('/orders/alice'),
      request.get('/orders/bob'),
      request.get('/orders/carol'),
    ]);

    const [alice, bob, carol] = await Promise.all([
      aliceRes.json(),
      bobRes.json(),
      carolRes.json(),
    ]);

    expect(alice.count).toBe(1);
    expect(bob.count).toBe(1);
    expect(carol.count).toBe(1);
    expect(alice.data[0].productId).toBe(1);
    expect(bob.data[0].productId).toBe(2);
    expect(carol.data[0].productId).toBe(3);
  });

  test('stock is consistently reduced across multiple orders', async ({ request }) => {
    await request.post('/orders', { data: { productId: 2, quantity: 10, userId: 'buyer-1' } });
    await request.post('/orders', { data: { productId: 2, quantity: 5,  userId: 'buyer-2' } });
    await request.post('/orders', { data: { productId: 2, quantity: 20, userId: 'buyer-3' } });

    const productRes = await request.get('/products/2');
    const product = await productRes.json();
    expect(product.data.stock).toBe(165); // 200 - 10 - 5 - 20
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEY 4: Error resilience — bad requests don't corrupt state
// ═══════════════════════════════════════════════════════════════════════════
test.describe('E2E Journey 4: System stays consistent after failures', () => {
  test('failed product creation does not change product count', async ({ request }) => {
    const beforeRes = await request.get('/products');
    const before = await beforeRes.json();

    await request.post('/products', { data: { name: '', price: -1 } }); // invalid

    const afterRes = await request.get('/products');
    const after = await afterRes.json();
    expect(after.count).toBe(before.count);
  });

  test('failed order does not change stock', async ({ request }) => {
    const beforeRes = await request.get('/products/1');
    const before = await beforeRes.json();

    await request.post('/orders', { data: { productId: 1, quantity: 9999, userId: 'u1' } }); // over stock

    const afterRes = await request.get('/products/1');
    const after = await afterRes.json();
    expect(after.data.stock).toBe(before.data.stock);
  });

  test('system health is ok after multiple errors', async ({ request }) => {
    await Promise.all([
      request.get('/products/99999'),
      request.post('/products', { data: { name: '' } }),
      request.post('/orders', { data: { productId: 99999, quantity: 1, userId: 'x' } }),
      request.delete('/products/99999'),
    ]);

    const healthRes = await request.get('/health');
    expect(healthRes.status()).toBe(200);
    const health = await healthRes.json();
    expect(health.status).toBe('ok');

    const productsRes = await request.get('/products');
    const products = await productsRes.json();
    expect(products.count).toBe(3); // seed data intact
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEY 5: Pre-deploy smoke test
// ═══════════════════════════════════════════════════════════════════════════
test.describe('E2E Journey 5: Pre-deploy smoke test', () => {
  const endpoints: { label: string; method: 'get'; path: string; expected: number }[] = [
    { label: 'GET /health',       method: 'get', path: '/health',        expected: 200 },
    { label: 'GET /products',     method: 'get', path: '/products',      expected: 200 },
    { label: 'GET /products/1',   method: 'get', path: '/products/1',    expected: 200 },
    { label: 'GET /orders/smoke', method: 'get', path: '/orders/smoke',  expected: 200 },
  ];

  for (const { label, method, path, expected } of endpoints) {
    test(`${label} returns ${expected}`, async ({ request }) => {
      const res = await request[method](path);
      expect(res.status()).toBe(expected);
    });
  }

  test('can complete a full transaction in under 500ms', async ({ request }) => {
    const start = Date.now();

    await request.post('/products', {
      data: { name: 'Speed Test', price: 1.00, stock: 10, category: 'test' },
    });
    const listRes = await request.get('/products?category=test');
    const list = await listRes.json();
    const id = list.data[0].id;
    await request.post('/orders', { data: { productId: id, quantity: 1, userId: 'smoke-user' } });
    await request.get('/orders/smoke-user');

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(500);
  });
});