#!/bin/bash

# CORS Fix Verification Script
# This script checks if the proxy configuration is correctly set up

echo "=================================="
echo "CORS Fix Verification"
echo "=================================="
echo ""

# Check if package.json has proxy
echo "1. Checking package.json for proxy configuration..."
if grep -q '"proxy": "http://localhost:8080"' package.json; then
    echo "   ✅ Proxy found in package.json"
else
    echo "   ❌ Proxy NOT found in package.json"
    echo "   Add this line after 'private': true,"
    echo "   \"proxy\": \"http://localhost:8080\","
fi
echo ""

# Check config.ts
echo "2. Checking src/config.ts for relative API URL..."
if grep -q 'API_URL: "/api"' src/config.ts; then
    echo "   ✅ API_URL is set to relative path"
else
    echo "   ❌ API_URL is not set correctly"
    echo "   Change API_URL to: \"/api\""
fi
echo ""

# Check .env
echo "3. Checking .env for relative API URL..."
if grep -q 'REACT_APP_API_URL="/api"' .env; then
    echo "   ✅ .env has relative API URL"
else
    echo "   ⚠️  .env might need updating"
    echo "   Set REACT_APP_API_URL=\"/api\""
fi
echo ""

# Check if node_modules exists
echo "4. Checking if dependencies are installed..."
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules found"
else
    echo "   ❌ node_modules NOT found"
    echo "   Run: npm install"
fi
echo ""

# Summary
echo "=================================="
echo "Summary"
echo "=================================="
echo ""
echo "Configuration Status:"
echo "  Proxy: Check package.json"
echo "  API URL: Check config.ts and .env"
echo "  Dependencies: Check node_modules"
echo ""
echo "Next Steps:"
echo "  1. Make sure all checks pass ✅"
echo "  2. RESTART React dev server (Ctrl+C, then npm start)"
echo "  3. Try login at http://localhost:3000/login"
echo ""
echo "If you still get CORS errors after restart:"
echo "  - Check backend is running on port 8080"
echo "  - Verify endpoint: POST http://localhost:8080/api/auth/login"
echo "  - Check browser console for other errors"
echo ""

