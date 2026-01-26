/**
 * Next方向业务配置
 * 包含 P00、P0、P1、P2 四个优先级
 */

// ========== 优先级配置 ==========

/**
 * Next方向优先级选项（包含 P00）
 */
export const NEXT_PRIORITY_OPTIONS = [
  { value: 'P00', label: 'P00：立刻修复', color: 'red' },
  { value: 'P0', label: 'P0：多天内修复', color: 'orange' },
  { value: 'P1', label: 'P1：多周内修复', color: 'blue' },
  { value: 'P2', label: 'P2：可先不修', color: 'default' },
] as const;

export type NextPriority = 'P00' | 'P0' | 'P1' | 'P2';

/**
 * 获取Next优先级颜色
 */
export function getNextPriorityColor(priority?: string): string {
  const colors: Record<string, string> = {
    P00: 'red',
    P0: 'orange',
    P1: 'blue',
    P2: 'default',
  };
  return colors[priority || ''] || 'default';
}

/**
 * 获取Next优先级文本
 */
export function getNextPriorityText(priority?: string): string {
  if (!priority) return '未填写';
  const texts: Record<string, string> = {
    P00: 'P00：立刻修复',
    P0: 'P0：多天内修复',
    P1: 'P1：多周内修复',
    P2: 'P2：可先不修',
  };
  // 非标准优先级（包括旧数据）统一显示为"未填写"
  return texts[priority] || '未填写';
}

// ========== 分类配置 ==========

/**
 * Next方向分类选项
 */
export const NEXT_CATEGORY_OPTIONS = [
  { value: '读音错误', label: '读音错误' },
  { value: '停顿不当', label: '停顿不当' },
  { value: '重读不对', label: '重读不对' },
  { value: '语速突变', label: '语速突变' },
  { value: '音量突变', label: '音量突变' },
  { value: '音质问题', label: '音质问题' },
  { value: '其他', label: '其他' },
] as const;

export type NextCategory = typeof NEXT_CATEGORY_OPTIONS[number]['value'];
