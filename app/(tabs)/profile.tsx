import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity, Switch,
  Platform, Modal, TextInput, Alert, Pressable, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fonts, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useUserStats } from '@/hooks/useUserStats';
import { useRouter } from 'expo-router';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const SESSION_DURATIONS = ['15 min', '30 min', '45 min', '60 min', '90 min'];
const TARGET_SCORES = ['200/400', '220/400', '240/400', '260/400', '280/400', '300/400', '320/400', '340/400', '360/400'];

const PREFS_KEY = 'naija_study_prefs';

type Prefs = {
  notifications: boolean;
  sessionDuration: string;
  targetScore: string;
};

const DEFAULT_PREFS: Prefs = {
  notifications: true,
  sessionDuration: '45 min',
  targetScore: '300/400',
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { username, email, streak, topicsDone, avgScore } = useUserStats();
  const router = useRouter();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [durationModal, setDurationModal] = useState(false);
  const [scoreModal, setScoreModal] = useState(false);
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [helpModal, setHelpModal] = useState(false);
  const [aboutModal, setAboutModal] = useState(false);

  const [newUsername, setNewUsername] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

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

  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY).then(raw => {
      if (raw) {
        try { setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) }); } catch {}
      }
    });
  }, []);

  const savePrefs = useCallback(async (next: Prefs) => {
    setPrefs(next);
    setSavingPrefs(true);
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
    setSavingPrefs(false);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth');
  };

  const handleSaveProfile = async () => {
    if (!newUsername.trim()) return;
    setSavingProfile(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.updateUser({
          data: { username: newUsername.trim() },
        });
        if (error) {
          Alert.alert('Error', error.message);
          return;
        }
      }
      Alert.alert('Saved', 'Your display name has been updated.');
      setEditProfileModal(false);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Something went wrong.');
    } finally {
      setSavingProfile(false);
    }
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
        <View style={[styles.settingRow, { borderBottomColor: colors.surfaceBorder, borderBottomWidth: 1 }]}>
          <View style={[styles.settingIcon, { backgroundColor: colors.accentDim }]}>
            <Ionicons name="notifications-outline" size={18} color={colors.accent} />
          </View>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Daily Reminders</Text>
          <Switch
            value={prefs.notifications}
            onValueChange={v => savePrefs({ ...prefs, notifications: v })}
            trackColor={{ false: colors.surfaceBorder, true: colors.accent }}
            thumbColor="#fff"
          />
        </View>

        <View style={[styles.settingRow, { borderBottomColor: colors.surfaceBorder, borderBottomWidth: 1 }]}>
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

        <TouchableOpacity
          style={[styles.settingRow, { borderBottomColor: colors.surfaceBorder, borderBottomWidth: 1 }]}
          onPress={() => setDurationModal(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.settingIcon, { backgroundColor: colors.accentDim }]}>
            <Ionicons name="timer-outline" size={18} color={colors.accent} />
          </View>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Session Duration</Text>
          <View style={styles.settingRight}>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{prefs.sessionDuration}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={() => setScoreModal(true)} activeOpacity={0.7}>
          <View style={[styles.settingIcon, { backgroundColor: colors.accentDim }]}>
            <Ionicons name="trending-up-outline" size={18} color={colors.accent} />
          </View>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Target Score</Text>
          <View style={styles.settingRight}>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{prefs.targetScore}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Account */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account</Text>
      <View style={[styles.settingsGroup, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        <TouchableOpacity
          style={[styles.settingRow, { borderBottomColor: colors.surfaceBorder, borderBottomWidth: 1 }]}
          onPress={() => { setNewUsername(username); setEditProfileModal(true); }}
          activeOpacity={0.7}
        >
          <View style={[styles.settingIcon, { backgroundColor: colors.accentDim }]}>
            <Ionicons name="person-outline" size={18} color={colors.accent} />
          </View>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingRow, { borderBottomColor: colors.surfaceBorder, borderBottomWidth: 1 }]}
          onPress={() => setHelpModal(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.settingIcon, { backgroundColor: colors.accentDim }]}>
            <Ionicons name="help-circle-outline" size={18} color={colors.accent} />
          </View>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={() => setAboutModal(true)} activeOpacity={0.7}>
          <View style={[styles.settingIcon, { backgroundColor: colors.accentDim }]}>
            <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
          </View>
          <Text style={[styles.settingLabel, { color: colors.text }]}>About NaijaAcademy</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: colors.dangerDim, borderColor: colors.danger }]}
        onPress={handleSignOut}
      >
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out</Text>
      </TouchableOpacity>

      {/* ── Session Duration Modal ── */}
      <Modal visible={durationModal} transparent animationType="fade" onRequestClose={() => setDurationModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setDurationModal(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.surface }]} onPress={() => {}}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Session Duration</Text>
            <Text style={[styles.sheetSub, { color: colors.textSecondary }]}>How long do you want to study per session?</Text>
            {SESSION_DURATIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.sheetOption,
                  { borderColor: colors.surfaceBorder },
                  prefs.sessionDuration === opt && { backgroundColor: colors.accentDim, borderColor: colors.accent },
                ]}
                onPress={() => { savePrefs({ ...prefs, sessionDuration: opt }); setDurationModal(false); }}
              >
                <Text style={[styles.sheetOptionText, { color: prefs.sessionDuration === opt ? colors.accent : colors.text }]}>{opt}</Text>
                {prefs.sessionDuration === opt && <Ionicons name="checkmark" size={18} color={colors.accent} />}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Target Score Modal ── */}
      <Modal visible={scoreModal} transparent animationType="fade" onRequestClose={() => setScoreModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setScoreModal(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.surface }]} onPress={() => {}}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Target Score</Text>
            <Text style={[styles.sheetSub, { color: colors.textSecondary }]}>Set your JAMB score goal</Text>
            {TARGET_SCORES.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.sheetOption,
                  { borderColor: colors.surfaceBorder },
                  prefs.targetScore === opt && { backgroundColor: colors.accentDim, borderColor: colors.accent },
                ]}
                onPress={() => { savePrefs({ ...prefs, targetScore: opt }); setScoreModal(false); }}
              >
                <Text style={[styles.sheetOptionText, { color: prefs.targetScore === opt ? colors.accent : colors.text }]}>{opt}</Text>
                {prefs.targetScore === opt && <Ionicons name="checkmark" size={18} color={colors.accent} />}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Edit Profile Modal ── */}
      <Modal visible={editProfileModal} transparent animationType="fade" onRequestClose={() => setEditProfileModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setEditProfileModal(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.surface }]} onPress={() => {}}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Edit Profile</Text>
            <Text style={[styles.sheetSub, { color: colors.textSecondary }]}>Update your display name</Text>
            <View style={[styles.inputWrap, { borderColor: colors.surfaceBorder, backgroundColor: colors.background }]}>
              <Ionicons name="person-outline" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                value={newUsername}
                onChangeText={setNewUsername}
                placeholder="Display name"
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { color: colors.text }]}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleSaveProfile}
              />
            </View>
            {!isSupabaseConfigured && (
              <Text style={[styles.guestNote, { color: colors.textSecondary }]}>
                Connect Supabase to persist changes across devices.
              </Text>
            )}
            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={[styles.sheetBtn, { borderColor: colors.surfaceBorder }]}
                onPress={() => setEditProfileModal(false)}
              >
                <Text style={[styles.sheetBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sheetBtn, { backgroundColor: colors.accent, borderColor: colors.accent }]}
                onPress={handleSaveProfile}
                disabled={savingProfile || !newUsername.trim()}
              >
                <Text style={[styles.sheetBtnText, { color: '#fff' }]}>{savingProfile ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Help & Support Modal ── */}
      <Modal visible={helpModal} transparent animationType="fade" onRequestClose={() => setHelpModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setHelpModal(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.surface }]} onPress={() => {}}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Help & Support</Text>
            {[
              { icon: 'mail-outline', label: 'Email Us', value: 'support@naijaacademy.app' },
              { icon: 'chatbubble-ellipses-outline', label: 'WhatsApp Community', value: 'Join our study group' },
              { icon: 'book-outline', label: 'Study Tips', value: 'Read our exam prep guide' },
              { icon: 'bug-outline', label: 'Report a Bug', value: 'Help us improve the app' },
            ].map((item, i) => (
              <View key={i} style={[styles.helpRow, { borderBottomColor: colors.surfaceBorder, borderBottomWidth: i < 3 ? 1 : 0 }]}>
                <View style={[styles.settingIcon, { backgroundColor: colors.accentDim }]}>
                  <Ionicons name={item.icon as any} size={18} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.helpLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.helpValue, { color: colors.textSecondary }]}>{item.value}</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity
              style={[styles.sheetCloseBtn, { backgroundColor: colors.accentDim, borderColor: colors.accent }]}
              onPress={() => setHelpModal(false)}
            >
              <Text style={[styles.sheetCloseBtnText, { color: colors.accent }]}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── About Modal ── */}
      <Modal visible={aboutModal} transparent animationType="fade" onRequestClose={() => setAboutModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setAboutModal(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.surface }]} onPress={() => {}}>
            <View style={{ alignItems: 'center', marginBottom: Spacing.md }}>
              <View style={[styles.aboutLogo, { backgroundColor: colors.accentDim, borderColor: colors.accent }]}>
                <Ionicons name="school" size={32} color={colors.accent} />
              </View>
              <Text style={[styles.sheetTitle, { color: colors.text, marginTop: Spacing.sm }]}>NaijaAcademy</Text>
              <Text style={[styles.aboutVersion, { color: colors.textSecondary }]}>Version 1.0.0</Text>
            </View>
            <Text style={[styles.aboutDesc, { color: colors.textSecondary }]}>
              NaijaAcademy is a comprehensive study platform built to help Nigerian secondary school students excel in JAMB UTME, WAEC, and NECO examinations.
            </Text>
            <View style={[styles.aboutStats, { borderColor: colors.surfaceBorder }]}>
              {[
                { label: 'Subjects', value: '17+' },
                { label: 'Lessons', value: '200+' },
                { label: 'Questions', value: '2000+' },
              ].map((s, i) => (
                <View key={i} style={[styles.aboutStatItem, i < 2 && { borderRightWidth: 1, borderRightColor: colors.surfaceBorder }]}>
                  <Text style={[styles.statValue, { color: colors.accent }]}>{s.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.label}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.sheetCloseBtn, { backgroundColor: colors.accentDim, borderColor: colors.accent }]}
              onPress={() => setAboutModal(false)}
            >
              <Text style={[styles.sheetCloseBtnText, { color: colors.accent }]}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
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
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  settingIcon: { width: 36, height: 36, borderRadius: Radius.sm, justifyContent: 'center', alignItems: 'center' },
  settingLabel: { flex: 1, fontSize: 15, fontFamily: Fonts.medium },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  settingValue: { fontSize: 13, fontFamily: Fonts.regular },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, marginTop: Spacing.sm },
  logoutText: { fontSize: 15, fontFamily: Fonts.semiBold },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  sheet: { width: '100%', maxWidth: 420, borderRadius: Radius.xl, padding: Spacing.lg, gap: 8 },
  sheetTitle: { fontSize: 18, fontFamily: Fonts.bold, marginBottom: 2 },
  sheetSub: { fontSize: 13, fontFamily: Fonts.regular, marginBottom: Spacing.sm },
  sheetOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, marginBottom: 6 },
  sheetOptionText: { fontSize: 15, fontFamily: Fonts.medium },
  sheetActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  sheetBtn: { flex: 1, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, alignItems: 'center' },
  sheetBtnText: { fontSize: 15, fontFamily: Fonts.semiBold },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Platform.OS === 'web' ? Spacing.sm : 0, marginBottom: 4 },
  input: { flex: 1, fontSize: 15, fontFamily: Fonts.regular, paddingVertical: Spacing.sm },
  guestNote: { fontSize: 12, fontFamily: Fonts.regular, marginBottom: 4 },
  helpRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  helpLabel: { fontSize: 14, fontFamily: Fonts.medium },
  helpValue: { fontSize: 12, fontFamily: Fonts.regular, marginTop: 2 },
  sheetCloseBtn: { marginTop: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, alignItems: 'center' },
  sheetCloseBtnText: { fontSize: 15, fontFamily: Fonts.semiBold },
  aboutLogo: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  aboutVersion: { fontSize: 13, fontFamily: Fonts.regular, marginTop: 4 },
  aboutDesc: { fontSize: 14, fontFamily: Fonts.regular, lineHeight: 22, marginBottom: Spacing.md, textAlign: 'center' },
  aboutStats: { flexDirection: 'row', borderRadius: Radius.lg, borderWidth: 1, marginBottom: Spacing.md, overflow: 'hidden' },
  aboutStatItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
});
