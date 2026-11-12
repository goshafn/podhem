import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { AppHeader, Button, C, EmptyState, formatDate, formatDuration, formatKg, Metric, Screen, Surface, TitleBlock } from '@/components/common';
import { useTraining } from '@/context/TrainingContext';
import { bestRecords, formatVolume } from '@/utils/metrics';

export default function HomeScreen() {
  const router = useRouter();
  const { activeWorkout, workouts, startWorkout, isReady, storageError } = useTraining();
  const records = bestRecords(workouts);
  const totalVolume = workouts.reduce((sum, workout) => sum + workout.tonnage, 0);
  const start = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!activeWorkout) startWorkout();
    router.push('/workout');
  };
  if (!isReady) return <Screen><View style={styles.loading}><Text style={styles.subtle}>Загружаем тренировки…</Text></View></Screen>;
  return <Screen>
    <AppHeader right={<View style={styles.offline}><View style={styles.dot} /><Text style={styles.offlineText}>ОФЛАЙН</Text></View>} />
    {storageError ? <View style={styles.storageWarning}><Text style={styles.warningText}>{storageError}</Text></View> : null}
    <TitleBlock eyebrow={new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })} title="Твой зал. Твой ритм." note="Каждый подход приближает к следующему уровню." />
    <Pressable onPress={start} style={({ pressed }) => [styles.hero, pressed && styles.pressed]} testID="start-workout">
      <View style={styles.heroTop}><Text style={styles.heroEyebrow}>{activeWorkout ? 'ТРЕНИРОВКА УЖЕ ИДЁТ' : 'СИЛА НАЧИНАЕТСЯ ЗДЕСЬ'}</Text><View style={styles.heroMark}><Text style={styles.heroMarkText}>01</Text></View></View>
      <Text style={styles.heroTitle}>{activeWorkout ? 'Продолжить\nтренировку' : 'Начать\nтренировку'}</Text>
      <View style={styles.heroBottom}><Text style={styles.heroAction}>{activeWorkout ? 'Вернуться к подходам' : 'Пустая тренировка'}</Text><View style={styles.heroArrow}><Text style={styles.arrow}>↗</Text></View></View>
    </Pressable>
    <View style={styles.metricsRow}><Surface style={styles.metricCard}><Metric label="ТРЕНИРОВОК" value={String(workouts.length)} accent /></Surface><Surface style={styles.metricCard}><Metric label="ОБЪЁМ ВСЕГО" value={formatVolume(totalVolume)} /></Surface><Surface style={styles.metricCard}><Metric label="ЛИЧНЫХ РЕКОРДОВ" value={String(records.length)} /></Surface></View>
    <View style={styles.sectionHead}><Text style={styles.sectionTitle}>Последний результат</Text><Pressable onPress={() => router.push('/history')}><Text style={styles.link}>Вся история</Text></Pressable></View>
    {workouts[0] ? <Surface><View style={styles.lastHead}><View><Text style={styles.lastTitle}>{workouts[0].name}</Text><Text style={styles.lastDate}>{formatDate(workouts[0].completedAt)}</Text></View><Text style={styles.lastIcon}>↗</Text></View><View style={styles.divider} /><View style={styles.metricsRow}><Metric label="ВРЕМЯ" value={formatDuration(workouts[0].completedAt - workouts[0].startedAt)} /><Metric label="ТОННАЖ" value={formatVolume(workouts[0].tonnage)} /><Metric label="УПРАЖНЕНИЙ" value={String(workouts[0].exercises.length)} /></View></Surface> : <Surface><EmptyState icon="activity" title="История начнётся здесь" note="Заверши первую тренировку — и твой прогресс появится на этой странице." /></Surface>}
    <View style={styles.sectionHead}><Text style={styles.sectionTitle}>Готовые программы</Text><Pressable onPress={() => router.push('/programs')}><Text style={styles.link}>Смотреть все</Text></Pressable></View>
    <Surface style={styles.programCard}><View style={styles.programNumber}><Text style={styles.programNumberText}>A</Text></View><View style={styles.programCopy}><Text style={styles.programTitle}>Full Body A</Text><Text style={styles.lastDate}>5 упражнений · для всего тела</Text></View><Pressable onPress={() => router.push('/programs')} accessibilityLabel="Открыть программы"><Text style={styles.lastIcon}>→</Text></Pressable></Surface>
    <Text style={styles.footerNote}>Каталог · 50 упражнений · работает без интернета</Text>
  </Screen>;
}
const styles = StyleSheet.create({ loading: { flex: 1, justifyContent: 'center', alignItems: 'center' }, subtle: { color: C.mutedForeground }, offline: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: C.card, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: C.border }, dot: { width: 6, height: 6, borderRadius: 4, backgroundColor: C.primary }, offlineText: { color: C.mutedForeground, fontSize: 9, fontWeight: '700', letterSpacing: 1 }, storageWarning: { padding: 12, borderRadius: 12, backgroundColor: C.noticeBackground }, warningText: { color: C.noticeForeground, fontSize: 12, lineHeight: 18 }, hero: { padding: 21, borderRadius: 26, backgroundColor: C.primary, minHeight: 232, justifyContent: 'space-between', overflow: 'hidden' }, pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] }, heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, heroEyebrow: { fontSize: 10, color: C.heroMuted, fontWeight: '800', letterSpacing: 1.3 }, heroMark: { width: 34, height: 34, borderRadius: 12, backgroundColor: C.heroOverlay, alignItems: 'center', justifyContent: 'center' }, heroMarkText: { color: C.heroMark, fontSize: 11, fontWeight: '800' }, heroTitle: { color: C.heroForeground, fontSize: 39, lineHeight: 43, fontWeight: '800', letterSpacing: -1.7, marginTop: 17 }, heroBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, heroAction: { color: C.heroMark, fontWeight: '700', fontSize: 13 }, heroArrow: { width: 38, height: 38, borderRadius: 14, backgroundColor: C.heroDeep, alignItems: 'center', justifyContent: 'center' }, arrow: { color: C.primary, fontSize: 20, fontWeight: '700' }, metricsRow: { flexDirection: 'row', gap: 9 }, metricCard: { flex: 1, paddingHorizontal: 12, paddingVertical: 14 }, sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }, sectionTitle: { color: C.foreground, fontSize: 17, fontWeight: '700' }, link: { color: C.primary, fontSize: 12, fontWeight: '700' }, lastHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, lastTitle: { color: C.foreground, fontWeight: '700', fontSize: 15 }, lastDate: { color: C.mutedForeground, fontSize: 12, marginTop: 5 }, lastIcon: { color: C.primary, fontSize: 21 }, divider: { height: 1, backgroundColor: C.border, marginVertical: 16 }, programCard: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 13 }, programNumber: { width: 42, height: 42, borderRadius: 14, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' }, programNumberText: { color: C.primary, fontSize: 17, fontWeight: '800' }, programCopy: { flex: 1 }, programTitle: { color: C.foreground, fontWeight: '700', fontSize: 14 }, footerNote: { color: C.mutedForeground, fontSize: 11, textAlign: 'center', marginTop: 1 },
});
