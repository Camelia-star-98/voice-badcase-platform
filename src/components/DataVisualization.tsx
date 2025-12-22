import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Spin, Statistic, message } from 'antd'
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { getStatistics, type Statistics } from '../services/api'

const DataVisualization: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<Statistics | null>(null)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    setLoading(true)
    try {
      const data = await getStatistics()
      setStats(data)
    } catch (error) {
      message.error('加载统计数据失败')
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!stats) {
    return null
  }

  // 状态分布饼图配置
  const statusChartOption: EChartsOption = {
    title: {
      text: '问题状态分布',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
    },
    series: [
      {
        name: '状态分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}: {c}',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        data: stats.statusDistribution.map((item) => ({
          value: item.count,
          name: item.status,
          itemStyle: {
            color:
              item.status === '修复中'
                ? '#faad14'
                : item.status === '待确认'
                ? '#1890ff'
                : item.status === '已上线并验证'
                ? '#52c41a'
                : item.status === '已关闭'
                ? '#8c8c8c'
                : '#d9d9d9',
          },
        })),
      },
    ],
  }

  // 优先级分布饼图配置
  const priorityChartOption: EChartsOption = {
    title: {
      text: '优先级分布',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
    },
    series: [
      {
        name: '优先级分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}: {c}',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        data: stats.priorityDistribution.map((item) => ({
          value: item.count,
          name: item.priority,
          itemStyle: {
            color:
              item.priority === 'P00'
                ? '#ff4d4f'
                : item.priority === 'P0'
                ? '#ff7a45'
                : item.priority === 'P1'
                ? '#ffa940'
                : '#52c41a',
          },
        })),
      },
    ],
  }

  // 每日反馈趋势折线图配置
  const trendChartOption: EChartsOption = {
    title: {
      text: '近30天反馈趋势',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: stats.dailyTrend.map((item) => item.date),
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      name: '问题数量',
    },
    series: [
      {
        name: '问题数量',
        type: 'line',
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(24, 144, 255, 0.3)',
              },
              {
                offset: 1,
                color: 'rgba(24, 144, 255, 0.05)',
              },
            ],
          },
        },
        lineStyle: {
          color: '#1890ff',
          width: 2,
        },
        itemStyle: {
          color: '#1890ff',
        },
        data: stats.dailyTrend.map((item) => item.count),
      },
    ],
  }

  // 反馈来源柱状图配置
  const sourceChartOption: EChartsOption = {
    title: {
      text: '反馈来源分布',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: {
      type: 'category',
      data: stats.sourceDistribution.map((item) => item.source || '未知'),
      axisLabel: {
        interval: 0,
        rotate: 30,
      },
    },
    yAxis: {
      type: 'value',
      name: '问题数量',
    },
    series: [
      {
        name: '问题数量',
        type: 'bar',
        data: stats.sourceDistribution.map((item) => item.count),
        itemStyle: {
          color: '#1890ff',
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: '#40a9ff',
          },
        },
      },
    ],
  }

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="问题总数"
              value={stats.totalCount}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已解决"
              value={stats.resolvedCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="进行中"
              value={stats.inProgressCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="高优先级(P00/P0)"
              value={stats.highPriorityCount}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={statusChartOption} style={{ height: 400 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={priorityChartOption} style={{ height: 400 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card>
            <ReactECharts option={trendChartOption} style={{ height: 400 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card>
            <ReactECharts option={sourceChartOption} style={{ height: 400 }} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DataVisualization

