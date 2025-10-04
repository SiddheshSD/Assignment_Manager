# AssignHub - Smart Assignment & Academic Management

A comprehensive mobile app built with React Native and Expo for managing assignments, experiments, and test scores with a modern, professional UI design and intelligent notification system.

## ✨ Key Features

### 📝 Smart Assignments Management
- **Progress Visualization**: Visual progress bars showing completion percentage
- **Status Tracking**: Completed, Written, Not Completed, Not Given with color-coded icons
- **Submission Dates**: Set and track assignment submission deadlines
- **Course Integration**: Add course codes and organize by subjects
- **Bulk Management**: Edit total assignments and auto-generate items

### 🧪 Advanced Experiments Management
- **Identical Functionality**: Same powerful features as assignments
- **Lab Tracking**: Perfect for laboratory experiments and reports
- **Status Management**: Visual status indicators with icon-only display
- **Progress Monitoring**: Track completion rates across all experiments

### 📊 Comprehensive Test Scores Management
- **Flexible Test Types**: UT1, UT2, Finals with year/semester selection
- **Grade Visualization**: Percentage-based scoring with color-coded performance
- **Performance Analytics**: Overall statistics and subject-wise breakdown
- **Smart Calculations**: Automatic percentage and performance tracking

### 🔔 Intelligent Notification System
- **Written Item Reminders**: Daily notifications for items ready for review
- **Submission Alerts**: 2-day, 1-day, and same-day deadline reminders
- **Customizable Schedule**: Set multiple reminder times and active days
- **Smart Filtering**: Only notifies for relevant items with future deadlines
- **Professional Settings**: Beautiful notification management interface

### 🎨 Modern UI/UX Design
- **Clean Interface**: Modern card-based design with consistent spacing
- **Visual Hierarchy**: Clear section headers and organized layouts
- **Icon Integration**: Meaningful icons for quick status recognition
- **Progress Indicators**: Visual progress bars and percentage displays
- **Responsive Design**: Optimized for different screen sizes
- **Dark/Light Themes**: Theme switching capability

## 🛠️ Technology Stack

- **React Native** with Expo SDK 54
- **React Navigation** for seamless navigation
- **AsyncStorage** for local data persistence
- **Expo Notifications** for intelligent reminder system
- **Expo Vector Icons** (Ionicons) for consistent iconography
- **React Native DateTimePicker** for date/time selection
- **Custom Neumorphic Components** for modern UI design

## 📱 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device (for testing)
- Android Studio (for Android development) or Xcode (for iOS development)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/SiddheshSD/Assignment_Manager.git
   cd Assignment_Manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

4. **Run on device**
   - Install Expo Go app on your Android/iOS device
   - Scan the QR code from the terminal/browser
   - The app will load on your device

### Building for Production

#### Android APK
```bash
expo build:android
# or for EAS Build
eas build --platform android
```

#### iOS App
```bash
expo build:ios
# or for EAS Build
eas build --platform ios
```

## 📁 Project Structure

```
AssignHub/
├── src/
│   ├── components/
│   │   ├── Header.js              # Enhanced header with notifications
│   │   ├── NeumorphicCard.js      # Modern card component
│   │   ├── NeumorphicButton.js    # Styled button component
│   │   └── NeumorphicInput.js     # Input component
│   ├── screens/
│   │   ├── AssignmentsScreen.js   # Assignments list with progress
│   │   ├── AssignmentDetailScreen.js # Assignment management
│   │   ├── ExperimentsScreen.js   # Experiments list with progress
│   │   ├── ExperimentDetailScreen.js # Experiment management
│   │   ├── TestScoresScreen.js    # Test scores with analytics
│   │   └── TestScoreDetailScreen.js # Score management
│   └── utils/
│       ├── storage.js             # Data persistence utilities
│       ├── notifications.js       # Notification system
│       └── theme.js               # Theme management
├── assets/                        # App icons and images
├── app.json                       # Expo configuration
└── package.json                   # Dependencies
```

## 📖 Usage Guide

### 🚀 Getting Started
1. **Launch AssignHub** and explore the three main tabs
2. **Set up notifications** via the header menu (three dots)
3. **Add your first subject** using the "+" button
4. **Start tracking** your academic progress!

### 📝 Managing Assignments & Experiments
1. **Add Subject**: Tap "+" → Enter subject name, total count, and course code
2. **Track Progress**: Visual progress bars show completion percentage
3. **Update Status**: Tap items to change status (icons only for clean look)
4. **Set Deadlines**: Add submission dates for automatic reminders
5. **Monitor Performance**: View completion statistics at a glance

### 📊 Test Score Management
1. **Create Test**: Select type (UT1/UT2/Finals), year, and semester
2. **Add Subjects**: Enter marks obtained and total marks
3. **View Performance**: Automatic percentage calculation with color coding
4. **Track Progress**: Overall statistics and subject-wise breakdown

### 🔔 Notification System
1. **Access Settings**: Tap three dots → Notification Settings
2. **Set Reminder Times**: Add multiple daily reminder times
3. **Choose Active Days**: Select which days to receive notifications
4. **Get Smart Alerts**: 
   - Daily reminders for written items
   - 2-day advance deadline warnings
   - 1-day advance deadline alerts
   - Same-day submission reminders

## 💾 Data Storage & Privacy

- **Local Storage**: All data stored locally using AsyncStorage
- **No Server Required**: Works completely offline
- **Privacy First**: No data collection or external transmission
- **Persistent**: Data survives app updates and device restarts
- **Secure**: Data remains on your device only

## 🎨 Design System

### Color Palette
- **Primary**: #6366f1 (Indigo) - Main accent color
- **Success**: #10b981 (Green) - Completed items
- **Warning**: #f59e0b (Amber) - Written/pending items  
- **Error**: #ef4444 (Red) - Not completed items
- **Neutral**: #6b7280 (Gray) - Not given items
- **Background**: #e6e6e6 (Light Gray) - App background

### Modern UI Elements
- **Cards**: Elevated design with consistent 12px border radius
- **Progress Bars**: Visual completion indicators
- **Status Icons**: Meaningful iconography for quick recognition
- **Typography**: Clear hierarchy with proper font weights
- **Spacing**: Consistent 20px padding and 8px margins

## 🔧 Troubleshooting

### Common Issues

1. **App won't start**
   ```bash
   # Clear cache and reinstall
   expo start -c
   rm -rf node_modules && npm install
   ```

2. **Notifications not working**
   - Grant notification permissions in device settings
   - Check if Do Not Disturb mode is enabled
   - Verify notification times are set correctly

3. **Build errors**
   ```bash
   # Update tools
   npm install -g @expo/cli@latest
   npm install -g eas-cli@latest
   ```

4. **Data not saving**
   - Ensure sufficient device storage
   - Check AsyncStorage permissions
   - Try clearing app data and restarting

## 🤝 Contributing

We welcome contributions! Here's how you can help:

- **🐛 Report Bugs**: Create detailed issue reports
- **💡 Suggest Features**: Share your ideas for improvements
- **🔧 Submit PRs**: Fix bugs or add new features
- **📚 Improve Docs**: Help make documentation better
- **⭐ Star the Repo**: Show your support!

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Submit a pull request with a clear description

## 📄 License

This project is open source and available under the **MIT License**.

## 🆘 Support

- **GitHub Issues**: [Create an issue](https://github.com/SiddheshSD/Assignment_Manager/issues)
- **Discussions**: Join project discussions on GitHub
- **Email**: Contact the developer for urgent matters

## 🙏 Acknowledgments

- Built with ❤️ by **SiddheshSD**
- Powered by **React Native** and **Expo**
- Icons by **Expo Vector Icons**
- UI inspired by modern design principles

---

**AssignHub** - Making academic management simple, smart, and beautiful! 🎓✨
