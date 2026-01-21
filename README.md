# 🧘 Mind Space

A beautiful and comprehensive mental wellness app built with React, TypeScript, and Tailwind CSS. Track your mood, practice breathing exercises, and assess your stress levels - all in one place.

## ✨ Features

### 1. 📊 Mood Tracker
- **Emoji-based mood selection** - Choose from 8 different moods
- **Daily mood logging** - One entry per day with optional notes
- **Calendar view** - Visual calendar showing your mood history
- **Mood streak** - Track consecutive days of logging
- **Weekly summary chart** - Beautiful line chart showing your mood trends over the past week
- **LocalStorage & IndexedDB support** - Your data stays local and private

### 2. 🌬️ Breathing Exercise
- **4-4-4 breathing pattern** - Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds
- **Visual guide** - Expanding and contracting circle animation
- **Calm gradient background** - Soothing animated gradient
- **Web Speech API** - Voice-guided breathing instructions
- **Cycle counter** - Track how many breathing cycles you complete

### 3. 🧠 Stress Self-Assessment Quiz
- **10 comprehensive questions** - Based on common stress indicators
- **Likert scale responses** - Never to Always (1-5 scale)
- **Stress level assessment** - Low, Moderate, or High stress levels
- **Personalized suggestions** - Tailored recommendations based on your results
- **Awareness-focused** - Not a medical diagnosis, but a tool for self-awareness

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Mind-Space
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling and animations
- **React Router** - Navigation
- **Recharts** - Data visualization
- **date-fns** - Date utilities
- **Web Speech API** - Voice guidance
- **LocalStorage/IndexedDB** - Data persistence
- **PWA Support** - Progressive Web App capabilities

## 📱 Progressive Web App (PWA)

The app includes PWA support, allowing you to:
- Install it on your device
- Use it offline (with cached resources)
- Get a native app-like experience

## 🎨 Design Features

- **Modern UI** - Clean, intuitive interface
- **Responsive design** - Works on mobile, tablet, and desktop
- **Smooth animations** - CSS animations for breathing exercises
- **Gradient backgrounds** - Calming color schemes
- **Bottom navigation** - Easy access to all features

## 📝 Usage

### Mood Tracker
1. Select your current mood from the emoji grid
2. Optionally add a note about how you're feeling
3. Click "Save Mood" to log your entry
4. View your mood history in the calendar
5. Check your streak and weekly trends

### Breathing Exercise
1. Navigate to the Breathing tab
2. Click "Start Breathing Exercise"
3. Follow the expanding/contracting circle
4. Listen to voice guidance (if enabled)
5. Continue for as many cycles as needed
6. Click "Stop" when finished

### Stress Quiz
1. Navigate to the Stress Quiz tab
2. Answer all 10 questions honestly
3. Select your response on a scale from Never (1) to Always (5)
4. Click "View Results" to see your stress level
5. Review personalized suggestions
6. Consider trying the breathing exercise if stress is moderate or high

## 🔒 Privacy

All data is stored locally on your device using LocalStorage or IndexedDB. No data is sent to any external servers. Your privacy is completely protected.

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⚠️ Disclaimer

This app is for awareness and self-care purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. If you're experiencing persistent stress or mental health concerns, please consult with a qualified healthcare provider.

---

Made with ❤️ for mental wellness and mindfulness
