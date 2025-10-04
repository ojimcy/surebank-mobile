# SureBank Mobile - Production Deployment Guide

## Pre-Deployment Checklist

### ✅ Code Quality (COMPLETED)
- [x] All TypeScript errors fixed
- [x] ESLint configuration created
- [x] Navigation types fixed
- [x] Theme system errors resolved
- [ ] Remove remaining `console.log` statements (optional, warnings only)
- [ ] Address TODO/FIXME comments (optional)

### ⚠️ Branding Assets (NEEDS DESIGNER)
- [ ] **CRITICAL**: Replace placeholder app icon with SureBank branded icon
  - Location: `assets/icon.png` (1024x1024px)
  - Design: See `assets/BRANDING_GUIDE.md`
- [ ] **CRITICAL**: Replace placeholder adaptive icon
  - Location: `assets/adaptive-icon.png` (1024x1024px)
- [ ] **CRITICAL**: Create branded splash screen
  - Location: `assets/splash-icon.png` (1024x1024px)
- [ ] Create proper favicon
  - Location: `assets/favicon.png` (48x48px)

### ✅ Configuration (COMPLETED)
- [x] `app.config.ts` updated with production settings
- [x] `eas.json` configured for build profiles
- [x] `.env.example` updated to reflect SureBank branding
- [x] EAS project ID added to config

### 🔒 Security & Environment
- [ ] Create production `.env` file (copy from `.env.example`)
- [ ] Add Firebase production credentials to `.env`
- [ ] Configure Paystack production keys
- [ ] Set production API URLs
- [ ] Add `.env` to `.gitignore` (verify it exists)
- [ ] Review and secure all API endpoints
- [ ] Enable rate limiting on backend
- [ ] Configure SSL certificates

### 📱 Testing
- [ ] Test on physical Android device
- [ ] Test on physical iOS device (if available)
- [ ] Test all critical user flows:
  - [ ] Registration and login
  - [ ] KYC verification
  - [ ] Package creation
  - [ ] Deposits and withdrawals
  - [ ] Payment methods
  - [ ] Transaction history
- [ ] Test biometric authentication
- [ ] Test deep linking
- [ ] Test push notifications
- [ ] Performance testing (load times, memory usage)

### 📋 Legal & Compliance
- [ ] Privacy Policy URL (update in app.config.ts)
- [ ] Terms of Service URL (update in app.config.ts)
- [ ] App Store description and screenshots
- [ ] Google Play Store description and screenshots
- [ ] Age rating determination
- [ ] Required legal notices

---

## Build Commands

### Development Build (APK for testing)
```bash
npm run build:apk:local
# or
eas build --platform android --profile development --local
```

### Preview Build (APK for internal testing)
```bash
npm run build:apk
# or
eas build --platform android --profile preview
```

### Production Build (AAB for Play Store)
```bash
npm run build:aab
# or
eas build --platform android --profile production
```

### Production Build (APK for direct distribution)
```bash
npm run build:apk:local
# or
eas build --platform android --profile production-apk
```

---

## EAS Build Setup

### First Time Setup

1. **Install EAS CLI** (if not already installed):
```bash
npm install -g eas-cli
```

2. **Login to Expo**:
```bash
eas login
```

3. **Configure credentials** (for signing):
```bash
# For Android
eas credentials

# Follow prompts to create or upload keystore
```

4. **Build configuration is already set** in `eas.json`

### Environment Variables for EAS

Create secrets in Expo dashboard or use `.env` files:
```bash
# Set secrets via CLI
eas secret:create --name EXPO_PUBLIC_API_BASE_URL --value https://api.surebank.com --scope project

# Or add to .env and EAS will use them
```

---

## Google Play Store Submission

### Prerequisites
1. **Google Play Console Account** ($25 one-time fee)
2. **App Signing Key** (managed by EAS or manually)
3. **Service Account JSON** for automated submissions

### Submission Steps

1. **Build production AAB**:
```bash
npm run build:aab
```

2. **Download the AAB** from EAS build page or CLI:
```bash
eas build:list
```

3. **Manual Upload** to Google Play Console:
   - Go to Google Play Console
   - Select your app
   - Navigate to Release > Production
   - Create new release
   - Upload AAB file
   - Fill in release notes
   - Review and rollout

4. **Automated Submission** (requires setup):
```bash
# First time: configure service account
eas submit --platform android

# Follow prompts for service account JSON
```

### Store Listing Requirements
- **Short Description** (80 characters max)
- **Full Description** (4000 characters max)
- **Screenshots**:
  - Phone: Minimum 2 screenshots (min 320px, max 3840px)
  - 7-inch Tablet: Optional
  - 10-inch Tablet: Optional
- **Feature Graphic** (1024 x 500px)
- **App Icon** (512 x 512px, 32-bit PNG with alpha)
- **Privacy Policy URL**
- **Contact Information**

---

## iOS App Store Submission

### Prerequisites
1. **Apple Developer Account** ($99/year)
2. **App Store Connect** access
3. **Provisioning Profiles and Certificates**

### Submission Steps

1. **Build for iOS**:
```bash
eas build --platform ios --profile production
```

2. **Download IPA** from EAS build page

3. **Upload to App Store Connect**:
   - Using Transporter app (macOS)
   - Or via EAS submit:
```bash
eas submit --platform ios
```

4. **Complete App Store Connect** listing:
   - App Information
   - Pricing and Availability
   - Screenshots (multiple device sizes required)
   - App Privacy details
   - App Review Information

### App Store Listing Requirements
- **Screenshots**:
  - 6.7" Display: 1290 x 2796px (iPhone 15 Pro Max)
  - 6.5" Display: 1284 x 2778px (iPhone 12 Pro Max)
  - 5.5" Display: 1242 x 2208px (iPhone 8 Plus)
- **App Preview Videos** (Optional, 15-30 seconds)
- **Privacy Policy URL**
- **Support URL**
- **Marketing URL** (Optional)

---

## Version Management

### Versioning Strategy
- **Semantic Versioning**: `MAJOR.MINOR.PATCH`
  - MAJOR: Breaking changes
  - MINOR: New features
  - PATCH: Bug fixes

### Updating Version

1. **Update package.json**:
```json
{
  "version": "1.0.1"
}
```

2. **Update app.config.ts**:
```typescript
{
  version: '1.0.1',
  ios: {
    buildNumber: '2', // Increment for each iOS submission
  },
  android: {
    versionCode: 2, // Auto-increment with EAS if configured
  }
}
```

3. **Auto-increment with EAS** (already configured):
```json
// eas.json
{
  "build": {
    "production": {
      "autoIncrement": true  // ✅ Already enabled
    }
  }
}
```

---

## Post-Deployment Monitoring

### Analytics Setup
- Firebase Analytics (configured in `.env`)
- Crashlytics for crash reporting
- Custom event tracking for key user actions

### Monitoring Checklist
- [ ] Monitor crash reports daily
- [ ] Track key metrics:
  - Daily/Monthly Active Users
  - Session duration
  - Feature usage
  - Error rates
- [ ] Set up alerts for critical errors
- [ ] Monitor API response times
- [ ] Track conversion funnels

### Performance Metrics
- App launch time: < 3 seconds
- Screen transition time: < 500ms
- API response time: < 2 seconds
- Memory usage: < 200MB baseline
- Battery drain: Minimal background usage

---

## Rollback Plan

### If Critical Bug is Found

1. **Immediate Actions**:
   - Halt rollout in Play Console (if in staged rollout)
   - Identify and fix the bug
   - Create hotfix branch

2. **Quick Fix Process**:
```bash
# Fix the bug
git checkout -b hotfix/critical-bug-fix

# After fixing, build new version
npm run build:aab

# Submit update
eas submit --platform android --latest
```

3. **Communication**:
   - Notify users via in-app message
   - Post update on social media
   - Send email notification if necessary

---

## Maintenance Schedule

### Regular Updates
- **Patch releases**: As needed for bug fixes
- **Minor releases**: Monthly feature updates
- **Major releases**: Quarterly or as needed

### Dependency Updates
```bash
# Check outdated packages
npm outdated

# Update dependencies
npm update

# Test thoroughly after updates
npm run type-check
npm test
```

---

## Support & Resources

### Documentation
- [Expo EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com/)

### Contact
- **Development Team**: dev@surebank.com
- **Support**: support@surebank.com
- **Emergency**: emergency@surebank.com

---

## Appendix: Build Commands Quick Reference

```bash
# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Development
npm start
npm run android
npm run ios

# Building
npm run build:apk        # Preview APK (cloud)
npm run build:aab        # Production AAB (cloud)
npm run build:apk:local  # Preview APK (local)
npm run build:aab:local  # Production AAB (local)

# EAS Commands
eas build --platform android --profile preview
eas build --platform android --profile production
eas submit --platform android --latest
eas update --branch production

# Credentials
eas credentials
eas secret:list
```

---

**Last Updated**: 2025-10-03
**Version**: 1.0.0
**Status**: Ready for build after asset replacement
