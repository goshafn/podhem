import React, { ReactNode, useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Circle, Path, Svg, SvgXml } from 'react-native-svg';
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
  const motion = exercise.motion;
  const isSupine = ['press-flat', 'press-incline', 'fly-mid', 'fly-low', 'skull-crusher', 'crunch'].includes(motion);
  const isHinge = ['hinge', 'row', 'back-extension', 'pullover'].includes(motion);
  const isLegDrive = ['squat', 'front-squat', 'leg-press', 'lunge', 'knee-extension', 'knee-flexion', 'hip-thrust', 'bridge', 'calf-raise', 'hip-abduction', 'run', 'kickboxing', 'judo'].includes(motion);
  const isRaise = ['overhead-press', 'arnold-press', 'lateral-raise', 'front-raise', 'face-pull', 'rear-delt-fly', 'upright-row', 'boxing'].includes(motion);
  const isCurl = ['curl', 'hammer-curl', 'preacher-curl', 'triceps-pushdown', 'overhead-triceps'].includes(motion);
  const isCore = ['plank', 'crunch', 'leg-raise', 'cable-crunch', 'rotation', 'rollout'].includes(motion);
  const bodyY = lift.interpolate({ inputRange: [0, 1], outputRange: [0, isLegDrive ? -12 : -3] });
  const bodyRotate = lift.interpolate({ inputRange: [0, 1], outputRange: ['0deg', isHinge ? '-12deg' : isCore ? '-7deg' : motion === 'judo' ? '8deg' : '0deg'] });
  const armRotate = lift.interpolate({ inputRange: [0, 1], outputRange: [isSupine || isRaise ? '23deg' : '-5deg', isSupine || isRaise ? '-24deg' : isCurl ? '-40deg' : '10deg'] });
  const loadShift = lift.interpolate({ inputRange: [0, 1], outputRange: [8, -11] });
  const punchShift = lift.interpolate({ inputRange: [0, 1], outputRange: [0, 25] });
  const showBar = exercise.equipment === 'Штанга';
  const showDumbbells = exercise.equipment === 'Гантели';
  const showCable = exercise.equipment === 'Блок';
  const posePath = isSupine
    ? 'M15 70 L34 70 L53 63 L87 63 L101 70 L119 70 M56 62 L47 47 M85 62 L94 47 M87 63 L109 79 M49 64 L35 80'
    : isHinge
      ? 'M59 29 L69 42 L62 61 L52 78 L37 91 M69 42 L90 47 L104 59 M62 61 L81 69 L93 84 M59 29 L44 23 M52 78 L36 99'
      : isCore || motion === 'push-up'
        ? 'M20 69 L37 69 L56 62 L91 62 L108 69 L121 69 M60 62 L45 78 M88 62 L103 78 M61 63 L51 86 M92 63 L102 86'
        : 'M68 23 L68 43 L68 65 L68 84 M68 44 L48 47 L39 65 M68 44 L87 47 L97 65 M68 84 L55 105 M68 84 L82 105';
  const head = isSupine || isCore ? { cx: 18, cy: 70 } : { cx: 68, cy: 15 };
  const detailLabel = exercise.tracking === 'running' ? 'ВРЕМЯ · ДИСТАНЦИЯ' : exercise.tracking === 'rounds' ? 'ВРЕМЯ · РАУНДЫ' : exercise.equipment.toUpperCase();
  return <View style={[styles.motion, small && styles.motionSmall]} accessibilityLabel={'Зацикленная демонстрация движения: ' + exercise.name}>
    <View style={styles.motionStage}>
      {isSupine ? <View style={styles.animationBench} /> : null}
      <Animated.View style={[styles.animationBody, { transform: [{ translateY: bodyY }, { rotate: bodyRotate }] }]}>
        <Svg width={small ? 105 : 154} height={small ? 78 : 112} viewBox="0 0 140 120">
          <Circle cx={head.cx} cy={head.cy} r="8" fill={C.anatomyLight} />
          <Path d={posePath} fill="none" stroke={C.anatomyLight} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
          <Path d={posePath} fill="none" stroke={C.anatomyOutline} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Animated.View>
      {showBar ? <Animated.View style={[styles.animationBar, { transform: [{ translateY: loadShift }] }]}><View style={styles.barShaft} /><View style={styles.barPlate} /><View style={[styles.barPlate, { right: 1 }]} /></Animated.View> : null}
      {showDumbbells ? <Animated.View style={[styles.animationDumbbells, { transform: [{ translateY: loadShift }, { rotate: armRotate }] }]}><View style={styles.dumbbellHandle} /><View style={styles.dumbbellHead} /><View style={[styles.dumbbellHead, { right: -5 }]} /></Animated.View> : null}
      {showCable ? <View style={styles.cableLine}><Animated.View style={[styles.cableHandle, { transform: [{ translateX: punchShift }] }]} /></View> : null}
      {exercise.tracking === 'rounds' ? <Animated.View style={[styles.motionGlove, { transform: [{ translateX: punchShift }, { rotate: armRotate }] }]} /> : null}
      {exercise.tracking === 'running' ? <Animated.View style={[styles.runTrail, { opacity: lift.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.95] }) }]}><View style={styles.runTrailLine} /><View style={styles.runTrailLine} /><View style={styles.runTrailLine} /></Animated.View> : null}
    </View>
    <Text style={styles.motionCaption}>{exercise.name}</Text>
    <Text style={styles.motionSubcaption}>{detailLabel} · цикл движения</Text>
  </View>;
}
export function ExerciseRow({ exercise, onPress, onAdd, added = false }: { exercise: Exercise; onPress: () => void; onAdd?: () => void; added?: boolean }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.exerciseRow, pressed && styles.pressed]}>
    <View style={styles.exerciseGlyph}>{exercise.tracking === 'strength' ? <MaterialCommunityIcons name="dumbbell" size={19} color={C.primary} /> : <Feather name={exercise.tracking === 'running' ? 'wind' : 'target'} size={18} color={C.primary} />}</View>
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
  motion: { minHeight: 182, paddingHorizontal: 12, paddingVertical: 9, backgroundColor: C.card, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border }, motionSmall: { minHeight: 88, width: 100 }, motionStage: { width: '100%', height: 126, position: 'relative', alignItems: 'center', justifyContent: 'center' }, animationBody: { position: 'absolute', alignItems: 'center', justifyContent: 'center' }, animationBench: { position: 'absolute', bottom: 28, left: '50%', marginLeft: -66, width: 132, height: 7, borderRadius: 4, backgroundColor: C.border }, animationBar: { position: 'absolute', top: 37, left: '50%', marginLeft: -47, width: 94, height: 5, borderRadius: 4, backgroundColor: C.foreground, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, barShaft: { position: 'absolute', left: 7, right: 7, height: 3, borderRadius: 2, backgroundColor: C.foreground }, barPlate: { position: 'absolute', top: -8, width: 9, height: 21, borderRadius: 3, backgroundColor: C.primary }, animationDumbbells: { position: 'absolute', top: 42, left: '50%', marginLeft: -20, width: 40, height: 5, borderRadius: 4, backgroundColor: C.foreground, flexDirection: 'row', alignItems: 'center' }, dumbbellHandle: { position: 'absolute', left: 2, right: 2, height: 3, backgroundColor: C.foreground }, dumbbellHead: { position: 'absolute', left: -5, width: 8, height: 15, borderRadius: 3, backgroundColor: C.primary }, cableLine: { position: 'absolute', top: 23, bottom: 23, right: 29, width: 3, borderRadius: 2, backgroundColor: C.border }, cableHandle: { position: 'absolute', top: 48, width: 13, height: 17, borderRadius: 5, backgroundColor: C.primary }, motionGlove: { position: 'absolute', top: 43, right: '19%', width: 20, height: 20, borderRadius: 8, backgroundColor: C.musclePrimary }, runTrail: { position: 'absolute', left: '15%', bottom: 25, gap: 5 }, runTrailLine: { width: 20, height: 2, borderRadius: 2, backgroundColor: C.primary }, mediaAnimation: { width: '100%', height: 135 }, svgAnimation: { alignItems: 'center', justifyContent: 'center' }, motionCaption: { color: C.primary, fontSize: 11, fontWeight: '700', marginTop: 3, textAlign: 'center' }, motionSubcaption: { color: C.mutedForeground, fontSize: 8, marginTop: 2, textAlign: 'center', letterSpacing: 0.5 },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border }, exerciseGlyph: { width: 40, height: 40, borderRadius: 13, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' }, exerciseCopy: { flex: 1, gap: 4 }, exerciseName: { color: C.foreground, fontSize: 14, fontWeight: '600' }, exerciseSub: { color: C.mutedForeground, fontSize: 11 },
});
