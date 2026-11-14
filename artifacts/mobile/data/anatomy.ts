export type MuscleId =
  | 'pec-major' | 'pec-clavicular' | 'deltoid-anterior' | 'deltoid-lateral' | 'deltoid-posterior'
  | 'triceps' | 'biceps' | 'brachialis' | 'forearm-flexors' | 'forearm-extensors'
  | 'latissimus' | 'trapezius' | 'lower-trapezius' | 'rhomboids' | 'teres-major' | 'rotator-cuff'
  | 'serratus-anterior' | 'erector-spinae' | 'rectus-abdominis' | 'external-oblique' | 'transverse-abdominis'
  | 'gluteus-maximus' | 'gluteus-medius' | 'quadriceps' | 'rectus-femoris' | 'vastus-lateralis'
  | 'vastus-medialis' | 'hamstrings' | 'biceps-femoris' | 'adductors' | 'hip-flexors'
  | 'gastrocnemius' | 'soleus' | 'tibialis-anterior';

export type MuscleRole = 'primary' | 'secondary' | 'stabilizer';
export type TrackingKind = 'strength' | 'running' | 'rounds';
export type MotionKind =
  | 'press-flat' | 'press-incline' | 'fly-mid' | 'fly-low' | 'push-up' | 'dip'
  | 'hinge' | 'row' | 'vertical-pull' | 'back-extension' | 'pullover'
  | 'squat' | 'front-squat' | 'leg-press' | 'knee-extension' | 'lunge'
  | 'knee-flexion' | 'hip-thrust' | 'bridge' | 'calf-raise' | 'hip-abduction'
  | 'overhead-press' | 'arnold-press' | 'lateral-raise' | 'front-raise' | 'face-pull'
  | 'rear-delt-fly' | 'upright-row' | 'curl' | 'hammer-curl' | 'preacher-curl'
  | 'triceps-pushdown' | 'skull-crusher' | 'overhead-triceps'
  | 'plank' | 'crunch' | 'leg-raise' | 'cable-crunch' | 'rotation' | 'rollout'
  | 'run' | 'boxing' | 'kickboxing' | 'judo';

export interface MuscleActivation {
  primary: MuscleId[];
  secondary: MuscleId[];
  stabilizers: MuscleId[];
}

export interface ExerciseAnatomy {
  muscles: MuscleActivation;
  motion: MotionKind;
  tracking?: TrackingKind;
}

export interface MuscleDefinition {
  id: MuscleId;
  name: string;
  view: 'front' | 'back';
  paths: string[];
  note: string;
}

const m = (
  primary: MuscleId[],
  secondary: MuscleId[] = [],
  stabilizers: MuscleId[] = [],
): MuscleActivation => ({ primary, secondary, stabilizers });

export const MUSCLE_DEFINITIONS: MuscleDefinition[] = [
  { id: 'pec-major', name: 'Большая грудная мышца', view: 'front', note: 'Приводит и вращает плечо внутрь.', paths: ['M96 93 C105 83 114 83 119 91 L117 112 C108 111 100 107 94 101 Z', 'M144 93 C135 83 126 83 121 91 L123 112 C132 111 140 107 146 101 Z'] },
  { id: 'pec-clavicular', name: 'Ключичная часть большой грудной', view: 'front', note: 'Помогает поднять плечо вперёд.', paths: ['M96 91 C103 84 112 84 119 91 L118 101 C109 99 102 97 96 91 Z', 'M144 91 C137 84 128 84 121 91 L122 101 C131 99 138 97 144 91 Z'] },
  { id: 'deltoid-anterior', name: 'Передняя дельтовидная', view: 'front', note: 'Поднимает плечо вперёд и помогает в жимах.', paths: ['M91 79 C82 81 77 90 79 102 L91 108 L98 91 Z', 'M149 79 C158 81 163 90 161 102 L149 108 L142 91 Z'] },
  { id: 'deltoid-lateral', name: 'Средняя дельтовидная', view: 'front', note: 'Отводит плечо в сторону.', paths: ['M81 84 C73 89 71 100 76 111 L84 117 L92 98 Z', 'M159 84 C167 89 169 100 164 111 L156 117 L148 98 Z'] },
  { id: 'deltoid-posterior', name: 'Задняя дельтовидная', view: 'back', note: 'Участвует в отведении плеча назад.', paths: ['M91 80 C81 82 77 91 80 103 L92 108 L99 91 Z', 'M149 80 C159 82 163 91 160 103 L148 108 L141 91 Z'] },
  { id: 'triceps', name: 'Трёхглавая мышца плеча', view: 'back', note: 'Разгибает локоть.', paths: ['M78 104 C72 115 69 132 68 145 L78 150 L86 119 Z', 'M162 104 C168 115 171 132 172 145 L162 150 L154 119 Z'] },
  { id: 'biceps', name: 'Двуглавая мышца плеча', view: 'front', note: 'Сгибает локоть и поворачивает предплечье.', paths: ['M78 105 C84 109 86 123 82 137 L74 144 L70 130 Z', 'M162 105 C156 109 154 123 158 137 L166 144 L170 130 Z'] },
  { id: 'brachialis', name: 'Плечевая мышца', view: 'front', note: 'Помогает сгибать локоть.', paths: ['M84 119 L91 123 L86 141 L78 143 Z', 'M156 119 L149 123 L154 141 L162 143 Z'] },
  { id: 'forearm-flexors', name: 'Сгибатели предплечья', view: 'front', note: 'Сгибают кисть и помогают удерживать хват.', paths: ['M70 151 L78 151 L84 184 L76 190 L67 166 Z', 'M170 151 L162 151 L156 184 L164 190 L173 166 Z'] },
  { id: 'forearm-extensors', name: 'Разгибатели предплечья', view: 'back', note: 'Разгибают кисть и помогают удерживать хват.', paths: ['M70 151 L79 149 L85 182 L76 190 L67 166 Z', 'M170 151 L161 149 L155 182 L164 190 L173 166 Z'] },
  { id: 'serratus-anterior', name: 'Передняя зубчатая', view: 'front', note: 'Стабилизирует лопатку на грудной клетке.', paths: ['M91 111 L99 113 L97 133 L88 128 Z', 'M149 111 L141 113 L143 133 L152 128 Z'] },
  { id: 'latissimus', name: 'Широчайшая мышца спины', view: 'back', note: 'Приводит и разгибает плечо.', paths: ['M96 106 C88 111 88 136 99 151 L111 159 L115 124 Z', 'M144 106 C152 111 152 136 141 151 L129 159 L125 124 Z'] },
  { id: 'trapezius', name: 'Трапециевидная мышца', view: 'back', note: 'Двигает и стабилизирует лопатки.', paths: ['M108 63 L120 70 L132 63 L148 97 L136 112 L120 104 L104 112 L92 97 Z'] },
  { id: 'lower-trapezius', name: 'Нижние пучки трапециевидной', view: 'back', note: 'Помогают опускать и стабилизировать лопатку.', paths: ['M116 104 L120 108 L124 104 L130 139 L120 148 L110 139 Z'] },
  { id: 'rhomboids', name: 'Ромбовидные мышцы', view: 'back', note: 'Сводят лопатки к позвоночнику.', paths: ['M105 95 L117 101 L116 124 L105 131 L99 112 Z', 'M135 95 L123 101 L124 124 L135 131 L141 112 Z'] },
  { id: 'teres-major', name: 'Большая круглая мышца', view: 'back', note: 'Помогает приводить плечо и тянуть локоть назад.', paths: ['M95 111 L106 108 L114 124 L104 135 L96 128 Z', 'M145 111 L134 108 L126 124 L136 135 L144 128 Z'] },
  { id: 'rotator-cuff', name: 'Мышцы вращательной манжеты', view: 'back', note: 'Стабилизируют головку плечевой кости.', paths: ['M86 89 L96 84 L104 97 L96 108 L86 103 Z', 'M154 89 L144 84 L136 97 L144 108 L154 103 Z'] },
  { id: 'erector-spinae', name: 'Разгибатели позвоночника', view: 'back', note: 'Удерживают и разгибают позвоночник.', paths: ['M114 111 L119 113 L118 176 L108 169 L108 132 Z', 'M126 111 L121 113 L122 176 L132 169 L132 132 Z'] },
  { id: 'rectus-abdominis', name: 'Прямая мышца живота', view: 'front', note: 'Сгибает туловище и помогает удерживать корпус.', paths: ['M110 116 L119 116 L119 165 L111 161 Z', 'M130 116 L121 116 L121 165 L129 161 Z'] },
  { id: 'external-oblique', name: 'Наружная косая мышца живота', view: 'front', note: 'Вращает и наклоняет туловище.', paths: ['M99 116 L109 120 L108 151 L98 145 L93 129 Z', 'M141 116 L131 120 L132 151 L142 145 L147 129 Z'] },
  { id: 'transverse-abdominis', name: 'Поперечная мышца живота', view: 'front', note: 'Глубокий стабилизатор корпуса.', paths: ['M107 139 L119 139 L119 159 L108 156 Z', 'M133 139 L121 139 L121 159 L132 156 Z'] },
  { id: 'gluteus-maximus', name: 'Большая ягодичная мышца', view: 'back', note: 'Разгибает тазобедренный сустав.', paths: ['M96 169 C103 161 114 161 119 170 L117 195 L101 198 L92 188 Z', 'M144 169 C137 161 126 161 121 170 L123 195 L139 198 L148 188 Z'] },
  { id: 'gluteus-medius', name: 'Средняя ягодичная мышца', view: 'back', note: 'Отводит бедро и стабилизирует таз.', paths: ['M96 165 C101 158 110 158 116 165 L113 178 L98 180 Z', 'M144 165 C139 158 130 158 124 165 L127 178 L142 180 Z'] },
  { id: 'quadriceps', name: 'Четырёхглавая мышца бедра', view: 'front', note: 'Разгибает колено.', paths: ['M99 206 C105 199 114 200 117 209 L114 263 L103 266 L96 230 Z', 'M141 206 C135 199 126 200 123 209 L126 263 L137 266 L144 230 Z'] },
  { id: 'rectus-femoris', name: 'Прямая мышца бедра', view: 'front', note: 'Разгибает колено и сгибает бедро.', paths: ['M108 207 L118 210 L116 261 L106 257 Z', 'M132 207 L122 210 L124 261 L134 257 Z'] },
  { id: 'vastus-lateralis', name: 'Латеральная широкая мышца бедра', view: 'front', note: 'Разгибает колено с наружной стороны бедра.', paths: ['M98 210 L106 207 L104 258 L96 248 Z', 'M142 210 L134 207 L136 258 L144 248 Z'] },
  { id: 'vastus-medialis', name: 'Медиальная широкая мышца бедра', view: 'front', note: 'Разгибает колено с внутренней стороны бедра.', paths: ['M106 250 L115 253 L113 270 L103 267 Z', 'M134 250 L125 253 L127 270 L137 267 Z'] },
  { id: 'hamstrings', name: 'Задняя группа мышц бедра', view: 'back', note: 'Сгибает колено и помогает разгибать бедро.', paths: ['M99 207 L109 205 L111 261 L101 255 Z', 'M141 207 L131 205 L129 261 L139 255 Z'] },
  { id: 'biceps-femoris', name: 'Двуглавая мышца бедра', view: 'back', note: 'Сгибает колено и разгибает бедро.', paths: ['M102 207 L110 207 L111 258 L104 262 Z', 'M138 207 L130 207 L129 258 L136 262 Z'] },
  { id: 'adductors', name: 'Приводящие мышцы бедра', view: 'front', note: 'Приводят бедро к средней линии тела.', paths: ['M117 202 L120 206 L119 251 L113 249 L110 218 Z', 'M123 202 L120 206 L121 251 L127 249 L130 218 Z'] },
  { id: 'hip-flexors', name: 'Сгибатели бедра', view: 'front', note: 'Поднимают бедро к туловищу.', paths: ['M105 177 L117 180 L115 205 L107 211 L101 194 Z', 'M135 177 L123 180 L125 205 L133 211 L139 194 Z'] },
  { id: 'gastrocnemius', name: 'Икроножная мышца', view: 'back', note: 'Поднимает пятку при согнутом или прямом колене.', paths: ['M101 300 C105 292 114 293 117 303 L114 349 L106 355 L100 332 Z', 'M139 300 C135 292 126 293 123 303 L126 349 L134 355 L140 332 Z'] },
  { id: 'soleus', name: 'Камбаловидная мышца', view: 'back', note: 'Помогает поднимать пятку, особенно при согнутом колене.', paths: ['M106 326 L114 323 L112 357 L106 360 Z', 'M134 326 L126 323 L128 357 L134 360 Z'] },
  { id: 'tibialis-anterior', name: 'Передняя большеберцовая мышца', view: 'front', note: 'Поднимает стопу вверх.', paths: ['M105 302 L113 300 L111 353 L106 357 Z', 'M135 302 L127 300 L129 353 L134 357 Z'] },
];

const muscleMap: Record<string, ExerciseAnatomy> = {
  'barbell-bench': { motion: 'press-flat', muscles: m(['pec-major'], ['deltoid-anterior', 'triceps'], ['rotator-cuff', 'serratus-anterior', 'transverse-abdominis']) },
  'incline-bench': { motion: 'press-incline', muscles: m(['pec-clavicular'], ['deltoid-anterior', 'triceps'], ['rotator-cuff', 'serratus-anterior']) },
  'dumbbell-bench': { motion: 'press-flat', muscles: m(['pec-major'], ['deltoid-anterior', 'triceps'], ['rotator-cuff', 'serratus-anterior', 'transverse-abdominis']) },
  'incline-dumbbell': { motion: 'press-incline', muscles: m(['pec-clavicular'], ['deltoid-anterior', 'triceps'], ['rotator-cuff', 'serratus-anterior']) },
  'cable-fly': { motion: 'fly-mid', muscles: m(['pec-major'], ['deltoid-anterior'], ['rotator-cuff', 'serratus-anterior', 'transverse-abdominis']) },
  'cable-fly-low': { motion: 'fly-low', muscles: m(['pec-clavicular'], ['deltoid-anterior'], ['rotator-cuff', 'serratus-anterior', 'transverse-abdominis']) },
  'pec-deck': { motion: 'fly-mid', muscles: m(['pec-major'], ['deltoid-anterior'], ['rotator-cuff']) },
  'push-up': { motion: 'push-up', muscles: m(['pec-major'], ['triceps', 'deltoid-anterior', 'serratus-anterior'], ['rectus-abdominis', 'gluteus-maximus', 'transverse-abdominis']) },
  'chest-dip': { motion: 'dip', muscles: m(['pec-major', 'triceps'], ['deltoid-anterior'], ['rotator-cuff', 'rectus-abdominis']) },
  deadlift: { motion: 'hinge', muscles: m(['gluteus-maximus', 'hamstrings'], ['erector-spinae', 'quadriceps', 'latissimus'], ['transverse-abdominis', 'forearm-flexors', 'trapezius']) },
  'barbell-row': { motion: 'row', muscles: m(['latissimus', 'rhomboids'], ['biceps', 'deltoid-posterior', 'trapezius'], ['erector-spinae', 'transverse-abdominis', 'forearm-flexors']) },
  'lat-pulldown': { motion: 'vertical-pull', muscles: m(['latissimus'], ['teres-major', 'biceps', 'rhomboids'], ['lower-trapezius', 'rotator-cuff', 'forearm-flexors']) },
  'seated-row': { motion: 'row', muscles: m(['rhomboids', 'latissimus'], ['trapezius', 'biceps', 'deltoid-posterior'], ['erector-spinae', 'transverse-abdominis', 'forearm-flexors']) },
  'one-arm-row': { motion: 'row', muscles: m(['latissimus'], ['rhomboids', 'biceps', 'teres-major'], ['erector-spinae', 'transverse-abdominis', 'forearm-flexors']) },
  'pull-up': { motion: 'vertical-pull', muscles: m(['latissimus'], ['biceps', 'teres-major', 'rhomboids'], ['lower-trapezius', 'transverse-abdominis', 'forearm-flexors']) },
  't-bar-row': { motion: 'row', muscles: m(['latissimus', 'rhomboids'], ['trapezius', 'biceps', 'deltoid-posterior'], ['erector-spinae', 'transverse-abdominis', 'forearm-flexors']) },
  'back-extension': { motion: 'back-extension', muscles: m(['erector-spinae'], ['gluteus-maximus', 'hamstrings'], ['transverse-abdominis']) },
  'cable-pullover': { motion: 'pullover', muscles: m(['latissimus'], ['teres-major', 'triceps'], ['rectus-abdominis', 'rotator-cuff']) },
  'back-squat': { motion: 'squat', muscles: m(['quadriceps', 'gluteus-maximus'], ['adductors', 'hamstrings'], ['erector-spinae', 'transverse-abdominis', 'gluteus-medius']) },
  'front-squat': { motion: 'front-squat', muscles: m(['quadriceps'], ['gluteus-maximus', 'adductors'], ['erector-spinae', 'transverse-abdominis', 'gluteus-medius']) },
  'leg-press': { motion: 'leg-press', muscles: m(['quadriceps', 'gluteus-maximus'], ['adductors', 'hamstrings'], ['transverse-abdominis', 'gluteus-medius']) },
  'leg-extension': { motion: 'knee-extension', muscles: m(['quadriceps', 'rectus-femoris', 'vastus-lateralis', 'vastus-medialis'], [], ['transverse-abdominis']) },
  'walking-lunge': { motion: 'lunge', muscles: m(['quadriceps', 'gluteus-maximus'], ['hamstrings', 'adductors'], ['gluteus-medius', 'transverse-abdominis']) },
  'bulgarian-split-squat': { motion: 'lunge', muscles: m(['quadriceps', 'gluteus-maximus'], ['hamstrings', 'adductors'], ['gluteus-medius', 'transverse-abdominis']) },
  'romanian-deadlift': { motion: 'hinge', muscles: m(['hamstrings', 'gluteus-maximus'], ['erector-spinae', 'adductors'], ['transverse-abdominis', 'latissimus']) },
  'leg-curl': { motion: 'knee-flexion', muscles: m(['hamstrings', 'biceps-femoris'], ['gastrocnemius'], ['gluteus-maximus']) },
  'hip-thrust': { motion: 'hip-thrust', muscles: m(['gluteus-maximus'], ['hamstrings', 'adductors'], ['transverse-abdominis', 'gluteus-medius']) },
  'glute-bridge': { motion: 'bridge', muscles: m(['gluteus-maximus'], ['hamstrings'], ['transverse-abdominis', 'gluteus-medius']) },
  'standing-calf-raise': { motion: 'calf-raise', muscles: m(['gastrocnemius'], ['soleus'], ['tibialis-anterior']) },
  'seated-calf-raise': { motion: 'calf-raise', muscles: m(['soleus'], ['gastrocnemius'], ['tibialis-anterior']) },
  'hip-abduction': { motion: 'hip-abduction', muscles: m(['gluteus-medius'], ['gluteus-maximus'], ['transverse-abdominis']) },
  'overhead-press': { motion: 'overhead-press', muscles: m(['deltoid-anterior', 'deltoid-lateral'], ['triceps', 'trapezius'], ['rotator-cuff', 'transverse-abdominis']) },
  'arnold-press': { motion: 'arnold-press', muscles: m(['deltoid-anterior', 'deltoid-lateral'], ['triceps'], ['rotator-cuff', 'transverse-abdominis']) },
  'lateral-raise': { motion: 'lateral-raise', muscles: m(['deltoid-lateral'], ['trapezius'], ['rotator-cuff']) },
  'front-raise': { motion: 'front-raise', muscles: m(['deltoid-anterior'], ['pec-clavicular'], ['rotator-cuff', 'transverse-abdominis']) },
  'face-pull': { motion: 'face-pull', muscles: m(['deltoid-posterior', 'rhomboids'], ['trapezius', 'rotator-cuff'], ['lower-trapezius']) },
  'rear-delt-fly': { motion: 'rear-delt-fly', muscles: m(['deltoid-posterior'], ['rhomboids', 'trapezius'], ['erector-spinae', 'transverse-abdominis']) },
  'upright-row': { motion: 'upright-row', muscles: m(['deltoid-lateral', 'trapezius'], ['biceps'], ['rotator-cuff', 'forearm-flexors']) },
  'barbell-curl': { motion: 'curl', muscles: m(['biceps'], ['brachialis', 'forearm-flexors'], ['transverse-abdominis']) },
  'dumbbell-curl': { motion: 'curl', muscles: m(['biceps'], ['brachialis', 'forearm-flexors'], ['transverse-abdominis']) },
  'hammer-curl': { motion: 'hammer-curl', muscles: m(['brachialis'], ['biceps', 'forearm-flexors'], ['transverse-abdominis']) },
  'preacher-curl': { motion: 'preacher-curl', muscles: m(['biceps'], ['brachialis', 'forearm-flexors'], []) },
  'triceps-pushdown': { motion: 'triceps-pushdown', muscles: m(['triceps'], [], ['forearm-flexors', 'transverse-abdominis']) },
  'skull-crusher': { motion: 'skull-crusher', muscles: m(['triceps'], ['deltoid-anterior'], ['rotator-cuff']) },
  'overhead-triceps': { motion: 'overhead-triceps', muscles: m(['triceps'], ['deltoid-anterior'], ['rotator-cuff', 'transverse-abdominis']) },
  plank: { motion: 'plank', muscles: m(['transverse-abdominis', 'rectus-abdominis'], ['gluteus-maximus', 'deltoid-anterior'], ['erector-spinae', 'serratus-anterior']) },
  crunch: { motion: 'crunch', muscles: m(['rectus-abdominis'], ['external-oblique'], ['transverse-abdominis']) },
  'hanging-leg-raise': { motion: 'leg-raise', muscles: m(['rectus-abdominis', 'hip-flexors'], ['external-oblique'], ['latissimus', 'forearm-flexors']) },
  'cable-crunch': { motion: 'cable-crunch', muscles: m(['rectus-abdominis'], ['external-oblique'], ['transverse-abdominis']) },
  'russian-twist': { motion: 'rotation', muscles: m(['external-oblique'], ['rectus-abdominis'], ['transverse-abdominis', 'hip-flexors']) },
  'ab-wheel': { motion: 'rollout', muscles: m(['rectus-abdominis', 'transverse-abdominis'], ['latissimus', 'deltoid-anterior'], ['gluteus-maximus', 'erector-spinae']) },
  running: { motion: 'run', tracking: 'running', muscles: m(['quadriceps', 'hamstrings', 'gastrocnemius'], ['gluteus-maximus', 'soleus', 'tibialis-anterior'], ['gluteus-medius', 'transverse-abdominis']) },
  boxing: { motion: 'boxing', tracking: 'rounds', muscles: m(['deltoid-anterior', 'triceps'], ['pec-major', 'serratus-anterior', 'external-oblique'], ['gluteus-maximus', 'quadriceps', 'transverse-abdominis']) },
  kickboxing: { motion: 'kickboxing', tracking: 'rounds', muscles: m(['quadriceps', 'gluteus-maximus', 'deltoid-anterior'], ['hamstrings', 'triceps', 'external-oblique'], ['gluteus-medius', 'transverse-abdominis', 'gastrocnemius']) },
  judo: { motion: 'judo', tracking: 'rounds', muscles: m(['latissimus', 'forearm-flexors', 'gluteus-maximus'], ['biceps', 'quadriceps', 'external-oblique'], ['erector-spinae', 'transverse-abdominis', 'gluteus-medius']) },
};

export function getExerciseAnatomy(id: string): ExerciseAnatomy {
  const detail = muscleMap[id];
  if (!detail) throw new Error('Missing exercise anatomy and motion profile: ' + id);
  return detail;
}

export const MUSCLE_ROLE_LABELS: Record<MuscleRole, string> = {
  primary: 'Основные',
  secondary: 'Помогают',
  stabilizer: 'Стабилизируют',
};
