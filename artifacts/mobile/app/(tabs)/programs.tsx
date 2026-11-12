import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Button, C, Screen, Surface, TitleBlock } from '@/components/common';
import { useTraining } from '@/context/TrainingContext';
import { findExercise, workoutPlans } from '@/data/catalog';

const categories = ['Все', 'Всё тело', 'Сплит', 'Акцент', 'Сохранённые'];
export default function ProgramsScreen() {
  const router = useRouter();
  const { activeWorkout, startWorkout, savedPlanIds, toggleSavedPlan } = useTraining();
  const [category, setCategory] = useState('Все');
  const visible = useMemo(() => workoutPlans.filter((plan) => category === 'Все' || (category === 'Сохранённые' ? savedPlanIds.includes(plan.id) : plan.category === category)), [category, savedPlanIds]);
  const start = (plan: (typeof workoutPlans)[number]) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!activeWorkout) startWorkout(plan.title, plan.exercises, plan.restSeconds);
    router.push('/workout');
  };
  return <Screen>
    <TitleBlock eyebrow="ПЛАНЫ НА КАЖДЫЙ ДЕНЬ" title="Программы" note="Готовая структура тренировки — выбери и начинай." />
    <View style={styles.filterRow}>{categories.map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.filter, category === item && styles.filterOn]}><Text style={[styles.filterText, category === item && styles.filterTextOn]}>{item}</Text></Pressable>)}</View>
    {activeWorkout ? <Pressable onPress={() => router.push('/workout')} style={styles.active}><Feather name="activity" size={16} color={C.primary} /><Text style={styles.activeText}>Тренировка уже идёт — продолжить</Text><Feather name="arrow-up-right" size={16} color={C.primary} /></Pressable> : null}
    {visible.length ? visible.map((plan, index) => <Surface key={plan.id} style={styles.card}>
      <View style={styles.cardTop}><View style={styles.number}><Text style={styles.numberText}>{String(index + 1).padStart(2, '0')}</Text></View><View style={styles.planText}><Text style={styles.category}>{plan.category.toUpperCase()} · {plan.level.toUpperCase()}</Text><Text style={styles.planTitle}>{plan.title}</Text><Text style={styles.summary}>{plan.summary}</Text></View><Pressable onPress={() => toggleSavedPlan(plan.id)} accessibilityLabel={savedPlanIds.includes(plan.id) ? 'Убрать из сохранённых' : 'Сохранить программу'} style={styles.bookmark}><Feather name={savedPlanIds.includes(plan.id) ? 'bookmark' : 'bookmark'} size={17} color={savedPlanIds.includes(plan.id) ? C.primary : C.mutedForeground} /></Pressable></View>
      <View style={styles.metaRow}><Text style={styles.meta}>{plan.exercises.length} упражнений</Text><View style={styles.metaDot} /><Text style={styles.meta}>Отдых {plan.restSeconds} сек</Text><View style={styles.metaDot} /><Text style={styles.meta}>{plan.exercises.reduce((sum, item) => sum + item.sets, 0)} подходов</Text></View>
      <View style={styles.exerciseList}>{plan.exercises.slice(0, 4).map((item) => <View key={item.exerciseId} style={styles.exerciseLine}><Text style={styles.exerciseName}>{findExercise(item.exerciseId)?.name ?? item.exerciseId}</Text><Text style={styles.exerciseDetail}>{item.sets} × {item.reps}</Text></View>)}{plan.exercises.length > 4 ? <Text style={styles.more}>и ещё {plan.exercises.length - 4} упражнения</Text> : null}</View>
      <Button title={activeWorkout ? 'Вернуться к текущей' : 'Начать тренировку'} icon="play" onPress={() => start(plan)} testID={'start-' + plan.id} />
    </Surface>) : <Surface><View style={styles.empty}><Feather name="bookmark" size={24} color={C.primary} /><Text style={styles.emptyTitle}>Сохранённых программ пока нет</Text><Text style={styles.summary}>Нажми на закладку у любой программы, чтобы добавить её в свой список.</Text></View></Surface>}
    <Text style={styles.footer}>Сохранённые планы остаются на устройстве и доступны без интернета.</Text>
  </Screen>;
}
const styles = StyleSheet.create({ filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, filter: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 18, backgroundColor: C.card, borderWidth: 1, borderColor: C.border }, filterOn: { backgroundColor: C.primary, borderColor: C.primary }, filterText: { color: C.mutedForeground, fontSize: 11, fontWeight: '600' }, filterTextOn: { color: C.primaryForeground }, active: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 12, backgroundColor: C.accent, borderRadius: 14 }, activeText: { flex: 1, color: C.primary, fontWeight: '600', fontSize: 12 }, card: { gap: 15 }, cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 11 }, number: { width: 41, height: 41, borderRadius: 14, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' }, numberText: { color: C.primary, fontSize: 13, fontWeight: '800' }, planText: { flex: 1, gap: 5 }, category: { color: C.primary, fontSize: 9, fontWeight: '800', letterSpacing: 1 }, planTitle: { color: C.foreground, fontSize: 18, fontWeight: '700' }, summary: { color: C.mutedForeground, fontSize: 12, lineHeight: 18 }, bookmark: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' }, metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, meta: { color: C.mutedForeground, fontSize: 10 }, metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: C.primary }, exerciseList: { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10, gap: 8 }, exerciseLine: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }, exerciseName: { color: C.foreground, fontSize: 11, textTransform: 'capitalize', flex: 1 }, exerciseDetail: { color: C.mutedForeground, fontSize: 11 }, more: { color: C.mutedForeground, fontSize: 10, marginTop: 2 }, empty: { alignItems: 'center', gap: 10, padding: 12 }, emptyTitle: { color: C.foreground, fontWeight: '700', fontSize: 15, textAlign: 'center' }, footer: { color: C.mutedForeground, fontSize: 11, textAlign: 'center' },
});
