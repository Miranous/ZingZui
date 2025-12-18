import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Platform, TextInput } from 'react-native';
import { theme } from '../theme/theme';
import { uploadImage, deleteImage } from '../lib/storage';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  userId: string;
  onFocus?: () => void;
  onBlur?: () => void;
  textColor?: string;
  placeholderColor?: string;
}

export interface RichTextEditorRef {
  insertTextAtCursor: (text: string) => void;
}

export const RichTextEditor = React.forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ value, onChange, placeholder = 'Enter content...', userId, onFocus, onBlur, textColor, placeholderColor }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [, setUpdateTrigger] = useState(0);

    React.useImperativeHandle(ref, () => ({
      insertTextAtCursor: (text: string) => {
        if (Platform.OS === 'web' && editorRef.current) {
          const editor = editorRef.current;
          const selection = window.getSelection();

          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const textNode = document.createTextNode(text);
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
          } else {
            const textNode = document.createTextNode(text);
            editor.appendChild(textNode);
          }

          onChange(editor.innerHTML);
        }
      },
    }));

    useEffect(() => {
      if (Platform.OS === 'web' && editorRef.current) {
        if (editorRef.current.innerHTML !== value) {
          const selection = window.getSelection();
          const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
          const startOffset = range?.startOffset || 0;
          const startContainer = range?.startContainer;

          editorRef.current.innerHTML = value;

          if (startContainer && range) {
            try {
              const newRange = document.createRange();
              newRange.setStart(startContainer, Math.min(startOffset, startContainer.textContent?.length || 0));
              newRange.collapse(true);
              selection?.removeAllRanges();
              selection?.addRange(newRange);
            } catch (e) {
            }
          }
        }
      }
    }, [value]);

    useEffect(() => {
      if (Platform.OS === 'web' && editorRef.current) {
        const editor = editorRef.current;

        const handleInput = () => {
          onChange(editor.innerHTML);
        };

        const handlePaste = async (e: ClipboardEvent) => {
          const items = e.clipboardData?.items;
          if (!items) return;

          for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
              e.preventDefault();
              const file = items[i].getAsFile();
              if (!file) continue;

              const reader = new FileReader();
              reader.onload = async (event) => {
                const dataUrl = event.target?.result as string;
                const blob = await fetch(dataUrl).then((r) => r.blob());
                const result = await uploadImage(blob, userId);

                if (result.error) {
                  alert('Failed to upload image: ' + result.error);
                  return;
                }

                const img = document.createElement('img');
                img.src = result.url;
                img.contentEditable = 'false';
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                img.style.display = 'block';
                img.style.margin = '12px 0';
                img.style.borderRadius = '8px';
                img.style.cursor = 'pointer';

                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0);
                  range.deleteContents();
                  range.insertNode(img);

                  const br = document.createElement('br');
                  range.collapse(false);
                  range.insertNode(br);
                  range.setStartAfter(br);
                  range.collapse(true);
                  selection.removeAllRanges();
                  selection.addRange(range);
                } else {
                  editor.appendChild(img);
                  editor.appendChild(document.createElement('br'));
                }

                onChange(editor.innerHTML);
              };

              reader.readAsDataURL(file);
              break;
            }
          }
        };

        const handleClick = (e: MouseEvent) => {
          if ((e.target as HTMLElement).tagName === 'IMG') {
            document.querySelectorAll('img.selected').forEach((img) => {
              img.classList.remove('selected');
            });
            (e.target as HTMLElement).classList.add('selected');
          }
        };

        const handleCopy = (e: ClipboardEvent) => {
          const selection = window.getSelection();
          const selectedImg = document.querySelector('img.selected') as HTMLImageElement;

          if (selectedImg && selection && selection.toString() === '') {
            e.preventDefault();

            fetch(selectedImg.src)
              .then((res) => res.blob())
              .then((blob) => {
                const item = new ClipboardItem({ 'image/png': blob });
                navigator.clipboard.write([item]);
              });
          }
        };

        const handleKeyDown = async (e: KeyboardEvent) => {
          const selectedImg = document.querySelector('img.selected') as HTMLImageElement;

          if (selectedImg && (e.key === 'Delete' || e.key === 'Backspace')) {
            e.preventDefault();

            const imgSrc = selectedImg.src;
            const pathMatch = imgSrc.match(/note-images\/(.+)$/);

            if (pathMatch) {
              const imagePath = pathMatch[1];
              await deleteImage(imagePath);
            }

            selectedImg.remove();
            onChange(editor.innerHTML);
          }
        };

        const handleFocus = () => {
          if (onFocus) {
            onFocus();
          }
        };

        const handleBlur = () => {
          if (onBlur) {
            onBlur();
          }
        };

        editor.addEventListener('input', handleInput);
        editor.addEventListener('paste', handlePaste as any);
        editor.addEventListener('click', handleClick);
        editor.addEventListener('keydown', handleKeyDown);
        editor.addEventListener('focus', handleFocus);
        editor.addEventListener('blur', handleBlur);
        document.addEventListener('copy', handleCopy);

        return () => {
          editor.removeEventListener('input', handleInput);
          editor.removeEventListener('paste', handlePaste as any);
          editor.removeEventListener('click', handleClick);
          editor.removeEventListener('keydown', handleKeyDown);
          editor.removeEventListener('focus', handleFocus);
          editor.removeEventListener('blur', handleBlur);
          document.removeEventListener('copy', handleCopy);
        };
      }
    }, [userId, onChange, onFocus, onBlur]);

    if (Platform.OS === 'web') {
      return (
        <View style={styles.container}>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            style={{
              minHeight: 200,
              outline: 'none',
              padding: 12,
              color: textColor || theme.palette.textPrimary,
              fontSize: 16,
              lineHeight: 1.6,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              whiteSpace: 'pre-wrap',
              overflowWrap: 'break-word',
              wordWrap: 'break-word',
            }}
            data-placeholder={placeholder}
          />
          <style>{`
          div[contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: ${placeholderColor || theme.palette.textTertiary};
            font-style: italic;
          }
          img.selected {
            outline: 2px solid ${theme.palette.primaryGradient[0]};
            outline-offset: 2px;
          }
        `}</style>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <TextInput
          value={value.replace(/<[^>]+>/g, '')}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={theme.palette.textTertiary}
          multiline
          style={styles.textInput}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    minHeight: 200,
    backgroundColor: theme.palette.inputBg,
    borderRadius: theme.radii.input,
    borderWidth: 1,
    borderColor: theme.palette.glassBorder,
    overflow: 'hidden',
  },
  textInput: {
    minHeight: 200,
    padding: 12,
    color: theme.palette.textPrimary,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    textAlignVertical: 'top',
  },
});
