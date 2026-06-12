import React, { useState } from 'react';
import { Card, Table, Button, Input, DatePicker, Tag, message, Tooltip } from 'antd';
import { SearchOutlined, DownloadOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { writeFile, utils } from 'xlsx';
import type { ColumnsType } from 'antd/es/table';

/* ── 类型 - 按后端实体字段 ─────────────── */
interface OrderRecord {
  key: string;
  entity: string;
  customerCode: string;
  customerAbbrev: string;
  warehouseCode: string;
  warehouseName: string;
  orderType: string;
  orderRef: string;
  orderIB: string;
  orderRefRMA: string;
  orderReceiveDate: string;
  orderEntryDate: string;
  shipmentNo: string;
  adr: string;
  unCode: string;
  businessType: string;
  mod: string;
  deliveryType: string;
  truckType: string;
  stockType: string;
  inboundDateTime: string;
  arrivalTime: string;
  leaveTime: string;
  customerETA: string;
  commitETA: string;
  shipQtyPlan: string;
  shipQtyActual: string;
  shipUnit: string;
  consigneeStreetNo: string;
  consigneeCity: string;
  consigneePostCode: string;
  consigneeCountry: string;
  consigneePIC: string;
  pickDate: string;
  scanDate: string;
  readyDate: string;
  loadDate: string;
  customerSKU: string;
  quantity: string;
  pallet: string;
  palletType: string;
  unit: string;
  carton: string;
}

const INPUT_STYLE = {
  borderRadius: 8,
  height: 40,
};

/* ── 组件 ─────────────────────────────── */
const OrderReportPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<OrderRecord[]>([]);

  /* 表单状态 */
  const [warehouseCode, setWarehouseCode] = useState('');
  const [orderType, setOrderType] = useState('');
  const [orderRef, setOrderRef] = useState('');
  const [customerSKU, setCustomerSKU] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  /* 查询 */
  const handleSearch = async () => {
    setLoading(true);

    try {
      const params = {
        warehouseCode: warehouseCode.trim() || null,
        orderType: orderType.trim() || null,
        orderRef: orderRef.trim() || null,
        customerSKU: customerSKU.trim() || null,
        orderReceiveDateFrom: dateRange?.[0]?.format('YYYY-MM-DD') || null,
        orderReceiveDateTo: dateRange?.[1]?.format('YYYY-MM-DD') || null,
      };

      console.log('查询参数:', params);

      const res = await fetch('/api/oldData/orderReport', {
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
        key: String(index),
        entity: item.entity,
        customerCode: item.customer_Code,
        customerAbbrev: item.customer_Abbrev,
        warehouseCode: item.warehouse_Code,
        warehouseName: item.warehouse_Name,
        orderType: item.order_Type,
        orderRef: item.order_Ref,
        orderIB: item.order_IB,
        orderRefRMA: item.order_Ref_RMA,
        orderReceiveDate: item.order_receive_date,
        orderEntryDate: item.order_Entry_date,
        shipmentNo: item.shipment_No,
        adr: item.adr,
        unCode: item.un_Code,
        businessType: item.business_Type,
        mod: item.mod,
        deliveryType: item.delivery_Type,
        truckType: item.truck_Type,
        stockType: item.stock_Type,
        inboundDateTime: item.inbound_Date_Time,
        arrivalTime: item.arrival_Time,
        leaveTime: item.leave_Time,
        customerETA: item.customer_ETA,
        commitETA: item.commit_ETA,
        shipQtyPlan: item.ship_Qty_Plan,
        shipQtyActual: item.ship_Qty_Actual,
        shipUnit: item.ship_Unit,
        consigneeStreetNo: item.consignee_Street_No,
        consigneeCity: item.consignee_City,
        consigneePostCode: item.consignee_Post_Code,
        consigneeCountry: item.consignee_Country,
        consigneePIC: item.consignee_PIC,
        pickDate: item.pick_Date,
        scanDate: item.scan_Date,
        readyDate: item.ready_Date,
        loadDate: item.load_Date,
        customerSKU: item.customer_SKU,
        quantity: item.quantity,
        pallet: item.pallet,
        palletType: item.pallet_Type,
        unit: item.unit,
        carton: item.carton,
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
    setWarehouseCode('');
    setOrderType('');
    setOrderRef('');
    setCustomerSKU('');
    setDateRange(null);
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
    utils.book_append_sheet(wb, ws, 'Order Report');
    writeFile(wb, `Order_Report_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
    message.success(`已导出 ${dataSource.length} 条记录`);
  };

  /* 通用列渲染 */
  const renderCode = (text: string) => text ? (
    <Tooltip title={text}>
      <span style={{ fontFamily: '"SF Mono", "Fira Code", Consolas, monospace', color: '#1890ff', fontWeight: 500 }}>
        {text.length > 12 ? text.slice(0, 12) + '...' : text}
      </span>
    </Tooltip>
  ) : <span style={{ color: '#bfbfbf' }}>-</span>;

  const renderTag = (text: string) => text ? (
    <Tag color="blue">{text}</Tag>
  ) : <span style={{ color: '#bfbfbf' }}>-</span>;

  const renderTagColor = (color: string) => (text: string) => text ? (
    <Tag color={color}>{text}</Tag>
  ) : <span style={{ color: '#bfbfbf' }}>-</span>;

  const renderDate = (text: string) => text ? (
    <span>{dayjs(text).format('YYYY-MM-DD')}</span>
  ) : <span style={{ color: '#bfbfbf' }}>-</span>;

  const renderDateTime = (text: string) => text ? (
    <span>{dayjs(text).format('MM-DD HH:mm')}</span>
  ) : <span style={{ color: '#bfbfbf' }}>-</span>;

  /* 表格列 */
  const columns: ColumnsType<OrderRecord> = [
    // 基础信息
    { title: 'Entity', dataIndex: 'entity', width: 120, render: renderTag },
    { title: 'Customer Code', dataIndex: 'customerCode', width: 140, render: renderTagColor('geekblue') },
    { title: 'Customer Abbrev', dataIndex: 'customerAbbrev', width: 130, render: renderTag },
    { title: 'Warehouse Code', dataIndex: 'warehouseCode', width: 150, render: renderTagColor('cyan') },
    { title: 'Warehouse Name', dataIndex: 'warehouseName', width: 150, render: renderTag },
    // 订单信息
    { title: 'Order Type', dataIndex: 'orderType', width: 110, render: (t) => <Tag color={t === 'IN' ? 'green' : 'orange'}>{t === 'IN' ? '入库' : '出库'}</Tag> },
    { title: 'Order Ref', dataIndex: 'orderRef', width: 170, render: renderCode },
    { title: 'Order IB', dataIndex: 'orderIB', width: 120, render: renderCode },
    { title: 'Order Ref RMA', dataIndex: 'orderRefRMA', width: 150, render: renderCode },
    // 日期
    { title: 'Order Receive Date', dataIndex: 'orderReceiveDate', width: 160, render: renderDate, sorter: (a, b) => dayjs(a.orderReceiveDate).valueOf() - dayjs(b.orderReceiveDate).valueOf() },
    { title: 'Order Entry Date', dataIndex: 'orderEntryDate', width: 150, render: renderDate },
    // 物流信息
    { title: 'Shipment No', dataIndex: 'shipmentNo', width: 140, render: renderCode },
    { title: 'ADR', dataIndex: 'adr', width: 80, render: (t) => t === 'Y' ? <Tag color="red">Y</Tag> : <Tag>N</Tag> },
    { title: 'UN Code', dataIndex: 'unCode', width: 100, render: renderCode },
    { title: 'Business Type', dataIndex: 'businessType', width: 130, render: renderTag },
    { title: 'MOD', dataIndex: 'mod', width: 90, render: renderTag },
    { title: 'Delivery Type', dataIndex: 'deliveryType', width: 120, render: renderTag },
    { title: 'Truck Type', dataIndex: 'truckType', width: 120, render: renderTag },
    { title: 'Stock Type', dataIndex: 'stockType', width: 110, render: renderTag },
    // 时间
    { title: 'Inbound Date Time', dataIndex: 'inboundDateTime', width: 160, render: renderDateTime },
    { title: 'Arrival Time', dataIndex: 'arrivalTime', width: 140, render: renderDateTime },
    { title: 'Leave Time', dataIndex: 'leaveTime', width: 140, render: renderDateTime },
    { title: 'Customer ETA', dataIndex: 'customerETA', width: 130, render: renderDate },
    { title: 'Commit ETA', dataIndex: 'commitETA', width: 130, render: renderDate },
    // 数量
    { title: 'Ship Qty Plan', dataIndex: 'shipQtyPlan', width: 120, align: 'right', render: (t) => <span style={{ fontWeight: 600 }}>{t}</span> },
    { title: 'Ship Qty Actual', dataIndex: 'shipQtyActual', width: 130, align: 'right', render: (t) => <span style={{ fontWeight: 600, color: t ? '#52c41a' : '#bfbfbf' }}>{t || '-'}</span> },
    { title: 'Ship Unit', dataIndex: 'shipUnit', width: 100, render: renderTag },
    // 收货人信息
    { title: 'Consignee Street No', dataIndex: 'consigneeStreetNo', width: 180, render: (t) => <Tooltip title={t}><span>{t?.length > 15 ? t.slice(0, 15) + '...' : t}</span></Tooltip> },
    { title: 'Consignee City', dataIndex: 'consigneeCity', width: 140, render: renderTag },
    { title: 'Consignee Post Code', dataIndex: 'consigneePostCode', width: 160, render: renderCode },
    { title: 'Consignee Country', dataIndex: 'consigneeCountry', width: 150, render: renderTag },
    { title: 'Consignee PIC', dataIndex: 'consigneePIC', width: 140, render: renderTag },
    // 操作日期
    { title: 'Pick Date', dataIndex: 'pickDate', width: 120, render: renderDate },
    { title: 'Scan Date', dataIndex: 'scanDate', width: 120, render: renderDate },
    { title: 'Ready Date', dataIndex: 'readyDate', width: 120, render: renderDate },
    { title: 'Load Date', dataIndex: 'loadDate', width: 120, render: renderDate },
    // Order Detail
    { title: 'Customer SKU', dataIndex: 'customerSKU', width: 160, render: renderCode },
    { title: 'Quantity', dataIndex: 'quantity', width: 100, align: 'right', render: (t) => <span style={{ fontWeight: 600 }}>{t}</span> },
    { title: 'Pallet', dataIndex: 'pallet', width: 90, align: 'right', render: (t) => <span style={{ fontWeight: 600 }}>{t}</span> },
    { title: 'Pallet Type', dataIndex: 'palletType', width: 120, render: renderTag },
    { title: 'Unit', dataIndex: 'unit', width: 90, render: renderTag },
    { title: 'Carton', dataIndex: 'carton', width: 90, align: 'right', render: (t) => <span style={{ fontWeight: 600 }}>{t}</span> },
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
          <FilterOutlined style={{ color: '#52c41a', fontSize: 16 }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: '#262626' }}>筛选条件</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px' }}>
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
              SKU
            </label>
            <Input
              placeholder="请输入 SKU"
              value={customerSKU}
              onChange={e => setCustomerSKU(e.target.value)}
              allowClear
              onPressEnter={handleSearch}
              style={INPUT_STYLE}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#8c8c8c', marginBottom: 6, fontWeight: 500 }}>
              Order Receive Date
            </label>
            <DatePicker.RangePicker
              value={dateRange as any}
              onChange={(dates) => setDateRange(dates as any)}
              placeholder={['开始日期', '结束日期']}
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
              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(82,196,26,0.35)',
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
        <Table<OrderRecord>
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowKey="key"
          size="small"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: t => <span style={{ color: '#8c8c8c' }}>共 {t} 条记录</span>,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          scroll={{ x: 4200 }}
          locale={{ emptyText: <div style={{ padding: 40, textAlign: 'center', color: '#bfbfbf' }}><p>🔍 请输入筛选条件后点击「查询」</p></div> }}
          rowClassName={(_, index) => index % 2 === 0 ? '' : 'table-row-stripe'}
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

export default OrderReportPage;