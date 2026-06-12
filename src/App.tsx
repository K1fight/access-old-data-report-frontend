import React, { useState } from 'react';
import { Layout } from 'antd';
import Sidebar from './components/Sidebar';
import SnReportPage from './pages/SnReportPage';
import OrderReportPage from './pages/OrderReportPage';
import type { SidebarKey } from './components/Sidebar';

const MENU_LABELS: Record<SidebarKey, string> = {
  snReport:    'SN Report',
  orderReport: 'Order Report',
};

const App: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<SidebarKey>('snReport');

  const renderPage = () => {
    switch (activeMenu) {
      case 'snReport':    return <SnReportPage />;
      case 'orderReport': return <OrderReportPage />;
      default:            return null;
    }
  };

  const { Header, Content } = Layout;

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Sidebar activeKey={activeMenu} onSelect={setActiveMenu} />

      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 28px',
            fontSize: 17,
            fontWeight: 600,
            borderBottom: '1px solid #f0f0f0',
            lineHeight: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <span>{MENU_LABELS[activeMenu]}</span>
          <span
            style={{
              fontSize: 12,
              color: '#8c8c8c',
              fontWeight: 400,
              background: '#fafafa',
              padding: '4px 14px',
              borderRadius: 20,
            }}
          >
            {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })}
          </span>
        </Header>
        <Content style={{ margin: 24, minHeight: 280 }}>
          {renderPage()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
