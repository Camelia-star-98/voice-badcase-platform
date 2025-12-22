import { BadcaseData } from '../types';

// Mock数据生成函数
const generateMockData = (): BadcaseData[] => {
  const categories = ['读音错误', '停顿不当', '重读不对', '语速突变', '音量突变', '音质问题', '其他'];
  const statuses: ('pending' | 'processing' | 'resolved')[] = [
    'pending',
    'processing',
    'resolved',
  ];
  const subjects = ['chinese', 'math', 'english', 'physics', 'chemistry'];
  const modelsBySubject: Record<string, string[]> = {
    chinese: ['AIJHSChineseYangsisi1to1', 'AICVJHSChineseYangsisi1to1', 'AIJHSChineseYangsisi'],
    math: ['AIJHSMathLiumengya1to1', 'AICVJHSMathLiumengya1to1', 'AIJHSMathLiumengya'],
    english: ['AIJHSEnglishShixinyu1to1', 'AICVJHSEnglishShixinyu1to1', 'AIJHSEnglishShixinyu'],
    physics: ['AIJHSPhysicsYangying1to1', 'AICVJHSPhysicsYangying1to1', 'AIJHSPhysicsYangying'],
    chemistry: ['AIJHSChemistryZhuxin1to1', 'AIJHSChemistryZhuxin'],
  };
  const reporters = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'];
  const cmsIds = ['CMS-2023001', 'CMS-2023002', 'CMS-2023003', 'CMS-2024001', 'CMS-2024002', 'CMS-2024003', 'CMS-2024004', 'CMS-2024005'];
  const descriptions = [
    '发音不准确，声母或韵母错误',
    '停顿位置不合理，影响语义理解',
    '重读音节不正确，语气不自然',
    '语速忽快忽慢，听感不佳',
    '音量变化突兀，影响听觉体验',
    '音频存在杂音或音质不清晰',
    '语调不符合语境',
    '情感表达不够自然',
    '语音断句不当',
    '其他语音质量问题',
  ];

  const data: BadcaseData[] = [];
  const now = new Date();

  for (let i = 1; i <= 50; i++) {
    const date = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const createdAt = new Date(date.getTime() - Math.random() * 24 * 60 * 60 * 1000);
    
    // 生成期望修复日期（在提交日期后的1-60天内）
    const daysToFix = Math.floor(Math.random() * 60) + 1;
    const expectedFixDate = new Date(date.getTime() + daysToFix * 24 * 60 * 60 * 1000);
    
    // 随机选择一个学科
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    // 根据学科选择对应的模型ID
    const models = modelsBySubject[subject];
    const modelId = models[Math.floor(Math.random() * models.length)];
    
    data.push({
      id: `BC-${String(i).padStart(4, '0')}`,
      date: date.toISOString().split('T')[0],
      subject: subject,
      cmsId: Math.random() > 0.2 ? cmsIds[Math.floor(Math.random() * cmsIds.length)] : undefined,
      reporter: reporters[Math.floor(Math.random() * reporters.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      expectedFixDate: expectedFixDate.toISOString().split('T')[0],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      audioUrl: Math.random() > 0.3 ? `/audio/sample-${i}.mp3` : undefined,
      modelId: modelId,
      createdAt: createdAt.toLocaleString('zh-CN'),
      updatedAt: new Date(
        createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000
      ).toLocaleString('zh-CN'),
    });
  }

  return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const mockBadcaseList = generateMockData();

// 统计数据
export const getMockStatistics = () => {
  const data = mockBadcaseList;
  
  return {
    totalCases: data.length,
    resolvedCases: data.filter((item) => item.status === 'resolved').length,
    pendingCases: data.filter((item) => item.status === 'pending').length,
    processingCases: data.filter((item) => item.status === 'processing').length,
  };
};

