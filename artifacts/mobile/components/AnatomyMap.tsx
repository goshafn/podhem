import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Circle, Path, Svg } from 'react-native-svg';
import { C } from '@/components/common';
import { MUSCLE_DEFINITIONS, MUSCLE_ROLE_LABELS, MuscleActivation, MuscleId, MuscleRole } from '@/data/anatomy';

function roleFor(id: MuscleId, activation: MuscleActivation): MuscleRole | null {
  if (activation.primary.includes(id)) return 'primary';
  if (activation.secondary.includes(id)) return 'secondary';
  if (activation.stabilizers.includes(id)) return 'stabilizer';
  return null;
}

function MuscleFigure({ view, activation }: { view: 'front' | 'back'; activation: MuscleActivation }) {
  const definitions = MUSCLE_DEFINITIONS.filter((muscle) => muscle.view === view);
  return <View style={styles.figureWrap}>
    <Svg width="100%" height={216} viewBox="0 0 240 390" accessibilityLabel={view === 'front' ? 'Мышцы тела, вид спереди' : 'Мышцы тела, вид сзади'}>
      <Circle cx="120" cy="29" r="17" fill={C.anatomyBase} stroke={C.anatomyOutline} strokeWidth="2" />
      <Path d="M108 48 L107 59 L94 63 C82 66 74 74 71 87 L57 142 L69 147 L85 108 L88 163 C90 175 99 184 110 188 L110 200 L96 208 L94 268 L104 289 L108 359 L121 359 L126 291 L132 291 L139 359 L152 359 L148 289 L158 268 L155 208 L130 198 L130 187 C142 183 150 174 152 163 L155 108 L171 147 L183 142 L169 87 C166 74 158 66 146 63 L133 59 L132 48 Z" fill={C.anatomyBase} stroke={C.anatomyOutline} strokeWidth="2" strokeLinejoin="round" />
      <Path d="M94 67 C82 66 76 72 72 85 L56 142 L65 147 L83 105 L90 91 Z M146 67 C158 66 164 72 168 85 L184 142 L175 147 L157 105 L150 91 Z" fill={C.anatomyBase} stroke={C.anatomyOutline} strokeWidth="2" strokeLinejoin="round" />
      <Path d="M104 288 L91 354 L102 358 L116 309 L120 289 Z M136 288 L149 354 L138 358 L124 309 L120 289 Z" fill={C.anatomyBase} stroke={C.anatomyOutline} strokeWidth="2" strokeLinejoin="round" />
      <Path d="M107 187 Q120 193 133 187" fill="none" stroke={C.anatomyOutline} strokeWidth="2" />
      {definitions.map((muscle) => {
        const role = roleFor(muscle.id, activation);
        const fill = role === 'primary' ? C.musclePrimary : role === 'secondary' ? C.muscleSecondary : role === 'stabilizer' ? C.muscleStabilizer : C.anatomyLight;
        return muscle.paths.map((path, index) => <Path key={muscle.id + '-' + index} d={path} fill={fill} fillOpacity={role ? 0.96 : 0.5} stroke={C.background} strokeWidth="1.4" strokeLinejoin="round" />);
      })}
    </Svg>
    <Text style={styles.viewLabel}>{view === 'front' ? 'СПЕРЕДИ' : 'СЗАДИ'}</Text>
  </View>;
}

function RoleList({ role, ids }: { role: MuscleRole; ids: MuscleId[] }) {
  const names = ids.map((id) => MUSCLE_DEFINITIONS.find((muscle) => muscle.id === id)?.name).filter((name): name is string => Boolean(name));
  if (!names.length) return null;
  const color = role === 'primary' ? C.musclePrimary : role === 'secondary' ? C.muscleSecondary : C.muscleStabilizer;
  return <View style={styles.roleRow}>
    <View style={[styles.roleDot, { backgroundColor: color }]} />
    <View style={styles.roleCopy}>
      <Text style={styles.roleTitle}>{MUSCLE_ROLE_LABELS[role]}</Text>
      <Text style={styles.roleNames}>{names.join(' · ')}</Text>
    </View>
  </View>;
}

export function AnatomyMap({ muscles }: { muscles: MuscleActivation }) {
  return <View style={styles.card}>
    <View style={styles.heading}>
      <View style={styles.headingMark}><Text style={styles.headingMarkText}>01</Text></View>
      <View style={styles.headingCopy}><Text style={styles.title}>Работающие мышцы</Text><Text style={styles.subtitle}>Анатомическая карта · основные и вспомогательные</Text></View>
    </View>
    <View style={styles.figures}>
      <MuscleFigure view="front" activation={muscles} />
      <MuscleFigure view="back" activation={muscles} />
    </View>
    <View style={styles.roles}>
      <RoleList role="primary" ids={muscles.primary} />
      <RoleList role="secondary" ids={muscles.secondary} />
      <RoleList role="stabilizer" ids={muscles.stabilizers} />
    </View>
    <Text style={styles.note}>В организме описано более 600 скелетных мышц; оценка зависит от способа подсчёта. Здесь подсвечены только участвующие в этом движении.</Text>
  </View>;
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 21, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, gap: 13 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headingMark: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: C.accent },
  headingMarkText: { color: C.primary, fontSize: 10, fontWeight: '800' },
  headingCopy: { flex: 1, gap: 3 },
  title: { color: C.foreground, fontSize: 15, fontWeight: '800' },
  subtitle: { color: C.mutedForeground, fontSize: 10 },
  figures: { flexDirection: 'row', gap: 6, padding: 8, borderRadius: 17, backgroundColor: C.background },
  figureWrap: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center' },
  viewLabel: { color: C.mutedForeground, fontSize: 8, fontWeight: '800', letterSpacing: 1, marginTop: -2 },
  roles: { gap: 12, paddingTop: 2 },
  roleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  roleDot: { width: 9, height: 9, borderRadius: 5, marginTop: 3 },
  roleCopy: { flex: 1, gap: 2 },
  roleTitle: { color: C.foreground, fontSize: 11, fontWeight: '700' },
  roleNames: { color: C.mutedForeground, fontSize: 11, lineHeight: 16 },
  note: { color: C.mutedForeground, fontSize: 9, lineHeight: 14, paddingTop: 3 },
});
