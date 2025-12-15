#!/bin/bash
# ==============================================================================
# jsDelivr CDN Delivery Script for guia.js
# ==============================================================================
# This script generates jsDelivr CDN URLs for delivering guia.js from GitHub
# Reference: https://www.jsdelivr.com/?docs=gh
# ==============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project configuration
GITHUB_USER="mpbarbosa"
GITHUB_REPO="guia_js"
PACKAGE_VERSION=$(node -p "require('./package.json').version")
MAIN_FILE="src/guia.js"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         jsDelivr CDN URLs for guia.js                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Repository:${NC} ${GITHUB_USER}/${GITHUB_REPO}"
echo -e "${GREEN}Version:${NC} ${PACKAGE_VERSION}"
echo ""

# ==============================================================================
# 1. Load specific version
# ==============================================================================
echo -e "${YELLOW}📦 Version-Specific URLs:${NC}"
echo ""
echo "Load a specific version (recommended for production):"
echo "https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@${PACKAGE_VERSION}/${MAIN_FILE}"
echo ""
echo "Load entire src directory (specific version):"
echo "https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@${PACKAGE_VERSION}/src/"
echo ""

# ==============================================================================
# 2. Load from specific commit
# ==============================================================================
LATEST_COMMIT=$(git rev-parse HEAD)
echo -e "${YELLOW}🔖 Commit-Specific URL:${NC}"
echo ""
echo "Load from specific commit (${LATEST_COMMIT:0:7}):"
echo "https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@${LATEST_COMMIT}/${MAIN_FILE}"
echo ""

# ==============================================================================
# 3. Load latest from branch
# ==============================================================================
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${YELLOW}🌿 Branch URLs:${NC}"
echo ""
echo "Load latest from ${CURRENT_BRANCH} branch (auto-updates):"
echo "https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@${CURRENT_BRANCH}/${MAIN_FILE}"
echo ""
echo "Load latest from main branch (if main exists):"
echo "https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@main/${MAIN_FILE}"
echo ""

# ==============================================================================
# 4. Load with version ranges
# ==============================================================================
echo -e "${YELLOW}🎯 Version Range URLs (SemVer):${NC}"
echo ""
echo "Load latest v0.6.x (patch updates):"
echo "https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@0.6/${MAIN_FILE}"
echo ""
echo "Load latest v0.x.x (minor updates):"
echo "https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@0/${MAIN_FILE}"
echo ""

# ==============================================================================
# 5. Minified files (if available)
# ==============================================================================
echo -e "${YELLOW}⚡ Optimized URLs:${NC}"
echo ""
echo "Auto-minified version (adds .min.js automatically):"
echo "https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@${PACKAGE_VERSION}/src/guia.min.js"
echo ""
echo "Load IBGE utilities:"
echo "https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@${PACKAGE_VERSION}/src/guia_ibge.js"
echo ""

# ==============================================================================
# 6. Load multiple files (combine)
# ==============================================================================
echo -e "${YELLOW}📚 Combine Multiple Files:${NC}"
echo ""
echo "Combine guia.js and guia_ibge.js:"
echo "https://cdn.jsdelivr.net/combine/gh/${GITHUB_USER}/${GITHUB_REPO}@${PACKAGE_VERSION}/src/guia.js,gh/${GITHUB_USER}/${GITHUB_REPO}@${PACKAGE_VERSION}/src/guia_ibge.js"
echo ""

# ==============================================================================
# 7. Load entire package with /npm (if published to npm)
# ==============================================================================
echo -e "${YELLOW}📦 NPM CDN URLs (if published):${NC}"
echo ""
echo "Load from npm registry:"
echo "https://cdn.jsdelivr.net/npm/guia_js@${PACKAGE_VERSION}/${MAIN_FILE}"
echo ""
echo "Load latest from npm:"
echo "https://cdn.jsdelivr.net/npm/guia_js/${MAIN_FILE}"
echo ""

# ==============================================================================
# 8. HTML Usage Examples
# ==============================================================================
echo -e "${YELLOW}🌐 HTML Usage Examples:${NC}"
echo ""
echo "<!-- Load specific version -->"
echo "<script src=\"https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@${PACKAGE_VERSION}/${MAIN_FILE}\"></script>"
echo ""
echo "<!-- Load with SRI (Subresource Integrity) -->"
echo "<!-- Generate SRI hash at: https://www.srihash.org/ -->"
echo "<script src=\"https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@${PACKAGE_VERSION}/${MAIN_FILE}\""
echo "        integrity=\"sha384-HASH_HERE\""
echo "        crossorigin=\"anonymous\"></script>"
echo ""
echo "<!-- ES Module import -->"
echo "<script type=\"module\">"
echo "  import { WebGeocodingManager } from 'https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@${PACKAGE_VERSION}/${MAIN_FILE}';"
echo "</script>"
echo ""

# ==============================================================================
# 9. Additional Features
# ==============================================================================
echo -e "${YELLOW}🔧 Additional Features:${NC}"
echo ""
echo "Add .map to get source maps:"
echo "https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@${PACKAGE_VERSION}/${MAIN_FILE}.map"
echo ""
echo "Get package.json:"
echo "https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@${PACKAGE_VERSION}/package.json"
echo ""
echo "List all files in the package:"
echo "https://data.jsdelivr.com/v1/package/gh/${GITHUB_USER}/${GITHUB_REPO}@${PACKAGE_VERSION}"
echo ""

# ==============================================================================
# 10. Performance Tips
# ==============================================================================
echo -e "${YELLOW}⚡ Performance Tips:${NC}"
echo ""
echo "1. Always use specific versions in production (not @latest or branch names)"
echo "2. Enable SRI for security and cache validation"
echo "3. jsDelivr automatically serves from 750+ CDN locations worldwide"
echo "4. Files are minified and compressed (Brotli/Gzip) automatically"
echo "5. HTTP/2 and HTTP/3 support for faster loading"
echo ""

# ==============================================================================
# 11. Save URLs to file
# ==============================================================================
OUTPUT_FILE="cdn-urls.txt"
echo -e "${GREEN}💾 Saving URLs to ${OUTPUT_FILE}...${NC}"

cat > "${OUTPUT_FILE}" << EOF
jsDelivr CDN URLs for ${GITHUB_USER}/${GITHUB_REPO} v${PACKAGE_VERSION}
Generated: $(date)
=============================================================================

PRODUCTION (Recommended - Specific Version):
https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@${PACKAGE_VERSION}/${MAIN_FILE}

DEVELOPMENT (Latest from branch):
https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@${CURRENT_BRANCH}/${MAIN_FILE}

VERSION RANGE (Auto-update patches):
https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@0.6/${MAIN_FILE}

NPM CDN (if published to npm):
https://cdn.jsdelivr.net/npm/guia_js@${PACKAGE_VERSION}/${MAIN_FILE}

HTML USAGE:
<script src="https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@${PACKAGE_VERSION}/${MAIN_FILE}"></script>

ES MODULE:
<script type="module">
  import { WebGeocodingManager } from 'https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@${PACKAGE_VERSION}/${MAIN_FILE}';
</script>

PACKAGE INFO API:
https://data.jsdelivr.com/v1/package/gh/${GITHUB_USER}/${GITHUB_REPO}@${PACKAGE_VERSION}

=============================================================================
EOF

echo ""
echo -e "${GREEN}✅ URLs saved to ${OUTPUT_FILE}${NC}"
echo ""

# ==============================================================================
# 12. Test CDN availability (optional)
# ==============================================================================
if command -v curl &> /dev/null; then
    echo -e "${YELLOW}🧪 Testing CDN availability...${NC}"
    TEST_URL="https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@${PACKAGE_VERSION}/package.json"
    
    if curl -s -f -o /dev/null "$TEST_URL"; then
        echo -e "${GREEN}✅ CDN is serving your package!${NC}"
        echo -e "   Test URL: ${TEST_URL}"
    else
        echo -e "${RED}⚠️  Package not yet available on CDN${NC}"
        echo -e "   Make sure you have:"
        echo -e "   1. Pushed your code to GitHub"
        echo -e "   2. Created a git tag: git tag v${PACKAGE_VERSION}"
        echo -e "   3. Pushed the tag: git push origin v${PACKAGE_VERSION}"
        echo -e ""
        echo -e "   Or wait a few minutes for jsDelivr to sync from GitHub"
    fi
else
    echo -e "${YELLOW}ℹ️  Install curl to test CDN availability${NC}"
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  For more information visit: https://www.jsdelivr.com/    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
