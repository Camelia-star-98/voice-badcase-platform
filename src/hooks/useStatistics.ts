import { useMemo } from 'react';
import { BadcaseData } from '../types';

// 统计数据类型
export interface StatisticsData {
  // 总体统计
  totalCount: number;
  pendingCount: number;
  processingCount: number;
  resolvedCount: number;
  
  // 按优先级分类统计
  statusDistribution: {
    name: string;
    value: number;
    percentage: number;
  }[];
  
  // 按时间趋势统计（每周）
  weeklyTrend: {
    week: string;
    P0: number;
    P1: number;
    P2: number;
    total: number;
  }[];
  
  // 按状态分类的时间趋势
  statusTrend: {
    week: string;
    pending: number;
    processing: number;
    resolved: number;
  }[];
  
  // 按分类统计
  categoryDistribution: {
    name: string;
    value: number;
  }[];
}

export const useStatistics = (badcaseList: BadcaseData[]): StatisticsData => {
  return useMemo(() => {
    // 1. 计算总体统计
    const totalCount = badcaseList.length;
    const pendingCount = badcaseList.filter(item => 
      item.status === 'pending'
    ).length;
    const processingCount = badcaseList.filter(item => 
      item.status === 'processing' || 
      item.status === 'algorithm_processing' || 
      item.status === 'engineering_processing'
    ).length;
    const resolvedCount = badcaseList.filter(item => 
      item.status === 'resolved'
    ).length;

    // 2. 状态分布（用于饼图）
    const statusDistribution = [
      {
        name: '待处理',
        value: pendingCount,
        percentage: totalCount > 0 ? (pendingCount / totalCount * 100) : 0
      },
      {
        name: '处理中',
        value: processingCount,
        percentage: totalCount > 0 ? (processingCount / totalCount * 100) : 0
      },
      {
        name: '已解决',
        value: resolvedCount,
        percentage: totalCount > 0 ? (resolvedCount / totalCount * 100) : 0
      }
    ].filter(item => item.value > 0); // 过滤掉值为0的项

    // 3. 按优先级分类（从分类推断）
    const getPriority = (category: string): string => {
      const highPriority = ['读音错误', '音质问题'];
      const mediumPriority = ['停顿不当', '重读不对'];
      
      if (highPriority.includes(category)) return 'P0';
      if (mediumPriority.includes(category)) return 'P1';
      return 'P2';
    };

    // 4. 按周统计（优先级趋势）
    const weeklyMap = new Map<string, { P0: number; P1: number; P2: number }>();
    
    badcaseList.forEach(item => {
      const date = new Date(item.date);
      const weekNumber = getWeekNumber(date);
      const weekKey = formatWeek(date);
      
      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, { P0: 0, P1: 0, P2: 0 });
      }
      
      const priority = getPriority(item.category);
      const weekData = weeklyMap.get(weekKey)!;
      
      if (priority === 'P0') weekData.P0++;
      else if (priority === 'P1') weekData.P1++;
      else weekData.P2++;
    });

    // 转换为数组并排序
    const weeklyTrend = Array.from(weeklyMap.entries())
      .map(([week, data]) => ({
        week,
        P0: data.P0,
        P1: data.P1,
        P2: data.P2,
        total: data.P0 + data.P1 + data.P2
      }))
      .sort((a, b) => a.week.localeCompare(b.week));

    // 5. 按状态的时间趋势
    const statusWeeklyMap = new Map<string, { pending: number; processing: number; resolved: number }>();
    
    badcaseList.forEach(item => {
      const date = new Date(item.date);
      const weekKey = formatWeek(date);
      
      if (!statusWeeklyMap.has(weekKey)) {
        statusWeeklyMap.set(weekKey, { pending: 0, processing: 0, resolved: 0 });
      }
      
      const weekData = statusWeeklyMap.get(weekKey)!;
      
      if (item.status === 'pending') {
        weekData.pending++;
      } else if (item.status === 'resolved') {
        weekData.resolved++;
      } else {
        weekData.processing++;
      }
    });

    const statusTrend = Array.from(statusWeeklyMap.entries())
      .map(([week, data]) => ({
        week,
        ...data
      }))
      .sort((a, b) => a.week.localeCompare(b.week));

    // 6. 按分类统计
    const categoryMap = new Map<string, number>();
    badcaseList.forEach(item => {
      const count = categoryMap.get(item.category) || 0;
      categoryMap.set(item.category, count + 1);
    });

    const categoryDistribution = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      totalCount,
      pendingCount,
      processingCount,
      resolvedCount,
      statusDistribution,
      weeklyTrend,
      statusTrend,
      categoryDistribution
    };
  }, [badcaseList]);
};

// 辅助函数：获取周数
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// 辅助函数：格式化周
function formatWeek(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

