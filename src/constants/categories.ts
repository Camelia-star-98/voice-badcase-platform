/**
 * 分类选项常量
 * 统一管理所有分类相关的配置
 */

export const CATEGORY_OPTIONS = [
  { value: '读音错误', label: '读音错误' },
  { value: '停顿不当', label: '停顿不当' },
  { value: '重读不对', label: '重读不对' },
  { value: '语速突变', label: '语速突变' },
  { value: '音量突变', label: '音量突变' },
  { value: '音质问题', label: '音质问题' },
  { value: '其他', label: '其他' },
] as const;

/**
 * 出现位置选项
 */
export const LOCATION_OPTIONS = [
  { value: '全程TTS做课部分', label: '全程TTS做课部分' },
  { value: '行课互动部分', label: '行课互动部分' },
] as const;

/**
 * 学科选项
 */
export const SUBJECT_OPTIONS = [
  { value: 'math', label: '数学' },
  { value: 'chinese', label: '语文' },
  { value: 'english', label: '英语' },
] as const;

/**
 * 获取学科标签
 */
export function getSubjectLabel(value: string): string {
  const option = SUBJECT_OPTIONS.find(opt => opt.value === value);
  return option?.label || value;
}

