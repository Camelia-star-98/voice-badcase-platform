/**
 * 风灵方向业务配置
 * 与 Next 方向配置完全独立
 */

// ========== 优先级配置 ==========

/**
 * 风灵方向优先级选项（只有 P0、P1、P2）
 */
export const FENGLING_PRIORITY_OPTIONS = [
  { value: 'P0', label: 'P0：多天内修复', color: 'orange' },
  { value: 'P1', label: 'P1：多周内修复', color: 'blue' },
  { value: 'P2', label: 'P2：可先不修', color: 'default' },
] as const;

export type FenglingPriority = 'P0' | 'P1' | 'P2';

/**
 * 获取风灵优先级颜色
 */
export function getFenglingPriorityColor(priority?: string): string {
  const colors: Record<string, string> = {
    P0: 'orange',
    P1: 'blue',
    P2: 'default',
  };
  return colors[priority || ''] || 'default';
}

/**
 * 获取风灵优先级文本
 */
export function getFenglingPriorityText(priority?: string): string {
  if (!priority) return '未填写';
  const texts: Record<string, string> = {
    P0: 'P0：多天内修复',
    P1: 'P1：多周内修复',
    P2: 'P2：可先不修',
  };
  // 非标准优先级（包括旧数据）统一显示为"未填写"
  return texts[priority] || '未填写';
}

// ========== 分类配置 ==========

/**
 * 风灵方向主分类（TTS、ASR、VAD）
 */
export const FENGLING_MAIN_CATEGORIES = [
  { value: 'TTS', label: 'TTS' },
  { value: 'ASR', label: 'ASR' },
  { value: 'VAD', label: 'VAD' },
] as const;

/**
 * 风灵方向 TTS 子分类
 */
export const FENGLING_TTS_SUBCATEGORIES = [
  { value: 'TTS-读音错误', label: '读音错误' },
  { value: 'TTS-停顿不当', label: '停顿不当' },
  { value: 'TTS-重读不对', label: '重读不对' },
  { value: 'TTS-语速突变', label: '语速突变' },
  { value: 'TTS-音量突变', label: '音量突变' },
  { value: 'TTS-音质问题', label: '音质问题' },
  { value: 'TTS-其他', label: '其他' },
] as const;

/**
 * 风灵方向 ASR 子分类
 */
export const FENGLING_ASR_SUBCATEGORIES = [
  { value: 'ASR-识别错误', label: '识别错误' },
  { value: 'ASR-漏识别', label: '漏识别' },
  { value: 'ASR-误识别', label: '误识别' },
  { value: 'ASR-响应慢', label: '响应慢' },
  { value: 'ASR-其他', label: '其他' },
] as const;

/**
 * 风灵方向 VAD 子分类
 */
export const FENGLING_VAD_SUBCATEGORIES = [
  { value: 'VAD-截断问题', label: '截断问题' },
  { value: 'VAD-延迟问题', label: '延迟问题' },
  { value: 'VAD-灵敏度问题', label: '灵敏度问题' },
  { value: 'VAD-其他', label: '其他' },
] as const;

/**
 * 根据主分类获取子分类选项
 */
export function getFenglingSubcategories(mainCategory: string) {
  switch (mainCategory) {
    case 'TTS':
      return FENGLING_TTS_SUBCATEGORIES;
    case 'ASR':
      return FENGLING_ASR_SUBCATEGORIES;
    case 'VAD':
      return FENGLING_VAD_SUBCATEGORIES;
    default:
      return [];
  }
}

/**
 * 获取风灵分类的显示文本
 */
export function getFenglingCategoryLabel(category: string): string {
  // 如果是带前缀的子分类（如 "TTS-读音错误"），提取显示部分
  if (category.includes('-')) {
    const [main, sub] = category.split('-');
    return `${main} - ${sub}`;
  }
  return category;
}

/**
 * 获取风灵分类的主分类
 */
export function getFenglingMainCategory(category: string): string {
  if (category.includes('-')) {
    return category.split('-')[0];
  }
  return category;
}

/**
 * 所有风灵分类选项（用于筛选）
 */
export const FENGLING_ALL_CATEGORIES = [
  ...FENGLING_TTS_SUBCATEGORIES,
  ...FENGLING_ASR_SUBCATEGORIES,
  ...FENGLING_VAD_SUBCATEGORIES,
] as const;

// ========== 类型定义 ==========

export type FenglingMainCategory = 'TTS' | 'ASR' | 'VAD';
export type FenglingCategory = 
  | typeof FENGLING_TTS_SUBCATEGORIES[number]['value']
  | typeof FENGLING_ASR_SUBCATEGORIES[number]['value']
  | typeof FENGLING_VAD_SUBCATEGORIES[number]['value'];
