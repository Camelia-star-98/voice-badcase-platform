import { Card, Row, Col, Button } from 'antd';
import {
  RightOutlined,
  RocketOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <h1>欢迎使用语音Badcase数据可视化平台</h1>
      <p className="home-subtitle">请选择业务方向进入对应的Badcase管理系统</p>
      
      {/* 业务方向选择 */}
      <Row gutter={[24, 24]} style={{ marginTop: 40 }}>
        <Col xs={24} lg={12}>
          <Card 
            className="business-card next-card"
            hoverable
            onClick={() => navigate('/business-portal?business=next')}
          >
            <div className="business-card-content">
              <div className="business-icon next-icon">
                <RocketOutlined />
              </div>
              <div className="business-info">
                <h2>Next方向</h2>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<RightOutlined />}
                  className="enter-btn next-btn"
                >
                  进入Next方向badcase提报
                </Button>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            className="business-card fengling-card"
            hoverable
            onClick={() => navigate('/business-portal?business=fengling')}
          >
            <div className="business-card-content">
              <div className="business-icon fengling-icon">
                <ThunderboltOutlined />
              </div>
              <div className="business-info">
                <h2>风灵方向</h2>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<RightOutlined />}
                  className="enter-btn fengling-btn"
                >
                  进入风灵方向badcase提报
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 40 }} title="平台功能">
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
          <li>选择对应的业务方向（Next或风灵）进入系统</li>
          <li>点击左侧导航栏"数据统计"查看统计图表</li>
          <li>点击"Badcase列表"浏览和管理所有Badcase</li>
          <li>使用筛选器快速定位特定类型的Badcase</li>
        </ol>
      </Card>
    </div>
  );
};

export default HomePage;

