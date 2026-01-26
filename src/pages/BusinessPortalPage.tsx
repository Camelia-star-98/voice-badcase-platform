import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Row, Col } from 'antd';
import { BarChartOutlined, UnorderedListOutlined, SwapOutlined } from '@ant-design/icons';
import BackButton from '../components/BackButton';
import './BusinessPortalPage.css';

const BusinessPortalPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const business = searchParams.get('business') || 'next';
  
  const businessConfig = {
    next: {
      name: 'Next方向',
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    fengling: {
      name: '风灵方向',
      color: '#f093fb',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    }
  };

  const config = businessConfig[business as keyof typeof businessConfig];

  useEffect(() => {
    // 设置当前业务方向到 localStorage
    localStorage.setItem('currentBusiness', business);
  }, [business]);

  const menuItems = [
    {
      title: 'Badcase列表',
      icon: <UnorderedListOutlined />,
      description: '查看和管理所有Badcase记录',
      path: `/badcase-list?business=${business}`
    },
    {
      title: '流转状态',
      icon: <SwapOutlined />,
      description: '跟踪Badcase处理流程和状态',
      path: `/status-flow?business=${business}`
    },
    {
      title: '数据统计',
      icon: <BarChartOutlined />,
      description: '查看多维度数据分析和报表',
      path: `/data-dashboard?business=${business}`
    }
  ];

  return (
    <div className="business-portal-page">
      <BackButton to="/home" />
      
      <div className="portal-header" style={{ background: config.gradient }}>
        <h1>{config.name}</h1>
        <p>请选择功能模块</p>
      </div>

      <Row gutter={[24, 24]} style={{ marginTop: 40, padding: '0 40px' }}>
        {menuItems.map((item, index) => (
          <Col xs={24} md={8} key={index}>
            <Card
              className="portal-menu-card"
              hoverable
              onClick={() => navigate(item.path)}
            >
              <div className="menu-icon" style={{ color: config.color }}>
                {item.icon}
              </div>
              <h2>{item.title}</h2>
              <p className="menu-desc">{item.description}</p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default BusinessPortalPage;
