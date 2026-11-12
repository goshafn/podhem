import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Button, C, EmptyState, Screen, TitleBlock } from '@/components/common';
import { equipmentTypes, exercises, muscleGroups } from '@/data/catalog';
import { useTraining } from '@/context/TrainingContext';

export default function LibraryScreen() {
  const router = useRouter();
  const { activeWorkout, addExercise } = useTraining();
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState<string>('Все');
  const [equipment, setEquipment] = useState<string>('Все');
  const filtered = useMemo(() => exercises.filter((exercise) => {
    const query = search.trim().toLocaleLowerCase('ru');
    return (!query || [exercise.name, exercise.target, exercise.group, exercise.equipment].some((value) => value.toLocaleLowerCase('ru').includes(query))) && (group === 'Все' || exercise.group === group) && (equipment === 'Все' || exercise.equipment === equipment);
  }), [search, group, equipment]);
  const add = (exerciseId: string, name: string) => {
    const success = addExercise(exerciseId);
    if (!success) { Alert.alert('Уже в тренировке', 'Это упражнение уже добавлено.'); return; }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Добавлено', name + ' добавлено в активную тренировку.');
  };
  return <Screen scroll={false}><ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <TitleBlock eyebrow="БАЗА УПРАЖНЕНИЙ" title="Каталог" note="Найди движение, настрой технику и добавь его в план." />
    {activeWorkout ? <Pressable style={styles.activeBanner} onPress={() => router.push('/workout')}><Feather name="activity" color={C.primary} size={16} /><Text style={styles.activeText}>Идёт тренировка · нажми, чтобы вернуться</Text><Feather name="arrow-up-right" color={C.primary} size={16} /></Pressable> : null}
    <View style={styles.search}><Feather name="search" size={17} color={C.mutedForeground} /><TextInput testID="exercise-search" value={search} onChangeText={setSearch} placeholder="Упражнение, мышца или инвентарь" placeholderTextColor={C.mutedForeground} returnKeyType="search" style={styles.searchInput} /><Pressable onPress={() => setSearch('')} accessibilityLabel="Очистить поиск"><Feather name="x" size={16} color={C.mutedForeground} /></Pressable></View>
    <Text style={styles.filterLabel}>ГРУППА МЫШЦ</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{muscleGroups.map((item) => <Pressable key={item} onPress={() => setGroup(item)} style={[styles.chip, group === item && styles.chipOn]}><Text style={[styles.chipText, group === item && styles.chipTextOn]}>{item}</Text></Pressable>)}</ScrollView>
    <Text style={styles.filterLabel}>ОБОРУДОВАНИЕ</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{equipmentTypes.map((item) => <Pressable key={item} onPress={() => setEquipment(item)} style={[styles.chip, equipment === item && styles.chipOn]}><Text style={[styles.chipText, equipment === item && styles.chipTextOn]}>{item}</Text></Pressable>)}</ScrollView>
    <View style={styles.countRow}><Text style={styles.resultCount}>{filtered.length} упражнений</Text>{activeWorkout ? <Text style={styles.hint}>Нажми +, чтобы добавить</Text> : null}</View>
    {filtered.length ? <View style={styles.list}>{filtered.map((exercise) => {
      const added = Boolean(activeWorkout?.exercises.some((entry) => entry.exerciseId === exercise.id));
      return <View key={exercise.id} style={styles.row}>
        <Pressable onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: exercise.id } })} style={({ pressed }) => [styles.rowMain, pressed && styles.pressed]}><View style={styles.glyph}><Feather name="activity" size={17} color={C.primary} /></View><View style={styles.copy}><Text numberOfLines={1} style={styles.name}>{exercise.name}</Text><Text numberOfLines={1} style={styles.sub}>{exercise.target} · {exercise.equipment}</Text></View><Feather name="chevron-right" size={18} color={C.mutedForeground} /></Pressable>
        {activeWorkout ? <Pressable disabled={added} onPress={() => add(exercise.id, exercise.name)} testID={'add-' + exercise.id} accessibilityLabel="Добавить упражнение" style={({ pressed }) => [styles.addButton, added && styles.added, pressed && styles.pressed]}><Feather name={added ? 'check' : 'plus'} size={17} color={added ? C.mutedForeground : C.primaryForeground} /></Pressable> : null}
      </View>;
    })}</View> : <EmptyState icon="search" title="Ничего не найдено" note="Измени запрос или выбери другую группу мышц." />}
    <Text style={styles.footer}>Демонстрация движения и техника безопасности доступны в карточке упражнения.</Text>
  </ScrollView></Screen>;
}
const styles = StyleSheet.create({ content: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 115, gap: 13 }, activeBanner: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 12, borderRadius: 13, backgroundColor: C.accent }, activeText: { flex: 1, color: C.primary, fontSize: 12, fontWeight: '600' }, search: { height: 50, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 15, borderWidth: 1, borderColor: C.border, backgroundColor: C.card }, searchInput: { flex: 1, color: C.foreground, fontSize: 13, paddingVertical: 10 }, filterLabel: { color: C.mutedForeground, fontSize: 9, letterSpacing: 1.3, fontWeight: '800', marginTop: 2 }, chips: { gap: 8, paddingRight: 10 }, chip: { borderRadius: 18, paddingHorizontal: 13, paddingVertical: 8, borderWidth: 1, borderColor: C.border, backgroundColor: C.card }, chipOn: { backgroundColor: C.primary, borderColor: C.primary }, chipText: { color: C.mutedForeground, fontSize: 11, fontWeight: '600' }, chipTextOn: { color: C.primaryForeground }, countRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }, resultCount: { color: C.foreground, fontSize: 13, fontWeight: '700' }, hint: { color: C.primary, fontSize: 10 }, list: { gap: 1 }, row: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: C.border, paddingVertical: 8, gap: 8 }, rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 11, minHeight: 52 }, pressed: { opacity: 0.75 }, glyph: { width: 39, height: 39, borderRadius: 13, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' }, copy: { flex: 1, gap: 3 }, name: { color: C.foreground, fontSize: 13, fontWeight: '600' }, sub: { color: C.mutedForeground, fontSize: 10 }, addButton: { height: 38, width: 38, borderRadius: 12, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }, added: { backgroundColor: C.secondary, borderWidth: 1, borderColor: C.border }, footer: { color: C.mutedForeground, fontSize: 11, lineHeight: 17, paddingTop: 4 },
});
