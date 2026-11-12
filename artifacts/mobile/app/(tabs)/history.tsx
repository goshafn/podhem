import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, EmptyState, formatDate, formatDuration, Screen, Surface, TitleBlock } from '@/components/common';
import { useTraining, WorkoutSession } from '@/context/TrainingContext';
import { formatVolume } from '@/utils/metrics';

const sameDay = (timestamp: number, date: Date) => new Date(timestamp).toDateString() === date.toDateString();
export default function HistoryScreen() {
  const { workouts } = useTraining();
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const month = new Date(new Date().getFullYear(), new Date().getMonth() + monthOffset, 1);
  const monthLabel = month.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = (first.getDay() + 6) % 7;
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array.from({ length: start }, () => 0), ...Array.from({ length: count }, (_, index) => index + 1)];
  }, [monthOffset]);
  const selectedWorkouts = workouts.filter((workout) => sameDay(workout.completedAt, selectedDate));
  const hasWorkoutDay = (day: number) => workouts.some((workout) => { const date = new Date(workout.completedAt); return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth() && date.getDate() === day; });
  const moveMonth = (delta: number) => { setMonthOffset((value) => value + delta); setSelectedDate(new Date(month.getFullYear(), month.getMonth() + delta, 1)); };
  return <Screen>
    <TitleBlock eyebrow="ТВОЯ РАБОТА СОХРАНЕНА" title="История" note="Календарь и детали завершённых тренировок." />
    <Surface style={styles.calendar}>
      <View style={styles.monthHead}><Pressable onPress={() => moveMonth(-1)} style={styles.monthArrow} accessibilityLabel="Предыдущий месяц"><Feather name="chevron-left" size={20} color={C.foreground} /></Pressable><Text style={styles.monthLabel}>{monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}</Text><Pressable onPress={() => moveMonth(1)} style={styles.monthArrow} accessibilityLabel="Следующий месяц"><Feather name="chevron-right" size={20} color={C.foreground} /></Pressable></View>
      <View style={styles.weekRow}>{['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map((day) => <Text key={day} style={styles.weekday}>{day}</Text>)}</View>
      <View style={styles.days}>{days.map((day, index) => {
        if (!day) return <View key={'blank-' + index} style={styles.dayCell} />;
        const date = new Date(month.getFullYear(), month.getMonth(), day);
        const selected = sameDay(date.getTime(), selectedDate);
        const marked = hasWorkoutDay(day);
        return <Pressable key={day} onPress={() => setSelectedDate(date)} style={[styles.dayCell, selected && styles.daySelected]}><Text style={[styles.dayText, selected && styles.dayTextSelected]}>{day}</Text>{marked ? <View style={[styles.dayDot, selected && styles.dayDotSelected]} /> : <View style={styles.dotSpacer} />}</Pressable>;
      })}</View>
    </Surface>
    <View style={styles.listHead}><Text style={styles.sectionTitle}>{formatDate(selectedDate.getTime())}</Text><Text style={styles.count}>{selectedWorkouts.length} тренировок</Text></View>
    {selectedWorkouts.length ? selectedWorkouts.map((workout) => <SessionCard key={workout.id} workout={workout} />) : <Surface><EmptyState icon="calendar" title="В этот день тренировок нет" note="Выбери отмеченный день или начни новую тренировку." /></Surface>}
    <Text style={styles.footer}>Отмеченные точки показывают дни с сохранёнными тренировками.</Text>
  </Screen>;
}
function SessionCard({ workout }: { workout: WorkoutSession }) {
  const [expanded, setExpanded] = useState(false);
  return <Surface style={styles.session}>
    <Pressable onPress={() => setExpanded((value) => !value)} style={styles.sessionTop}><View style={styles.sessionIcon}><Feather name="activity" size={17} color={C.primary} /></View><View style={styles.sessionCopy}><Text style={styles.sessionTitle}>{workout.name}</Text><Text style={styles.sessionSub}>{formatDuration(workout.completedAt - workout.startedAt)} · {workout.exercises.length} упражнений</Text></View><View style={styles.sessionRight}><Text style={styles.tonnage}>{formatVolume(workout.tonnage)}</Text><Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={17} color={C.mutedForeground} /></View></Pressable>
    {expanded ? <View style={styles.details}>{workout.exercises.map((entry) => <View key={entry.id} style={styles.detailItem}><Text style={styles.exerciseName}>{entry.name}</Text><Text style={styles.setText}>{entry.sets.filter((set) => set.completed).map((set) => (set.weight || '0') + ' × ' + set.reps).join('   ') || 'Нет завершённых подходов'}</Text></View>)}</View> : null}
  </Surface>;
}
const styles = StyleSheet.create({ calendar: { padding: 14, gap: 10 }, monthHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, monthArrow: { width: 36, height: 34, alignItems: 'center', justifyContent: 'center' }, monthLabel: { color: C.foreground, fontSize: 15, fontWeight: '700' }, weekRow: { flexDirection: 'row' }, weekday: { width: '14.285%', textAlign: 'center', color: C.mutedForeground, fontSize: 9, fontWeight: '700', paddingVertical: 5 }, days: { flexDirection: 'row', flexWrap: 'wrap' }, dayCell: { width: '14.285%', aspectRatio: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 2 }, daySelected: { backgroundColor: C.primary }, dayText: { color: C.foreground, fontSize: 12, fontWeight: '600' }, dayTextSelected: { color: C.primaryForeground, fontWeight: '800' }, dayDot: { width: 4, height: 4, borderRadius: 3, backgroundColor: C.primary }, dayDotSelected: { backgroundColor: C.primaryForeground }, dotSpacer: { width: 4, height: 4 }, listHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sectionTitle: { color: C.foreground, fontSize: 17, fontWeight: '700' }, count: { color: C.mutedForeground, fontSize: 11 }, session: { padding: 14 }, sessionTop: { flexDirection: 'row', alignItems: 'center', gap: 11 }, sessionIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' }, sessionCopy: { flex: 1, gap: 4 }, sessionTitle: { color: C.foreground, fontSize: 14, fontWeight: '700' }, sessionSub: { color: C.mutedForeground, fontSize: 11 }, sessionRight: { alignItems: 'flex-end', gap: 3 }, tonnage: { color: C.primary, fontSize: 12, fontWeight: '700' }, details: { borderTopWidth: 1, borderTopColor: C.border, marginTop: 13, paddingTop: 12, gap: 12 }, detailItem: { gap: 4 }, exerciseName: { color: C.foreground, fontSize: 12, fontWeight: '600' }, setText: { color: C.mutedForeground, fontSize: 11, lineHeight: 17 }, footer: { color: C.mutedForeground, textAlign: 'center', fontSize: 11 },
});
