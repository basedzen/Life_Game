# Version Verification Guide

This guide helps you verify that your deployed Docker containers match the code in the GitHub repository.

## Quick Version Check

### Method 1: Check Frontend UI (Easiest)
1. Open the application in your browser
2. Look at the bottom of the left sidebar (desktop view)
3. You'll see a 7-character commit hash (e.g., `f4b1a4e`)
4. Compare this with the latest commit on GitHub

### Method 2: Check version.json endpoint
```bash
curl http://localhost:3001/version.json
```

This will return:
```json
{
  "commit": "f4b1a4e2849eb622279e2611f2a0da53184f7b77",
  "buildTime": "2026-01-10T09:15:20Z"
}
```

### Method 3: Compare with GitHub
```bash
# Get latest commit from GitHub
git ls-remote https://github.com/basedzen/Life_Game HEAD

# Compare with deployed version
curl http://localhost:3001/version.json | grep commit
```

## Building with Version Information

### Using the build script (Recommended)
```bash
./build.sh
```

This script automatically:
- Captures the current git commit hash
- Records the build timestamp
- Passes these as build arguments to Docker

### Manual build with version info
```bash
export GIT_COMMIT=$(git rev-parse HEAD)
export BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
docker-compose build
```

### Build without version info
```bash
docker-compose build
```
Note: Version will show as "unknown" if built without the environment variables.

## Deployment Workflow

### Complete rebuild and deploy:
```bash
# 1. Pull latest code
git pull origin main

# 2. Build with version info
./build.sh

# 3. Stop existing containers
docker-compose down

# 4. Start new containers
docker-compose up -d

# 5. Verify version
curl http://localhost:3001/version.json
```

### Quick verification after deploy:
```bash
# Check what commit is deployed
DEPLOYED_COMMIT=$(curl -s http://localhost:3001/version.json | grep -o '"commit":"[^"]*"' | cut -d'"' -f4)

# Check what commit is on GitHub main
GITHUB_COMMIT=$(git ls-remote https://github.com/basedzen/Life_Game HEAD | cut -f1)

# Compare
if [ "$DEPLOYED_COMMIT" = "$GITHUB_COMMIT" ]; then
    echo "✅ Deployed version matches GitHub"
else
    echo "❌ Version mismatch!"
    echo "Deployed: $DEPLOYED_COMMIT"
    echo "GitHub:   $GITHUB_COMMIT"
fi
```

## Troubleshooting

### Version shows "unknown"
**Cause**: Container was built without version information.
**Solution**: Rebuild using `./build.sh`

### Version doesn't match after rebuild
**Possible causes**:
1. **Docker cache**: Docker may be using cached layers
   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```

2. **Wrong container running**: Check container image ID
   ```bash
   docker ps
   docker images | grep gameoflife
   ```

3. **Old image not removed**: Remove old images
   ```bash
   docker-compose down
   docker rmi gameoflife-frontend gameoflife-backend
   ./build.sh
   docker-compose up -d
   ```

### Changes not appearing after deploy
1. **Verify you pulled latest code**:
   ```bash
   git status
   git log -1
   ```

2. **Force rebuild without cache**:
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

3. **Check browser cache**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

4. **Verify version endpoint**:
   ```bash
   curl http://localhost:3001/version.json
   ```

## Portainer Verification

If using Portainer:

1. Go to **Containers** → Select `gameoflife-frontend`
2. Click **Inspect**
3. Look for `Labels` or `Env` section
4. Compare build args with GitHub commit

Or use Portainer's console:
```bash
# In Portainer console for frontend container
cat /usr/share/nginx/html/version.json
```

## CI/CD Integration

For automated deployments, add to your CI/CD pipeline:

```bash
export GIT_COMMIT=$CI_COMMIT_SHA
export BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
docker-compose build
docker-compose push  # if using registry
```
