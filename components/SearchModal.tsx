/**
 * Search Modal Component
 *
 * Modal dialog for searching notes by title and/or body
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Search } from 'lucide-react-native';
import { GlassCard } from './GlassCard';
import { ThemedInput } from './ThemedInput';
import { ThemedButton } from './ThemedButton';
import { theme } from '../theme/theme';

interface SearchModalProps {
  visible: boolean;
  onSearch: (searchTerm: string, titlesOnly: boolean) => void;
  onClose: () => void;
}

export function SearchModal({ visible, onSearch, onClose }: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [titlesOnly, setTitlesOnly] = useState(true);

  const handleSearch = () => {
    onSearch(searchTerm, titlesOnly);
    setSearchTerm('');
    onClose();
  };

  const handleClose = () => {
    setSearchTerm('');
    setTitlesOnly(true);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <BlurView intensity={20} style={styles.backdrop}>
        <Pressable style={styles.backdropPressable} onPress={handleClose}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <GlassCard style={styles.card}>
                <View style={styles.header}>
                  <Text style={styles.title}>Search Notes</Text>
                  <Pressable
                    onPress={handleClose}
                    style={styles.closeButton}
                    accessibilityLabel="close-search-modal"
                  >
                    <X
                      size={24}
                      color={theme.palette.textSecondary}
                      strokeWidth={2}
                    />
                  </Pressable>
                </View>

                <View style={styles.content}>
                  <ThemedInput
                    label="Search Term"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    placeholder="Enter search term..."
                    autoFocus
                    accessibilityLabel="search-input"
                  />

                  <Pressable
                    style={styles.checkboxContainer}
                    onPress={() => setTitlesOnly(!titlesOnly)}
                    accessibilityLabel="titles-only-checkbox"
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: titlesOnly }}
                  >
                    <View style={styles.checkbox}>
                      {titlesOnly && <View style={styles.checkboxInner} />}
                    </View>
                    <Text style={styles.checkboxLabel}>Titles only</Text>
                  </Pressable>

                  <View style={styles.actions}>
                    <Pressable
                      onPress={handleClose}
                      style={styles.iconButton}
                      accessibilityLabel="cancel-search-button"
                    >
                      <X
                        size={24}
                        color={theme.palette.textPrimary}
                        strokeWidth={2}
                      />
                    </Pressable>
                    <Pressable
                      onPress={handleSearch}
                      style={[
                        styles.iconButton,
                        styles.primaryButton,
                        !searchTerm.trim() && styles.disabledButton,
                      ]}
                      disabled={!searchTerm.trim()}
                      accessibilityLabel="confirm-search-button"
                    >
                      <Search
                        size={24}
                        color={theme.palette.textPrimary}
                        strokeWidth={2}
                      />
                    </Pressable>
                  </View>
                </View>
              </GlassCard>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropPressable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  keyboardView: {
    width: '100%',
    maxWidth: 500,
  },
  card: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.title,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  content: {
    gap: theme.spacing.lg,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: theme.radii.small,
    borderWidth: 2,
    borderColor: theme.palette.glassBorder,
    backgroundColor: theme.palette.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: theme.palette.primaryGradient[0],
  },
  checkboxLabel: {
    ...theme.typography.body,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
    justifyContent: 'flex-end',
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.button,
    backgroundColor: theme.palette.inputBg,
    borderWidth: 1,
    borderColor: theme.palette.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: theme.palette.primaryGradient[0],
    borderColor: theme.palette.primaryGradient[1],
  },
  disabledButton: {
    opacity: 0.5,
  },
});
