#!/bin/bash

# Environment Configuration Test Script
# This script helps verify that react-native-config is set up correctly

echo "🧪 Testing Environment Configuration Setup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env files exist
echo "📋 Checking environment files..."
if [ -f ".env.staging" ]; then
    echo -e "${GREEN}✅ .env.staging exists${NC}"
else
    echo -e "${RED}❌ .env.staging NOT found${NC}"
    exit 1
fi

if [ -f ".env.production" ]; then
    echo -e "${GREEN}✅ .env.production exists${NC}"
else
    echo -e "${RED}❌ .env.production NOT found${NC}"
    exit 1
fi

# Check if react-native-config is installed
echo ""
echo "📦 Checking dependencies..."
if npm list react-native-config > /dev/null 2>&1; then
    echo -e "${GREEN}✅ react-native-config is installed${NC}"
    npm list react-native-config | grep react-native-config
else
    echo -e "${RED}❌ react-native-config NOT installed${NC}"
    echo "Run: npm install react-native-config@1.6.1"
    exit 1
fi

# Check iOS pods
echo ""
echo "🍎 Checking iOS setup..."
if [ -d "ios" ]; then
    if [ -d "ios/Pods/react-native-config" ]; then
        echo -e "${GREEN}✅ iOS Pods installed${NC}"
    else
        echo -e "${YELLOW}⚠️  iOS Pods may not be installed${NC}"
        echo "Run: cd ios && pod install && cd .."
    fi
    
    # Check Podfile configuration
    if grep -q "ENVFILES" ios/Podfile; then
        echo -e "${GREEN}✅ Podfile has ENVFILES configuration${NC}"
    else
        echo -e "${RED}❌ Podfile missing ENVFILES configuration${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  iOS directory not found${NC}"
fi

# Check Android setup
echo ""
echo "🤖 Checking Android setup..."
if [ -d "android" ]; then
    if grep -q "react-native-config" android/app/build.gradle; then
        echo -e "${GREEN}✅ Android build.gradle configured${NC}"
    else
        echo -e "${RED}❌ Android build.gradle missing react-native-config setup${NC}"
    fi
    
    if grep -q "productFlavors" android/app/build.gradle; then
        echo -e "${GREEN}✅ Android product flavors configured${NC}"
    else
        echo -e "${RED}❌ Android product flavors NOT configured${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Android directory not found${NC}"
fi

# Check TypeScript config files
echo ""
echo "📝 Checking TypeScript configuration..."
if [ -f "src/config/env.config.ts" ]; then
    echo -e "${GREEN}✅ env.config.ts exists${NC}"
else
    echo -e "${RED}❌ env.config.ts NOT found${NC}"
fi

if [ -f "src/config/react-native-config.d.ts" ]; then
    echo -e "${GREEN}✅ react-native-config.d.ts exists${NC}"
else
    echo -e "${RED}❌ react-native-config.d.ts NOT found${NC}"
fi

# Display staging environment values (if available)
echo ""
echo "🔍 Staging Environment Values:"
if [ -f ".env.staging" ]; then
    echo "API_BASE_URL: $(grep '^API_BASE_URL=' .env.staging | cut -d '=' -f2)"
    echo "ENV_NAME: $(grep '^ENV_NAME=' .env.staging | cut -d '=' -f2)"
    echo "ENV_TYPE: $(grep '^ENV_TYPE=' .env.staging | cut -d '=' -f2)"
fi

echo ""
echo "🔍 Production Environment Values:"
if [ -f ".env.production" ]; then
    echo "API_BASE_URL: $(grep '^API_BASE_URL=' .env.production | cut -d '=' -f2)"
    echo "ENV_NAME: $(grep '^ENV_NAME=' .env.production | cut -d '=' -f2)"
    echo "ENV_TYPE: $(grep '^ENV_TYPE=' .env.production | cut -d '=' -f2)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 Next Steps:"
echo ""
echo "1. For iOS Testing:"
echo "   npm run ios:staging:debug"
echo "   npm run ios:production:debug"
echo ""
echo "2. Check console logs for:"
echo "   [EnvConfig] Configuration loaded successfully"
echo ""
echo "3. Verify API URLs in network requests"
echo ""
echo "4. See docs/IOS_TESTING_GUIDE.md for detailed steps"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"