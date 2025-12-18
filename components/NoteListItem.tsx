/**
 * NoteListItem Component
 *
 * Displays a single note in the list with selection state
 */

import React from 'react';
import { Pressable, Text, StyleSheet, View, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { ListTodo } from 'lucide-react-native';
import { Note } from '../lib/notes';
import { theme } from '../theme/theme';

interface NoteListItemProps {
  note: Note;
  isSelected: boolean;
  onPress: () => void;
  onDoublePress?: () => void;
  showPreview?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Paint splash vibrant colors from the theme
export const PAINT_SPLASH_COLORS = [
  { bg: '#E63946', text: '#FFFFFF' },  // Red
  { bg: '#FF9F1C', text: '#1A1423' },  // Orange
  { bg: '#FFD60A', text: '#1A1423' },  // Yellow
  { bg: '#06BCC1', text: '#FFFFFF' },  // Cyan
  { bg: '#7B2CBF', text: '#FFFFFF' },  // Purple
  { bg: '#FF6B9D', text: '#FFFFFF' },  // Pink (mix of red/purple)
  { bg: '#00A8E8', text: '#FFFFFF' },  // Bright Blue
  { bg: '#F15BB5', text: '#FFFFFF' },  // Magenta
];

export const getColorForNote = (noteId: string): { bg: string; text: string } => {
  let hash = 0;
  for (let i = 0; i < noteId.length; i++) {
    hash = noteId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PAINT_SPLASH_COLORS.length;
  return PAINT_SPLASH_COLORS[index];
};

export const NoteListItem: React.FC<NoteListItemProps> = ({
  note,
  isSelected,
  onPress,
  onDoublePress,
  showPreview = false,
}) => {
  const scale = useSharedValue(1);
  const noteColors = getColorForNote(note.id);
  const lastPressTime = React.useRef<number>(0);
  const DOUBLE_PRESS_DELAY = 300; // milliseconds

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    const now = Date.now();
    const timeSinceLastPress = now - lastPressTime.current;

    if (timeSinceLastPress < DOUBLE_PRESS_DELAY && onDoublePress) {
      // Double press detected
      lastPressTime.current = 0; // Reset to avoid triple-press
      onDoublePress();
    } else {
      // Single press
      lastPressTime.current = now;
      onPress();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getSnippet = (body: string, maxLength = 120) => {
    const trimmed = body.replace(/<[^>]+>/g, '').trim();
    if (trimmed.length <= maxLength) return trimmed;
    return trimmed.substring(0, maxLength) + '...';
  };

  const hasImages = (body: string) => {
    return body.includes('<img');
  };

  const renderPreview = () => {
    if (note.type === 'tasklist') {
      const tasks = note.tasks || [];
      const completedCount = tasks.filter((task) => task.completed).length;
      return (
        <View style={styles.taskListPreview}>
          <ListTodo size={16} color={noteColors.text} style={{ opacity: 0.8 }} />
          <Text style={[styles.taskListCount, { color: noteColors.text }]}>
            {completedCount} of {tasks.length} completed
          </Text>
        </View>
      );
    }

    if (!note.body) {
      return <Text style={[styles.emptySnippet, { color: noteColors.text, opacity: 0.6 }]}>No content</Text>;
    }

    if (Platform.OS === 'web' && hasImages(note.body)) {
      return (
        <View style={styles.previewContainer}>
          <div
            dangerouslySetInnerHTML={{ __html: note.body.substring(0, 300) }}
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: 14,
              lineHeight: 1.5,
              color: noteColors.text,
              overflow: 'hidden',
              padding: 4,
            }}
          />
          <style>{`
            .previewContainer img {
              max-width: 100%;
              height: auto;
              display: block;
              margin: 4px 0;
              border-radius: 6px;
              max-height: 60px;
              object-fit: cover;
            }
          `}</style>
        </View>
      );
    }

    return (
      <Text style={[styles.snippet, { color: noteColors.text, opacity: 0.85 }]} numberOfLines={2} ellipsizeMode="tail">
        {getSnippet(note.body)}
      </Text>
    );
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, styles.container]}
      accessibilityRole="button"
      accessibilityLabel={`note-item-${note.id}`}
      accessibilityState={{ selected: isSelected }}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: noteColors.bg },
          isSelected && styles.cardSelected,
        ]}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              {note.type === 'tasklist' && (
                <ListTodo size={16} color={noteColors.text} style={{ marginRight: 6 }} />
              )}
              <Text
                style={[styles.title, { color: noteColors.text }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {note.title}
              </Text>
            </View>
            {isSelected && note.type === 'tasklist' && note.tasks && (
              <Text
                style={[styles.firstLine, { color: noteColors.text }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {note.tasks.filter(t => t.completed).length} of {note.tasks.length} complete
              </Text>
            )}
            {isSelected && note.body && note.type !== 'tasklist' && (
              <Text
                style={[styles.firstLine, { color: noteColors.text }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {getSnippet(note.body, 80)}
              </Text>
            )}
          </View>
          <Text style={[styles.timestamp, { color: noteColors.text, opacity: 0.75 }]}>
            {formatDate(note.updatedAt)}
          </Text>
        </View>

        {showPreview && !isSelected && renderPreview()}
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.sm,
  },
  card: {
    width: '100%',
    borderRadius: theme.radii.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    ...theme.shadows.cardShadow,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  titleContainer: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...theme.typography.title,
    lineHeight: 21,
    flex: 1,
  },
  firstLine: {
    ...theme.typography.bodySmall,
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
    marginTop: 2,
  },
  timestamp: {
    ...theme.typography.caption,
    color: theme.palette.textSecondary,
  },
  snippet: {
    ...theme.typography.bodySmall,
    color: theme.palette.textSecondary,
  },
  emptySnippet: {
    ...theme.typography.bodySmall,
    color: theme.palette.textTertiary,
    fontStyle: 'italic',
  },
  previewContainer: {
    maxHeight: 70,
    overflow: 'hidden',
    borderRadius: 6,
  },
  taskListPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  taskListCount: {
    ...theme.typography.bodySmall,
    opacity: 0.8,
  },
});
