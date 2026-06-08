import http from 'k6/http';
import { check } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

export const options = {
  vus: 10,
  duration: '60s',
  thresholds: {
    http_req_duration: ['p(90)<50', 'p(95)<50'],
  },
};

export default function () {
  const res = http.get('http://localhost:3031/api/v1/products');
  check(res, { 'status is 200': (r) => r.status === 200 });
}

export function handleSummary(data) {
  return {
    'reports/get-products.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
