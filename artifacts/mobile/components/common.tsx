import React, { ReactNode, useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Circle, Ellipse, Path, Rect, Svg, SvgXml } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { Exercise } from '@/data/catalog';
import LottiePlayer from '@/components/LottiePlayer';

export const C = colors.dark;
export const spacing = { page: 20 };
export function Screen({ children, scroll = true, contentStyle }: { children: ReactNode; scroll?: boolean; contentStyle?: object }) {
  const insets = useSafeAreaInsets();
  const top = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const bottom = Platform.OS === 'web' ? 96 : Math.max(insets.bottom, 18) + 82;
  return <View style={{ flex: 1, backgroundColor: C.background, paddingTop: top }}>
    {scroll ? <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={[styles.page, { paddingBottom: bottom }, contentStyle]}>{children}</ScrollView> : children}
  </View>;
}
export function TitleBlock({ eyebrow, title, note }: { eyebrow?: string; title: string; note?: string }) {
  return <View style={styles.titleBlock}>{eyebrow ? <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text> : null}<Text style={styles.title}>{title}</Text>{note ? <Text style={styles.subtitle}>{note}</Text> : null}</View>;
}
export function Button({ title, onPress, icon, secondary = false, disabled = false, compact = false, testID }: { title: string; onPress: () => void; icon?: keyof typeof Feather.glyphMap; secondary?: boolean; disabled?: boolean; compact?: boolean; testID?: string }) {
  return <Pressable testID={testID} onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.button, secondary && styles.buttonSecondary, compact && styles.buttonCompact, disabled && styles.buttonDisabled, pressed && !disabled && styles.pressed]}>
    {icon ? <Feather name={icon} size={17} color={secondary ? C.foreground : C.primaryForeground} /> : null}<Text style={[styles.buttonText, secondary && styles.buttonTextSecondary]}>{title}</Text>
  </Pressable>;
}
export function IconButton({ icon, onPress, label, highlighted = false, testID }: { icon: keyof typeof Feather.glyphMap; onPress: () => void; label: string; highlighted?: boolean; testID?: string }) {
  return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.iconButton, highlighted && styles.iconButtonActive, pressed && styles.pressed]}><Feather name={icon} size={18} color={highlighted ? C.primaryForeground : C.foreground} /></Pressable>;
}
export function Surface({ children, style }: { children: ReactNode; style?: object }) { return <View style={[styles.surface, style]}>{children}</View>; }
export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.pressed]}><Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text></Pressable>;
}
export function Metric({ label, value, unit, accent = false }: { label: string; value: string; unit?: string; accent?: boolean }) {
  return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={[styles.metricValue, accent && { color: C.primary }]}>{value}{unit ? <Text style={styles.metricUnit}> {unit}</Text> : null}</Text></View>;
}
export function Notice({ children }: { children: ReactNode }) { return <View style={styles.notice}><Feather name="info" size={16} color={C.warning} /><Text style={styles.noticeText}>{children}</Text></View>; }
export function EmptyState({ icon = 'activity', title, note }: { icon?: keyof typeof Feather.glyphMap; title: string; note: string }) {
  return <View style={styles.empty}><View style={styles.emptyIcon}><Feather name={icon} size={22} color={C.primary} /></View><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyNote}>{note}</Text></View>;
}
export function ExerciseMotion({ exercise, small = false }: { exercise: Exercise; small?: boolean }) {
  const lift = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(lift, { toValue: 1, duration: 780, useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 780, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [lift]);
  const shift = lift.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  const size = small ? 48 : 74;
  if (exercise.animation?.format === 'lottie' && Platform.OS !== 'web') {
    return <View style={[styles.motion, small && styles.motionSmall]} accessibilityLabel={'Зацикленная анимация упражнения: ' + exercise.name}>
      <LottiePlayer source={exercise.animation.source} style={styles.mediaAnimation} />
      <Text style={styles.motionCaption}>{exercise.target}</Text>
    </View>;
  }
  if (exercise.animation?.format === 'gif') {
    return <View style={[styles.motion, small && styles.motionSmall]} accessibilityLabel={'Зацикленная GIF-анимация упражнения: ' + exercise.name}>
      <Image source={exercise.animation.source} contentFit="contain" autoplay style={styles.mediaAnimation} />
      <Text style={styles.motionCaption}>{exercise.target}</Text>
    </View>;
  }
  if (exercise.animation?.format === 'svg') {
    return <View style={[styles.motion, small && styles.motionSmall]} accessibilityLabel={'Зацикленная SVG-анимация упражнения: ' + exercise.name}>
      <Animated.View style={[styles.svgAnimation, { opacity: lift.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }), transform: [{ translateY: shift }] }]}><SvgXml xml={exercise.animation.xml} width={small ? 54 : 100} height={small ? 54 : 100} /></Animated.View>
      <Text style={styles.motionCaption}>{exercise.target}</Text>
    </View>;
  }
  return <View style={[styles.motion, small && styles.motionSmall]} accessibilityLabel={'Зацикленная заглушка анимации: ' + exercise.name}>
    <Animated.View style={[styles.motionBar, { transform: [{ translateY: shift }] }]} />
    <View style={[styles.motionPlate, { left: '30%' }]} /><View style={[styles.motionPlate, { right: '30%' }]} />
    <View style={[styles.motionFigure, { height: size, width: size }]}><BodyFigure exercise={exercise} /></View>
    <Text style={styles.motionCaption}>{exercise.target}</Text>
  </View>;
}
function BodyFigure({ exercise }: { exercise: Exercise }) {
  const chest = exercise.group === 'Грудь' || exercise.group === 'Спина';
  const shoulders = exercise.group === 'Плечи';
  const arms = exercise.group === 'Руки';
  const legs = exercise.group === 'Ноги';
  const core = exercise.group === 'Пресс';
  return <Svg width={48} height={64} viewBox="0 0 56 76" accessibilityLabel={'Выделена группа мышц: ' + exercise.group}>
    <Circle cx="28" cy="8" r="6" fill={C.mutedForeground} />
    <Path d="M18 18 Q28 13 38 18 L41 39 Q34 45 28 43 Q22 45 15 39 Z" fill={chest || shoulders ? C.primary : C.secondary} />
    <Path d="M17 20 L9 38 M39 20 L47 38" stroke={arms || shoulders ? C.primary : C.secondary} strokeWidth="7" strokeLinecap="round" />
    <Rect x="20" y="41" width="16" height="13" rx="5" fill={core ? C.primary : C.secondary} />
    <Path d="M22 53 L18 70 M34 53 L38 70" stroke={legs ? C.primary : C.secondary} strokeWidth="8" strokeLinecap="round" />
    {exercise.group === 'Спина' ? <Ellipse cx="28" cy="29" rx="5" ry="8" fill={C.primary} /> : null}
  </Svg>;
}
export function ExerciseRow({ exercise, onPress, onAdd, added = false }: { exercise: Exercise; onPress: () => void; onAdd?: () => void; added?: boolean }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.exerciseRow, pressed && styles.pressed]}>
    <View style={styles.exerciseGlyph}><MaterialCommunityIcons name="dumbbell" size={19} color={C.primary} /></View>
    <View style={styles.exerciseCopy}><Text numberOfLines={1} style={styles.exerciseName}>{exercise.name}</Text><Text numberOfLines={1} style={styles.exerciseSub}>{exercise.target} · {exercise.equipment}</Text></View>
    {onAdd ? <IconButton icon={added ? 'check' : 'plus'} onPress={onAdd} label={added ? 'Упражнение добавлено' : 'Добавить упражнение'} highlighted={!added} /> : <Feather name="chevron-right" size={18} color={C.mutedForeground} />}
  </Pressable>;
}
export function AppHeader({ eyebrow = 'ПОДХОД · ТРЕНИРОВКИ', right }: { eyebrow?: string; right?: ReactNode }) {
  return <View style={styles.appHeader}><View><Text style={styles.eyebrow}>{eyebrow}</Text><Text style={styles.brand}>ПОДХОД</Text></View>{right}</View>;
}
export function formatDuration(milliseconds: number) {
  const minutes = Math.max(0, Math.floor(milliseconds / 60000));
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? hours + ' ч ' + (minutes % 60) + ' мин' : minutes + ' мин';
}
export function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}
export function formatKg(value: number) { return (Number.isInteger(value) ? String(value) : value.toFixed(1).replace('.', ',')) + ' кг'; }
export function epley(weight: number, reps: number) { return weight > 0 && reps > 0 ? weight * (1 + reps / 30) : 0; }
const styles = StyleSheet.create({
  page: { paddingHorizontal: 20, paddingTop: 14, gap: 18 }, titleBlock: { gap: 6, marginBottom: 2 }, eyebrow: { color: C.mutedForeground, fontSize: 10, fontWeight: '700', letterSpacing: 1.6 }, title: { color: C.foreground, fontSize: 30, lineHeight: 36, fontWeight: '700', letterSpacing: -0.8 }, subtitle: { color: C.mutedForeground, fontSize: 14, lineHeight: 21 },
  appHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }, brand: { color: C.foreground, fontWeight: '800', fontSize: 21, letterSpacing: 2 },
  button: { minHeight: 50, borderRadius: 15, paddingHorizontal: 18, backgroundColor: C.primary, flexDirection: 'row', gap: 9, alignItems: 'center', justifyContent: 'center' }, buttonSecondary: { backgroundColor: C.secondary, borderWidth: 1, borderColor: C.border }, buttonCompact: { minHeight: 40, borderRadius: 12, paddingHorizontal: 13 }, buttonDisabled: { opacity: 0.45 }, pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] }, buttonText: { color: C.primaryForeground, fontSize: 14, fontWeight: '700' }, buttonTextSecondary: { color: C.foreground },
  iconButton: { height: 40, width: 40, alignItems: 'center', justifyContent: 'center' }, iconButtonActive: { borderRadius: 12, backgroundColor: C.primary }, surface: { padding: 17, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: C.secondary, borderWidth: 1, borderColor: C.border }, chipSelected: { backgroundColor: C.primary, borderColor: C.primary }, chipText: { color: C.mutedForeground, fontSize: 12, fontWeight: '600' }, chipTextSelected: { color: C.primaryForeground },
  metric: { flex: 1, gap: 8 }, metricLabel: { fontSize: 11, color: C.mutedForeground }, metricValue: { color: C.foreground, fontSize: 22, fontWeight: '700' }, metricUnit: { color: C.mutedForeground, fontSize: 11, fontWeight: '500' },
  notice: { padding: 13, borderRadius: 14, backgroundColor: C.noticeBackground, flexDirection: 'row', gap: 9, alignItems: 'flex-start' }, noticeText: { flex: 1, color: C.noticeForeground, fontSize: 12, lineHeight: 18 },
  empty: { alignItems: 'center', paddingHorizontal: 22, paddingVertical: 32, gap: 10 }, emptyIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' }, emptyTitle: { color: C.foreground, fontWeight: '700', fontSize: 16, textAlign: 'center' }, emptyNote: { color: C.mutedForeground, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  motion: { minHeight: 175, backgroundColor: C.card, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border }, motionSmall: { minHeight: 88, width: 100 }, motionBar: { position: 'absolute', width: 110, height: 5, borderRadius: 3, backgroundColor: C.foreground, top: '48%' }, motionPlate: { position: 'absolute', width: 10, height: 24, borderRadius: 3, backgroundColor: C.primary, top: '42%' }, motionFigure: { alignItems: 'center', justifyContent: 'center', borderRadius: 40, backgroundColor: C.accent }, mediaAnimation: { width: '100%', height: 135 }, svgAnimation: { alignItems: 'center', justifyContent: 'center' }, motionCaption: { color: C.primary, fontSize: 11, fontWeight: '700', marginTop: 10, textAlign: 'center' },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border }, exerciseGlyph: { width: 40, height: 40, borderRadius: 13, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' }, exerciseCopy: { flex: 1, gap: 4 }, exerciseName: { color: C.foreground, fontSize: 14, fontWeight: '600' }, exerciseSub: { color: C.mutedForeground, fontSize: 11 },
});
