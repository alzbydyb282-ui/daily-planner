import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';
import { useTasks } from '@/context/TasksContext';
import TaskCard from '@/components/TaskCard';
import EmptyState from '@/components/EmptyState';
import type { Task } from '@/types/task';

function formatSectionHeader(dateStr: string, isArabic: boolean): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return isArabic ? 'اليوم' : 'Today';
  if (diff === 1) return isArabic ? 'غداً' : 'Tomorrow';
  if (diff === -1) return isArabic ? 'أمس' : 'Yesterday';
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
  return d.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', options);
}

export default function TasksScreen() {
  const colors = useColors();
  const { t, isRTL, language } = useLanguage();
  const { tasks } = useTasks();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const sections = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      if (!grouped[task.date]) grouped[task.date] = [];
      grouped[task.date].push(task);
    });
    return Object.keys(grouped)
      .sort()
      .map((date) => ({
        title: formatSectionHeader(date, language === 'ar'),
        date,
        data: grouped[date].sort((a, b) => a.time.localeCompare(b.time)),
      }));
  }, [tasks, language]);

  const handleEdit = useCallback((task: Task) => {
    router.push({ pathname: '/task-form', params: { taskId: task.id } });
  }, []);

  const handleAdd = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: '/task-form' });
  }, []);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background }]}>
        <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold', textAlign: isRTL ? 'right' : 'left' }]}>
            {t.allTasks}
          </Text>
          <TouchableOpacity
            onPress={handleAdd}
            style={[styles.addBtn, { backgroundColor: colors.primary, borderRadius: colors.radius + 20 }]}
          >
            <Ionicons name="add" size={24} color={colors.primaryForeground} />
          </TouchableOpacity>
        </View>

        {tasks.length > 0 && (
          <Text style={[styles.countText, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left', fontFamily: 'Inter_400Regular' }]}>
            {tasks.length} {language === 'ar' ? 'مهمة' : tasks.length === 1 ? 'task' : 'tasks'}
          </Text>
        )}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard task={item} onPress={() => handleEdit(item)} />
        )}
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
            <Text style={[
              styles.sectionTitle,
              {
                color: colors.mutedForeground,
                textAlign: isRTL ? 'right' : 'left',
                fontFamily: 'Inter_600SemiBold',
              },
            ]}>
              {section.title}
            </Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: (Platform.OS === 'web' ? 84 : insets.bottom) + 80 },
        ]}
        ListEmptyComponent={
          <EmptyState
            icon="list-outline"
            title={t.noTasks}
            description={t.noTasksAllDesc}
            isRTL={isRTL}
          />
        }
        stickySectionHeadersEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerTitle: { fontSize: 28 },
  addBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  countText: { fontSize: 14, marginBottom: 4 },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  sectionTitle: { fontSize: 13, letterSpacing: 0.5 },
  listContent: { paddingTop: 4 },
});
