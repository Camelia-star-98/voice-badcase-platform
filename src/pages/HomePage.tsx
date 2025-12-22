import { Card, Row, Col, Statistic } from 'antd';
import {
  SoundOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <h1>欢迎使用语音Badcase数据可视化平台</h1>
      
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总Badcase数"
              value={1289}
              prefix={<SoundOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已解决"
              value={856}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="处理中"
              value={234}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待处理"
              value={199}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }} title="平台功能">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card type="inner" title="📊 数据可视化">
              <p>通过多维度图表展示Badcase数据，包括：</p>
              <ul>
                <li>趋势分析：查看Badcase随时间的变化趋势</li>
                <li>分类统计：按类别、严重程度统计分布</li>
                <li>状态监控：实时监控处理进度</li>
                <li>对比分析：多维度数据对比</li>
              </ul>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card type="inner" title="📝 Badcase管理">
              <p>全面的Badcase管理功能：</p>
              <ul>
                <li>列表查看：分页展示所有Badcase</li>
                <li>筛选搜索：按多个维度快速筛选</li>
                <li>详情查看：查看Badcase详细信息</li>
                <li>音频播放：在线播放相关音频文件</li>
              </ul>
            </Card>
          </Col>
        </Row>
      </Card>

      <Card style={{ marginTop: 24 }} title="快速开始">
        <ol>
          <li>点击左侧导航栏"数据可视化"查看统计图表</li>
          <li>点击"Badcase列表"浏览和管理所有Badcase</li>
          <li>使用筛选器快速定位特定类型的Badcase</li>
          <li>导出数据进行深度分析</li>
        </ol>
      </Card>
    </div>
  );
};

export default HomePage;

