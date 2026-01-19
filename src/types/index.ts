// Badcase 数据类型
export interface BadcaseData {
  id: string;
  date: string;
  subject?: string; // 学科
  location?: string; // 出现位置：large_class_interactive（大班衔接课互动）、one_on_one_interactive（一对一衔接课互动）、full_tts_lesson（全程TTS做课）、full_tts_interactive（全程TTS互动）、english_word_recitation（英语背单词）
  fullTtsLessonId?: string; // 全程TTS课节ID（当location为fullTTS时）
  cmsId?: string; // CMS课程ID 或 CMS课节ID（当location为interactive时）
  reporter?: string; // 问题提报人
  category: string;
  expectedFixDate: string; // 期望修复时间
  status: 'pending' | 'algorithm_processing' | 'engineering_processing' | 'resolved' | 'processing';
  priority?: 'P00' | 'P0' | 'P1' | 'P2'; // 修复优先级：P00-立刻修复, P0-多天内修复, P1-多周内修复, P2-可先不修
  description: string;
  audioUrl?: string;
  videoUrl?: string; // 视频文件URL
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
  priority?: string; // 优先级筛选
}

