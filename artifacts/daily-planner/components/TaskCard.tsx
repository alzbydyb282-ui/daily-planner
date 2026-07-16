import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';
import { useTasks } from '@/context/TasksContext';
import type { Task, TaskCategory } from '@/types/task';

const CATEGORY_COLORS: Record<TaskCategory, string> = {
  work: '#3B82F6',
  personal: '#EC4899',
  health: '#10B981',
  other: '#F59E0B',
};

interface TaskCardProps {
  task: Task;
  onPress: () => void;
}

export default function TaskCard({ task, onPress }: TaskCardProps) {
  const colors = useColors();
  const { t, isRTL } = useLanguage();
  const { toggleComplete, deleteTask } = useTasks();

  const scale = useSharedValue(1);
  const checkScale = useSharedValue(task.completed ? 1 : 0);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));

  const handleToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    checkScale.value = withSpring(task.completed ? 0 : 1, { damping: 15, stiffness: 300 });
    scale.value = withTiming(0.97, { duration: 80 }, () => {
      scale.value = withSpring(1, { damping: 15 });
    });
    toggleComplete(task.id);
  }, [task.completed, task.id]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      t.deleteConfirm,
      t.deleteMessage,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            deleteTask(task.id);
          },
        },
      ]
    );
  }, [task.id, t]);

  const catColor = CATEGORY_COLORS[task.category];

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        onLongPress={handleDelete}
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderRadius: colors.radius + 4,
            borderLeftWidth: isRTL ? 0 : 4,
            borderRightWidth: isRTL ? 4 : 0,
            borderLeftColor: isRTL ? 'transparent' : catColor,
            borderRightColor: isRTL ? catColor : 'transparent',
            opacity: task.completed ? 0.7 : 1,
          },
        ]}
      >
        <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {/* Checkbox */}
          <TouchableOpacity onPress={handleToggle} style={styles.checkBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: task.completed ? catColor : colors.border,
                  backgroundColor: task.completed ? catColor : 'transparent',
                  borderRadius: 10,
                },
              ]}
            >
              <Animated.View style={checkStyle}>
                {task.completed && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </Animated.View>
            </View>
          </TouchableOpacity>

          {/* Content */}
          <View style={[styles.content, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
            <Text
              style={[
                styles.title,
                {
                  color: task.completed ? colors.mutedForeground : colors.foreground,
                  textDecorationLine: task.completed ? 'line-through' : 'none',
                  fontFamily: 'Inter_600SemiBold',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>
            {task.description ? (
              <Text
                style={[
                  styles.desc,
                  { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left', fontFamily: 'Inter_400Regular' },
                ]}
                numberOfLines={1}
              >
                {task.description}
              </Text>
            ) : null}
            <View style={[styles.metaRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                {' '}{formatTime(task.time)}
              </Text>
              {task.reminderEnabled && (
                <Ionicons
                  name="notifications-outline"
                  size={12}
                  color={colors.primary}
                  style={{ marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }}
                />
              )}
            </View>
          </View>

          {/* Priority dot */}
          <View style={styles.rightCol}>
            <View
              style={[
                styles.priorityDot,
                { backgroundColor: getPriorityColor(task.priority) },
              ]}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high': return '#EF4444';
    case 'medium': return '#F59E0B';
    default: return '#10B981';
  }
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 5,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    alignItems: 'center',
    gap: 12,
  },
  checkBtn: {
    padding: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 15,
  },
  desc: {
    fontSize: 13,
  },
  metaRow: {
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
  },
  rightCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
