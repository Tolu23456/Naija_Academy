import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Switch, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Fonts, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useUserStats } from '@/hooks/useUserStats';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { username, email, streak, topicsDone, avgScore } = useUserStats();
  const router = useRouter();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  const [notifications, setNotifications] = useState(true);

  const isOAuthUser = !!user?.app_metadata?.provider && user.app_metadata.provider !== 'email';
  const providerLabel = isOAuthUser
    ? (user?.app_metadata?.provider === 'github' ? 'GitHub Account' : `${user?.app_metadata?.provider} Account`)
    : 'Email Account';
  const providerIcon = user?.app_metadata?.provider === 'github' ? 'logo-github' : 'mail-outline';

  const profileStats = [
    { label: 'Topics Done', value: String(topicsDone) },
    { label: 'Study Streak', value: streak === 1 ? '1 Day' : `${streak} Days` },
    { label: 'Avg Score', value: avgScore > 0 ? `${Math.round(avgScore)}%` : '—' },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + Spacing.md, paddingBottom: bottomPad + Spacing.xl }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatarCircle, { backgroundColor: colors.accentDim, borderColor: colors.accent }]}>
          <Text style={[styles.avatarInitial, { color: colors.accent }]}>
            {username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.providerRow}>
          <Ionicons name={providerIcon as any} size={14} color={colors.textSecondary} />
          <Text style={[styles.providerLabel, { color: colors.textSecondary }]}>{providerLabel}</Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{username}</Text>
        {email ? <Text style={[styles.email, { color: colors.textSecondary }]}>{email}</Text> : null}
        <View style={[styles.badge, { backgroundColor: colors.accentDim }]}>
          <Text style={[styles.badgeText, { color: colors.accent }]}>JAMB 2026 Candidate</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        {profileStats.map((s, i) => (
          <View
            key={i}
            style={[styles.statItem, i < profileStats.length - 1 && { borderRightWidth: 1, borderRightColor: colors.surfaceBorder }]}
          >
            <Text style={[styles.statValue, { color: colors.text }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {topicsDone === 0 && (
        <View style={[styles.hintCard, { backgroundColor: colors.accentDim, borderColor: colors.accent }]}>
          <Ionicons name="rocket-outline" size={18} color={colors.accent} />
          <Text style={[styles.hintText, { color: colors.accent }]}>
            Complete your first mock test to start tracking your progress!
          </Text>
        </View>
      )}

      {/* Study Preferences */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Study Preferences</Text>
      <View style={[styles.settingsGroup, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        <View style={[styles.settingRow, { borderBottomColor: colors.surfaceBorder }]}>
          <View style={[styles.settingIcon, { backgroundColor: colors.accentDim }]}>
            <Ionicons name="notifications-outline" size={18} color={colors.accent} />
          </View>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Daily Reminders</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: colors.surfaceBorder, true: colors.accent }}
            thumbColor="#fff"
          />
        </View>

        <View style={[styles.settingRow, { borderBottomColor: colors.surfaceBorder }]}>
          <View style={[styles.settingIcon, { backgroundColor: colors.accentDim }]}>
            <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={colors.accent} />
          </View>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.surfaceBorder, true: colors.accent }}
            thumbColor="#fff"
          />
        </View>

        <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.surfaceBorder }]}>
          <View style={[styles.settingIcon, { backgroundColor: colors.accentDim }]}>
            <Ionicons name="timer-outline" size={18} color={colors.accent} />
          </View>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Session Duration</Text>
          <View style={styles.settingRight}>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>45 min</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow}>
          <View style={[styles.settingIcon, { backgroundColor: colors.accentDim }]}>
            <Ionicons name="trending-up-outline" size={18} color={colors.accent} />
          </View>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Target Score</Text>
          <View style={styles.settingRight}>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>300/400</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Account */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account</Text>
      <View style={[styles.settingsGroup, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        {[
          { icon: 'person-outline', label: 'Edit Profile' },
          { icon: 'help-circle-outline', label: 'Help & Support' },
          { icon: 'information-circle-outline', label: 'About NaijaAcademy' },
        ].map((row, i, arr) => (
          <TouchableOpacity
            key={row.icon}
            style={[styles.settingRow, i < arr.length - 1 && { borderBottomColor: colors.surfaceBorder, borderBottomWidth: 1 }]}
          >
            <View style={[styles.settingIcon, { backgroundColor: colors.accentDim }]}>
              <Ionicons name={row.icon as any} size={18} color={colors.accent} />
            </View>
            <Text style={[styles.settingLabel, { color: colors.text }]}>{row.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: colors.dangerDim, borderColor: colors.danger }]}
        onPress={handleSignOut}
      >
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: Spacing.md },
  avatarSection: { alignItems: 'center', paddingVertical: Spacing.lg },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', borderWidth: 2, marginBottom: Spacing.sm },
  avatarInitial: { fontSize: 38, fontFamily: Fonts.bold },
  providerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  providerLabel: { fontSize: 12, fontFamily: Fonts.regular },
  name: { fontSize: 22, fontFamily: Fonts.bold },
  email: { fontSize: 14, fontFamily: Fonts.regular, marginTop: 2, marginBottom: Spacing.sm },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full },
  badgeText: { fontSize: 12, fontFamily: Fonts.semiBold },
  statsCard: { flexDirection: 'row', borderRadius: Radius.lg, borderWidth: 1, marginBottom: Spacing.md, overflow: 'hidden' },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
  statValue: { fontSize: 20, fontFamily: Fonts.bold },
  statLabel: { fontSize: 11, fontFamily: Fonts.regular, marginTop: 2, textAlign: 'center' },
  hintCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, marginBottom: Spacing.md },
  hintText: { flex: 1, fontSize: 13, fontFamily: Fonts.medium, lineHeight: 18 },
  sectionTitle: { fontSize: 16, fontFamily: Fonts.semiBold, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  settingsGroup: { borderRadius: Radius.lg, borderWidth: 1, marginBottom: Spacing.md, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderBottomWidth: 0 },
  settingIcon: { width: 36, height: 36, borderRadius: Radius.sm, justifyContent: 'center', alignItems: 'center' },
  settingLabel: { flex: 1, fontSize: 15, fontFamily: Fonts.medium },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  settingValue: { fontSize: 13, fontFamily: Fonts.regular },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, marginTop: Spacing.sm },
  logoutText: { fontSize: 15, fontFamily: Fonts.semiBold },
});
