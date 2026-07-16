import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  isRTL?: boolean;
}

export default function EmptyState({ icon, title, description, isRTL }: EmptyStateProps) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: colors.muted, borderRadius: colors.radius + 20 }]}>
        <Ionicons name={icon} size={40} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.title, { color: colors.foreground, textAlign: isRTL ? 'right' : 'center', fontFamily: 'Inter_600SemiBold' }]}>
        {title}
      </Text>
      <Text style={[styles.desc, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'center', fontFamily: 'Inter_400Regular' }]}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
    gap: 12,
  },
  iconWrap: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
  },
  desc: {
    fontSize: 14,
    lineHeight: 20,
  },
});
