import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';

interface DateStripProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function generateDates(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = -3; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_AR = ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];
const MONTH_NAMES_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

const ITEM_WIDTH = 60;
const ITEM_MARGIN = 5;

export default function DateStrip({ selectedDate, onSelectDate }: DateStripProps) {
  const colors = useColors();
  const { isRTL, language } = useLanguage();
  const scrollRef = useRef<ScrollView>(null);
  const dates = generateDates();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayNames = language === 'ar' ? DAY_NAMES_AR : DAY_NAMES_EN;

  useEffect(() => {
    const idx = dates.findIndex((d) => formatDateKey(d) === selectedDate);
    if (idx >= 0 && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          x: Math.max(0, idx * (ITEM_WIDTH + ITEM_MARGIN * 2) - 100),
          animated: true,
        });
      }, 100);
    }
  }, [selectedDate]);

  const monthName = (() => {
    const selDate = dates.find((d) => formatDateKey(d) === selectedDate) ?? today;
    return language === 'ar'
      ? MONTH_NAMES_AR[selDate.getMonth()]
      : `${MONTH_NAMES_EN[selDate.getMonth()]} ${selDate.getFullYear()}`;
  })();

  return (
    <View>
      <Text style={[styles.monthLabel, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left', fontFamily: 'Inter_600SemiBold' }]}>
        {monthName}
      </Text>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.strip}
      >
        {dates.map((d) => {
          const key = formatDateKey(d);
          const isSelected = key === selectedDate;
          const isToday = formatDateKey(d) === formatDateKey(today);

          return (
            <TouchableOpacity
              key={key}
              onPress={() => onSelectDate(key)}
              style={[
                styles.dateItem,
                { borderRadius: colors.radius + 4 },
                isSelected
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: 'transparent' },
              ]}
            >
              <Text
                style={[
                  styles.dayName,
                  {
                    color: isSelected
                      ? colors.primaryForeground
                      : isToday
                      ? colors.primary
                      : colors.mutedForeground,
                    fontFamily: 'Inter_500Medium',
                  },
                ]}
              >
                {dayNames[d.getDay()]}
              </Text>
              <Text
                style={[
                  styles.dayNum,
                  {
                    color: isSelected
                      ? colors.primaryForeground
                      : isToday
                      ? colors.primary
                      : colors.foreground,
                    fontFamily: isSelected ? 'Inter_700Bold' : 'Inter_600SemiBold',
                  },
                ]}
              >
                {d.getDate()}
              </Text>
              {isToday && !isSelected && (
                <View style={[styles.todayDot, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  monthLabel: {
    fontSize: 13,
    marginBottom: 8,
    marginHorizontal: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  strip: {
    paddingHorizontal: 2,
    gap: 4,
  },
  dateItem: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: ITEM_MARGIN,
  },
  dayName: {
    fontSize: 11,
    marginBottom: 4,
  },
  dayNum: {
    fontSize: 18,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
});
