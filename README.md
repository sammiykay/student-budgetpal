# BudgetPal Student - React Native App

A mobile budgeting application designed specifically for students to track expenses, manage income, set financial goals, and build better money habits.

## Features

- **Authentication**: Secure sign-up and login with Supabase Auth
- **Expense Tracking**: Log daily expenses with categories and descriptions
- **Income Management**: Track various income sources with different frequencies
- **Financial Goals**: Set and track progress towards savings goals
- **Reports & Analytics**: Visual charts and PDF export functionality
- **Mobile-First Design**: Optimized for mobile devices with beautiful UI

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Native Paper** for UI components
- **Supabase** for authentication and database
- **React Navigation** for navigation
- **Expo Linear Gradient** for beautiful gradients
- **React Native Chart Kit** for data visualization

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd budgetpal-student-mobile
```

2. Install dependencies:
```bash
npm install
```

3. Configure Supabase:
   - Update `src/lib/supabase.ts` with your Supabase URL and anon key
   - Ensure your Supabase database has the required tables (incomes, expenses, goals)

4. Start the development server:
```bash
npm start
```

5. Run on your preferred platform:
   - iOS: `npm run ios`
   - Android: `npm run android`
   - Web: `npm run web`

## Project Structure

```
src/
├── contexts/          # React contexts (Auth)
├── lib/              # Utilities and configurations
├── screens/          # Screen components
├── theme/            # Theme configuration
└── App.tsx           # Main app component
```

## Database Schema

The app uses the following Supabase tables:

- `incomes`: User income tracking
- `expenses`: User expense tracking  
- `goals`: Financial goals management

## Features Overview

### Dashboard
- Monthly income/expense overview
- Recent transactions
- Daily financial tips
- Balance tracking

### Add Transaction
- Quick expense logging with categories
- Income source management
- Date selection and descriptions

### Reports
- Visual expense breakdown by category
- Monthly trends
- PDF export functionality

### Goals
- Set financial savings goals
- Track progress with visual indicators
- Add money to goals incrementally

### Settings
- User profile management
- App information
- Sign out functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.