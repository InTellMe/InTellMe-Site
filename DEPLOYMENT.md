# Deployment Guide for InTellMe Site

## HTTPS Configuration

This site is configured with best practices for HTTPS security. The browser "Not Secure" warning will be removed once deployed with proper HTTPS configuration.

## Deployment Options

### 1. Netlify (Recommended)

Netlify automatically provides free HTTPS certificates via Let's Encrypt.

**Setup:**
1. Connect your GitHub repository to Netlify
2. Set build settings:
   - Build command: (leave empty)
   - Publish directory: `.`
3. Deploy!

The `netlify.toml` file in this repository will automatically:
- Force HTTPS redirects
- Apply security headers
- Configure caching

**Custom Domain:**
1. Add your custom domain in Netlify dashboard
2. Update DNS records as instructed
3. Enable HTTPS (automatic with Let's Encrypt)
4. Force HTTPS redirect (enabled by default)

### 2. GitHub Pages

GitHub Pages provides free HTTPS for `.github.io` domains and custom domains.

**Setup:**
1. Go to repository Settings → Pages
2. Select branch: `main` (or your deployment branch)
3. Select folder: `/ (root)`
4. Save

**Custom Domain:**
1. Add `CNAME` file with your domain name
2. Configure DNS:
   - Add A records pointing to GitHub Pages IPs:
     - 185.199.108.153
     - 185.199.109.153
     - 185.199.110.153
     - 185.199.111.153
   - Or add CNAME record pointing to `<username>.github.io`
3. Enable "Enforce HTTPS" in repository settings

**Note:** For GitHub Pages, create a workflow file `.github/workflows/pages.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      - uses: actions/deploy-pages@v4
```

### 3. Cloudflare Pages

Cloudflare Pages provides free HTTPS with automatic certificate provisioning.

**Setup:**
1. Connect your GitHub repository to Cloudflare Pages
2. Set build settings:
   - Build command: (leave empty)
   - Build output directory: `/`
3. Deploy!

The `_headers` file will automatically apply security headers.

**Custom Domain:**
1. Add custom domain in Cloudflare Pages dashboard
2. Update DNS (if using Cloudflare DNS, it's automatic)
3. HTTPS is enabled by default

### 4. Vercel

Vercel provides automatic HTTPS with zero configuration.

**Setup:**
1. Import your GitHub repository
2. Framework Preset: Other
3. Build Command: (leave empty)
4. Output Directory: `./`
5. Deploy!

**Custom Domain:**
1. Add domain in Vercel dashboard
2. Configure DNS as instructed
3. HTTPS is automatic

### 5. Apache Server (.htaccess)

If deploying to a traditional Apache server, the `.htaccess` file is included.

**Requirements:**
- Apache with mod_rewrite, mod_headers, mod_expires, mod_deflate
- Valid SSL certificate (use Let's Encrypt via certbot)

**Setup SSL with Let's Encrypt:**
```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-apache
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com
```

The `.htaccess` file will automatically:
- Force HTTPS redirects
- Apply security headers
- Enable caching
- Enable compression

### 6. Nginx

For Nginx servers, add this to your server configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';" always;

    root /var/www/intellme;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Enable gzip
    gzip on;
    gzip_types text/plain text/css text/javascript application/javascript application/json;
}
```

**Setup SSL with Let's Encrypt:**
```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Security Features Implemented

### 1. Content Security Policy (CSP)
Prevents XSS attacks by controlling which resources can be loaded.

### 2. Strict Transport Security (HSTS)
Forces browsers to always use HTTPS for your domain.

### 3. X-Frame-Options
Prevents clickjacking attacks by disabling iframe embedding.

### 4. X-Content-Type-Options
Prevents MIME type sniffing attacks.

### 5. X-XSS-Protection
Enables browser's built-in XSS protection.

### 6. Referrer Policy
Controls how much referrer information is sent with requests.

### 7. Permissions Policy
Restricts access to browser features like geolocation, camera, and microphone.

## Verification

After deployment, verify HTTPS is working:

1. **Visit your site** - URL should show `https://` with a lock icon
2. **Check security headers** - Use [securityheaders.com](https://securityheaders.com)
3. **Test SSL configuration** - Use [SSL Labs](https://www.ssllabs.com/ssltest/)
4. **Verify HSTS** - Check if HSTS is properly configured

## Troubleshooting

### "Not Secure" Warning Still Appears

1. **Check HTTPS is enabled** on your hosting provider
2. **Verify SSL certificate** is valid and not expired
3. **Check mixed content** - ensure all resources use HTTPS
4. **Clear browser cache** and reload the page
5. **Check DNS propagation** - may take up to 48 hours

### Security Headers Not Applied

1. **Netlify/Cloudflare Pages:** Verify `_headers` file is in root directory
2. **Apache:** Ensure `.htaccess` is in root and mod_headers is enabled
3. **Nginx:** Verify security headers are in server configuration
4. **Check with browser DevTools:** Open Network tab → Headers

### CSP Errors

If you see CSP violations in console:
1. Open browser DevTools → Console
2. Note which resources are blocked
3. Update CSP in configuration files to allow those resources
4. Common additions: analytics, fonts, CDNs

## Contact

For deployment assistance, contact:
- Email: brandon@intellmeai.com
- Security issues: security@intellmeai.com
