# Code Examples

This document provides practical examples for using the Liquid Glass theme and components.

## Table of Contents

1. [Basic Screen Layout](#basic-screen-layout)
2. [Form Examples](#form-examples)
3. [Button Variants](#button-variants)
4. [Card Layouts](#card-layouts)
5. [Animations](#animations)
6. [Error Handling](#error-handling)
7. [Loading States](#loading-states)
8. [Custom Components](#custom-components)

## Basic Screen Layout

### Simple Screen with Glass Card

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../components/GlassCard';
import { theme } from '../theme/theme';

export default function ExampleScreen() {
  return (
    <LinearGradient
      colors={theme.palette.backgroundGradient}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Welcome</Text>

        <GlassCard style={styles.card}>
          <Text style={styles.cardText}>
            This is a glass card with the Liquid Glass theme.
          </Text>
        </GlassCard>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    paddingTop: 60,
  },
  title: {
    ...theme.typography.headline,
    marginBottom: theme.spacing.xl,
  },
  card: {
    width: '100%',
  },
  cardText: {
    ...theme.typography.body,
  },
});
```

### ScrollView with Multiple Cards

```typescript
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../components/GlassCard';
import { theme } from '../theme/theme';

export default function CardListScreen() {
  const items = [
    { id: '1', title: 'First Card', content: 'This is the first card.' },
    { id: '2', title: 'Second Card', content: 'This is the second card.' },
    { id: '3', title: 'Third Card', content: 'This is the third card.' },
  ];

  return (
    <LinearGradient
      colors={theme.palette.backgroundGradient}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Card List</Text>

        {items.map((item) => (
          <GlassCard key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardContent}>{item.content}</Text>
          </GlassCard>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.xl,
    paddingTop: 60,
  },
  title: {
    ...theme.typography.headline,
    marginBottom: theme.spacing.xl,
  },
  card: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  cardTitle: {
    ...theme.typography.title,
    marginBottom: theme.spacing.sm,
  },
  cardContent: {
    ...theme.typography.body,
  },
});
```

## Form Examples

### Complete Form with Validation

```typescript
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../components/GlassCard';
import { ThemedButton } from '../components/ThemedButton';
import { ThemedInput } from '../components/ThemedInput';
import { theme } from '../theme/theme';

export default function FormScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsLoading(false);
    alert('Form submitted successfully!');
  };

  return (
    <LinearGradient
      colors={theme.palette.backgroundGradient}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Contact Form</Text>

          <GlassCard style={styles.card}>
            <ThemedInput
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              error={errors.name}
            />

            <ThemedInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <ThemedInput
              label="Message"
              value={message}
              onChangeText={setMessage}
              placeholder="Enter your message"
              multiline
              numberOfLines={4}
              error={errors.message}
            />

            <ThemedButton
              title="Submit"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={!name || !email || !message}
              style={styles.button}
            />
          </GlassCard>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    paddingTop: 60,
  },
  title: {
    ...theme.typography.headline,
    marginBottom: theme.spacing.xl,
  },
  card: {
    width: '100%',
  },
  button: {
    marginTop: theme.spacing.lg,
  },
});
```

### Inline Form

```typescript
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GlassCard } from '../components/GlassCard';
import { ThemedButton } from '../components/ThemedButton';
import { ThemedInput } from '../components/ThemedInput';
import { theme } from '../theme/theme';

export function InlineSearchForm() {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    console.log('Searching for:', query);
  };

  return (
    <GlassCard style={styles.card}>
      <View style={styles.row}>
        <ThemedInput
          label="Search"
          value={query}
          onChangeText={setQuery}
          placeholder="Search..."
          containerStyle={styles.input}
        />
        <ThemedButton
          title="Go"
          onPress={handleSearch}
          style={styles.button}
        />
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.md,
  },
  input: {
    flex: 1,
    marginBottom: 0,
  },
  button: {
    flex: 0,
    minWidth: 80,
  },
});
```

## Button Variants

### All Button Types

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../components/GlassCard';
import { ThemedButton } from '../components/ThemedButton';
import { theme } from '../theme/theme';

export default function ButtonExamples() {
  return (
    <LinearGradient
      colors={theme.palette.backgroundGradient}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Button Variants</Text>

        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Primary</Text>
          <ThemedButton
            title="Primary Button"
            onPress={() => console.log('Primary pressed')}
            variant="primary"
            style={styles.button}
          />

          <Text style={styles.sectionTitle}>Secondary</Text>
          <ThemedButton
            title="Secondary Button"
            onPress={() => console.log('Secondary pressed')}
            variant="secondary"
            style={styles.button}
          />

          <Text style={styles.sectionTitle}>Ghost</Text>
          <ThemedButton
            title="Ghost Button"
            onPress={() => console.log('Ghost pressed')}
            variant="ghost"
            style={styles.button}
          />

          <Text style={styles.sectionTitle}>Loading</Text>
          <ThemedButton
            title="Loading..."
            onPress={() => {}}
            loading={true}
            style={styles.button}
          />

          <Text style={styles.sectionTitle}>Disabled</Text>
          <ThemedButton
            title="Disabled Button"
            onPress={() => {}}
            disabled={true}
            style={styles.button}
          />
        </GlassCard>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    paddingTop: 60,
  },
  title: {
    ...theme.typography.headline,
    marginBottom: theme.spacing.xl,
  },
  card: {
    width: '100%',
  },
  sectionTitle: {
    ...theme.typography.bodySmall,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  button: {
    width: '100%',
  },
});
```

### Button Group

```typescript
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedButton } from '../components/ThemedButton';
import { theme } from '../theme/theme';

export function ButtonGroup() {
  const [selected, setSelected] = useState('option1');

  return (
    <View style={styles.container}>
      <ThemedButton
        title="Option 1"
        onPress={() => setSelected('option1')}
        variant={selected === 'option1' ? 'primary' : 'secondary'}
        style={styles.button}
      />
      <ThemedButton
        title="Option 2"
        onPress={() => setSelected('option2')}
        variant={selected === 'option2' ? 'primary' : 'secondary'}
        style={styles.button}
      />
      <ThemedButton
        title="Option 3"
        onPress={() => setSelected('option3')}
        variant={selected === 'option3' ? 'primary' : 'secondary'}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  button: {
    flex: 1,
  },
});
```

## Card Layouts

### Info Card

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from '../components/GlassCard';
import { theme } from '../theme/theme';

export function InfoCard({ title, value, caption }) {
  return (
    <GlassCard style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      {caption && <Text style={styles.caption}>{caption}</Text>}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.xs,
  },
  value: {
    ...theme.typography.headline,
    marginBottom: theme.spacing.xs,
  },
  caption: {
    ...theme.typography.caption,
    color: theme.palette.textTertiary,
  },
});
```

### Stats Grid

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { InfoCard } from './InfoCard';
import { theme } from '../theme/theme';

export function StatsGrid() {
  return (
    <View style={styles.grid}>
      <InfoCard title="Total" value="1,234" caption="+12%" />
      <InfoCard title="Active" value="567" caption="+5%" />
      <InfoCard title="Pending" value="89" caption="-3%" />
      <InfoCard title="Completed" value="578" caption="+8%" />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
});
```

## Animations

### Fade In Animation

```typescript
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { GlassCard } from '../components/GlassCard';
import { theme } from '../theme/theme';

export function FadeInCard({ children }) {
  return (
    <Animated.View entering={FadeIn.duration(500)} exiting={FadeOut}>
      <GlassCard>
        {children}
      </GlassCard>
    </Animated.View>
  );
}
```

### Slide In Animation

```typescript
import React from 'react';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { GlassCard } from '../components/GlassCard';

export function SlideInCard({ children }) {
  return (
    <Animated.View
      entering={SlideInRight.springify()}
      exiting={SlideOutLeft.springify()}
    >
      <GlassCard>
        {children}
      </GlassCard>
    </Animated.View>
  );
}
```

## Error Handling

### Error Toast

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { theme } from '../theme/theme';

interface ErrorToastProps {
  message: string;
  visible: boolean;
}

export function ErrorToast({ message, visible }: ErrorToastProps) {
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutUp}
      style={styles.container}
    >
      <Text
        style={styles.text}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: theme.spacing.xl,
    right: theme.spacing.xl,
    backgroundColor: 'rgba(255,90,95,0.15)',
    borderRadius: theme.radii.small,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,90,95,0.3)',
    ...theme.shadows.microShadow,
  },
  text: {
    ...theme.typography.bodySmall,
    color: theme.palette.danger,
    textAlign: 'center',
  },
});
```

### Success Toast

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { theme } from '../theme/theme';

interface SuccessToastProps {
  message: string;
  visible: boolean;
}

export function SuccessToast({ message, visible }: SuccessToastProps) {
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutUp}
      style={styles.container}
    >
      <Text style={styles.icon}>✓</Text>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: theme.spacing.xl,
    right: theme.spacing.xl,
    backgroundColor: 'rgba(46,204,113,0.15)',
    borderRadius: theme.radii.small,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(46,204,113,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.microShadow,
  },
  icon: {
    fontSize: 20,
    color: theme.palette.success,
    marginRight: theme.spacing.sm,
  },
  text: {
    ...theme.typography.bodySmall,
    color: theme.palette.success,
  },
});
```

## Loading States

### Loading Screen

```typescript
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../components/GlassCard';
import { theme } from '../theme/theme';

export function LoadingScreen({ message = 'Loading...' }) {
  return (
    <LinearGradient
      colors={theme.palette.backgroundGradient}
      style={styles.container}
    >
      <GlassCard style={styles.card}>
        <ActivityIndicator size="large" color={theme.palette.primaryGradient[0]} />
        <Text style={styles.text}>{message}</Text>
      </GlassCard>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  card: {
    alignItems: 'center',
    minWidth: 200,
  },
  text: {
    ...theme.typography.body,
    marginTop: theme.spacing.lg,
  },
});
```

### Inline Loader

```typescript
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

export function InlineLoader() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={theme.palette.primaryGradient[0]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
});
```

## Custom Components

### Avatar with Glass Border

```typescript
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

interface AvatarProps {
  uri: string;
  size?: number;
}

export function Avatar({ uri, size = 64 }: AvatarProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={{ uri }}
        style={[styles.image, { width: size - 8, height: size - 8 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: theme.palette.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.glassBg,
  },
  image: {
    borderRadius: 999,
  },
});
```

### Glass Badge

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'danger' | 'warning';
}

export function Badge({ label, variant = 'primary' }: BadgeProps) {
  const backgroundColor = {
    primary: 'rgba(94,231,223,0.2)',
    success: 'rgba(46,204,113,0.2)',
    danger: 'rgba(255,90,95,0.2)',
    warning: 'rgba(243,156,18,0.2)',
  }[variant];

  const textColor = {
    primary: theme.palette.primaryGradient[0],
    success: theme.palette.success,
    danger: theme.palette.danger,
    warning: theme.palette.warning,
  }[variant];

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.small,
    alignSelf: 'flex-start',
  },
  text: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
});
```

---

These examples demonstrate the flexibility and power of the Liquid Glass theme system. Mix and match components to create beautiful, functional interfaces.
