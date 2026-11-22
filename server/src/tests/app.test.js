import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { GAME_NAME } from '../config/gameConfig.js';

describe('Backend Foundation & Health Check', () => {
  it('GET /api/health returns 200 with active game name', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.gameName).toBe(GAME_NAME);
  });
});
