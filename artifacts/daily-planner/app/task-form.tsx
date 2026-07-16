import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';
import { useTasks } from '@/context/TasksContext';
import type { TaskCategory, TaskPriority } from '@/types/task';

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const CATEGORIES: TaskCategory[] = ['work', 'personal', 'health', 'other'];
const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];

const CATEGORY_COLORS: Record<TaskCategory, string> = {
  work: '#3B82F6',
  personal: '#EC4899',
  health: '#10B981',
  other: '#F59E0B',
};
const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444',
};

function offsetDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDisplayDate(dateStr: string, language: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  return date.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function TaskFormScreen() {
  const colors = useColors();
  const { t, isRTL, language } = useLanguage();
  const { tasks, addTask, updateTask } = useTasks();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ taskId?: string; date?: string }>();

  const editingTask = useMemo(() =>
    params.taskId ? tasks.find((t) => t.id === params.taskId) : undefined,
    [params.taskId, tasks]
  );

  const [title, setTitle] = useState(editingTask?.title ?? '');
  const [description, setDescription] = useState(editingTask?.description ?? '');
  const [date, setDate] = useState(editingTask?.date ?? params.date ?? todayKey());
  const [hour, setHour] = useState(() => {
    if (editingTask) return parseInt(editingTask.time.split(':')[0], 10);
    const h = new Date().getHours();
    return (h + 1) % 24;
  });
  const [minute, setMinute] = useState(() => {
    if (editingTask) return parseInt(editingTask.time.split(':')[1], 10);
    return 0;
  });
  const [category, setCategory] = useState<TaskCategory>(editingTask?.category ?? 'personal');
  const [priority, setPriority] = useState<TaskPriority>(editingTask?.priority ?? 'medium');
  const [reminderEnabled, setReminderEnabled] = useState(editingTask?.reminderEnabled ?? true);
  const [titleError, setTitleError] = useState(false);

  const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      setTitleError(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      date,
      time: timeStr,
      completed: editingTask?.completed ?? false,
      reminderEnabled,
      category,
      priority,
    };

    if (editingTask) {
      await updateTask({ ...editingTask, ...taskData });
    } else {
      await addTask(taskData);
    }
    router.back();
  }, [title, description, date, timeStr, reminderEnabled, category, priority, editingTask]);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const catLabel = (c: TaskCategory) => {
    const map: Record<TaskCategory, string> = {
      work: t.work, personal: t.personal, health: t.health, other: t.other,
    };
    return map[c];
  };
  const priLabel = (p: TaskPriority) => {
    const map: Record<TaskPriority, string> = {
      low: t.low, medium: t.medium, high: t.high,
    };
    return map[p];
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Nav bar */}
      <View style={[styles.navbar, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Ionicons name="close" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
          {editingTask ? t.editTask : t.addTask}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveBtn, { backgroundColor: colors.primary, borderRadius: colors.radius + 12 }]}
        >
          <Text style={[styles.saveBtnText, { color: colors.primaryForeground, fontFamily: 'Inter_600SemiBold' }]}>
            {t.save}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 32 }]}
      >
        {/* Title */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left', fontFamily: 'Inter_500Medium' }]}>
            {t.titleLabel}
          </Text>
          <TextInput
            value={title}
            onChangeText={(v) => { setTitle(v); setTitleError(false); }}
            placeholder={t.titleLabel}
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: titleError ? colors.destructive : colors.border,
                color: colors.foreground,
                borderRadius: colors.radius,
                textAlign: isRTL ? 'right' : 'left',
                fontFamily: 'Inter_400Regular',
              },
            ]}
            autoFocus
          />
          {titleError && (
            <Text style={[styles.errorText, { color: colors.destructive, fontFamily: 'Inter_400Regular' }]}>
              {t.titleRequired}
            </Text>
          )}
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left', fontFamily: 'Inter_500Medium' }]}>
            {t.description}
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={t.description}
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={3}
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.foreground,
                borderRadius: colors.radius,
                textAlign: isRTL ? 'right' : 'left',
                fontFamily: 'Inter_400Regular',
              },
            ]}
          />
        </View>

        {/* Date */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left', fontFamily: 'Inter_500Medium' }]}>
            {t.date}
          </Text>
          <View style={[styles.datePicker, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <TouchableOpacity onPress={() => setDate(offsetDate(date, isRTL ? 1 : -1))}>
              <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={20} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.dateText, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
              {formatDisplayDate(date, language)}
            </Text>
            <TouchableOpacity onPress={() => setDate(offsetDate(date, isRTL ? -1 : 1))}>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Time */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left', fontFamily: 'Inter_500Medium' }]}>
            {t.time}
          </Text>
          <View style={[styles.timePicker, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TimeSpinner
              value={hour}
              min={0}
              max={23}
              onChange={setHour}
              colors={colors}
              isRTL={isRTL}
            />
            <Text style={[styles.colon, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>:</Text>
            <TimeSpinner
              value={minute}
              min={0}
              max={59}
              step={5}
              onChange={setMinute}
              colors={colors}
              isRTL={isRTL}
            />
          </View>
        </View>

        {/* Category */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left', fontFamily: 'Inter_500Medium' }]}>
            {t.category}
          </Text>
          <View style={[styles.pillRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setCategory(c)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: category === c ? CATEGORY_COLORS[c] : colors.muted,
                    borderRadius: colors.radius + 12,
                  },
                ]}
              >
                <Text style={[
                  styles.pillText,
                  {
                    color: category === c ? '#fff' : colors.mutedForeground,
                    fontFamily: 'Inter_500Medium',
                  },
                ]}>
                  {catLabel(c)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Priority */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left', fontFamily: 'Inter_500Medium' }]}>
            {t.priority}
          </Text>
          <View style={[styles.pillRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {PRIORITIES.map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setPriority(p)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: priority === p ? PRIORITY_COLORS[p] : colors.muted,
                    borderRadius: colors.radius + 12,
                  },
                ]}
              >
                <Text style={[
                  styles.pillText,
                  { color: priority === p ? '#fff' : colors.mutedForeground, fontFamily: 'Inter_500Medium' },
                ]}>
                  {priLabel(p)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reminder */}
        <View style={[styles.fieldGroup]}>
          <View style={[styles.reminderRow, { flexDirection: isRTL ? 'row-reverse' : 'row', backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
            <View style={[styles.reminderLeft, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
              <Text style={[styles.reminderLabel, { color: colors.foreground, textAlign: isRTL ? 'right' : 'left', fontFamily: 'Inter_500Medium' }]}>
                {t.reminder}
              </Text>
              <Text style={[styles.reminderDesc, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left', fontFamily: 'Inter_400Regular' }]}>
                {Platform.OS === 'web' ? 'Native only' : t.notificationsDesc}
              </Text>
            </View>
            <Switch
              value={Platform.OS !== 'web' && reminderEnabled}
              onValueChange={Platform.OS !== 'web' ? setReminderEnabled : undefined}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
              disabled={Platform.OS === 'web'}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function TimeSpinner({
  value, min, max, step = 1, onChange, colors, isRTL,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  colors: ReturnType<typeof import('@/hooks/useColors').useColors>;
  isRTL: boolean;
}) {
  const inc = () => {
    const next = value + step;
    onChange(next > max ? min : next);
  };
  const dec = () => {
    const prev = value - step;
    onChange(prev < min ? max : prev);
  };

  return (
    <View style={[tStyles.spinner, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
      <TouchableOpacity onPress={inc} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="chevron-up" size={18} color={colors.primary} />
      </TouchableOpacity>
      <Text style={[tStyles.value, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
        {String(value).padStart(2, '0')}
      </Text>
      <TouchableOpacity onPress={dec} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="chevron-down" size={18} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const tStyles = StyleSheet.create({
  spinner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    gap: 4,
  },
  value: {
    fontSize: 28,
    lineHeight: 36,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  navBtn: { padding: 4 },
  navTitle: { fontSize: 17 },
  saveBtn: { paddingHorizontal: 18, paddingVertical: 8 },
  saveBtnText: { fontSize: 15 },
  form: { paddingHorizontal: 20, paddingTop: 20, gap: 4 },
  fieldGroup: { marginBottom: 20 },
  fieldLabel: { fontSize: 13, letterSpacing: 0.5, marginBottom: 8 },
  input: { borderWidth: 1, padding: 14, fontSize: 16, minHeight: 48 },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  errorText: { fontSize: 12, marginTop: 4 },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateText: { fontSize: 16 },
  timePicker: {
    alignItems: 'center',
    gap: 16,
  },
  colon: { fontSize: 28 },
  pillRow: { flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 8 },
  pillText: { fontSize: 14 },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  reminderLeft: { flex: 1, gap: 2 },
  reminderLabel: { fontSize: 15 },
  reminderDesc: { fontSize: 12 },
});
