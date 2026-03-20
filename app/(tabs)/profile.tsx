import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Switch, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Colors, Fonts, Spacing, Radius } from '@/constants/theme';

const stats = [
  { label: 'Topics Mastered', value: '24' },
  { label: 'Study Streak', value: '14' },
  { label: 'Avg Score', value: '72%' },
];

type SettingRowProps = {
  icon: string;
  label: string;
  value?: string;
  toggle?: boolean;
  onPress?: () => void;
};

function SettingRow({ icon, label, value, toggle, onPress }: SettingRowProps) {
  const [enabled, setEnabled] = useState(false);
  return (
    <TouchableOpacity style={styles.settingRow} onPress={toggle ? undefined : onPress} activeOpacity={toggle ? 1 : 0.7}>
      <View style={[styles.settingIcon, { backgroundColor: Colors.accentDim }]}>
        <Ionicons name={icon as any} size={18} color={Colors.accent} />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      {toggle ? (
        <Switch
          value={enabled}
          onValueChange={setEnabled}
          trackColor={{ false: Colors.surfaceBorder, true: Colors.accent }}
          thumbColor="#fff"
        />
      ) : (
        <View style={styles.settingRight}>
          {value && <Text style={styles.settingValue}>{value}</Text>}
          <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: topPad + Spacing.md, paddingBottom: bottomPad + Spacing.xl }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatarCircle, { backgroundColor: Colors.accentDim, borderColor: Colors.accent }]}>
          <Ionicons name="person" size={44} color={Colors.accent} />
        </View>
        <Text style={styles.name}>Student</Text>
        <Text style={styles.email}>student@naija.academy</Text>
        <View style={[styles.badge, { backgroundColor: Colors.accentDim }]}>
          <Text style={[styles.badgeText, { color: Colors.accent }]}>JAMB 2026 Candidate</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={[styles.statsCard, { backgroundColor: Colors.surface, borderColor: Colors.surfaceBorder }]}>
        {stats.map((s, i) => (
          <View key={i} style={[styles.statItem, i < stats.length - 1 && { borderRightWidth: 1, borderRightColor: Colors.surfaceBorder }]}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Settings */}
      <Text style={styles.sectionTitle}>Study Preferences</Text>
      <View style={[styles.settingsGroup, { backgroundColor: Colors.surface, borderColor: Colors.surfaceBorder }]}>
        <SettingRow icon="notifications-outline" label="Daily Reminders" toggle />
        <SettingRow icon="moon-outline" label="Dark Mode" toggle />
        <SettingRow icon="timer-outline" label="Session Duration" value="45 min" />
        <SettingRow icon="trending-up-outline" label="Target Score" value="300/400" />
      </View>

      <Text style={styles.sectionTitle}>Account</Text>
      <View style={[styles.settingsGroup, { backgroundColor: Colors.surface, borderColor: Colors.surfaceBorder }]}>
        <SettingRow icon="person-outline" label="Edit Profile" />
        <SettingRow icon="help-circle-outline" label="Help & Support" />
        <SettingRow icon="information-circle-outline" label="About NaijaAcademy" />
      </View>

      <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: Colors.dangerDim, borderColor: Colors.danger }]}>
        <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
        <Text style={[styles.logoutText, { color: Colors.danger }]}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.md },
  avatarSection: { alignItems: 'center', paddingVertical: Spacing.lg },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', borderWidth: 2, marginBottom: Spacing.md },
  name: { fontSize: 22, fontFamily: Fonts.bold, color: Colors.text },
  email: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary, marginTop: 2, marginBottom: Spacing.sm },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full },
  badgeText: { fontSize: 12, fontFamily: Fonts.semiBold },
  statsCard: { flexDirection: 'row', borderRadius: Radius.lg, borderWidth: 1, marginBottom: Spacing.lg, overflow: 'hidden' },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
  statValue: { fontSize: 20, fontFamily: Fonts.bold, color: Colors.text },
  statLabel: { fontSize: 11, fontFamily: Fonts.regular, color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontFamily: Fonts.semiBold, color: Colors.textSecondary, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  settingsGroup: { borderRadius: Radius.lg, borderWidth: 1, marginBottom: Spacing.md, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
  settingIcon: { width: 36, height: 36, borderRadius: Radius.sm, justifyContent: 'center', alignItems: 'center' },
  settingLabel: { flex: 1, fontSize: 15, fontFamily: Fonts.medium, color: Colors.text },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  settingValue: { fontSize: 13, fontFamily: Fonts.regular, color: Colors.textSecondary },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, marginTop: Spacing.sm },
  logoutText: { fontSize: 15, fontFamily: Fonts.semiBold },
});
