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

