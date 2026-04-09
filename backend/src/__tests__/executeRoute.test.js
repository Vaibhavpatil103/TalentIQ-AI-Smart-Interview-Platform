import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import executeRoute from '../routes/executeRoute.js';
import rateLimit from "express-rate-limit";

// Mock the protectRoute to bypass authentication during unit testing
vi.mock('../middleware/protectRoute.js', () => ({
  protectRoute: (req, res, next) => next(),
}));

const app = express();
app.use(express.json());
app.use('/api/execute', executeRoute);

describe('Execute Route Unit Tests', () => {
  it('should return 400 if language or code is missing', async () => {
    const res = await request(app)
      .post('/api/execute')
      .send({ language: 'javascript' }); // Missing code

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Language and code are required');
  });

  it('should return 400 for unsupported languages', async () => {
    const res = await request(app)
      .post('/api/execute')
      .send({ language: 'ruby', code: 'puts "Hello"' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Unsupported language: ruby/);
  });

  // Note: We bypass running full node process locally to avoid execution hangs in unit test environments.
  // Full execution behavior is typically integration tested.
});
