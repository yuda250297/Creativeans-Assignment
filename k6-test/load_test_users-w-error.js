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
    { duration: '1m', target: 200 }, // Ramp-up to 200 concurrent users
    { duration: '2m', target: 200 }, // Stay at 200 users to test peak load
    { duration: '30s', target: 0 },  // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // Bcrypt is CPU intensive, allowing 500ms under load
  },
};

// Adjust this URL to match your running server
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3031';

export default function () {
  // Scenario: 80% valid login attempts, 20% invalid
  const isValidAttempt = Math.random() < 0.8;
  const user = users[(__VU + __ITER) % users.length];

  const email = isValidAttempt ? user.email : `invalid_${Date.now()}@example.com`;
  const password = isValidAttempt ? 'password123' : 'wrong_password';

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  // 1. Login
  const loginRes = http.post(`${BASE_URL}/api/v1/users/login`, JSON.stringify({
    email: email,
    password: password,
  }), params);

  let loginOk = false;

  check(loginRes, {
    'valid login status is 200': (r) => !isValidAttempt || r.status === 200,
    'invalid login status is 401 or 400': (r) => isValidAttempt || (r.status === 401 || r.status === 400),
  });

  // Capture token only if it was a valid attempt
  loginOk = isValidAttempt && check(loginRes, {
    'token exists for valid login': (r) => r.json('data.token') !== undefined,
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
  const reportName = 'reports/users-login-w-error.html';
  console.log(`Test complete. Report available at: ${reportName}`);
  return {
    [reportName]: htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
