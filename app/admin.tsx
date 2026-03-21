import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Fonts, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useAdmin } from '@/context/AdminContext';
import { SUBJECTS } from '@/lib/subjectsData';
import { getTopicSlugs } from '@/lib/lessonsData';

export default function AdminScreen() {
  const insets   = useSafeAreaInsets();
  const router   = useRouter();
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const { clearAdminSession } = useAdmin();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const totalLessons = SUBJECTS.reduce((acc, s) => acc + getTopicSlugs(s.id).length, 0);
  const totalTopics  = SUBJECTS.reduce((acc, s) => acc + s.topics.length, 0);
  const coverage     = Math.round((totalLessons / totalTopics) * 100);

  const subjectStats = SUBJECTS.map(s => ({
    name:      s.name,
    icon:      s.icon,
    colorKey:  s.colorKey,
    notes:     getTopicSlugs(s.id).length,
    total:     s.topics.length,
  }));

  function handleExitAdmin() {
    clearAdminSession();
    router.replace('/(tabs)');
  }

  async function handleSignOut() {
    clearAdminSession();
    await signOut();
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.surfaceBorder }]}>
        <TouchableOpacity onPress={handleExitAdmin} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: Spacing.sm }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Panel</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>{user?.email}</Text>
        </View>
        <View style={[styles.adminBadge, { backgroundColor: colors.accentDim }]}>
          <Ionicons name="shield-checkmark" size={14} color={colors.accent} />
          <Text style={[styles.adminBadgeText, { color: colors.accent }]}>Admin</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Overview cards */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Content Overview</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <Ionicons name="book" size={24} color={colors.accent} />
            <Text style={[styles.statValue, { color: colors.text }]}>{totalLessons}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Lessons Ready</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <Ionicons name="layers" size={24} color={colors.blue} />
            <Text style={[styles.statValue, { color: colors.text }]}>{totalTopics}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Topics</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <Ionicons name="pie-chart" size={24} color={colors.orange} />
            <Text style={[styles.statValue, { color: colors.text }]}>{coverage}%</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Coverage</Text>
          </View>
        </View>

        {/* Subject breakdown */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Subject Breakdown</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          {subjectStats.map((s, i) => {
            const subjectColor = colors[s.colorKey as keyof typeof colors] as string;
            const pct = Math.round((s.notes / s.total) * 100);
            return (
              <View key={s.name} style={[styles.subjectRow, i < subjectStats.length - 1 && { borderBottomColor: colors.surfaceBorder, borderBottomWidth: 1 }]}>
                <View style={[styles.subjectIcon, { backgroundColor: `${subjectColor}22` }]}>
                  <Ionicons name={s.icon as any} size={18} color={subjectColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.subjectMeta}>
                    <Text style={[styles.subjectName, { color: colors.text }]}>{s.name}</Text>
                    <Text style={[styles.subjectPct, { color: pct === 100 ? colors.accent : colors.textSecondary }]}>
                      {s.notes}/{s.total} notes
                    </Text>
                  </View>
                  <View style={[styles.progressBg, { backgroundColor: colors.surfaceBorder }]}>
                    <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: subjectColor }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Missing subjects */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Subjects Needing Content</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          {subjectStats.filter(s => s.notes === 0).length === 0 ? (
            <View style={styles.emptyRow}>
              <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>All subjects have at least some content</Text>
            </View>
          ) : (
            subjectStats.filter(s => s.notes === 0).map(s => (
              <View key={s.name} style={[styles.missingRow, { borderBottomColor: colors.surfaceBorder }]}>
                <Ionicons name="warning-outline" size={16} color={colors.orange} />
                <Text style={[styles.missingText, { color: colors.text }]}>{s.name}</Text>
                <Text style={[styles.missingPct, { color: colors.textSecondary }]}>0/{s.total} topics</Text>
              </View>
            ))
          )}
        </View>

        {/* System info */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>System Info</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          {[
            { label: 'Admin Email', value: user?.email ?? '—' },
            { label: 'User ID', value: (user?.id ?? '—').slice(0, 16) + '...' },
            { label: 'Platform', value: Platform.OS },
            { label: 'App Version', value: '1.0.0' },
          ].map((item, i, arr) => (
            <View key={item.label} style={[styles.infoRow, i < arr.length - 1 && { borderBottomColor: colors.surfaceBorder, borderBottomWidth: 1 }]}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{item.label}</Text>
              <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: colors.surfaceBorder, backgroundColor: colors.surface }]}
          onPress={handleExitAdmin}
        >
          <Ionicons name="home-outline" size={18} color={colors.text} />
          <Text style={[styles.actionBtnText, { color: colors.text }]}>Back to Student App</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: colors.danger, backgroundColor: `${colors.danger}18` }]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={[styles.actionBtnText, { color: colors.danger }]}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1 },
  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1 },
  backBtn:       { padding: 4 },
  headerTitle:   { fontSize: 18, fontFamily: Fonts.bold },
  headerSub:     { fontSize: 12, fontFamily: Fonts.regular },
  adminBadge:    { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  adminBadgeText: { fontSize: 12, fontFamily: Fonts.semiBold },
  content:       { padding: Spacing.md, paddingBottom: 60 },
  sectionTitle:  { fontSize: 16, fontFamily: Fonts.semiBold, marginBottom: Spacing.sm, marginTop: Spacing.md },
  statsRow:      { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statCard:      { flex: 1, alignItems: 'center', padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, gap: 4 },
  statValue:     { fontSize: 22, fontFamily: Fonts.bold },
  statLabel:     { fontSize: 11, fontFamily: Fonts.regular, textAlign: 'center' },
  card:          { borderRadius: Radius.lg, borderWidth: 1, marginBottom: Spacing.sm, overflow: 'hidden' },
  subjectRow:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  subjectIcon:   { width: 36, height: 36, borderRadius: Radius.sm, justifyContent: 'center', alignItems: 'center' },
  subjectMeta:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  subjectName:   { fontSize: 14, fontFamily: Fonts.medium },
  subjectPct:    { fontSize: 12, fontFamily: Fonts.semiBold },
  progressBg:    { height: 4, borderRadius: Radius.full },
  progressFill:  { height: 4, borderRadius: Radius.full },
  emptyRow:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  emptyText:     { fontSize: 13, fontFamily: Fonts.regular, flex: 1 },
  missingRow:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderBottomWidth: 1 },
  missingText:   { fontSize: 14, fontFamily: Fonts.medium, flex: 1 },
  missingPct:    { fontSize: 12, fontFamily: Fonts.regular },
  infoRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md },
  infoLabel:     { fontSize: 13, fontFamily: Fonts.regular },
  infoValue:     { fontSize: 13, fontFamily: Fonts.medium, maxWidth: '60%' },
  actionBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, marginTop: Spacing.sm },
  actionBtnText: { fontSize: 15, fontFamily: Fonts.semiBold },
});
