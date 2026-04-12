# Mobile App Authentication Structure

## Overview
The mobile app now has proper authentication guards to control access to features based on login status.

## Authentication Flow

### Entry Point (`app/index.tsx`)
- Checks if user is authenticated
- **Logged IN** → Redirects to `/(tabs)` (Home)
- **Logged OUT** → Redirects to `/login`
- Shows loading spinner while checking auth state

## Access Control by Tab

### 🟢 PUBLIC (No Login Required)
These tabs are accessible to everyone:

1. **Home** (`app/(tabs)/index.tsx`)
   - Browse featured courses
   - View course catalog
   - See promotional content
   - **Action**: Can view but prompted to login for enrollment

2. **Explore** (`app/(tabs)/courses.tsx`)
   - Discover all available courses
   - Search and filter courses
   - View course details
   - **Action**: Can browse but prompted to login for access

### 🔴 PROTECTED (Login Required)
These tabs require authentication:

3. **My Learning** (`app/(tabs)/my-learning.tsx`)
   - View enrolled courses
   - Track progress
   - Access course materials
   - **Status**: ⚠️ TODO - Add `useProtectedRoute()` hook

4. **Live Class** (`app/(tabs)/schedule.tsx`) ✅
   - View live session schedule
   - Join live classes
   - Access course materials
   - View assignments
   - **Status**: ✅ PROTECTED - Shows login prompt if not authenticated

5. **Profile** (`app/(tabs)/account.tsx`)
   - View user profile
   - Manage account settings
   - View certificates
   - **Status**: ⚠️ TODO - Add `useProtectedRoute()` hook

## Implementation Details

### Protected Route Hook
Location: `src/hooks/use-protected-route.ts`

```typescript
export function useProtectedRoute() {
  const { user, isReady } = useAuth();
  
  useEffect(() => {
    if (isReady && !user) {
      router.replace("/login");
    }
  }, [user, isReady]);
  
  return { user, isReady };
}
```

### Usage in Protected Screens
```typescript
export default function ProtectedScreen() {
  const { user, isReady } = useProtectedRoute();
  
  if (!isReady) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <LoginPrompt />;
  }
  
  // Render protected content
  return <ProtectedContent />;
}
```

## TODO: Complete Protection

### Screens that need protection:

1. **My Learning Tab**
   - Add `useProtectedRoute()` hook
   - Show login prompt for unauthenticated users
   - Redirect to login on access attempt

2. **Profile Tab**
   - Add `useProtectedRoute()` hook
   - Show login prompt for unauthenticated users
   - Redirect to login on access attempt

3. **Course Detail Pages**
   - Allow viewing course info (public)
   - Protect enrollment and content access (requires login)
   - Show "Login to Enroll" button for guests

## User Experience

### Guest Users (Not Logged In)
- Can browse Home and Explore tabs
- See course information and descriptions
- Prompted to login when trying to:
  - Enroll in a course
  - Access My Learning
  - Join Live Classes
  - View Profile

### Authenticated Users (Logged In)
- Full access to all tabs
- Can enroll in courses
- Can join live classes
- Can track progress
- Can manage profile

## Login Screen
Location: `app/login.tsx`

Features:
- Email/Password login
- Google Sign-In
- Auto-redirect to home after successful login
- Error handling with alerts

## Auth Provider
Location: `src/providers/auth-provider.tsx`

Provides:
- `user`: Current user object or null
- `isReady`: Boolean indicating if auth state is loaded
- `signInWithEmail()`: Email/password authentication
- `signInWithGoogle()`: Google OAuth authentication
- `signOutUser()`: Logout function
- `error`: Current error message
- `accessToken`: Firebase ID token for API calls

## Testing Checklist

- [ ] Guest can browse Home tab
- [ ] Guest can browse Explore tab
- [ ] Guest is redirected to login when accessing My Learning
- [ ] Guest is redirected to login when accessing Live Class
- [ ] Guest is redirected to login when accessing Profile
- [ ] Logged-in user can access all tabs
- [ ] Logged-in user can join live classes
- [ ] Logout redirects to login screen
- [ ] Login success redirects to home
