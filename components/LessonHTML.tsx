import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';

interface Props {
  html: string;
  title: string;
}

// Native fallback: strip HTML tags and display plain text.
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&rarr;/g, '→')
    .replace(/&#[0-9]+;/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export default function LessonHTML({ html, title }: Props) {
  const text = stripHtml(html);
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{text}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontFamily: Fonts.bold, color: Colors.accent, marginBottom: 12 },
  body: { fontSize: 15, fontFamily: Fonts.regular, color: Colors.textSecondary, lineHeight: 24 },
});
