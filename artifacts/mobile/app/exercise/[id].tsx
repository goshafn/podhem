import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button, C, ExerciseMotion, IconButton, Screen, Surface, TitleBlock } from '@/components/common';
import { findExercise } from '@/data/catalog';
import { useTraining } from '@/context/TrainingContext';

export default function ExerciseDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { activeWorkout, startWorkout, addExercise } = useTraining();
  const exercise = findExercise(params.id ?? '');
  if (!exercise) return <Screen><TitleBlock title="Упражнение не найдено" note="Вернись в каталог и выбери другое движение." /><Button title="Назад в каталог" onPress={() => router.back()} /></Screen>;
  const begin = () => {
    if (!activeWorkout) startWorkout('Тренировка · ' + exercise.name);
    const added = addExercise(exercise.id);
    if (!added && !activeWorkout) { Alert.alert('Не удалось добавить упражнение'); return; }
    router.push('/workout');
  };
  return <Screen>
    <View style={styles.top}><IconButton icon="chevron-left" label="Назад" onPress={() => router.back()} /><Text style={styles.topLabel}>КАРТОЧКА УПРАЖНЕНИЯ</Text><View style={{ width: 40 }} /></View>
    <TitleBlock eyebrow={exercise.group + ' · ' + exercise.equipment} title={exercise.name} note={exercise.summary} />
    <ExerciseMotion exercise={exercise} />
    <View style={styles.targetRow}><View style={styles.targetIcon}><Feather name="target" size={16} color={C.primary} /></View><View style={styles.targetCopy}><Text style={styles.targetLabel}>ОСНОВНАЯ НАГРУЗКА</Text><Text style={styles.targetName}>{exercise.target}</Text></View><Text style={styles.movement}>{exercise.movement.toUpperCase()}</Text></View>
    <View style={styles.sectionHead}><Text style={styles.sectionTitle}>Техника выполнения</Text><Text style={styles.sectionCount}>3 шага</Text></View>
    <Surface style={styles.steps}>{exercise.steps.map((step, index) => <View key={step} style={styles.step}><View style={styles.stepNumber}><Text style={styles.stepNumberText}>{String(index + 1).padStart(2, '0')}</Text></View><Text style={styles.stepText}>{step}</Text></View>)}</Surface>
    <Surface style={styles.safety}><View style={styles.safetyHead}><View style={styles.safetyIcon}><Feather name="shield" size={17} color={C.warning} /></View><Text style={styles.safetyTitle}>Техника безопасности</Text></View><Text style={styles.safetyText}>{exercise.safety}</Text></Surface>
    <Button title={activeWorkout ? 'Добавить в тренировку' : 'Начать с этим упражнением'} icon="plus" onPress={begin} testID="add-exercise-detail" />
  </Screen>;
}
const styles = StyleSheet.create({ top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }, topLabel: { color: C.mutedForeground, fontSize: 9, fontWeight: '800', letterSpacing: 1.1 }, targetRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }, targetIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' }, targetCopy: { flex: 1, gap: 3 }, targetLabel: { color: C.mutedForeground, fontSize: 8, fontWeight: '800', letterSpacing: 1 }, targetName: { color: C.foreground, fontWeight: '700', fontSize: 13 }, movement: { color: C.primary, fontSize: 8, fontWeight: '800', letterSpacing: 1 }, sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }, sectionTitle: { color: C.foreground, fontSize: 16, fontWeight: '700' }, sectionCount: { color: C.mutedForeground, fontSize: 10 }, steps: { gap: 14 }, step: { flexDirection: 'row', gap: 11, alignItems: 'flex-start' }, stepNumber: { width: 28, height: 28, borderRadius: 9, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' }, stepNumberText: { color: C.primary, fontSize: 9, fontWeight: '800' }, stepText: { flex: 1, color: C.foreground, fontSize: 12, lineHeight: 18, paddingTop: 4 }, safety: { backgroundColor: C.safetyBackground, borderColor: C.safetyBorder, gap: 10 }, safetyHead: { flexDirection: 'row', alignItems: 'center', gap: 9 }, safetyIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: C.safetyIconBackground, alignItems: 'center', justifyContent: 'center' }, safetyTitle: { color: C.warning, fontWeight: '800', fontSize: 13 }, safetyText: { color: C.safetyForeground, fontSize: 12, lineHeight: 18 },
});
