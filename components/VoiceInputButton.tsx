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
  const shouldContinueRef = useRef(false);
  const resultIndexRef = useRef(0);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

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
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('Speech recognition started');
      };

      recognition.onresult = (event: any) => {
        for (let i = resultIndexRef.current; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            const transcript = result[0].transcript;
            if (transcript.trim()) {
              onTranscriptRef.current(transcript + ' ');
            }
            resultIndexRef.current = i + 1;
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);

        if (event.error === 'no-speech') {
          console.log('No speech detected, will continue listening...');
        } else if (event.error === 'not-allowed') {
          setError('Microphone access denied.');
          setIsSupported(false);
          shouldContinueRef.current = false;
          setIsRecording(false);
        } else if (event.error === 'aborted') {
          console.log('Recognition aborted');
        } else if (event.error === 'network') {
          setError('Network error. Please check your connection.');
          shouldContinueRef.current = false;
          setIsRecording(false);
        } else {
          console.log('Speech recognition error, will continue:', event.error);
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended, shouldContinue:', shouldContinueRef.current);
        if (shouldContinueRef.current) {
          setTimeout(() => {
            if (shouldContinueRef.current) {
              try {
                console.log('Restarting speech recognition...');
                resultIndexRef.current = 0;
                recognition.start();
              } catch (e) {
                console.error('Failed to restart recognition:', e);
                setIsRecording(false);
                shouldContinueRef.current = false;
              }
            }
          }, 100);
        } else {
          setIsRecording(false);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        shouldContinueRef.current = false;
        try {
          recognitionRef.current.stop();
        } catch (e) {
        }
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current || disabled) return;

    setError(null);

    if (isRecording) {
      shouldContinueRef.current = false;
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        resultIndexRef.current = 0;
        shouldContinueRef.current = true;
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
