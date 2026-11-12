import React, { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button, C, EmptyState, formatKg, Screen, Surface, TitleBlock } from '@/components/common';
import { exercises } from '@/data/catalog';
import { useTraining, WorkoutSession } from '@/context/TrainingContext';
import { bestRecords, formatVolume } from '@/utils/metrics';

const periods = [{ label: '7 дней', days: 7 }, { label: '30 дней', days: 30 }, { label: 'Год', days: 365 }];
function sessionForExercise(workout: WorkoutSession, id: string) {
  const entry = workout.exercises.find((item) => item.exerciseId === id);
  if (!entry) return null;
  const sets = entry.sets.filter((set) => set.completed);
  if (!sets.length) return null;
  const maxWeight = Math.max(...sets.map((set) => Number(set.weight.replace(',', '.')) || 0));
  const volume = sets.reduce((sum, set) => sum + (Number(set.weight.replace(',', '.')) || 0) * (Number(set.reps) || 0), 0);
  return { date: workout.completedAt, maxWeight, volume };
}
function BarChart({ title, unit, values, formatter }: { title: string; unit: string; values: Array<{ label: string; value: number }>; formatter: (value: number) => string }) {
  const max = Math.max(1, ...values.map((item) => item.value));
  return <View style={styles.chartBlock}><View style={styles.chartHead}><Text style={styles.chartTitle}>{title}</Text><Text style={styles.chartUnit}>{unit}</Text></View><View style={styles.chart}>{values.map((item, index) => <View key={index} style={styles.barColumn}><Text numberOfLines={1} style={styles.barValue}>{item.value > 0 ? formatter(item.value) : ''}</Text><View style={styles.barTrack}><View style={[styles.bar, { height: Math.max(item.value > 0 ? 8 : 2, item.value / max * 100) }]} /></View><Text style={styles.barLabel}>{item.label}</Text></View>)}</View></View>;
}
export default function ProgressScreen() {
  const { workouts, exportBackup, importBackup, savedPlanIds, activeWorkout } = useTraining();
  const [exerciseId, setExerciseId] = useState('barbell-bench');
  const [period, setPeriod] = useState(30);
  const [backupOpen, setBackupOpen] = useState(false);
  const [backupJson, setBackupJson] = useState('');
  const [importJson, setImportJson] = useState('');
  const [backupMessage, setBackupMessage] = useState('');
  const records = bestRecords(workouts);
  const currentRecord = records.find((record) => record.exerciseId === exerciseId);
  const cutoff = Date.now() - period * 24 * 60 * 60 * 1000;
  const series = workouts.filter((workout) => workout.completedAt >= cutoff).map((workout) => sessionForExercise(workout, exerciseId)).filter((item): item is NonNullable<ReturnType<typeof sessionForExercise>> => Boolean(item)).sort((a, b) => a.date - b.date).slice(-8);
  const selected = exercises.find((item) => item.id === exerciseId) ?? exercises[0];
  const totalVolume = useMemo(() => workouts.filter((workout) => workout.completedAt >= cutoff).reduce((sum, workout) => sum + workout.tonnage, 0), [workouts, cutoff]);
  const createExport = async () => {
    const json = exportBackup();
    setBackupJson(json);
    setBackupMessage('');
    if (Platform.OS === 'web') {
      const web = globalThis as typeof globalThis & { document?: { createElement: (tag: string) => { href: string; download: string; click: () => void } }; URL?: { createObjectURL: (blob: Blob) => string; revokeObjectURL: (url: string) => void } };
      if (web.document && web.URL) {
        const url = web.URL.createObjectURL(new Blob([json], { type: 'application/json' }));
        const link = web.document.createElement('a'); link.href = url; link.download = 'podhod-backup.json'; link.click(); web.URL.revokeObjectURL(url);
        setBackupMessage('Файл podhod-backup.json скачан.');
      } else setBackupMessage('JSON готов. Скопируйте текст из поля ниже.');
    } else {
      try { await Share.share({ title: 'Резервная копия Подход', message: json }); setBackupMessage('JSON передан в меню отправки.'); }
      catch { setBackupMessage('JSON готов. Скопируйте текст из поля ниже.'); }
    }
  };
  const doImport = () => {
    const message = importBackup(importJson);
    setBackupMessage(message);
    if (message === 'Резервная копия импортирована.') { setImportJson(''); Alert.alert('Готово', message); }
  };
  const topRecord = records[0];
  return <Screen>
    <TitleBlock eyebrow="ЦИФРЫ И РЕЗУЛЬТАТЫ" title="Прогресс" note="Рабочие веса, объём и личные рекорды." />
    <View style={styles.periodRow}>{periods.map((item) => <Pressable key={item.days} onPress={() => setPeriod(item.days)} style={[styles.period, period === item.days && styles.periodOn]}><Text style={[styles.periodText, period === item.days && styles.periodTextOn]}>{item.label}</Text></Pressable>)}</View>
    <View style={styles.exercisePicker}><Text style={styles.eyebrow}>УПРАЖНЕНИЕ ДЛЯ ГРАФИКА</Text><View style={styles.selectWrap}><Text style={styles.selectedName}>{selected.name}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>{exercises.map((exercise) => <Pressable key={exercise.id} onPress={() => setExerciseId(exercise.id)} style={[styles.choice, exercise.id === exerciseId && styles.choiceOn]}><Text numberOfLines={1} style={[styles.choiceText, exercise.id === exerciseId && styles.choiceTextOn]}>{exercise.name}</Text></Pressable>)}</ScrollView></View></View>
    {series.length ? <Surface style={styles.chartCard}><BarChart title="Рабочий вес" unit="максимум за тренировку" values={series.map((item) => ({ label: new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }), value: item.maxWeight }))} formatter={(value) => String(Math.round(value))} /><View style={styles.divider} /><BarChart title="Тоннаж упражнения" unit="выполненный объём" values={series.map((item) => ({ label: new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }), value: item.volume }))} formatter={(value) => value >= 1000 ? (value / 1000).toFixed(1) + 'т' : String(Math.round(value))} /></Surface> : <Surface><EmptyState icon="trending-up" title="График появится после тренировки" note="Запиши рабочие подходы в этом упражнении — здесь отобразится рост веса и объёма." /></Surface>}
    <View style={styles.metricsRow}><Surface style={styles.metric}><Text style={styles.metricLabel}>ОБЪЁМ ЗА ПЕРИОД</Text><Text style={styles.metricValue}>{formatVolume(totalVolume)}</Text></Surface><Surface style={styles.metric}><Text style={styles.metricLabel}>СОХРАНЁННЫХ ПЛАНОВ</Text><Text style={styles.metricValue}>{savedPlanIds.length}</Text></Surface></View>
    <Surface style={styles.prCard}><View style={styles.prIcon}><Feather name="award" size={20} color={C.primary} /></View><View style={styles.prCopy}><Text style={styles.eyebrow}>ЛИЧНЫЙ РЕКОРД · 1RM ПО ЭПЛИ</Text><Text style={styles.prTitle}>{currentRecord ? formatKg(currentRecord.e1rm) : 'Пока нет'}</Text><Text style={styles.prSub}>{currentRecord ? selected.name + ' · расчётный максимум' : 'Выполни подход с весом, чтобы начать отслеживание.'}</Text></View></Surface>
    {topRecord ? <Text style={styles.bestNote}>Лучший расчётный максимум сейчас — {topRecord.name}, {formatKg(topRecord.e1rm)}.</Text> : null}
    <Surface style={styles.backupCard}><View style={styles.backupHead}><View><Text style={styles.backupTitle}>Резервная копия</Text><Text style={styles.backupSub}>Экспортируй или восстанови данные этого устройства.</Text></View><Feather name="hard-drive" size={19} color={C.primary} /></View><Text style={styles.backupNote}>Импорт заменит историю, сохранённые планы и активную тренировку.</Text><Button title={backupOpen ? 'Скрыть импорт и экспорт' : 'Открыть резервную копию'} icon="download" secondary onPress={() => setBackupOpen((value) => !value)} testID="toggle-backup" />
      {backupOpen ? <View style={styles.backupTools}><Button title="Экспортировать JSON" icon="share" onPress={createExport} testID="export-backup" />{backupJson ? <TextInput testID="backup-export-json" multiline editable={false} selectTextOnFocus value={backupJson} style={styles.jsonOutput} /> : null}<Text style={styles.importLabel}>ИМПОРТ JSON</Text><TextInput testID="backup-import-json" multiline value={importJson} onChangeText={setImportJson} placeholder="Вставь сюда резервную копию JSON" placeholderTextColor={C.mutedForeground} style={styles.jsonInput} autoCapitalize="none" autoCorrect={false} /><Button title="Импортировать копию" icon="upload" secondary disabled={!importJson.trim()} onPress={doImport} testID="import-backup" />{backupMessage ? <Text style={styles.message}>{backupMessage}</Text> : null}</View> : null}
    </Surface>
    {activeWorkout ? <Text style={styles.activeNote}>Активная тренировка сохранена автоматически, даже если закрыть приложение.</Text> : null}
  </Screen>;
}
const styles = StyleSheet.create({ periodRow: { flexDirection: 'row', gap: 7, backgroundColor: C.card, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: C.border }, period: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' }, periodOn: { backgroundColor: C.primary }, periodText: { color: C.mutedForeground, fontSize: 11, fontWeight: '700' }, periodTextOn: { color: C.primaryForeground }, exercisePicker: { gap: 8 }, eyebrow: { color: C.mutedForeground, fontSize: 9, fontWeight: '800', letterSpacing: 1.2 }, selectWrap: { backgroundColor: C.card, borderRadius: 17, padding: 13, borderWidth: 1, borderColor: C.border, gap: 10 }, selectedName: { color: C.foreground, fontWeight: '700', fontSize: 14 }, choiceRow: { flexDirection: 'row', gap: 6, paddingRight: 10 }, choice: { maxWidth: 160, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 7, backgroundColor: C.secondary }, choiceOn: { backgroundColor: C.accent }, choiceText: { color: C.mutedForeground, fontSize: 9 }, choiceTextOn: { color: C.primary, fontWeight: '700' }, chartCard: { gap: 4 }, chartBlock: { gap: 9 }, chartHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, chartTitle: { color: C.foreground, fontSize: 13, fontWeight: '700' }, chartUnit: { color: C.mutedForeground, fontSize: 9 }, chart: { height: 128, flexDirection: 'row', alignItems: 'flex-end', gap: 7 }, barColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 4 }, barValue: { color: C.mutedForeground, fontSize: 8, height: 12 }, barTrack: { height: 100, width: '100%', justifyContent: 'flex-end', alignItems: 'center' }, bar: { width: '70%', borderRadius: 5, backgroundColor: C.primary, minHeight: 2 }, barLabel: { color: C.mutedForeground, fontSize: 8 }, divider: { height: 1, backgroundColor: C.border, marginVertical: 10 }, metricsRow: { flexDirection: 'row', gap: 10 }, metric: { flex: 1, padding: 14, gap: 9 }, metricLabel: { color: C.mutedForeground, fontSize: 9, fontWeight: '700', letterSpacing: 0.6 }, metricValue: { color: C.foreground, fontSize: 20, fontWeight: '700' }, prCard: { flexDirection: 'row', gap: 13, alignItems: 'center' }, prIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' }, prCopy: { flex: 1, gap: 5 }, prTitle: { color: C.primary, fontSize: 23, fontWeight: '800' }, prSub: { color: C.mutedForeground, fontSize: 11, lineHeight: 16 }, bestNote: { color: C.mutedForeground, fontSize: 11 }, backupCard: { gap: 13 }, backupHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, backupTitle: { color: C.foreground, fontSize: 15, fontWeight: '700' }, backupSub: { color: C.mutedForeground, fontSize: 11, marginTop: 4 }, backupNote: { color: C.warning, fontSize: 11, lineHeight: 16 }, backupTools: { gap: 11 }, jsonOutput: { minHeight: 120, maxHeight: 220, color: C.mutedForeground, fontSize: 10, backgroundColor: C.background, padding: 10, borderRadius: 12, textAlignVertical: 'top' }, importLabel: { color: C.mutedForeground, fontSize: 9, letterSpacing: 1.2, fontWeight: '800' }, jsonInput: { minHeight: 115, color: C.foreground, fontSize: 11, backgroundColor: C.background, padding: 12, borderRadius: 12, textAlignVertical: 'top' }, message: { color: C.primary, fontSize: 11 }, activeNote: { color: C.mutedForeground, fontSize: 11, textAlign: 'center' },
});
