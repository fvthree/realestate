# CORS Fix Verification Script (PowerShell)
# This script checks if the proxy configuration is correctly set up

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "CORS Fix Verification" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if package.json has proxy
Write-Host "1. Checking package.json for proxy configuration..." -ForegroundColor Yellow
$packageJson = Get-Content -Path "package.json" -Raw
if ($packageJson -match '"proxy":\s*"http://localhost:8080"') {
    Write-Host "   ✅ Proxy found in package.json" -ForegroundColor Green
} else {
    Write-Host "   ❌ Proxy NOT found in package.json" -ForegroundColor Red
    Write-Host "   Add this line after 'private': true," -ForegroundColor Red
    Write-Host '   "proxy": "http://localhost:8080",' -ForegroundColor Yellow
}
Write-Host ""

# Check config.ts
Write-Host "2. Checking src/config.ts for relative API URL..." -ForegroundColor Yellow
if (Test-Path "src/config.ts") {
    $configTs = Get-Content -Path "src/config.ts" -Raw
    if ($configTs -match 'API_URL:\s*"/api"') {
        Write-Host "   ✅ API_URL is set to relative path" -ForegroundColor Green
    } else {
        Write-Host "   ❌ API_URL is not set correctly" -ForegroundColor Red
        Write-Host '   Change API_URL to: "/api"' -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ src/config.ts not found" -ForegroundColor Red
}
Write-Host ""

# Check .env
Write-Host "3. Checking .env for relative API URL..." -ForegroundColor Yellow
if (Test-Path ".env") {
    $envFile = Get-Content -Path ".env" -Raw
    if ($envFile -match 'REACT_APP_API_URL="/api"') {
        Write-Host "   ✅ .env has relative API URL" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  .env might need updating" -ForegroundColor Yellow
        Write-Host '   Set REACT_APP_API_URL="/api"' -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ .env file not found" -ForegroundColor Red
}
Write-Host ""

# Check if node_modules exists
Write-Host "4. Checking if dependencies are installed..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✅ node_modules found" -ForegroundColor Green
} else {
    Write-Host "   ❌ node_modules NOT found" -ForegroundColor Red
    Write-Host "   Run: npm install" -ForegroundColor Yellow
}
Write-Host ""

# Check if backend is running
Write-Host "5. Checking if backend is accessible..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"test","password":"test"}' -ErrorAction SilentlyContinue -TimeoutSec 2
    Write-Host "   ✅ Backend is responding on port 8080" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*401*" -or $_.Exception.Message -like "*400*") {
        Write-Host "   ✅ Backend is running (returned error status but is accessible)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Cannot connect to backend on port 8080" -ForegroundColor Red
        Write-Host "   Make sure your backend server is running" -ForegroundColor Yellow
    }
}
Write-Host ""

# Summary
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuration Status:" -ForegroundColor White
Write-Host "  📦 Proxy: Check package.json" -ForegroundColor White
Write-Host "  🔧 API URL: Check config.ts and .env" -ForegroundColor White
Write-Host "  📚 Dependencies: Check node_modules" -ForegroundColor White
Write-Host "  🚀 Backend: Check port 8080" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Make sure all checks pass ✅" -ForegroundColor White
Write-Host "  2. RESTART React dev server (Ctrl+C, then npm start)" -ForegroundColor Cyan
Write-Host "  3. Try login at http://localhost:3000/login" -ForegroundColor White
Write-Host ""
Write-Host "If you still get CORS errors after restart:" -ForegroundColor Red
Write-Host "  - Check backend is running on port 8080" -ForegroundColor White
Write-Host "  - Verify endpoint: POST http://localhost:8080/api/auth/login" -ForegroundColor White
Write-Host "  - Check browser console for other errors" -ForegroundColor White
Write-Host "  - Try clearing browser cache" -ForegroundColor White
Write-Host ""

