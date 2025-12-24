import { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  UnorderedListOutlined,
  SwapOutlined,
  BarChartOutlined,
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: '/home',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/badcase-list',
      icon: <UnorderedListOutlined />,
      label: 'Badcase列表',
    },
    {
      key: '/status-flow',
      icon: <SwapOutlined />,
      label: '流转状态',
    },
    {
      key: '/data-dashboard',
      icon: <BarChartOutlined />,
      label: '数据统计',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div
          style={{
            height: 32,
            margin: 16,
            color: 'white',
            fontSize: collapsed ? 16 : 20,
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          {collapsed ? 'VB' : '语音Badcase平台'}
        </div>
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          mode="inline"
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer }}>
          <h2 style={{ margin: 0 }}>语音Badcase数据可视化平台</h2>
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;

