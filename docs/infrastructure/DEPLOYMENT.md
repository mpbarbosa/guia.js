# Deployment Guide

## Production Deployment Checklist

### Build Process

1. **Run production build**:

   ```bash
   npm run build
   ```

2. **Verify build output** (`dist/` folder):
   - `index.html` - Main application entry point
   - `assets/` - JavaScript bundles and CSS files
   - `libs/sidra/tab6579_municipios.json` - REQUIRED offline IBGE data (190KB)
   - `service-worker.js` - Service worker (if applicable)

### Critical Files for Production

The following files **MUST** be deployed to production:

#### IBGE SIDRA Data (Required for Offline Functionality)

- **File**: `dist/libs/sidra/tab6579_municipios.json`
- **Purpose**: Offline fallback for Brazilian municipality population data
- **Size**: ~190KB
- **URL Pattern**: `https://your-domain.com/libs/sidra/tab6579_municipios.json`

**Common Issue**: 404 errors in production occur when the `libs/` folder is not deployed or is deployed to the wrong path.

### Deployment Structure

Your production server must serve files with this exact structure:

```
your-domain.com/
├── index.html
├── assets/
│   ├── *.js (JavaScript bundles)
│   ├── *.css (Stylesheets)
│   └── favicon.ico
├── libs/
│   └── sidra/
│       └── tab6579_municipios.json  ← REQUIRED
└── service-worker.js (optional)
```

### Verification Steps

After deployment, verify these URLs are accessible:

```bash
# Main application
curl -I https://your-domain.com/

# SIDRA data file (CRITICAL)
curl -I https://your-domain.com/libs/sidra/tab6579_municipios.json

# Should return: HTTP 200 OK
# Should return Content-Type: application/json
```

### Common Deployment Issues

#### 404 Error for libs/sidra/tab6579_municipios.json

**Symptoms**:

```
GET https://your-domain.com/libs/sidra/tab6579_municipios.json 404 (Not Found)
```

**Causes**:

1. The `dist/libs/` folder was not uploaded to production
2. Server configuration blocking access to `.json` files
3. File permissions incorrect on server
4. Deployment script excluding the `libs/` directory

**Solution**:

1. Ensure entire `dist/` folder is deployed, including subdirectories
2. Check server configuration allows serving `.json` files
3. Verify file permissions: `chmod 644 dist/libs/sidra/*.json`
4. Update deployment script to include all files

#### Build Not Including libs/ Folder

**Symptoms**: `dist/libs/` folder is empty or missing after build

**Solution**:

1. Verify `public/libs/` folder exists in source
2. Check `vite.config.js` has `publicDir: '../public'`
3. Rebuild: `npm run build`
4. Verify: `ls -la dist/libs/sidra/`

#### CORS/Network Errors for Nominatim API

**Symptoms**:

```
TypeError: Failed to fetch
GET https://nominatim.openstreetmap.org/reverse 404/CORS error
```

**Causes**:

1. OpenStreetMap Nominatim API blocked by CORS policy
2. Network firewall blocking external API calls
3. Rate limiting (HTTP 429) from excessive requests
4. Server SSL/TLS configuration issues

**Solution**:
The application has **automatic CORS fallback** enabled in production:

1. First attempt: Direct connection to Nominatim API
2. On failure: Automatic retry via CORS proxy (https://api.allorigins.win)
3. User notification if both attempts fail

**Server Configuration** (Optional CORS Headers):
If hosting your own reverse geocoding service, ensure CORS headers allow access from your domain.

### Server Configuration

#### Apache (.htaccess)

```apache
# Allow JSON files
<FilesMatch "\\.json$">
    Header set Access-Control-Allow-Origin "*"
    Header set Content-Type "application/json"
</FilesMatch>

# Enable gzip compression for JSON
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE application/json
</IfModule>
```

#### Nginx

```nginx
location /libs/ {
    add_header Access-Control-Allow-Origin *;
    add_header Content-Type application/json;
    gzip on;
    gzip_types application/json;
}
```

### Vite Build Configuration

The build process (via `vite.config.js`) automatically:

- Copies `public/libs/` to `dist/libs/`
- Minifies JavaScript with Terser
- Generates source maps
- Creates code-split bundles

**Do not modify** the build output manually - always redeploy from a fresh build.

### Testing Production Build Locally

Before deploying to production, test the build locally:

```bash
# Build
npm run build

# Preview (serves dist/ folder on port 9001)
npm run preview

# Test critical endpoints
curl -I http://localhost:9001/libs/sidra/tab6579_municipios.json
```

### CDN Deployment (Optional)

If using a CDN (e.g., jsDelivr, Cloudflare), ensure:

1. The `libs/` folder is included in CDN distribution
2. JSON files have correct MIME types
3. CORS headers allow cross-origin requests

### Rollback Procedure

If a deployment fails:

1. **Keep previous build**: Always keep the last working `dist/` folder
2. **Redeploy previous version**: Upload previous `dist/` folder
3. **Verify**: Test critical endpoints after rollback
4. **Investigate**: Check build logs and server logs

### Monitoring

After deployment, monitor for these errors:

```javascript
// Browser console errors - SIDRA JSON file
"Failed to fetch: /libs/sidra/tab6579_municipios.json"
"404 (Not Found)"

// Network tab - SIDRA file
// Status: 404 for libs/sidra/tab6579_municipios.json
```

If these errors appear, the deployment is incomplete.

**CORS/Geocoding Errors** (Expected in production):

```javascript
// First fetch attempt (expected to fail with CORS)
"TypeError: Failed to fetch"
"GET https://nominatim.openstreetmap.org/reverse"

// Automatic fallback (should succeed)
"Retrying with CORS proxy fallback..."
"CORS proxy fallback succeeded"
```

If you see `"CORS proxy fallback also failed"`, check:

1. Network connectivity from production server
2. Firewall rules blocking external API calls
3. SSL/TLS certificate issues

**Performance Monitoring**:

- Monitor CORS fallback frequency (should decrease over time)
- Track geocoding success rate (should be >95%)
- Watch for rate limiting errors (HTTP 429)

---

**Last Updated**: 2026-02-16
**Version**: 0.9.0-alpha
