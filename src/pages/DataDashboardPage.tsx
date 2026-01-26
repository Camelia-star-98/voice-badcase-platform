import { Card, Row, Col, Statistic, DatePicker } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useSearchParams } from 'react-router-dom';
import { useBadcase } from '../contexts/BadcaseContext';
import { useStatistics } from '../hooks/useStatistics';
import { useRef, useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import type { BadcaseData } from '../types';
import BackButton from '../components/BackButton';

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;

const DataDashboardPage = () => {
  const [searchParams] = useSearchParams();
  const { badcaseList, currentBusiness, setCurrentBusiness } = useBadcase();
  
  // 从 URL 参数获取业务方向
  useEffect(() => {
    const business = searchParams.get('business') || 'next';
    setCurrentBusiness(business);
  }, [searchParams, setCurrentBusiness]);
  
  // 获取当前业务方向，用于返回按钮
  const business = searchParams.get('business') || 'next';
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>([
    dayjs().subtract(7, 'day'),
    dayjs()
  ]);
  const [filteredBadcaseList, setFilteredBadcaseList] = useState(badcaseList);
  
  // 全量数据统计（不受时间筛选影响）- 传入业务方向
  const allStats = useStatistics(badcaseList, business);
  // 筛选后的数据统计（用于图表）- 传入业务方向
  const filteredStats = useStatistics(filteredBadcaseList, business);
  
  const chartRefs = useRef<any[]>([]);
  const [chartsReady, setChartsReady] = useState(false);

  // 根据选择的日期范围过滤数据
  useEffect(() => {
    if (!badcaseList || badcaseList.length === 0) {
      setFilteredBadcaseList([]);
      return;
    }

    if (!dateRange) {
      // 如果没有选择日期范围，显示所有数据
      setFilteredBadcaseList(badcaseList);
      return;
    }

    const [startDate, endDate] = dateRange;
    const filtered = badcaseList.filter(item => {
      const itemDate = dayjs(item.date);
      return (itemDate.isAfter(startDate, 'day') || itemDate.isSame(startDate, 'day')) &&
             (itemDate.isBefore(endDate, 'day') || itemDate.isSame(endDate, 'day'));
    });

    setFilteredBadcaseList(filtered);
  }, [badcaseList, dateRange]);

  // 等待数据加载后再渲染图表
  useEffect(() => {
    if (filteredBadcaseList && filteredBadcaseList.length >= 0) {
      // 延迟一小段时间确保 DOM 准备好
      const timer = setTimeout(() => {
        setChartsReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [filteredBadcaseList]);

  // 组件卸载时清理所有图表实例
  useEffect(() => {
    return () => {
      chartRefs.current.forEach(ref => {
        if (ref && ref.getEchartsInstance) {
          try {
            const instance = ref.getEchartsInstance();
            if (instance && !instance.isDisposed()) {
              instance.dispose();
            }
          } catch (e) {
            // 忽略清理错误
          }
        }
      });
    };
  }, []);

  // 饼图配置 - Badcase累计修复占比（使用筛选后的数据）
  const pieChartOption = {
    title: {
      text: 'Badcase累计修复占比',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const statusName = params.name;
        const statusValue = params.value;
        const statusPercent = params.percent;
        
        // 计算该状态下各科目的占比
        let statusData: BadcaseData[] = [];
        if (statusName === '待处理') {
          statusData = filteredBadcaseList.filter(item => item.status === 'pending');
        } else if (statusName === '处理中') {
          statusData = filteredBadcaseList.filter(item => 
            item.status === 'processing' || 
            item.status === 'algorithm_processing' || 
            item.status === 'engineering_processing'
          );
        } else if (statusName === '已解决') {
          statusData = filteredBadcaseList.filter(item => item.status === 'resolved');
        }
        
        // 按科目统计
        const subjectMap = new Map<string, number>();
        statusData.forEach(item => {
          const subject = item.subject || '未分类';
          subjectMap.set(subject, (subjectMap.get(subject) || 0) + 1);
        });
        
        // 生成科目占比信息
        let subjectInfo = '';
        const sortedSubjects = Array.from(subjectMap.entries())
          .sort((a, b) => b[1] - a[1]);
        
        sortedSubjects.forEach(([subject, count]) => {
          const subjectPercent = statusValue > 0 ? ((count / statusValue) * 100).toFixed(1) : 0;
          const subjectLabel = subject === 'chinese' ? '语文' :
                               subject === 'math' ? '数学' :
                               subject === 'english' ? '英语' : subject;
          subjectInfo += `<br/><span style="color: #999; font-size: 12px;">　　${subjectLabel}: ${count}条 (${subjectPercent}%)</span>`;
        });
        
        return `<span style="font-weight: bold; font-size: 14px; color: #333;">${statusName}: ${statusValue}条 (${statusPercent}%)</span>${subjectInfo}`;
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: 5,
      data: filteredStats.statusDistribution.map(item => item.name)
    },
    series: [
      {
        name: '状态分布',
        type: 'pie',
        radius: ['35%', '60%'],
        center: ['50%', '52%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {d}%',
          fontSize: 12,
          position: 'outer',
          alignTo: 'edge',
          margin: 15,
          edgeDistance: 10
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 10,
          smooth: true
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        data: [
          { 
            value: filteredStats.pendingCount, 
            name: '待处理',
            itemStyle: { color: '#1890ff' }
          },
          { 
            value: filteredStats.processingCount, 
            name: '处理中',
            itemStyle: { color: '#52c41a' }
          },
          { 
            value: filteredStats.resolvedCount, 
            name: '已解决',
            itemStyle: { color: '#faad14' }
          }
        ].filter(item => item.value > 0)
      }
    ]
  };

  // 柱状图配置 - 每周反馈Badcase数量（按优先级）（使用筛选后的数据）
  // 根据业务方向动态生成系列数据
  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'P00': '#ff0000',  // 红色
      'P0': '#ff4d4f',   // 橙红
      'P1': '#faad14',   // 橙色
      'P2': '#1890ff',   // 蓝色
      '未填写': '#d9d9d9'  // 灰色
    };
    return colors[priority] || '#d9d9d9';
  };
  
  const barChartOption = {
    title: {
      text: '每周_反馈Badcase_修复优先级',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: filteredStats.priorityKeys,  // 动态优先级列表
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: filteredStats.weeklyTrend.map(item => item.week),
      axisLabel: {
        rotate: 45,
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      name: '数量'
    },
    series: filteredStats.priorityKeys.map(priority => ({
      name: priority,
        type: 'bar',
        stack: 'total',
      data: filteredStats.weeklyTrend.map(item => item[priority] || 0),
      itemStyle: { color: getPriorityColor(priority) }
    }))
  };

  // 堆叠面积图配置 - 修复进度（使用筛选后的数据）
  const areaChartOption = {
    title: {
      text: '每周_反馈Badcase_解决进度',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      formatter: (params: any) => {
        let result = `${params[0].axisValue}<br/>`;
        params.forEach((item: any) => {
          result += `${item.marker} ${item.seriesName}: ${item.value}%<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: ['待处理', '处理中', '已解决'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: filteredStats.statusTrend.map(item => item.week),
      axisLabel: {
        rotate: 45,
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      name: '百分比(%)'
    },
    series: [
      {
        name: '待处理',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: filteredStats.statusTrend.map(item => {
          const total = item.pending + item.processing + item.resolved;
          return total > 0 ? ((item.pending / total) * 100).toFixed(1) : 0;
        }),
        itemStyle: { color: '#1890ff' }
      },
      {
        name: '处理中',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: filteredStats.statusTrend.map(item => {
          const total = item.pending + item.processing + item.resolved;
          return total > 0 ? ((item.processing / total) * 100).toFixed(1) : 0;
        }),
        itemStyle: { color: '#52c41a' }
      },
      {
        name: '已解决',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: filteredStats.statusTrend.map(item => {
          const total = item.pending + item.processing + item.resolved;
          return total > 0 ? ((item.resolved / total) * 100).toFixed(1) : 0;
        }),
        itemStyle: { color: '#faad14' }
      }
    ]
  };

  return (
    <div className="data-dashboard-page">
      <BackButton to={`/business-portal?business=${business}`} />
      
      {/* 标题区域 */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          {business === 'fengling' ? '风灵方向badcase跟进' : 'NEXT方向badcase跟进'}
        </h1>
        <p className="dashboard-subtitle">
          每天自动化展示「反馈量、问题占比及解决进度」等数据摘要信息
        </p>
      </div>

      {/* 核心指标卡片 - 显示全量数据 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={24} md={8}>
          <Card className="metric-card metric-card-total">
            <Statistic
              title={<span style={{ fontSize: 16, fontWeight: 500 }}>Badcase累计总条数</span>}
              value={allStats.totalCount}
              valueStyle={{ color: '#faad14', fontSize: 48, fontWeight: 'bold' }}
              suffix={<span style={{ fontSize: 18 }}>条</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} md={5}>
          <Card className="metric-card metric-card-pending">
            <Statistic
              title="待处理"
              value={allStats.pendingCount}
              valueStyle={{ color: '#1890ff', fontSize: 28 }}
              prefix={<ClockCircleOutlined />}
              suffix="条"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} md={5}>
          <Card className="metric-card metric-card-processing">
            <Statistic
              title="处理中"
              value={allStats.processingCount}
              valueStyle={{ color: '#52c41a', fontSize: 28 }}
              prefix={<SyncOutlined spin />}
              suffix="条"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Card className="metric-card metric-card-resolved">
            <Statistic
              title="已上线并验证"
              value={allStats.resolvedCount}
              valueStyle={{ color: '#52c41a', fontSize: 28 }}
              prefix={<CheckCircleOutlined />}
              suffix="条"
            />
          </Card>
        </Col>
      </Row>

      {/* 时间筛选器 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 500, fontSize: 14 }}>选择时间范围：</span>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
            format="YYYY-MM-DD"
            allowClear
            style={{ width: 280 }}
            placeholder={['开始日期', '结束日期']}
          />
          {dateRange && (
            <span style={{ color: '#999', fontSize: 13 }}>
              共 {filteredBadcaseList.length} 条数据
            </span>
          )}
        </div>
      </Card>

      {/* 图表区域 */}
      {chartsReady && (
        <Row gutter={[16, 16]}>
          {/* 饼图 */}
          <Col xs={24} lg={12}>
            <Card className="chart-card">
              <ReactECharts 
                ref={(e) => chartRefs.current[0] = e}
                option={pieChartOption} 
                style={{ height: '400px' }}
                opts={{ renderer: 'svg' }}
                notMerge={true}
                lazyUpdate={true}
              />
            </Card>
          </Col>

          {/* 柱状图 - 优先级趋势 */}
          <Col xs={24} lg={12}>
            <Card className="chart-card">
              <ReactECharts 
                ref={(e) => chartRefs.current[1] = e}
                option={barChartOption} 
                style={{ height: '400px' }}
                opts={{ renderer: 'svg' }}
                notMerge={true}
                lazyUpdate={true}
              />
            </Card>
          </Col>

          {/* 堆叠面积图 - 解决进度 */}
          <Col xs={24}>
            <Card className="chart-card">
              <ReactECharts 
                ref={(e) => chartRefs.current[2] = e}
                option={areaChartOption} 
                style={{ height: '400px' }}
                opts={{ renderer: 'svg' }}
                notMerge={true}
                lazyUpdate={true}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 按分类统计 - 显示全量数据 */}
      {allStats.categoryDistribution.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Card title="每周_反馈Badcase_体感分类" className="chart-card">
              <Row gutter={[16, 16]}>
                {allStats.categoryDistribution.map(category => (
                  <Col key={category.name} xs={12} sm={8} md={6} lg={4}>
                    <Card 
                      size="small" 
                      className="category-card"
                      style={{ textAlign: 'center' }}
                    >
                      <Statistic
                        title={category.name}
                        value={category.value}
                        valueStyle={{ fontSize: 24, color: '#1890ff' }}
                        suffix="条"
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default DataDashboardPage;

