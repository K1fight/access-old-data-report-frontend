import React from 'react';
import { Layout, Menu } from 'antd';
import { DatabaseOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Sider } = Layout;

export type SidebarKey = 'snReport' | 'orderReport';

interface SidebarProps {
  activeKey: SidebarKey;
  onSelect: (key: SidebarKey) => void;
}

const MENU_ITEMS: MenuProps['items'] = [
  {
    key: 'snReport',
    icon: <DatabaseOutlined />,
    label: <span style={{ fontWeight: 500 }}>SN Report</span>,
  },
  {
    key: 'orderReport',
    icon: <DatabaseOutlined />,
    label: <span style={{ fontWeight: 500 }}>Order Report</span>,
  },
];

const Sidebar: React.FC<SidebarProps> = ({ activeKey, onSelect }) => (
  <Sider
    width={220}
    style={{
      background: 'linear-gradient(180deg, #0a1628 0%, #1a2744 100%)',
      boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* 装饰背景 */}
    <div
      style={{
        position: 'absolute',
        top: -60,
        right: -40,
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(24,144,255,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}
    />

    {/* Logo 区域 */}
    <div
      style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          color: '#fff',
          fontWeight: 700,
          boxShadow: '0 4px 12px rgba(24,144,255,0.35)',
        }}
      >
        A
      </div>
      <span style={{ color: '#e8e8e8', fontSize: 16, fontWeight: 600, letterSpacing: 0.5 }}>
        AccessOldData
      </span>
    </div>

    {/* 菜单 */}
    <Menu
      mode="inline"
      selectedKeys={[activeKey]}
      theme="dark"
      items={MENU_ITEMS}
      onClick={({ key }) => onSelect(key as SidebarKey)}
      style={{
        borderRight: 0,
        background: 'transparent',
        marginTop: 12,
      }}
    />
  </Sider>
);

export default Sidebar;
