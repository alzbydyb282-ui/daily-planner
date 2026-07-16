import React from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useLanguage, type Language } from '@/context/LanguageContext';
import { useTasks } from '@/context/TasksContext';

export default function SettingsScreen() {
  const colors = useColors();
  const { t, isRTL, language, setLanguage } = useLanguage();
  const { notificationsGranted, requestNotificationPermission } = useTasks();
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad + 12, paddingBottom: (Platform.OS === 'web' ? 84 : insets.bottom) + 32 },
        ]}
      >
        {/* Title */}
        <Text style={[styles.screenTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold', textAlign: isRTL ? 'right' : 'left' }]}>
          {t.settings}
        </Text>

        {/* Language */}
        <SectionHeader title={t.language} isRTL={isRTL} color={colors.mutedForeground} />
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius + 4 }]}>
          {languages.map((lang, idx) => (
            <React.Fragment key={lang.code}>
              <TouchableOpacity
                onPress={() => setLanguage(lang.code)}
                style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
              >
                <Text style={[styles.rowLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium', textAlign: isRTL ? 'right' : 'left' }]}>
                  {lang.label}
                </Text>
                {language === lang.code ? (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                ) : (
                  <View style={[styles.emptyCheck, { borderColor: colors.border }]} />
                )}
              </TouchableOpacity>
              {idx < languages.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
            </React.Fragment>
          ))}
        </View>

        {/* Notifications */}
        <SectionHeader title={t.notifications} isRTL={isRTL} color={colors.mutedForeground} />
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius + 4 }]}>
          <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.rowContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
              <Text style={[styles.rowLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium', textAlign: isRTL ? 'right' : 'left' }]}>
                {t.enableNotifications}
              </Text>
              <Text style={[styles.rowDesc, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left', fontFamily: 'Inter_400Regular' }]}>
                {t.notificationsDesc}
              </Text>
            </View>
            {Platform.OS !== 'web' ? (
              <Switch
                value={notificationsGranted}
                onValueChange={(val) => {
                  if (val) requestNotificationPermission();
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            ) : (
              <Text style={[styles.webNote, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                Native only
              </Text>
            )}
          </View>
        </View>

        {/* About */}
        <SectionHeader title="About" isRTL={isRTL} color={colors.mutedForeground} />
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius + 4 }]}>
          <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.appIconSmall, { backgroundColor: colors.primary, borderRadius: colors.radius }]}>
              <Ionicons name="calendar" size={20} color="#fff" />
            </View>
            <View style={[styles.rowContent, { alignItems: isRTL ? 'flex-end' : 'flex-start', marginLeft: 12 }]}>
              <Text style={[styles.rowLabel, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
                {t.appName}
              </Text>
              <Text style={[styles.rowDesc, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                Version 1.0.0
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionHeader({ title, isRTL, color }: { title: string; isRTL: boolean; color: string }) {
  return (
    <Text style={[sectionStyles.header, { color, textAlign: isRTL ? 'right' : 'left', fontFamily: 'Inter_600SemiBold' }]}>
      {title}
    </Text>
  );
}

const sectionStyles = StyleSheet.create({
  header: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 24,
    marginHorizontal: 4,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  screenTitle: { fontSize: 28, marginBottom: 8 },
  card: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  rowContent: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 16 },
  rowDesc: { fontSize: 13, lineHeight: 18 },
  divider: { height: 1, marginHorizontal: 16 },
  emptyCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
  },
  appIconSmall: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webNote: { fontSize: 12 },
});
