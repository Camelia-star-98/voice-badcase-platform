import { useMemo } from 'react';
import { BadcaseData } from '../types';

// 统计数据类型（动态优先级字段）
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
  
  // 按时间趋势统计（每周）- 使用动态的优先级字段
  weeklyTrend: {
    week: string;
    [key: string]: number | string;  // 动态优先级字段
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
  
  // 实际使用的优先级列表（用于图表渲染）
  priorityKeys: string[];
}

export const useStatistics = (badcaseList: BadcaseData[], business: string = 'next'): StatisticsData => {
  return useMemo(() => {
    // 1. 计算总体统计
    const totalCount = badcaseList.length;
    const pendingCount = badcaseList.filter(item => 
      item.status === 'pending'
    ).length;
    // 将 algorithm_processing, engineering_processing, processing 都归入 processingCount
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

    // 3. 按周统计（动态优先级字段，根据业务方向）
    // 确定实际使用的优先级列表
    const priorityKeys = business === 'fengling' 
      ? ['P0', 'P1', 'P2', '未填写']  // 风灵：无P00
      : ['P00', 'P0', 'P1', 'P2', '未填写'];  // Next：有P00
    
    const weeklyMap = new Map<string, Record<string, number>>();
    
    badcaseList.forEach(item => {
      const date = new Date(item.date);
      const weekKey = formatWeek(date);
      
      if (!weeklyMap.has(weekKey)) {
        const initData: Record<string, number> = {};
        priorityKeys.forEach(key => {
          initData[key] = 0;
        });
        weeklyMap.set(weekKey, initData);
      }
      
      const weekData = weeklyMap.get(weekKey)!;
      
      // 根据实际优先级值统计
      const priority = item.priority;
      if (priority && priorityKeys.includes(priority)) {
        weekData[priority]++;
      } else {
        weekData['未填写']++;
      }
    });

    // 转换为数组并排序
    const weeklyTrend = Array.from(weeklyMap.entries())
      .map(([week, data]) => {
        const total = priorityKeys.reduce((sum, key) => sum + (data[key] || 0), 0);
        return {
          week,
          ...data,
          total
        };
      })
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
        // algorithm_processing, engineering_processing, processing 都归入 processing
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
      categoryDistribution,
      priorityKeys  // 返回实际使用的优先级列表
    };
  }, [badcaseList, business]);
};

// 辅助函数：格式化周
function formatWeek(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

