import { BadcaseData } from '../types';

// Mock数据生成函数 - 已清空，不再生成测试数据
const generateMockData = (): BadcaseData[] => {
  // 返回空数组，不生成任何测试数据
  return [];
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

