import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

/**
 * k6 Load Test for User Service
 * 
 * This script tests the Login -> List Users flow using pre-seeded data from users.json.
 * Run with: k6 run load_test_users.js
 */

const users = new SharedArray('users', function () {
  return JSON.parse(open('./users.json'));
});

export const options = {
  stages: [
    { duration: '30s', target: 5 },  // Ramp-up to 5 concurrent users
    { duration: '1m', target: 10 },  // Stay at 10 users to check stability
    { duration: '20s', target: 0 },  // Ramp-down
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
    http_req_duration: ['p(95)<100'], // 95% of requests should be under 100ms
  },
};

// Adjust this URL to match your running server
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3031';

export default function () {
  // Select a user from the shared array
  const user = users[(__VU + __ITER) % users.length];

  const payload = {
    email: user.email,
    password: 'password123', // Assuming pre-seeded users use this password
  };
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  // 1. Login
  const loginRes = http.post(`${BASE_URL}/api/v1/users/login`, JSON.stringify({
    email: payload.email,
    password: payload.password,
  }), params);

  const loginOk = check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login returns a token': (r) => r.json('data.token') !== undefined,
  });

  if (loginOk) {
    const token = loginRes.json('data.token');
    const authParams = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };

    // 3. List Users (Protected Route)
    const listRes = http.get(`${BASE_URL}/api/v1/users`, authParams);
    check(listRes, {
      'list users returns 200': (r) => r.status === 200,
    });
  }

  sleep(1); // Think time between iterations
}

export function handleSummary(data) {
  return {
    'reports/users-login-basic.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
