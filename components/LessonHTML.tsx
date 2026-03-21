import React from 'react';
import { ScrollView, Text, StyleSheet, useWindowDimensions, View } from 'react-native';
import RenderHtml, { MixedStyleDeclaration } from 'react-native-render-html';
import { Colors, Fonts } from '@/constants/theme';

interface Props {
  html: string;
  title: string;
}

const tagsStyles: Record<string, MixedStyleDeclaration> = {
  h1: { color: Colors.accent,        fontFamily: Fonts.bold,     fontSize: 22, marginBottom: 6,  marginTop: 12 },
  h2: { color: Colors.accent,        fontFamily: Fonts.semiBold, fontSize: 18, marginBottom: 4,  marginTop: 14 },
  h3: { color: Colors.text,          fontFamily: Fonts.semiBold, fontSize: 16, marginBottom: 4,  marginTop: 10 },
  h4: { color: Colors.text,          fontFamily: Fonts.semiBold, fontSize: 15, marginBottom: 4,  marginTop: 8  },
  p:  { color: Colors.textSecondary, fontFamily: Fonts.regular,  fontSize: 15, lineHeight: 24,   marginBottom: 6 },
  li: { color: Colors.textSecondary, fontFamily: Fonts.regular,  fontSize: 15, lineHeight: 24,   marginBottom: 4 },
  strong: { color: Colors.text,      fontFamily: Fonts.semiBold },
  em:     { color: Colors.textSecondary },
  code:   { color: Colors.accent,    fontFamily: Fonts.regular,  fontSize: 13, backgroundColor: 'rgba(0,229,160,0.08)', padding: 2 },
  table:  { marginVertical: 8 },
  th:     { color: Colors.text,      fontFamily: Fonts.semiBold, fontSize: 13, padding: 6, backgroundColor: 'rgba(255,255,255,0.06)' },
  td:     { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 13, padding: 6 },
};

const classesStyles: Record<string, MixedStyleDeclaration> = {
  'text-accent':    { color: '#00E5A0' },
  'text-warning':   { color: '#F5A623' },
  'text-blue':      { color: '#4FC3F7' },
  'text-secondary': { color: 'rgba(255,255,255,0.55)' },
  'text-orange':    { color: '#FF7043' },
  'text-success':   { color: '#50C878' },
  'text-center':    { textAlign: 'center' },
  'glass-card':     { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, marginBottom: 16, padding: 16 },
  'bg-dark':        { backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 10, padding: 12, marginBottom: 8 },
  'padding-2':      { padding: 20 },
  'padding-1':      { padding: 12 },
  'mb-1':           { marginBottom: 8 },
  'mb-2':           { marginBottom: 16 },
  'mt-1':           { marginTop: 8 },
  'rounded':        { borderRadius: 10 },
  'p-2':            { padding: 14 },
};

export default function LessonHTML({ html, title }: Props) {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 32, 700);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>{title}</Text>
      <RenderHtml
        contentWidth={contentWidth}
        source={{ html }}
        tagsStyles={tagsStyles}
        classesStyles={classesStyles}
        baseStyle={{ color: Colors.textSecondary, fontFamily: Fonts.regular }}
        enableExperimentalBRCollapsing
        enableExperimentalGhostLinesPrevention
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 60 },
  title:     { fontSize: 22, fontFamily: Fonts.bold, color: Colors.accent, marginBottom: 16 },
});
