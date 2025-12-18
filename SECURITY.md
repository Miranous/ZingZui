# Security Guide

This document outlines the security measures implemented in the authentication system and provides guidelines for maintaining security in production.

## Authentication Security

### Password Security

#### Hashing Algorithm

Passwords are hashed using **SHA-256** with a salt before storage:

```typescript
async function hashPassword(password: string): Promise<string> {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password + 'salt_secret_key'
  );
  return hash;
}
```

**Important**: For production applications, consider using a native bcrypt library for enhanced security. SHA-256 is used here for React Native compatibility without native modules.

#### Password Requirements

Enforced password policies:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)

```typescript
function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
}
```

**Recommendations for Production**:
- Add special character requirement
- Implement password history (prevent reuse)
- Add password strength meter UI
- Consider using zxcvbn for strength estimation

### Database Security

#### Row Level Security (RLS)

All database tables have RLS enabled with strict policies:

**Users Table Policies**:

1. **SELECT Policy** - Users can only read their own data:
   ```sql
   CREATE POLICY "Users can read own profile"
     ON users FOR SELECT
     TO authenticated
     USING (auth.uid() = id);
   ```

2. **UPDATE Policy** - Users can only update their own data:
   ```sql
   CREATE POLICY "Users can update own profile"
     ON users FOR UPDATE
     TO authenticated
     USING (auth.uid() = id)
     WITH CHECK (auth.uid() = id);
   ```

3. **INSERT Policy** - Public signup allowed (validated in app):
   ```sql
   CREATE POLICY "Anyone can create account"
     ON users FOR INSERT
     TO anon, authenticated
     WITH CHECK (true);
   ```

4. **DELETE Policy** - Users can delete their own account:
   ```sql
   CREATE POLICY "Users can delete own account"
     ON users FOR DELETE
     TO authenticated
     USING (auth.uid() = id);
   ```

#### Email Uniqueness

Email uniqueness enforced at database level:

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  -- ...
);
```

Additionally validated in application layer:

```typescript
const { data: existingUser } = await supabase
  .from('users')
  .select('id')
  .eq('email', data.email.toLowerCase())
  .maybeSingle();

if (existingUser) {
  return { error: 'An account with this email already exists' };
}
```

### Input Validation

#### Email Validation

Email format validated using regex:

```typescript
function validateEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}
```

**Database constraint**:
```sql
CONSTRAINT email_format CHECK (
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
)
```

#### SQL Injection Prevention

Supabase automatically prevents SQL injection through parameterized queries:

```typescript
// Safe - parameterized query
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail);  // Automatically escaped

// NEVER do this (vulnerable to injection):
// const query = `SELECT * FROM users WHERE email = '${userEmail}'`;
```

### Session Management

#### Session Storage

User sessions stored securely in AsyncStorage:

```typescript
// Save session
await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

// Load session
const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);

// Clear session
await AsyncStorage.removeItem(USER_STORAGE_KEY);
```

**Security Note**: AsyncStorage is encrypted on iOS and uses SharedPreferences on Android. However, rooted/jailbroken devices may expose this data.

#### Session Persistence

Sessions persist until explicit logout:

```typescript
export const logout = async () => {
  await logoutUser();
  setUser(null);
  await AsyncStorage.removeItem(USER_STORAGE_KEY);
};
```

**Recommendations for Production**:
- Implement session expiration (e.g., 7 days)
- Add refresh tokens
- Implement "remember me" option
- Add device fingerprinting

### API Security

#### Environment Variables

Sensitive configuration stored in environment variables:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Important**:
- Never commit `.env` to version control
- Use `.env.example` for template
- Rotate keys regularly
- Use different keys for dev/staging/production

#### HTTPS Enforcement

All API communication uses HTTPS:

```typescript
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL; // https://...
```

## Security Best Practices

### For Production Deployment

1. **Upgrade Password Hashing**:
   ```typescript
   // Consider using react-native-bcrypt or expo-crypto advanced features
   import bcrypt from 'react-native-bcrypt';

   const hash = await bcrypt.hash(password, 12);
   const isValid = await bcrypt.compare(password, hash);
   ```

2. **Implement Rate Limiting**:
   ```typescript
   // Add to Supabase Edge Functions or API Gateway
   // Example: Max 5 login attempts per minute per IP
   ```

3. **Add CAPTCHA**:
   ```typescript
   // Implement reCAPTCHA on signup/login
   // Prevents automated bot attacks
   ```

4. **Enable 2FA**:
   ```typescript
   // Add two-factor authentication option
   // Use TOTP (Time-based One-Time Password)
   ```

5. **Add Audit Logging**:
   ```sql
   CREATE TABLE audit_log (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id uuid REFERENCES users(id),
     action text NOT NULL,
     timestamp timestamptz DEFAULT now(),
     ip_address text,
     user_agent text
   );
   ```

6. **Implement Password Reset**:
   ```typescript
   // Email-based password reset flow
   // Use secure tokens with expiration
   ```

7. **Add Email Verification**:
   ```typescript
   // Verify email before allowing login
   // Send verification link via email
   ```

### Code Security

#### Secure Error Messages

Never expose sensitive information in errors:

```typescript
// ✓ GOOD - Generic error
if (!user) {
  return { error: 'Invalid email or password' };
}

// ✗ BAD - Reveals if email exists
if (!user) {
  return { error: 'Email not found' };
}
```

#### Sanitize User Input

Always sanitize and validate user input:

```typescript
// Trim whitespace
const email = data.email.trim().toLowerCase();

// Escape special characters if needed
const firstName = data.firstName.replace(/[<>]/g, '');
```

#### Prevent Timing Attacks

Use constant-time comparison for passwords:

```typescript
// In production, use a constant-time comparison library
// Example with bcrypt:
const isValid = await bcrypt.compare(password, hash);
```

### Network Security

#### SSL Pinning

For high-security apps, implement SSL pinning:

```typescript
// Ensure communication only with trusted servers
// Use expo-ssl-pinning or similar library
```

#### Certificate Validation

Always validate SSL certificates in production.

### Data Protection

#### Encryption at Rest

Sensitive data should be encrypted:

```typescript
import * as SecureStore from 'expo-secure-store';

// Use SecureStore for sensitive data
await SecureStore.setItemAsync('sensitive_key', value);
const value = await SecureStore.getItemAsync('sensitive_key');
```

#### Encryption in Transit

All data transmission uses HTTPS/TLS.

### Compliance

#### GDPR Compliance

For EU users, implement:
- Right to access data
- Right to delete data
- Right to data portability
- Clear privacy policy

```typescript
// Example: Export user data
export async function exportUserData(userId: string) {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  return JSON.stringify(data, null, 2);
}
```

#### Privacy Policy

Include privacy policy covering:
- What data is collected
- How data is used
- How data is stored
- How data is protected
- User rights

## Vulnerability Management

### Security Updates

Keep dependencies updated:

```bash
npm audit
npm audit fix
```

### Regular Security Reviews

Schedule regular security audits:
- Code review for security issues
- Penetration testing
- Dependency scanning
- Security training for team

### Incident Response Plan

Prepare for security incidents:

1. **Detection**: Monitor for unusual activity
2. **Containment**: Isolate affected systems
3. **Investigation**: Identify root cause
4. **Remediation**: Fix vulnerability
5. **Communication**: Notify affected users
6. **Prevention**: Implement safeguards

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email security@yourcompany.com
3. Include detailed description
4. Wait for acknowledgment before disclosure

## Security Checklist

Before production deployment:

- [ ] Upgrade to bcrypt or similar for password hashing
- [ ] Implement rate limiting on authentication endpoints
- [ ] Add CAPTCHA on signup/login
- [ ] Enable email verification
- [ ] Implement password reset flow
- [ ] Add session expiration
- [ ] Set up audit logging
- [ ] Review and test all RLS policies
- [ ] Perform security audit
- [ ] Update dependencies
- [ ] Configure proper CORS settings
- [ ] Set up monitoring and alerts
- [ ] Implement SSL pinning (if needed)
- [ ] Add 2FA option (recommended)
- [ ] Review and update privacy policy
- [ ] Train team on security best practices

## Resources

- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/security)
- [React Native Security](https://reactnative.dev/docs/security)
- [Expo Security Guidelines](https://docs.expo.dev/guides/security/)
