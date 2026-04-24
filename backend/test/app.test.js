const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.ENABLE_OAUTH = 'false';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventify-test';

const app = require('../app');

test('GET / returns API welcome payload', async () => {
  const response = await request(app).get('/');
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.message, 'Welcome to the Eventify API.');
});

test('GET /api/health returns service status object', async () => {
  const response = await request(app).get('/api/health');
  assert.equal(response.statusCode, 200);
  assert.equal(typeof response.body?.data?.services, 'object');
  assert.equal(response.body.data.services.oauthGoogle, 'degraded');
  assert.equal(response.body.data.services.oauthGithub, 'degraded');
});

test('GET /api/auth/google returns OAuth disabled response', async () => {
  const response = await request(app).get('/api/auth/google');
  assert.equal(response.statusCode, 503);
  assert.equal(response.body.success, false);
  assert.equal(response.body.error.code, 'FEATURE_DISABLED');
});

test('GET unknown route returns NOT_FOUND API error', async () => {
  const response = await request(app).get('/api/this-does-not-exist');
  assert.equal(response.statusCode, 404);
  assert.equal(response.body.error.code, 'NOT_FOUND');
});
