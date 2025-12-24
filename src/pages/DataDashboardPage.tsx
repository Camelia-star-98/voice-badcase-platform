import { Card, Row, Col, Statistic } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useBadcase } from '../contexts/BadcaseContext';
import { useStatistics } from '../hooks/useStatistics';
import { useRef, useEffect, useState } from 'react';

const DataDashboardPage = () => {
  const { badcaseList } = useBadcase();
  const stats = useStatistics(badcaseList);
  const chartRefs = useRef<any[]>([]);
  const [chartsReady, setChartsReady] = useState(false);

  // 等待数据加载后再渲染图表
  useEffect(() => {
    if (badcaseList && badcaseList.length >= 0) {
      // 延迟一小段时间确保 DOM 准备好
      const timer = setTimeout(() => {
        setChartsReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [badcaseList]);

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

  // 饼图配置 - Badcase累计修复占比
  const pieChartOption = {
    title: {
      text: 'Badcase累计修复占比',
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.name}: ${params.value} (${params.percent}%)`;
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: 10,
      data: stats.statusDistribution.map(item => item.name)
    },
    series: [
      {
        name: '状态分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {d}%',
          fontSize: 12
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: [
          { 
            value: stats.pendingCount, 
            name: '待处理',
            itemStyle: { color: '#1890ff' }
          },
          { 
            value: stats.processingCount, 
            name: '处理中',
            itemStyle: { color: '#52c41a' }
          },
          { 
            value: stats.resolvedCount, 
            name: '已解决',
            itemStyle: { color: '#faad14' }
          }
        ].filter(item => item.value > 0)
      }
    ]
  };

  // 柱状图配置 - 每周反馈Badcase数量（按优先级）
  const barChartOption = {
    title: {
      text: 'AI英语_每周_反馈Badcase_修复优先级',
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
      data: ['P0', 'P1', 'P2'],
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
      data: stats.weeklyTrend.map(item => item.week),
      axisLabel: {
        rotate: 45,
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      name: '数量'
    },
    series: [
      {
        name: 'P0',
        type: 'bar',
        stack: 'total',
        data: stats.weeklyTrend.map(item => item.P0),
        itemStyle: { color: '#ff4d4f' }
      },
      {
        name: 'P1',
        type: 'bar',
        stack: 'total',
        data: stats.weeklyTrend.map(item => item.P1),
        itemStyle: { color: '#faad14' }
      },
      {
        name: 'P2',
        type: 'bar',
        stack: 'total',
        data: stats.weeklyTrend.map(item => item.P2),
        itemStyle: { color: '#1890ff' }
      }
    ]
  };

  // 堆叠面积图配置 - 修复进度
  const areaChartOption = {
    title: {
      text: 'AI英语_每周_反馈Badcase_解决进度',
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
      data: stats.statusTrend.map(item => item.week),
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
        data: stats.statusTrend.map(item => {
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
        data: stats.statusTrend.map(item => {
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
        data: stats.statusTrend.map(item => {
          const total = item.pending + item.processing + item.resolved;
          return total > 0 ? ((item.resolved / total) * 100).toFixed(1) : 0;
        }),
        itemStyle: { color: '#faad14' }
      }
    ]
  };

  return (
    <div className="data-dashboard-page">
      {/* 标题区域 */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">AI英语TTS Badcase跟进</h1>
        <p className="dashboard-subtitle">
          每天自动化展示「反馈量、问题占比及解决进度」等数据摘要信息
        </p>
      </div>

      {/* 核心指标卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={24} md={8}>
          <Card className="metric-card metric-card-total">
            <Statistic
              title={<span style={{ fontSize: 16, fontWeight: 500 }}>Badcase累计总条数</span>}
              value={stats.totalCount}
              valueStyle={{ color: '#faad14', fontSize: 48, fontWeight: 'bold' }}
              suffix={<span style={{ fontSize: 18 }}>条</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} md={5}>
          <Card className="metric-card metric-card-pending">
            <Statistic
              title="待处理"
              value={stats.pendingCount}
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
              value={stats.processingCount}
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
              value={stats.resolvedCount}
              valueStyle={{ color: '#52c41a', fontSize: 28 }}
              prefix={<CheckCircleOutlined />}
              suffix="条"
            />
          </Card>
        </Col>
      </Row>

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

      {/* 按分类统计 */}
      {stats.categoryDistribution.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Card title="AI英语_每周_反馈Badcase_体感分类" className="chart-card">
              <Row gutter={[16, 16]}>
                {stats.categoryDistribution.map(category => (
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

