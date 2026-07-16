import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
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
import DateStrip from '@/components/DateStrip';
import EmptyState from '@/components/EmptyState';
import type { Task } from '@/types/task';

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function TodayScreen() {
  const colors = useColors();
  const { t, isRTL } = useLanguage();
  const { getTasksByDate } = useTasks();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(todayKey());

  const tasks = getTasksByDate(selectedDate);
  const pending = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);

  const handleAdd = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: '/task-form', params: { date: selectedDate } });
  }, [selectedDate]);

  const handleEdit = useCallback((task: Task) => {
    router.push({ pathname: '/task-form', params: { taskId: task.id } });
  }, []);

  const isToday = selectedDate === todayKey();
  const headerTitle = isToday ? t.today : selectedDate;

  const renderItem = useCallback(({ item }: { item: Task }) => (
    <TaskCard task={item} onPress={() => handleEdit(item)} />
  ), [handleEdit]);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background }]}>
        <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold', textAlign: isRTL ? 'right' : 'left' }]}>
            {headerTitle}
          </Text>
          <TouchableOpacity
            onPress={handleAdd}
            style={[styles.addBtn, { backgroundColor: colors.primary, borderRadius: colors.radius + 20 }]}
          >
            <Ionicons name="add" size={24} color={colors.primaryForeground} />
          </TouchableOpacity>
        </View>

        {/* Date Strip */}
        <View style={styles.dateStripWrap}>
          <DateStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </View>

        {/* Stats */}
        {tasks.length > 0 && (
          <View style={[styles.statsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.statChip, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
              <Text style={[styles.statText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                {pending.length} {t.upcomingTasks}
              </Text>
            </View>
            <View style={[styles.statChip, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={[styles.statText, { color: '#10B981', fontFamily: 'Inter_600SemiBold' }]}>
                {' '}{done.length} {t.completedTasks}
              </Text>
            </View>
          </View>
        )}
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: (Platform.OS === 'web' ? 84 : insets.bottom) + 80 },
        ]}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title={t.noSchedule}
            description={t.noScheduleDesc}
            isRTL={isRTL}
          />
        }
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
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
  },
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
  dateStripWrap: {
    marginBottom: 12,
  },
  statsRow: {
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statText: {
    fontSize: 13,
  },
  listContent: {
    paddingTop: 8,
  },
});
