import React from 'react';
import { Space, Input, Select, DatePicker, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

export interface FilterPanelProps {
  snInput: string;
  onSnInputChange: (v: string) => void;
  statusFilter: string | undefined;
  onStatusFilterChange: (v: string | undefined) => void;
  dateRange: [Dayjs | null, Dayjs | null] | null;
  onDateRangeChange: (v: [Dayjs | null, Dayjs | null] | null) => void;
  onSearch: () => void;
  onReset: () => void;
  loading: boolean;
}

const STATUS_OPTIONS = [
  { value: '已完成', label: '已完成' },
  { value: '处理中', label: '处理中' },
  { value: '待审核', label: '待审核' },
  { value: '已取消', label: '已取消' },
];

const FilterPanel: React.FC<FilterPanelProps> = (props) => {
  const {
    snInput, onSnInputChange,
    statusFilter, onStatusFilterChange,
    dateRange, onDateRangeChange,
    onSearch, onReset, loading,
  } = props;

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8, marginBottom: 24 }}>
      <h3 style={{ marginTop: 0 }}>过滤条件</h3>
      <Space wrap size={[16, 16]} style={{ width: '100%' }}>
        <div>
          <div style={{ marginBottom: 4, color: '#666' }}>SN 单号 / 订单号</div>
          <Input
            placeholder="输入 SN 单号或订单号"
            value={snInput}
            onChange={(e) => onSnInputChange(e.target.value)}
            onPressEnter={onSearch}
            style={{ width: 260 }}
            allowClear
          />
        </div>

        <div>
          <div style={{ marginBottom: 4, color: '#666' }}>状态筛选</div>
          <Select
            placeholder="全部状态"
            value={statusFilter}
            onChange={onStatusFilterChange}
            allowClear
            style={{ width: 160 }}
            options={STATUS_OPTIONS}
          />
        </div>

        <div>
          <div style={{ marginBottom: 4, color: '#666' }}>创建日期范围</div>
          <RangePicker
            value={dateRange as any}
            onChange={(dates) => onDateRangeChange(dates as any)}
            style={{ width: 280 }}
          />
        </div>

        <div style={{ alignSelf: 'flex-end' }}>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={onSearch} loading={loading}>
              查询
            </Button>
            <Button onClick={onReset}>重置</Button>
          </Space>
        </div>
      </Space>
    </div>
  );
};

export default FilterPanel;
