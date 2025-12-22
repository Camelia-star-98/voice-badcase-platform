import { useState } from 'react';
import { Card, Row, Col, DatePicker, Select, Space, Button } from 'antd';
import ReactECharts from 'echarts-for-react';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import './DataVisualizationPage.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const DataVisualizationPage = () => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);
  const [category, setCategory] = useState<string>('all');

  // 趋势图数据
  const getTrendOption = () => ({
    title: {
      text: 'Badcase趋势分析',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: ['新增', '已解决', '待处理'],
      top: 30,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '新增',
        type: 'line',
        data: [120, 132, 101, 134, 90, 230, 210],
        smooth: true,
        itemStyle: { color: '#1890ff' },
      },
      {
        name: '已解决',
        type: 'line',
        data: [85, 95, 78, 110, 75, 180, 165],
        smooth: true,
        itemStyle: { color: '#52c41a' },
      },
      {
        name: '待处理',
        type: 'line',
        data: [35, 37, 23, 24, 15, 50, 45],
        smooth: true,
        itemStyle: { color: '#faad14' },
      },
    ],
  });

  // 分类饼图数据
  const getCategoryPieOption = () => ({
    title: {
      text: 'Badcase分类分布',
      left: 'center',
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
        name: '分类',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}: {d}%',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        data: [
          { value: 285, name: '读音错误', itemStyle: { color: '#5470c6' } },
          { value: 220, name: '停顿不当', itemStyle: { color: '#91cc75' } },
          { value: 195, name: '重读不对', itemStyle: { color: '#fac858' } },
          { value: 165, name: '语速突变', itemStyle: { color: '#ee6666' } },
          { value: 148, name: '音量突变', itemStyle: { color: '#73c0de' } },
          { value: 176, name: '音质问题', itemStyle: { color: '#3ba272' } },
          { value: 100, name: '其他', itemStyle: { color: '#fc8452' } },
        ],
      },
    ],
  });

  // 学科分布柱状图
  const getSubjectBarOption = () => ({
    title: {
      text: '学科分布统计',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['语文', '数学', '英语', '物理', '化学'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '数量',
        type: 'bar',
        data: [
          { value: 320, itemStyle: { color: '#5470c6' } },
          { value: 280, itemStyle: { color: '#91cc75' } },
          { value: 389, itemStyle: { color: '#fac858' } },
          { value: 245, itemStyle: { color: '#ee6666' } },
          { value: 195, itemStyle: { color: '#73c0de' } },
        ],
        label: {
          show: true,
          position: 'top',
        },
        barWidth: '40%',
      },
    ],
  });

  // 状态分布环形图
  const getStatusPieOption = () => ({
    title: {
      text: '处理状态分布',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      bottom: 10,
      left: 'center',
    },
    series: [
      {
        name: '状态',
        type: 'pie',
        radius: ['50%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}: {c}',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        data: [
          { value: 856, name: '已解决', itemStyle: { color: '#52c41a' } },
          { value: 234, name: '处理中', itemStyle: { color: '#1890ff' } },
          { value: 199, name: '待处理', itemStyle: { color: '#faad14' } },
        ],
      },
    ],
  });

  // 热力图数据 - 按小时和星期
  const getHeatmapOption = () => {
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const data: [number, number, number][] = [];
    
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 24; j++) {
        data.push([j, i, Math.floor(Math.random() * 100)]);
      }
    }

    return {
      title: {
        text: 'Badcase时段热力图',
        left: 'center',
      },
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          return `${days[params.data[1]]} ${hours[params.data[0]]}<br/>数量: ${params.data[2]}`;
        },
      },
      grid: {
        height: '60%',
        top: '15%',
      },
      xAxis: {
        type: 'category',
        data: hours,
        splitArea: {
          show: true,
        },
      },
      yAxis: {
        type: 'category',
        data: days,
        splitArea: {
          show: true,
        },
      },
      visualMap: {
        min: 0,
        max: 100,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '5%',
        inRange: {
          color: ['#e0f3ff', '#1890ff', '#0050b3'],
        },
      },
      series: [
        {
          name: 'Badcase数量',
          type: 'heatmap',
          data: data,
          label: {
            show: false,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
  };

  // 对比雷达图
  const getRadarOption = () => ({
    title: {
      text: '各类别指标对比',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      bottom: 10,
      left: 'center',
    },
    radar: {
      indicator: [
        { name: '识别准确度', max: 100 },
        { name: '响应速度', max: 100 },
        { name: '音质评分', max: 100 },
        { name: '用户满意度', max: 100 },
        { name: '系统稳定性', max: 100 },
      ],
    },
    series: [
      {
        name: '指标对比',
        type: 'radar',
        data: [
          {
            value: [85, 90, 75, 88, 92],
            name: '本周',
            areaStyle: {
              color: 'rgba(24, 144, 255, 0.3)',
            },
            itemStyle: { color: '#1890ff' },
          },
          {
            value: [80, 85, 70, 82, 88],
            name: '上周',
            areaStyle: {
              color: 'rgba(82, 196, 26, 0.3)',
            },
            itemStyle: { color: '#52c41a' },
          },
        ],
      },
    ],
  });

  const handleRefresh = () => {
    // 刷新数据逻辑
    console.log('刷新数据');
  };

  const handleExport = () => {
    // 导出数据逻辑
    console.log('导出数据');
  };

  return (
    <div className="data-visualization-page">
      <div className="filter-section">
        <Card>
          <Space wrap size="large">
            <Space direction="vertical" size="small">
              <span>时间范围：</span>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs])}
                format="YYYY-MM-DD"
              />
            </Space>
            <Space direction="vertical" size="small">
              <span>分类：</span>
              <Select
                value={category}
                onChange={setCategory}
                style={{ width: 200 }}
              >
                <Option value="all">全部</Option>
                <Option value="pronunciation">读音错误</Option>
                <Option value="pause">停顿不当</Option>
                <Option value="stress">重读不对</Option>
                <Option value="speed">语速突变</Option>
                <Option value="volume">音量突变</Option>
                <Option value="quality">音质问题</Option>
                <Option value="other">其他</Option>
              </Select>
            </Space>
            <Space style={{ marginTop: 20 }}>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
              >
                刷新
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleExport}>
                导出数据
              </Button>
            </Space>
          </Space>
        </Card>
      </div>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card>
            <ReactECharts option={getTrendOption()} style={{ height: 400 }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card>
            <ReactECharts
              option={getCategoryPieOption()}
              style={{ height: 400 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card>
            <ReactECharts
              option={getSubjectBarOption()}
              style={{ height: 350 }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card>
            <ReactECharts
              option={getStatusPieOption()}
              style={{ height: 350 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts
              option={getHeatmapOption()}
              style={{ height: 400 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={getRadarOption()} style={{ height: 400 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DataVisualizationPage;

