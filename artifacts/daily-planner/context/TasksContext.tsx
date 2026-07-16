import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Task } from '@/types/task';

const STORAGE_KEY = 'daily_planner_tasks';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function scheduleTaskNotification(task: Task): Promise<string | undefined> {
  if (!task.reminderEnabled || Platform.OS === 'web') return undefined;
  try {
    const [hours, minutes] = task.time.split(':').map(Number);
    const [year, month, day] = task.date.split('-').map(Number);
    const triggerDate = new Date(year, month - 1, day, hours, minutes, 0);
    if (triggerDate <= new Date()) return undefined;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: task.title,
        body: task.description || task.time,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
    return id;
  } catch {
    return undefined;
  }
}

async function cancelTaskNotification(notificationId?: string) {
  if (!notificationId || Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {}
}

type TasksContextType = {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'notificationId'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  getTasksByDate: (date: string) => Task[];
  notificationsGranted: boolean;
  requestNotificationPermission: () => Promise<boolean>;
};

const TasksContext = createContext<TasksContextType>({
  tasks: [],
  addTask: async () => {},
  updateTask: async () => {},
  deleteTask: async () => {},
  toggleComplete: async () => {},
  getTasksByDate: () => [],
  notificationsGranted: false,
  requestNotificationPermission: async () => false,
});

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notificationsGranted, setNotificationsGranted] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        try {
          setTasks(JSON.parse(data));
        } catch {}
      }
    });

    if (Platform.OS !== 'web') {
      Notifications.getPermissionsAsync().then(({ granted }) => {
        setNotificationsGranted(granted);
      });
    }
  }, []);

  const saveTasks = useCallback(async (updated: Task[]) => {
    setTasks(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if (Platform.OS === 'web') return false;
    const { granted } = await Notifications.requestPermissionsAsync();
    setNotificationsGranted(granted);
    return granted;
  }, []);

  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'notificationId'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newTask: Task = { ...taskData, id, createdAt: Date.now() };

    if (taskData.reminderEnabled && notificationsGranted) {
      const notificationId = await scheduleTaskNotification(newTask);
      newTask.notificationId = notificationId;
    }

    const updated = [...tasks, newTask];
    await saveTasks(updated);
  }, [tasks, saveTasks, notificationsGranted]);

  const updateTask = useCallback(async (updatedTask: Task) => {
    const old = tasks.find((t) => t.id === updatedTask.id);
    if (old?.notificationId) {
      await cancelTaskNotification(old.notificationId);
    }

    let notificationId: string | undefined;
    if (updatedTask.reminderEnabled && notificationsGranted) {
      notificationId = await scheduleTaskNotification(updatedTask);
    }

    const updated = tasks.map((t) =>
      t.id === updatedTask.id ? { ...updatedTask, notificationId } : t
    );
    await saveTasks(updated);
  }, [tasks, saveTasks, notificationsGranted]);

  const deleteTask = useCallback(async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task?.notificationId) {
      await cancelTaskNotification(task.notificationId);
    }
    const updated = tasks.filter((t) => t.id !== id);
    await saveTasks(updated);
  }, [tasks, saveTasks]);

  const toggleComplete = useCallback(async (id: string) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    await saveTasks(updated);
  }, [tasks, saveTasks]);

  const getTasksByDate = useCallback((date: string) => {
    return tasks
      .filter((t) => t.date === date)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [tasks]);

  return (
    <TasksContext.Provider value={{
      tasks,
      addTask,
      updateTask,
      deleteTask,
      toggleComplete,
      getTasksByDate,
      notificationsGranted,
      requestNotificationPermission,
    }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  return useContext(TasksContext);
}
