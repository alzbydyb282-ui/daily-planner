import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import { reloadAppAsync } from 'expo';

export type Language = 'en' | 'ar';

type Translations = {
  today: string;
  tasks: string;
  settings: string;
  addTask: string;
  editTask: string;
  delete: string;
  save: string;
  cancel: string;
  titleLabel: string;
  description: string;
  time: string;
  date: string;
  reminder: string;
  category: string;
  priority: string;
  work: string;
  personal: string;
  health: string;
  other: string;
  low: string;
  medium: string;
  high: string;
  completed: string;
  pending: string;
  noTasks: string;
  addFirstTask: string;
  language: string;
  notifications: string;
  arabic: string;
  english: string;
  appName: string;
  titleRequired: string;
  allTasks: string;
  schedule: string;
  deleteConfirm: string;
  deleteMessage: string;
  enableNotifications: string;
  notificationsDesc: string;
  noSchedule: string;
  noScheduleDesc: string;
  completedTasks: string;
  upcomingTasks: string;
  theme: string;
  dark: string;
  light: string;
  system: string;
  noTasksAllDesc: string;
  restartRequired: string;
  restartDesc: string;
  hour: string;
  minute: string;
  am: string;
  pm: string;
};

const en: Translations = {
  today: 'Today',
  tasks: 'Tasks',
  settings: 'Settings',
  addTask: 'Add Task',
  editTask: 'Edit Task',
  delete: 'Delete',
  save: 'Save',
  cancel: 'Cancel',
  titleLabel: 'Title',
  description: 'Description (optional)',
  time: 'Time',
  date: 'Date',
  reminder: 'Reminder',
  category: 'Category',
  priority: 'Priority',
  work: 'Work',
  personal: 'Personal',
  health: 'Health',
  other: 'Other',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  completed: 'Completed',
  pending: 'Pending',
  noTasks: 'No tasks yet',
  addFirstTask: 'Tap + to add your first task',
  language: 'Language',
  notifications: 'Notifications',
  arabic: 'العربية',
  english: 'English',
  appName: 'My Daily Planner',
  titleRequired: 'Title is required',
  allTasks: 'All Tasks',
  schedule: 'Schedule',
  deleteConfirm: 'Delete Task',
  deleteMessage: 'Are you sure you want to delete this task?',
  enableNotifications: 'Enable Notifications',
  notificationsDesc: 'Get reminders for your scheduled tasks',
  noSchedule: 'Nothing scheduled',
  noScheduleDesc: 'Tap + to add tasks to your day',
  completedTasks: 'Done',
  upcomingTasks: 'Upcoming',
  theme: 'Appearance',
  dark: 'Dark',
  light: 'Light',
  system: 'System',
  noTasksAllDesc: 'All your tasks will appear here',
  restartRequired: 'Restart Required',
  restartDesc: 'The app needs to restart to apply language changes.',
  hour: 'Hour',
  minute: 'Minute',
  am: 'AM',
  pm: 'PM',
};

const ar: Translations = {
  today: 'اليوم',
  tasks: 'المهام',
  settings: 'الإعدادات',
  addTask: 'إضافة مهمة',
  editTask: 'تعديل المهمة',
  delete: 'حذف',
  save: 'حفظ',
  cancel: 'إلغاء',
  titleLabel: 'العنوان',
  description: 'الوصف (اختياري)',
  time: 'الوقت',
  date: 'التاريخ',
  reminder: 'تذكير',
  category: 'الفئة',
  priority: 'الأولوية',
  work: 'عمل',
  personal: 'شخصي',
  health: 'صحة',
  other: 'أخرى',
  low: 'منخفضة',
  medium: 'متوسطة',
  high: 'عالية',
  completed: 'مكتمل',
  pending: 'قيد الانتظار',
  noTasks: 'لا توجد مهام',
  addFirstTask: 'اضغط + لإضافة مهمتك الأولى',
  language: 'اللغة',
  notifications: 'الإشعارات',
  arabic: 'العربية',
  english: 'English',
  appName: 'مخططي اليومي',
  titleRequired: 'العنوان مطلوب',
  allTasks: 'جميع المهام',
  schedule: 'الجدول',
  deleteConfirm: 'حذف المهمة',
  deleteMessage: 'هل أنت متأكد من حذف هذه المهمة؟',
  enableNotifications: 'تفعيل الإشعارات',
  notificationsDesc: 'احصل على تذكيرات لمهامك المجدولة',
  noSchedule: 'لا شيء مجدول',
  noScheduleDesc: 'اضغط + لإضافة مهام ليومك',
  completedTasks: 'مكتملة',
  upcomingTasks: 'القادمة',
  theme: 'المظهر',
  dark: 'داكن',
  light: 'فاتح',
  system: 'تلقائي',
  noTasksAllDesc: 'ستظهر جميع مهامك هنا',
  restartRequired: 'إعادة تشغيل مطلوبة',
  restartDesc: 'يحتاج التطبيق إلى إعادة التشغيل لتطبيق تغييرات اللغة.',
  hour: 'الساعة',
  minute: 'الدقيقة',
  am: 'ص',
  pm: 'م',
};

const TRANSLATIONS: Record<Language, Translations> = { en, ar };

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: Translations;
  isRTL: boolean;
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: async () => {},
  t: en,
  isRTL: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    AsyncStorage.getItem('language').then((saved) => {
      if (saved === 'ar' || saved === 'en') {
        setLanguageState(saved);
      }
    });
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    await AsyncStorage.setItem('language', lang);
    const needsRTLChange = (lang === 'ar') !== I18nManager.isRTL;
    if (needsRTLChange) {
      I18nManager.forceRTL(lang === 'ar');
      await reloadAppAsync();
    } else {
      setLanguageState(lang);
    }
  }, []);

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: TRANSLATIONS[language], isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
