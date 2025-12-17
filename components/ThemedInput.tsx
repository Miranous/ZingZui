/**
 * ThemedInput Component
 *
 * A text input with Liquid Glass aesthetic:
 * - Translucent background with glass effect
 * - Focus state with gradient border
 * - Error state handling
 * - Accessibility support
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { theme } from '../theme/theme';

interface ThemedInputProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const ThemedInput: React.FC<ThemedInputProps> = ({
  label,
  error,
  containerStyle,
  secureTextEntry,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        <TextInput
          {...textInputProps}
          style={styles.input}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          placeholderTextColor={theme.palette.textTertiary}
          onFocus={(e) => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={togglePasswordVisibility}
            accessibilityLabel={
              isPasswordVisible ? 'Hide password' : 'Show password'
            }
          >
            {isPasswordVisible ? (
              <EyeOff color={theme.palette.textSecondary} size={20} />
            ) : (
              <Eye color={theme.palette.textSecondary} size={20} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text
          style={styles.errorText}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.bodySmall,
    marginBottom: theme.spacing.sm,
    color: theme.palette.textSecondary,
  },
  inputContainer: {
    backgroundColor: theme.palette.inputBg,
    borderRadius: theme.radii.input,
    borderWidth: 1,
    borderColor: theme.palette.inputBorder,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainerFocused: {
    borderColor: theme.palette.inputBorderFocus,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: theme.palette.danger,
  },
  input: {
    ...theme.typography.body,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    color: theme.palette.textPrimary,
    flex: 1,
  },
  eyeIcon: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.palette.danger,
    marginTop: theme.spacing.xs,
  },
});
