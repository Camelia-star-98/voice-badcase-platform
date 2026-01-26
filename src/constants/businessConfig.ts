/**
 * 业务配置工厂
 * 根据业务方向返回对应的配置
 */

import {
  NEXT_PRIORITY_OPTIONS,
  NEXT_CATEGORY_OPTIONS,
  getNextPriorityColor,
  getNextPriorityText,
  NextPriority,
} from './nextConfig';

import {
  FENGLING_PRIORITY_OPTIONS,
  FENGLING_MAIN_CATEGORIES,
  FENGLING_ALL_CATEGORIES,
  getFenglingPriorityColor,
  getFenglingPriorityText,
  getFenglingSubcategories,
  getFenglingCategoryLabel,
  getFenglingMainCategory,
  FenglingPriority,
} from './fenglingConfig';

export type BusinessType = 'next' | 'fengling';

/**
 * 获取优先级选项
 */
export function getPriorityOptions(business: BusinessType) {
  return business === 'fengling' ? FENGLING_PRIORITY_OPTIONS : NEXT_PRIORITY_OPTIONS;
}

/**
 * 获取优先级颜色
 */
export function getPriorityColor(priority: string | undefined, business: BusinessType): string {
  return business === 'fengling' 
    ? getFenglingPriorityColor(priority) 
    : getNextPriorityColor(priority);
}

/**
 * 获取优先级文本
 */
export function getPriorityText(priority: string | undefined, business: BusinessType): string {
  return business === 'fengling' 
    ? getFenglingPriorityText(priority) 
    : getNextPriorityText(priority);
}

/**
 * 获取分类选项（Next 返回扁平列表，风灵返回主分类）
 */
export function getCategoryOptions(business: BusinessType) {
  return business === 'fengling' ? FENGLING_MAIN_CATEGORIES : NEXT_CATEGORY_OPTIONS;
}

/**
 * 获取所有分类选项（用于筛选）
 */
export function getAllCategoryOptions(business: BusinessType) {
  return business === 'fengling' ? FENGLING_ALL_CATEGORIES : NEXT_CATEGORY_OPTIONS;
}

/**
 * 获取分类显示文本
 */
export function getCategoryLabel(category: string, business: BusinessType): string {
  if (business === 'fengling') {
    return getFenglingCategoryLabel(category);
  }
  return category;
}

/**
 * 获取子分类选项（仅风灵使用）
 */
export function getSubcategoryOptions(mainCategory: string, business: BusinessType) {
  if (business === 'fengling') {
    return getFenglingSubcategories(mainCategory);
  }
  return [];
}

/**
 * 获取主分类（仅风灵使用）
 */
export function getMainCategory(category: string, business: BusinessType): string {
  if (business === 'fengling') {
    return getFenglingMainCategory(category);
  }
  return category;
}

/**
 * 验证优先级是否有效
 */
export function isValidPriority(priority: string, business: BusinessType): boolean {
  const options = getPriorityOptions(business);
  return options.some(opt => opt.value === priority);
}

// 导出类型
export type { NextPriority, FenglingPriority };
