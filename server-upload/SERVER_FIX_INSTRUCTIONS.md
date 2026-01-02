# Server Configuration Fix - Content-Type Issue

## 🔴 Problem

Your server is currently serving `apple-app-site-association` with:
- ❌ `Content-Type: application/octet-stream` (WRONG)

It needs to be:
- ✅ `Content-Type: application/json` (CORRECT)

This is why Safari is trying to download the file instead of using it for Universal Links.

---

## ✅ Solution: Update Nginx Configuration

### Step 1: Find Your Nginx Config File

Your Nginx config is usually located at:
- `/etc/nginx/sites-available/payairo.com` or
- `/etc/nginx/sites-available/default` or
- `/etc/nginx/nginx.conf`

### Step 2: Add This Configuration

Add this to your server block (inside the `server { ... }` block):

```nginx
# Serve apple-app-site-association with correct Content-Type
location /.well-known/apple-app-site-association {
    default_type application/json;
    add_header Content-Type application/json;
    add_header Access-Control-Allow-Origin *;
}

# Serve assetlinks.json with correct Content-Type
location /.well-known/assetlinks.json {
    default_type application/json;
    add_header Content-Type application/json;
    add_header Access-Control-Allow-Origin *;
}

# Handle referral deep links
location ~ ^/ref/(.+)$ {
    try_files /ref/index.html =404;
}
```

### Step 3: Test and Reload Nginx

```bash
# Test configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

### Step 4: Verify It's Fixed

```bash
# Check Content-Type header
curl -I https://payairo.com/.well-known/apple-app-site-association | grep -i content-type

# Should show: Content-Type: application/json
```

---

## 🔄 Alternative: Quick Fix with .htaccess (If Using Apache)

If you're using Apache instead of Nginx, add this to your `.htaccess` file:

```apache
# Set correct Content-Type for apple-app-site-association
<Files "apple-app-site-association">
    Header set Content-Type "application/json"
</Files>

# Set correct Content-Type for assetlinks.json
<Files "assetlinks.json">
    Header set Content-Type "application/json"
</Files>
```

---

## 🧪 After Fixing: Test Again

1. **Clear browser cache** or use incognito mode
2. **Visit**: https://payairo.com/.well-known/apple-app-site-association
3. **Expected**: Should display JSON (not download prompt)
4. **Verify header**:
   ```bash
   curl -I https://payairo.com/.well-known/apple-app-site-association | grep Content-Type
   ```

---

## ⚠️ Important Notes

1. **No file extension**: The file must be named `apple-app-site-association` (NO `.json` extension)
2. **HTTPS required**: Universal Links only work with HTTPS
3. **Content-Type critical**: Must be `application/json` for iOS to recognize it
4. **File location**: Must be at `/.well-known/apple-app-site-association` (exact path)

---

## 📋 Complete Nginx Server Block Example

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name payairo.com www.payairo.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name payairo.com www.payairo.com;
    
    # SSL configuration (your existing SSL config)
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    root /var/www/payairo.com;
    index index.html;
    
    # Universal Links configuration
    location /.well-known/apple-app-site-association {
        default_type application/json;
        add_header Content-Type application/json;
        add_header Access-Control-Allow-Origin *;
    }
    
    location /.well-known/assetlinks.json {
        default_type application/json;
        add_header Content-Type application/json;
        add_header Access-Control-Allow-Origin *;
    }
    
    # Referral links
    location ~ ^/ref/(.+)$ {
        try_files /ref/index.html =404;
    }
    
    # Your other location blocks...
}
```

---

## ✅ Verification Checklist

After applying the fix:

- [ ] `curl -I` shows `Content-Type: application/json`
- [ ] Safari displays JSON (not download prompt)
- [ ] File accessible at: https://payairo.com/.well-known/apple-app-site-association
- [ ] Apple validator shows ✅ Valid: https://app.links.apple.com/validator

---

## 🆘 Still Not Working?

1. **Check file permissions**: File should be readable
   ```bash
   ls -la /var/www/payairo.com/.well-known/apple-app-site-association
   ```

2. **Check Nginx error logs**:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Verify file exists**:
   ```bash
   cat /var/www/payairo.com/.well-known/apple-app-site-association
   ```

4. **Test with curl**:
   ```bash
   curl -v https://payairo.com/.well-known/apple-app-site-association
   ```
