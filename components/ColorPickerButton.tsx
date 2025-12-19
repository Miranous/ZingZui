/**
 * ColorPickerButton Component
 *
 * Button that displays a color palette for selecting note colors
 */

import React, { useState } from 'react';
import { View, Pressable, StyleSheet, Modal } from 'react-native';
import { Palette } from 'lucide-react-native';
import { PAINT_SPLASH_COLORS } from './NoteListItem';
import { theme } from '../theme/theme';

interface ColorPickerButtonProps {
  selectedColor?: string;
  onColorSelect: (color: string) => void;
  disabled?: boolean;
}

export const ColorPickerButton: React.FC<ColorPickerButtonProps> = ({
  selectedColor,
  onColorSelect,
  disabled = false,
}) => {
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const handleColorSelect = (color: string) => {
    onColorSelect(color);
    setIsPickerVisible(false);
  };

  return (
    <>
      <Pressable
        onPress={() => setIsPickerVisible(true)}
        disabled={disabled}
        style={[styles.button, disabled && styles.buttonDisabled]}
        accessibilityLabel="color-picker-button"
        accessibilityRole="button"
      >
        <Palette size={20} color={theme.palette.textPrimary} />
      </Pressable>

      <Modal
        visible={isPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPickerVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsPickerVisible(false)}
        >
          <View style={styles.pickerContainer}>
            <View style={styles.colorsGrid}>
              {PAINT_SPLASH_COLORS.map((color) => (
                <Pressable
                  key={color.bg}
                  onPress={() => handleColorSelect(color.bg)}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color.bg },
                    selectedColor === color.bg && styles.colorSwatchSelected,
                  ]}
                  accessibilityLabel={`color-swatch-${color.bg}`}
                  accessibilityRole="button"
                />
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 32,
    height: 32,
    borderRadius: theme.radii.button,
    backgroundColor: theme.palette.inputBg,
    borderWidth: 1,
    borderColor: theme.palette.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: theme.palette.backgroundGradient[1],
    borderRadius: theme.radii.card,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.palette.glassBorder,
    ...theme.shadows.cardShadow,
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    maxWidth: 280,
  },
  colorSwatch: {
    width: 50,
    height: 50,
    borderRadius: theme.radii.small,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  colorSwatchSelected: {
    borderColor: theme.palette.textPrimary,
    borderWidth: 3,
    ...theme.shadows.buttonShadow,
  },
});
