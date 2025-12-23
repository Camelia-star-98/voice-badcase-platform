// Badcase 数据类型
export interface BadcaseData {
  id: string;
  date: string;
  subject?: string; // 学科
  location?: string; // 出现位置：fullTTS（全程TTS做课部分）或 interactive（行课互动部分）
  fullTtsLessonId?: string; // 全程TTS课节ID（当location为fullTTS时）
  cmsId?: string; // CMS课程ID 或 CMS课节ID（当location为interactive时）
  reporter?: string; // 问题提报人
  category: string;
  expectedFixDate: string; // 期望修复时间
  status: 'pending' | 'processing' | 'resolved';
  description: string;
  audioUrl?: string;
  modelId?: string; // 问题模型ID
  remark?: string; // 备注信息
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

