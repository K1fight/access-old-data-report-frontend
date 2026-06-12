import React from 'react';
import { Table, Button, Space, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { writeFile, utils } from 'xlsx';
import dayjs from 'dayjs';
import type { RecordType } from '../types';

interface ResultTableProps {
  dataSource: RecordType[];
  loading: boolean;
  searched: boolean;
  onExport: () => void;
}

const ResultTable: React.FC<ResultTableProps> = ({ dataSource, loading, searched, onExport }) => {
  const handleExport = () => {
    if (dataSource.length === 0) {
      message.warning('没有可导出的数据，请先查询');
      return;
    }
    const exportData = dataSource.map(({ key, ...rest }) => rest);
    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, '查询结果');
    writeFile(wb, `SN查询结果_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
    message.success(`已导出 ${dataSource.length} 条记录`);
  };

  const columns: ColumnsType<RecordType> = [
    { title: 'SN 单号',   dataIndex: 'sn',      width: 180 },
    { title: '关联订单号', dataIndex: 'orderNo',  width: 180 },
    { title: '客户',      dataIndex: 'customer', width: 120 },
    { title: '产品',      dataIndex: 'product',  width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      filters: [
        { text: '已完成', value: '已完成' },
        { text: '处理中', value: '处理中' },
        { text: '待审核', value: '待审核' },
        { text: '已取消', value: '已取消' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    { title: '创建日期',  dataIndex: 'createdAt', width: 120 },
    { title: '处理人',    dataIndex: 'handler',   width: 100 },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>查询结果</h3>
        <Space>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport} disabled={dataSource.length === 0}>
            导出 Excel（{dataSource.length} 条）
          </Button>
        </Space>
      </div>
      <Table<RecordType>
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        scroll={{ x: 1000 }}
        locale={{ emptyText: searched ? '没有找到匹配的记录' : '请输入查询条件后点击「查询」' }}
      />
    </div>
  );
};

export default ResultTable;
