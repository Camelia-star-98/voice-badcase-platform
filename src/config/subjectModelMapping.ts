// 学科和模型ID的映射配置

export interface SubjectConfig {
  label: string;
  value: string;
  models: string[];
}

// 学科和模型ID的映射关系
export const subjectModelMapping: SubjectConfig[] = [
  {
    label: '语文',
    value: 'chinese',
    models: [
      'AIJHSChineseYangsisi1to1',
      'AICVJHSChineseYangsisi1to1',
      'AIJHSChineseYangsisi',
    ],
  },
  {
    label: '数学',
    value: 'math',
    models: [
      'AIJHSMathLiumengya1to1',
      'AICVJHSMathLiumengya1to1',
      'AIJHSMathLiumengya',
    ],
  },
  {
    label: '英语',
    value: 'english',
    models: [
      'AIJHSEnglishShixinyu1to1',
      'AICVJHSEnglishShixinyu1to1',
      'AIJHSEnglishShixinyu',
    ],
  },
  {
    label: '物理',
    value: 'physics',
    models: [
      'AIJHSPhysicsYangying1to1',
      'AICVJHSPhysicsYangying1to1',
      'AIJHSPhysicsYangying',
    ],
  },
  {
    label: '化学',
    value: 'chemistry',
    models: [
      'AIJHSChemistryZhuxin1to1',
      'AIJHSChemistryZhuxin',
    ],
  },
];

// 获取所有学科列表
export const getSubjectList = (): { label: string; value: string }[] => {
  return subjectModelMapping.map(item => ({
    label: item.label,
    value: item.value,
  }));
};

// 根据学科获取模型ID列表
export const getModelsBySubject = (subject: string): string[] => {
  const subjectConfig = subjectModelMapping.find(item => item.value === subject);
  return subjectConfig ? subjectConfig.models : [];
};

// 根据学科value获取学科label
export const getSubjectLabel = (subjectValue: string): string => {
  const subject = subjectModelMapping.find(item => item.value === subjectValue);
  return subject ? subject.label : subjectValue;
};

// 出现位置配置
export interface LocationConfig {
  label: string;
  value: string;
}

// 出现位置选项列表
export const locationOptions: LocationConfig[] = [
  { label: '大班衔接课互动', value: 'large_class_interactive' },
  { label: '一对一衔接课互动', value: 'one_on_one_interactive' },
  { label: '全程TTS做课', value: 'full_tts_lesson' },
  { label: '全程TTS互动', value: 'full_tts_interactive' },
  { label: '英语背单词', value: 'english_word_recitation' },
];

// 根据出现位置value获取label
export const getLocationLabel = (locationValue: string): string => {
  const location = locationOptions.find(item => item.value === locationValue);
  return location ? location.label : locationValue;
};

// 判断是否需要CMS课节ID（互动类需要）
export const requiresCmsId = (location: string): boolean => {
  return location === 'large_class_interactive' || location === 'one_on_one_interactive' || location === 'full_tts_interactive';
};

// 判断是否需要全程TTS课节ID
export const requiresFullTtsLessonId = (location: string): boolean => {
  return location === 'full_tts_lesson';
};

// 判断是否需要问题模型ID（互动类需要）
export const requiresModelId = (location: string): boolean => {
  return location === 'large_class_interactive' || location === 'one_on_one_interactive' || location === 'full_tts_interactive';
};

// 全程TTS互动的音色ID映射（cosy voice造数TTS）
export const fullTtsInteractiveVoiceMapping: Record<string, string> = {
  'chinese': 'AICVJHSChineseYangsisi1to1',      // 语文
  'math': 'AICVJHSMathLiumengya1to1',            // 数学
  'english': 'AICVJHSEnglishShixinyu1to1',       // 英语
  'physics': 'AICVJHSPhysicsYangying1to1',       // 物理
  // 化学暂未配置，如需添加请补充
};

// 全程TTS做课的音色ID映射
export const fullTtsLessonVoiceMapping: Record<string, string> = {
  'chinese': 'AIJHSChineseYangsisi1to1',         // 语文
  'math': 'AIJHSMathLiumengya1to1',              // 数学
  'english': 'AIJHSEnglishShixinyu1to1',         // 英语
  'physics': 'AIJHSPhysicsYangying1to1',         // 物理
  'chemistry': 'AIJHSChemistryZhuxin1to1',       // 化学
};

// 一对一衔接课互动的音色ID映射（小模型 1对1风格minimax造数TTS）
export const oneOnOneInteractiveVoiceMapping: Record<string, string> = {
  'chinese': 'AIJHSChineseYangsisi1to1',         // 语文
  'math': 'AIJHSMathLiumengya1to1',              // 数学
  'english': 'AIJHSEnglishShixinyu1to1',         // 英语
  'physics': 'AIJHSPhysicsYangying1to1',         // 物理
  'chemistry': 'AIJHSChemistryZhuxin1to1',       // 化学
};

// 大班衔接课互动的音色ID映射（小模型 大班课风格minimax造数TTS）
export const largeClassInteractiveVoiceMapping: Record<string, string> = {
  'chinese': 'AIJHSChineseYangsisi',             // 语文
  'math': 'AIJHSMathLiumengya',                  // 数学
  'english': 'AIJHSEnglishShixinyu',             // 英语
  'physics': 'AIJHSPhysicsYangying',             // 物理
  'chemistry': 'AIJHSChemistryZhuxin',           // 化学
};

// 根据学科和出现位置获取模型ID列表
// 根据不同场景返回对应的专用音色ID
export const getModelsBySubjectAndLocation = (subject: string, location?: string): string[] => {
  // 如果是全程TTS互动场景，返回专用的音色ID
  if (location === 'full_tts_interactive') {
    const voiceId = fullTtsInteractiveVoiceMapping[subject];
    return voiceId ? [voiceId] : [];
  }
  
  // 如果是全程TTS做课场景，返回专用的音色ID
  if (location === 'full_tts_lesson') {
    const voiceId = fullTtsLessonVoiceMapping[subject];
    return voiceId ? [voiceId] : [];
  }
  
  // 如果是一对一衔接课互动场景，返回专用的音色ID
  if (location === 'one_on_one_interactive') {
    const voiceId = oneOnOneInteractiveVoiceMapping[subject];
    return voiceId ? [voiceId] : [];
  }
  
  // 如果是大班衔接课互动场景，返回专用的音色ID
  if (location === 'large_class_interactive') {
    const voiceId = largeClassInteractiveVoiceMapping[subject];
    return voiceId ? [voiceId] : [];
  }
  
  // 其他场景返回该学科的所有模型ID
  return getModelsBySubject(subject);
};

