import React, { useState } from 'react';
import { Card, Table, Button, Input, DatePicker, Tag, message, Tooltip } from 'antd';
import { SearchOutlined, DownloadOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { writeFile, utils } from 'xlsx';
import type { ColumnsType } from 'antd/es/table';

/* ── 类型 - 按后端实体字段 ─────────────── */
interface SnRecord {
  key: string;
  idSn: number;
  initialIdSn: string;
  orderRefIB: string;
  orderRefOB: string;
  orderRefRMA: string;
  customerSKU: string;
  qrCode: boolean;
  snBarcode: string;
  snPhysical: string;
  snScanTimeIB: string;
  snScanTimeOB: string;
  snScanTimeRMA: string;
  lpnIB: string;
  lpnOB: string;
  lpnRMA: string;
  cartonID: string;
  initialIdLPNIB: string;
  initialIdLPNOB: string;
  initialIdLPNRMA: string;
  snLog: string;
  deleteSN: string;
  customerCode: string;
}

const INPUT_STYLE = {
  borderRadius: 8,
  height: 40,
};

/* ── 组件 ─────────────────────────────── */
const SnReportPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<SnRecord[]>([]);

  /* 表单状态 */
  const [customerCode, setCustomerCode] = useState('');
  const [warehouseCode, setWarehouseCode] = useState('');
  const [orderType, setOrderType] = useState('');
  const [orderRef, setOrderRef] = useState('');
  const [snBarcode, setSnBarcode] = useState('');
  const [scanTimeRange, setScanTimeRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  /* 查询 - 调用后端接口 */
  const handleSearch = async () => {
    setLoading(true);

    try {
      const params = {
        customerCode: customerCode.trim() || null,
        warehouseCode: warehouseCode.trim() || null,
        orderType: orderType.trim() || null,
        orderRef: orderRef.trim() || null,
        snBarcode: snBarcode.trim() || null,
        scanTimeFrom: scanTimeRange?.[0]?.toISOString() || null,
        scanTimeTo: scanTimeRange?.[1]?.toISOString() || null,
      };

      console.log('查询参数:', params);

      // CRA 开发模式下通过 src/setupProxy.js 代理到后端，无 CORS 问题
      const res = await fetch('/api/oldData/snReport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      // 后端返回蛇形命名，转为驼峰命名
      const mappedData = data.map((item: any, index: number) => ({
        key: String(item.id_SN || index),
        idSn: item.id_SN,
        initialIdSn: item.initialID_SN,
        orderRefIB: item.order_Ref_IB,
        orderRefOB: item.order_Ref_OB,
        orderRefRMA: item.order_Ref_RMA,
        customerSKU: item.customer_SKU,
        qrCode: item.qr_Code,
        snBarcode: item.sn_Barcode,
        snPhysical: item.sn_physical,
        snScanTimeIB: item.sn_Scan_Time_IB,
        snScanTimeOB: item.sn_Scan_Time_OB,
        snScanTimeRMA: item.sn_Scan_Time_RMA,
        lpnIB: item.lpn_IB,
        lpnOB: item.lpn_OB,
        lpnRMA: item.lpn_RMA,
        cartonID: item.carton_ID,
        initialIdLPNIB: item.initialID_LPNIB,
        initialIdLPNOB: item.initialID_LPNOB,
        initialIdLPNRMA: item.initialID_LPNRMA,
        snLog: item.sn_Log,
        deleteSN: item.delete_SN,
        customerCode: item.customer_Code,
      }));

      setDataSource(mappedData);

    } catch (error) {
      console.error('查询失败:', error);
      message.error('查询失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  /* 重置 */
  const handleReset = () => {
    setCustomerCode('');
    setWarehouseCode('');
    setOrderType('');
    setOrderRef('');
    setSnBarcode('');
    setScanTimeRange(null);
    setDataSource([]);
  };

  /* 导出 */
  const handleExport = () => {
    if (dataSource.length === 0) {
      message.warning('没有可导出的数据，请先查询');
      return;
    }
    const exportData = dataSource.map(({ key, ...rest }) => rest);
    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'SN Report');
    writeFile(wb, `SN_Report_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
    message.success(`已导出 ${dataSource.length} 条记录`);
  };

  /* 通用列渲染 */
  const renderCode = (text: string) => text ? (
    <Tooltip title={text}>
      <span style={{ fontFamily: '"SF Mono", "Fira Code", Consolas, monospace', color: '#1890ff', fontWeight: 500 }}>
        {text.length > 15 ? text.slice(0, 15) + '...' : text}
      </span>
    </Tooltip>
  ) : <span style={{ color: '#bfbfbf' }}>-</span>;

  const renderTag = (text: string) => text ? (
    <Tag color="blue">{text}</Tag>
  ) : <span style={{ color: '#bfbfbf' }}>-</span>;

  const renderDateTime = (text: string) => text ? (
    <span>{dayjs(text).format('YYYY-MM-DD HH:mm:ss')}</span>
  ) : <span style={{ color: '#bfbfbf' }}>-</span>;

  /* 表格列 - 按后端实体字段顺序 */
  const columns: ColumnsType<SnRecord> = [
    { title: 'ID_SN', dataIndex: 'idSn', width: 100, align: 'right' },
    { title: 'Initial ID SN', dataIndex: 'initialIdSn', width: 150, render: renderCode },
    { title: 'Order Ref IB', dataIndex: 'orderRefIB', width: 160, render: renderCode },
    { title: 'Order Ref OB', dataIndex: 'orderRefOB', width: 160, render: renderCode },
    { title: 'Order Ref RMA', dataIndex: 'orderRefRMA', width: 160, render: renderCode },
    { title: 'Customer SKU', dataIndex: 'customerSKU', width: 150, render: renderCode },
    { title: 'QR Code', dataIndex: 'qrCode', width: 90, render: (v: boolean) => v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag> },
    { title: 'SN Barcode', dataIndex: 'snBarcode', width: 180, render: renderCode },
    { title: 'SN Physical', dataIndex: 'snPhysical', width: 140, render: renderTag },
    { title: 'SN Scan Time IB', dataIndex: 'snScanTimeIB', width: 180, render: renderDateTime, sorter: (a, b) => dayjs(a.snScanTimeIB).valueOf() - dayjs(b.snScanTimeIB).valueOf() },
    { title: 'SN Scan Time OB', dataIndex: 'snScanTimeOB', width: 180, render: renderDateTime },
    { title: 'SN Scan Time RMA', dataIndex: 'snScanTimeRMA', width: 180, render: renderDateTime },
    { title: 'LPN IB', dataIndex: 'lpnIB', width: 140, render: renderCode },
    { title: 'LPN OB', dataIndex: 'lpnOB', width: 140, render: renderCode },
    { title: 'LPN RMA', dataIndex: 'lpnRMA', width: 140, render: renderCode },
    { title: 'Carton ID', dataIndex: 'cartonID', width: 140, render: renderCode },
    { title: 'Initial ID LPNIB', dataIndex: 'initialIdLPNIB', width: 150, render: renderCode },
    { title: 'Initial ID LPNOB', dataIndex: 'initialIdLPNOB', width: 150, render: renderCode },
    { title: 'Initial ID LPNRMA', dataIndex: 'initialIdLPNRMA', width: 150, render: renderCode },
    { title: 'SN Log', dataIndex: 'snLog', width: 200, render: (t: string) => t ? <Tooltip title={t}><span>{t.length > 20 ? t.slice(0, 20) + '...' : t}</span></Tooltip> : <span style={{ color: '#bfbfbf' }}>-</span> },
    { title: 'Delete SN', dataIndex: 'deleteSN', width: 100, render: renderTag },
    { title: 'Customer Code', dataIndex: 'customerCode', width: 140, render: (t: string) => <Tag color="geekblue">{t}</Tag> },
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - 112px)', animation: 'fadeIn 0.3s ease-in-out' }}>
      {/* 筛选卡片 */}
      <Card
        bordered={false}
        style={{ marginBottom: 20, borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        bodyStyle={{ padding: '24px 28px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <FilterOutlined style={{ color: '#1890ff', fontSize: 16 }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: '#262626' }}>筛选条件</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#8c8c8c', marginBottom: 6, fontWeight: 500 }}>
              Customer Code
            </label>
            <Input
              placeholder="请输入 Customer Code"
              value={customerCode}
              onChange={e => setCustomerCode(e.target.value)}
              allowClear
              style={INPUT_STYLE}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#8c8c8c', marginBottom: 6, fontWeight: 500 }}>
              Warehouse Code
            </label>
            <Input
              placeholder="请输入 Warehouse Code"
              value={warehouseCode}
              onChange={e => setWarehouseCode(e.target.value)}
              allowClear
              style={INPUT_STYLE}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#8c8c8c', marginBottom: 6, fontWeight: 500 }}>
              Order Type
            </label>
            <Input
              placeholder="请输入 Order Type"
              value={orderType}
              onChange={e => setOrderType(e.target.value)}
              allowClear
              style={INPUT_STYLE}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#8c8c8c', marginBottom: 6, fontWeight: 500 }}>
              Order Ref
            </label>
            <Input
              placeholder="请输入 Order Ref"
              value={orderRef}
              onChange={e => setOrderRef(e.target.value)}
              allowClear
              onPressEnter={handleSearch}
              style={INPUT_STYLE}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#8c8c8c', marginBottom: 6, fontWeight: 500 }}>
              SN Barcode
            </label>
            <Input
              placeholder="请输入 SN Barcode"
              value={snBarcode}
              onChange={e => setSnBarcode(e.target.value)}
              allowClear
              onPressEnter={handleSearch}
              style={INPUT_STYLE}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#8c8c8c', marginBottom: 6, fontWeight: 500 }}>
              Scan Time
            </label>
            <DatePicker.RangePicker
              showTime
              value={scanTimeRange as any}
              onChange={(dates) => setScanTimeRange(dates as any)}
              placeholder={['开始时间', '结束时间']}
              style={{ ...INPUT_STYLE, width: '100%' }}
            />
          </div>
        </div>

        {/* 操作按钮 */}
        <div style={{ marginTop: 22, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button icon={<ReloadOutlined />} onClick={handleReset} style={{ borderRadius: 8, height: 38 }}>
            重置
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
            disabled={dataSource.length === 0}
            style={{ borderRadius: 8, height: 38 }}
          >
            导出 Excel（{dataSource.length} 条）
          </Button>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            loading={loading}
            style={{
              borderRadius: 8,
              height: 38,
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(24,144,255,0.35)',
              paddingLeft: 20,
              paddingRight: 20,
            }}
          >
            查询
          </Button>
        </div>
      </Card>

      {/* 结果表格 */}
      <Card
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        bodyStyle={{ padding: '20px 28px' }}
      >
        <Table<SnRecord>
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowKey="key"
          size="small"
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showTotal: t => <span style={{ color: '#8c8c8c' }}>共 {t} 条记录</span>,
            pageSizeOptions: ['10', '15', '20', '50'],
          }}
          scroll={{ x: 3500 }}
          locale={{ emptyText: <div style={{ padding: 40, textAlign: 'center', color: '#bfbfbf' }}><p>🔍 请输入筛选条件后点击「查询」</p></div> }}
          rowClassName={(record, index) => index % 2 === 0 ? '' : 'table-row-stripe'}
        />
      </Card>

      {/* 全局样式 */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ant-table-thead > tr > th {
          background: #fafbfc !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          color: #595959 !important;
          border-bottom: 2px solid #e8e8e8 !important;
          white-space: nowrap;
        }
        .ant-table-tbody > tr:hover > td {
          background: #e6f7ff !important;
        }
        .ant-table-row-stripe > td {
          background: #fafafa !important;
        }
        .ant-table-row-stripe:hover > td {
          background: #e6f7ff !important;
        }
        .ant-table-cell {
          font-size: 12px !important;
        }
      `}</style>
    </div>
  );
};

export default SnReportPage;
