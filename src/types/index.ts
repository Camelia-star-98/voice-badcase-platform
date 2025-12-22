// Badcase 数据类型
export interface BadcaseData {
  id: string;
  date: string;
  subject?: string; // 学科
  cmsId?: string; // CMS课程ID
  reporter?: string; // 问题提报人
  category: string;
  expectedFixDate: string; // 期望修复时间
  status: 'pending' | 'processing' | 'resolved';
  description: string;
  audioUrl?: string;
  modelId?: string; // 问题模型ID
  createdAt: string;
  updatedAt: string;
}

// 统计数据类型
export interface StatisticsData {
  totalCases: number;
  resolvedCases: number;
  pendingCases: number;
  processingCases: number;
  categoryDistribution: CategoryStats[];
  trendData: TrendData[];
}

export interface CategoryStats {
  name: string;
  value: number;
}

export interface TrendData {
  date: string;
  count: number;
  resolved: number;
}

// 过滤器类型
export interface FilterOptions {
  dateRange?: [string, string];
  category?: string;
  expectedFixDateRange?: [string, string];
  status?: string;
}

