#!/bin/bash
# Production Deployment Pre-flight Checklist
# Run this before deploying to production

set -e

echo "🚀 Production Deployment Pre-flight Checklist"
echo "=============================================="
echo ""

# 1. Check Node.js version
echo "✓ Checking Node.js version..."
NODE_VERSION=$(node --version)
if echo "$NODE_VERSION" | grep -qE "v(1[89]|2[0-9]|[3-9][0-9])"; then
    echo "  ✅ Node.js version compatible ($NODE_VERSION)"
else
    echo "  ⚠️  Node.js version $NODE_VERSION (recommend v18+)"
fi

# 2. Run build
echo ""
echo "✓ Building production bundle..."
npm run build > /dev/null 2>&1 && echo "  ✅ Build succeeded" || (echo "  ❌ Build failed" && exit 1)

# 3. Check critical files
echo ""
echo "✓ Verifying critical files in dist/..."

if [ -f "dist/index.html" ]; then
    echo "  ✅ index.html exists"
else
    echo "  ❌ index.html missing"
    exit 1
fi

if [ -f "dist/libs/sidra/tab6579_municipios.json" ]; then
    echo "  ✅ libs/sidra/tab6579_municipios.json exists ($(du -h dist/libs/sidra/tab6579_municipios.json | cut -f1))"
else
    echo "  ❌ libs/sidra/tab6579_municipios.json MISSING - DEPLOYMENT WILL FAIL"
    exit 1
fi

if [ -d "dist/assets" ]; then
    JS_COUNT=$(find dist/assets -name "*.js" | wc -l)
    CSS_COUNT=$(find dist/assets -name "*.css" | wc -l)
    echo "  ✅ assets/ directory exists ($JS_COUNT JS files, $CSS_COUNT CSS files)"
else
    echo "  ❌ assets/ directory missing"
    exit 1
fi

# 4. Test build locally
echo ""
echo "✓ Testing production build locally..."
echo "  Starting preview server on port 9001..."
npm run preview > /tmp/vite-preview.log 2>&1 &
PREVIEW_PID=$!

sleep 3

# Test endpoints
echo "  Testing critical endpoints..."
if curl -s -I http://localhost:9001/ | grep "200 OK" > /dev/null; then
    echo "    ✅ Main page accessible"
else
    echo "    ❌ Main page not accessible"
    kill $PREVIEW_PID 2>/dev/null || true
    exit 1
fi

if curl -s -I http://localhost:9001/libs/sidra/tab6579_municipios.json | grep "200 OK" > /dev/null; then
    echo "    ✅ SIDRA JSON file accessible"
else
    echo "    ❌ SIDRA JSON file not accessible (404)"
    kill $PREVIEW_PID 2>/dev/null || true
    exit 1
fi

# Stop preview server
kill $PREVIEW_PID 2>/dev/null || true

# 5. Summary
echo ""
echo "=============================================="
echo "✅ All pre-flight checks passed!"
echo ""
echo "📦 Ready to deploy dist/ folder to production"
echo ""
echo "⚠️  IMPORTANT: Deploy the ENTIRE dist/ folder"
echo "   including dist/libs/sidra/ subdirectory"
echo ""
echo "See docs/DEPLOYMENT.md for deployment instructions"
