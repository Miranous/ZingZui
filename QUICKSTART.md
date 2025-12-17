# Quick Start Guide

Get up and running with the Liquid Glass Notes App in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- iOS Simulator (Mac) or Android Emulator

## Installation

### 1. Install Dependencies

```bash
npm install
```

This installs all required packages including:
- Expo SDK 54
- Supabase client
- UI libraries (expo-blur, expo-linear-gradient)
- Animation libraries (react-native-reanimated)

### 2. Verify Environment

Check that `.env` file exists with Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Start Development Server

```bash
npm run dev
```

This starts the Expo development server.

### 4. Open the App

**iOS Simulator** (Mac only):
- Press `i` in the terminal

**Android Emulator**:
- Press `a` in the terminal

**Physical Device**:
- Install Expo Go from App Store / Play Store
- Scan the QR code in terminal

## First Steps

### 1. Create an Account

1. App opens to login screen
2. Tap "Create account" link
3. Fill in:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Password: Test1234 (must meet requirements)
4. Tap "Create account"
5. Success! You're automatically logged in

### 2. Explore the Interface

**Home Screen**:
- Welcome message with your name
- Glass card with getting started info
- Bottom tab navigation

**Profile Screen**:
- View your account details
- See when you joined
- Log out button

### 3. Test the Features

**Login/Logout Flow**:
1. Tap "Log out" in profile
2. Redirected to login screen
3. Enter credentials
4. Tap "Log in"
5. Back to home screen

**Form Validation**:
1. Go to signup screen
2. Try submitting with weak password
3. See validation errors
4. Try existing email
5. See error message

**Glass UI Effects**:
- Notice frosted glass cards
- See gradient buttons
- Watch press animations
- Observe loading states

## Database

The Supabase database is already configured with:

- `users` table with proper schema
- Row Level Security (RLS) enabled
- Secure policies for data access
- Email uniqueness constraint

## Project Structure

```
app/
├── (auth)/          # Login and signup screens
├── (tabs)/          # Main app (home, profile)
└── _layout.tsx      # Root navigation with auth routing

components/          # Reusable UI components
├── GlassCard.tsx
├── ThemedButton.tsx
└── ThemedInput.tsx

theme/               # Design system
└── theme.ts         # Colors, typography, spacing

lib/                 # Core utilities
├── supabase.ts      # Database client
└── auth.ts          # Authentication functions

contexts/            # State management
└── AuthContext.tsx  # Global auth state
```

## Key Features

### Liquid Glass UI

- **Frosted glass cards** with blur effects
- **Gradient buttons** with press animations
- **Glass-styled inputs** with focus states
- **Premium design** with attention to detail

### Secure Authentication

- **Email/password** authentication
- **Password hashing** with SHA-256
- **Form validation** with helpful errors
- **Session persistence** with AsyncStorage

### Developer Experience

- **TypeScript** for type safety
- **Clean code** structure
- **Reusable components**
- **Comprehensive docs**

## Common Commands

```bash
# Start development server
npm run dev

# Type checking
npm run typecheck

# Build for web
npm run build:web

# Lint code
npm run lint
```

## Testing Authentication

### Valid Test Accounts

Create test accounts with:

**Email formats**:
- user@test.com
- john.doe@example.com

**Password requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

Example: `Test1234`

### Test Scenarios

1. **Happy Path**:
   - Sign up → Success
   - Log out → Login screen
   - Log in → Home screen

2. **Validation**:
   - Weak password → Error message
   - Invalid email → Error message
   - Existing email → Error message

3. **Session**:
   - Close app
   - Reopen app
   - Still logged in ✓

## Customization

### Change Theme Colors

Edit `theme/theme.ts`:

```typescript
export const theme = {
  palette: {
    primaryGradient: ['#5EE7DF', '#8B6CFF'], // Your colors
    // ...
  },
};
```

### Adjust Blur Intensity

In any screen using `GlassCard`:

```typescript
<GlassCard intensity={24}> {/* Higher = more blur */}
  {/* Content */}
</GlassCard>
```

### Disable Blur (Performance Mode)

```typescript
<GlassCard disableBlur={true}>
  {/* Content */}
</GlassCard>
```

## Troubleshooting

### Blur Not Working

- On web, blur fallback is automatic
- Try lower intensity if device struggles
- Use `disableBlur={true}` for older devices

### Authentication Errors

- Check Supabase connection in `.env`
- Verify database migrations applied
- Check console for detailed errors

### Style Issues

- Clear cache: `npx expo start --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Next Steps

### Add Notes Feature

1. Create notes table in Supabase
2. Build note list screen
3. Add note editor
4. Implement search

### Enhance Authentication

1. Add password reset
2. Implement email verification
3. Add "remember me" option

### Improve UI

1. Add dark/light mode toggle
2. Implement haptic feedback
3. Add more animations

## Learning Resources

- **README.md**: Complete documentation
- **THEME_GUIDE.md**: Theme system deep dive
- **SECURITY.md**: Security best practices
- **EXAMPLES.md**: Code examples
- **IMPLEMENTATION_SUMMARY.md**: Technical details

## Getting Help

1. Check documentation files
2. Review code examples
3. Check Expo docs: https://docs.expo.dev/
4. Check Supabase docs: https://supabase.com/docs

## What's Next?

Now that you're set up:

1. ✅ Explore the app interface
2. ✅ Test authentication flows
3. ✅ Review the code structure
4. ✅ Read the theme guide
5. ✅ Try customizing colors
6. ✅ Build your first feature

**Happy coding! 🚀**
