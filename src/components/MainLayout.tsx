import { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import { Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import type { MenuProps } from 'antd';
import {
  HomeOutlined,
  UnorderedListOutlined,
  SwapOutlined,
  BarChartOutlined,
  RocketOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';

const { Content, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>(['next', 'fengling']);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 根据当前路径和参数确定选中的菜单项
  const getSelectedKey = () => {
    const business = searchParams.get('business') || 'next';
    const path = location.pathname;
    
    if (path === '/home') return '/home';
    if (path === '/badcase-list') return `/badcase-list-${business}`;
    if (path === '/status-flow') return `/status-flow-${business}`;
    if (path === '/data-dashboard') return `/data-dashboard-${business}`;
    
    return '/home';
  };

  // 菜单项定义
  const menuItems: MenuItem[] = [
    {
      key: '/home',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: 'next',
      icon: <RocketOutlined />,
      label: 'Next方向case',
      children: [
        {
          key: '/badcase-list-next',
          icon: <UnorderedListOutlined />,
          label: 'Badcase列表',
        },
        {
          key: '/status-flow-next',
          icon: <SwapOutlined />,
          label: '流转状态',
        },
        {
          key: '/data-dashboard-next',
          icon: <BarChartOutlined />,
          label: '数据统计',
        },
      ],
    },
    {
      key: 'fengling',
      icon: <ThunderboltOutlined />,
      label: '风灵方向case',
      children: [
        {
          key: '/badcase-list-fengling',
          icon: <UnorderedListOutlined />,
          label: 'Badcase列表',
        },
        {
          key: '/status-flow-fengling',
          icon: <SwapOutlined />,
          label: '流转状态',
        },
        {
          key: '/data-dashboard-fengling',
          icon: <BarChartOutlined />,
          label: '数据统计',
        },
      ],
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === '/home') {
      navigate('/home');
    } else if (key.includes('-next')) {
      const path = key.replace('-next', '');
      navigate(`${path}?business=next`);
    } else if (key.includes('-fengling')) {
      const path = key.replace('-fengling', '');
      navigate(`${path}?business=fengling`);
    }
  };

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
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
          {collapsed ? 'BC' : 'badcase跟进'}
        </div>
        <Menu
          theme="dark"
          selectedKeys={[getSelectedKey()]}
          openKeys={openKeys}
          mode="inline"
          items={menuItems}
          onClick={handleMenuClick}
          onOpenChange={handleOpenChange}
        />
      </Sider>
      <Layout>
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

