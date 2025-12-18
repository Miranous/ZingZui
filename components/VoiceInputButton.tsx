import React, { useState, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Platform, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, MicOff } from 'lucide-react-native';
import { theme } from '../theme/theme';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join(' ');

        if (transcript) {
          onTranscript(transcript + ' ');
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);

        if (event.error === 'no-speech') {
          setError('No speech detected. Please try again.');
        } else if (event.error === 'not-allowed') {
          setError('Microphone access denied.');
          setIsSupported(false);
        } else if (event.error === 'network') {
          setError('Network error. Please check your connection.');
        } else {
          setError('Speech recognition error. Please try again.');
        }

        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
        }
      }
    };
  }, [onTranscript]);

  const toggleRecording = () => {
    if (!recognitionRef.current || disabled) return;

    setError(null);

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error('Failed to start recording:', e);
        setError('Failed to start recording.');
      }
    }
  };

  if (Platform.OS !== 'web' || !isSupported) {
    return null;
  }

  return (
    <View>
      <Pressable
        onPress={toggleRecording}
        disabled={disabled}
        style={[styles.button, disabled && styles.buttonDisabled]}
        accessibilityLabel={isRecording ? 'stop-recording' : 'start-recording'}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={
            isRecording
              ? ['#FF5A5F', '#FF385C']
              : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']
          }
          style={styles.gradient}
        >
          {isRecording ? (
            <MicOff size={20} color="#FFFFFF" />
          ) : (
            <Mic size={20} color={theme.palette.textPrimary} />
          )}
        </LinearGradient>
      </Pressable>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.palette.glassBorder,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  errorText: {
    position: 'absolute',
    top: 45,
    right: 0,
    ...theme.typography.caption,
    color: theme.palette.danger,
    backgroundColor: 'rgba(11,18,32,0.9)',
    padding: theme.spacing.xs,
    borderRadius: theme.radii.small,
    minWidth: 200,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: theme.palette.danger,
  },
});
