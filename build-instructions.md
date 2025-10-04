# Build Instructions for AssignHub (SDK 54)

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

3. **For mobile testing:**
   - Install Expo Go app on your phone (SDK 54 compatible)
   - Scan the QR code from the terminal
   - The app will load on your device

## Building for Production

### Android APK
```bash
# Install EAS CLI (if not already installed)
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Build for Android
eas build --platform android
```

### iOS App
```bash
# Build for iOS (requires Apple Developer account)
eas build --platform ios
```

### Local Development Build
```bash
# For Android
npx expo run:android

# For iOS (macOS only)
npx expo run:ios
```

## Testing the App

### Web Version
```bash
npm run web
```

### Mobile Version
1. Start the development server: `npm start`
2. Install Expo Go on your device
3. Scan the QR code
4. The app will load with live reload

## Features to Test

### Assignments
- [ ] Add new subject with assignment count
- [ ] Edit assignment status (Completed, Written, Not Completed, Not Given)
- [ ] Edit total number of assignments
- [ ] Data persistence after app restart

### Experiments
- [ ] Add new subject with experiment count
- [ ] Edit experiment status
- [ ] Edit total number of experiments
- [ ] Data persistence after app restart

### Test Scores
- [ ] Add new test (UT1, UT2, Finals)
- [ ] Select year (FE, SE, TE, BE) and semester (1-8)
- [ ] Add subjects with marks
- [ ] View percentage calculations
- [ ] View overall performance stats
- [ ] Data persistence after app restart

## Troubleshooting

### Common Issues

1. **Metro bundler issues:**
   ```bash
   npx expo start -c
   ```

2. **Dependencies issues:**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Build failures:**
   - Check Expo CLI version: `npx expo --version`
   - Update if needed: `npm install -g @expo/cli@latest`

### Performance Tips

- Use physical device for testing (faster than simulator)
- Close other apps to free up memory
- Use development build for better performance

## App Store Deployment

### Android (Google Play Store)
1. Build APK: `eas build --platform android`
2. Download and test the APK
3. Upload to Google Play Console
4. Follow Google Play Store guidelines

### iOS (App Store)
1. Build iOS app: `eas build --platform ios`
2. Download and test the app
3. Upload to App Store Connect
4. Follow Apple App Store guidelines

## Local Storage

The app uses AsyncStorage for local data persistence. All data is stored on the device and persists between app sessions. No server or internet connection is required.

## UI/UX Features

- Professional Neumorphism design
- Smooth animations and transitions
- Intuitive navigation
- Cross-platform compatibility
- Responsive design for different screen sizes
