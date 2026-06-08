import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

/**
 * k6 Load Test: Products with Dynamic Filters
 * This script simulates users applying various combinations of filters:
 * - Category (matching seeder defaults)
 * - Price range (min/max)
 * - Minimum rating
 * - Stock status
 */

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp-up to 20 users
    { duration: '1m', target: 50 },  // Stay at 50 users to check query performance
    { duration: '30s', target: 0 },  // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<50'], // Filtered queries might involve joins; allowing 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3031';

// Categories from your Creativeans-Assignment-BE/cmd/seeder/main.go
const CATEGORIES = ["1", "2", "3", "4", "5", "6", "7", "8"];

export default function () {
  const queryParams = [];

  // 60% chance to filter by a specific category
  if (Math.random() < 0.6) {
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    queryParams.push(`category=${encodeURIComponent(category)}`);
  }

  // 40% chance to apply price filters (Seeder range is 10 to 1000)
  if (Math.random() < 0.4) {
    const minPrice = Math.floor(Math.random() * 50);
    queryParams.push(`minPrice=${minPrice}`);
    queryParams.push(`maxPrice=${minPrice + 300}`);
  }

  // 30% chance to filter by minimum rating
  if (Math.random() < 0.3) {
    queryParams.push(`rating=${Math.floor(Math.random() * 5) + 1}`);
  }

  // 25% chance to filter by name
  if (Math.random() < 0.25) {
    // Common terms that might appear in product names
    const nameSearch = ['Product', 'Item', 'Special', 'Limited'];
    const term = nameSearch[Math.floor(Math.random() * nameSearch.length)];
    queryParams.push(`name=${encodeURIComponent(term)}`);
  }

  // 25% chance to filter by description
  if (Math.random() < 0.25) {
    // Common descriptive keywords
    const descSearch = ['quality', 'durable', 'modern', 'classic'];
    const term = descSearch[Math.floor(Math.random() * descSearch.length)];
    queryParams.push(`description=${encodeURIComponent(term)}`);
  }

  // 30% chance to filter for in-stock items only
  if (Math.random() < 0.3) {
    queryParams.push(`inStock=true`);
  }

  const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  const url = `${BASE_URL}/api/v1/products${queryString}`;

  const res = http.get(url);
  check(res, { 'status is 200': (r) => r.status === 200 });

  sleep(1); // Realistic think time
}

export function handleSummary(data) {
  const reportName = 'reports/products-filters-report.html';
  return {
    [reportName]: htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}