# ASS APP - Assignment, Experience, and Test Score Management

A beautiful mobile app built with React Native and Expo for managing assignments, experiments, and test scores with a professional Neumorphism UI design.

## Features

### 📝 Assignments Management
- Add subjects with custom number of assignments
- Track assignment status: Completed, Written, Not Completed, Not Given
- Edit total number of assignments after creation
- Beautiful card-based interface with status indicators

### 🧪 Experiments Management
- Similar functionality to assignments
- Track experiment completion status
- Easy-to-use status management interface

### 📊 Test Scores Management
- Create tests with UT1, UT2, or Finals options
- Select year (FE, SE, TE, BE) and semester (1-8)
- Add subjects with marks obtained and total marks
- Automatic percentage calculation and grade color coding
- Overall performance statistics

### 🎨 UI/UX Features
- Professional Neumorphism design
- Smooth animations and transitions
- Intuitive navigation with tab-based interface
- Local data storage (no server required)
- Cross-platform compatibility (Android & iOS)

## Technology Stack

- **React Native** with Expo SDK 54
- **React Navigation** for navigation
- **AsyncStorage** for local data persistence
- **Expo Linear Gradient** for Neumorphism effects
- **Expo Vector Icons** for icons

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device (for testing)

### Installation Steps

1. **Clone or download the project**
   ```bash
   cd ass_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device**
   - Install Expo Go app on your Android/iOS device
   - Scan the QR code from the terminal/browser
   - The app will load on your device

### Building for Production

#### Android APK
```bash
expo build:android
```

#### iOS App
```bash
expo build:ios
```

## App Structure

```
src/
├── components/
│   ├── NeumorphicCard.js      # Reusable card component
│   ├── NeumorphicButton.js    # Reusable button component
│   └── NeumorphicInput.js     # Reusable input component
├── screens/
│   ├── AssignmentsScreen.js   # Main assignments list
│   ├── AssignmentDetailScreen.js # Assignment management
│   ├── ExperimentsScreen.js   # Main experiments list
│   ├── ExperimentDetailScreen.js # Experiment management
│   ├── TestScoresScreen.js    # Main test scores list
│   └── TestScoreDetailScreen.js # Test score management
└── utils/
    └── storage.js             # Local storage utilities
```

## Usage Guide

### Adding Assignments/Experiments
1. Tap the "+" button in the respective tab
2. Enter subject name and number of assignments/experiments
3. Tap "Add Subject" to create the card
4. Tap on the card to manage individual items

### Managing Assignment/Experiment Status
1. Open a subject card
2. For each item, tap the appropriate status button:
   - **Completed**: Assignment/experiment is fully done
   - **Written**: Assignment/experiment is written but not checked
   - **Not Completed**: Assignment/experiment is incomplete
   - **Not Given**: Assignment/experiment not yet given

### Adding Test Scores
1. Go to Test Scores tab
2. Tap "+" to add a new test
3. Select test type (UT1, UT2, Finals)
4. Select year (FE, SE, TE, BE)
5. Select semester (1-8)
6. Tap "Add Test" to create the test card
7. Tap on the card to add subjects and marks

### Managing Test Scores
1. Open a test card
2. Tap "+" to add subjects
3. Enter subject name, marks obtained, and total marks
4. View automatic percentage calculation and grade colors
5. See overall performance statistics

## Data Storage

All data is stored locally on the device using AsyncStorage. No internet connection or server is required. Data persists between app sessions.

## Customization

### Colors
The app uses a consistent color scheme:
- Primary: #6366f1 (Indigo)
- Success: #10b981 (Green)
- Warning: #f59e0b (Amber)
- Error: #ef4444 (Red)
- Background: #e6e6e6 (Light Gray)

### Neumorphism Effects
The app uses custom Neumorphism components with:
- Soft shadows and highlights
- Gradient backgrounds
- Rounded corners
- Subtle depth effects

## Troubleshooting

### Common Issues

1. **App won't start**
   - Ensure all dependencies are installed: `npm install`
   - Clear cache: `expo start -c`

2. **Build errors**
   - Update Expo CLI: `npm install -g @expo/cli@latest`
   - Check Node.js version (should be 16+)

3. **Data not saving**
   - Ensure device has sufficient storage
   - Check if AsyncStorage permissions are granted

## Contributing

Feel free to contribute to this project by:
- Reporting bugs
- Suggesting new features
- Submitting pull requests
- Improving documentation

## License

This project is open source and available under the MIT License.

## Support

For support or questions, please create an issue in the project repository.
