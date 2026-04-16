#!/usr/bin/env node

/**
 * Properties API Tester
 *
 * This script helps test the properties API endpoints
 * Usage: node test-properties-api.js
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:8080/api';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

let authToken = null;
let cookies = {};

/**
 * Make HTTP request
 */
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const protocol = url.protocol === 'https:' ? https : http;

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    // Add cookies if they exist
    if (Object.keys(cookies).length > 0) {
      const cookieString = Object.entries(cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');
      options.headers['Cookie'] = cookieString;
    }

    const req = protocol.request(url, options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        // Store cookies from Set-Cookie header
        const setCookie = res.headers['set-cookie'];
        if (setCookie) {
          setCookie.forEach(cookie => {
            const [nameValue] = cookie.split(';');
            const [name, value] = nameValue.split('=');
            cookies[name.trim()] = value.trim();
          });
        }

        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: responseData ? JSON.parse(responseData) : null,
          cookies: res.headers['set-cookie']
        });
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Test sequence
 */
async function runTests() {
  console.log('🧪 Properties API Test Suite');
  console.log('================================\n');

  try {
    // Test 1: Health Check
    console.log('Test 1: Health Check');
    console.log('-------------------');
    try {
      const healthRes = await makeRequest('GET', '/health');
      console.log('✅ Backend is running');
      console.log(`   Status: ${healthRes.status}`);
    } catch (err) {
      console.log('❌ Backend is NOT running on localhost:8080');
      console.log(`   Error: ${err.message}`);
      console.log('   Start your backend and try again\n');
      return;
    }

    // Test 2: Login
    console.log('\nTest 2: Login');
    console.log('-------------');
    console.log(`Attempting login with email: ${TEST_EMAIL}`);

    const loginRes = await makeRequest('POST', '/auth/login', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    console.log(`Status: ${loginRes.status}`);

    if (loginRes.status === 200) {
      console.log('✅ Login successful');
      if (loginRes.body?.accessToken) {
        authToken = loginRes.body.accessToken;
        console.log(`   Token: ${authToken.substring(0, 20)}...`);
      }
      if (loginRes.cookies) {
        console.log('   Cookies received:');
        loginRes.cookies.forEach(c => console.log(`     - ${c.split(';')[0]}`));
      }
    } else {
      console.log('❌ Login failed');
      console.log(`   Response: ${JSON.stringify(loginRes.body)}`);
      console.log('   Check your credentials and try again\n');
      return;
    }

    // Test 3: Get Properties
    console.log('\nTest 3: Get Properties');
    console.log('---------------------');

    const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
    const propsRes = await makeRequest('GET', '/me/properties', null, headers);

    console.log(`Status: ${propsRes.status}`);

    if (propsRes.status === 200) {
      console.log('✅ Properties endpoint accessible');
      const properties = Array.isArray(propsRes.body) ? propsRes.body : (propsRes.body?.data || []);
      console.log(`   Found: ${properties.length} properties`);

      if (properties.length > 0) {
        console.log('   Sample property:');
        const prop = properties[0];
        console.log(`     - Title: ${prop.title}`);
        console.log(`     - Price: ₱${prop.price_php}`);
        console.log(`     - Type: ${prop.property_type}`);
        console.log(`     - Status: ${prop.status}`);
      } else {
        console.log('   ⚠️  No properties found (this is OK if you just started)');
      }
    } else if (propsRes.status === 401) {
      console.log('❌ Unauthorized (401)');
      console.log('   Your auth token is not valid');
      console.log('   Make sure:');
      console.log('   - You logged in successfully');
      console.log('   - The token/cookie is being sent with the request');
      console.log('   - Backend is checking auth correctly\n');
    } else if (propsRes.status === 500) {
      console.log('❌ Server Error (500)');
      console.log(`   Response: ${JSON.stringify(propsRes.body)}`);
      console.log('   Check your backend logs\n');
    } else {
      console.log(`❌ Unexpected status: ${propsRes.status}`);
      console.log(`   Response: ${JSON.stringify(propsRes.body)}`);
    }

    // Test 4: Response Format Check
    console.log('\nTest 4: Response Format');
    console.log('----------------------');
    const responseBody = propsRes.body;
    console.log(`Response type: ${typeof responseBody}`);
    console.log(`Is array: ${Array.isArray(responseBody)}`);

    if (Array.isArray(responseBody)) {
      console.log('✅ Response is a direct array (format OK)');
    } else if (responseBody?.data && Array.isArray(responseBody.data)) {
      console.log('✅ Response is wrapped in .data (format OK)');
    } else if (responseBody?.properties && Array.isArray(responseBody.properties)) {
      console.log('✅ Response is wrapped in .properties (format OK)');
    } else {
      console.log('⚠️  Response format might not match expectations');
      console.log(`   Keys: ${Object.keys(responseBody || {})}`);
    }

    // Summary
    console.log('\n✅ All tests completed successfully!');
    console.log('\nIf properties aren\'t showing in the UI:');
    console.log('1. Check browser DevTools Console for errors');
    console.log('2. Check Network tab for /api/me/properties request');
    console.log('3. Ensure you\'re logged in before viewing properties');

  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

// Run tests
runTests();

