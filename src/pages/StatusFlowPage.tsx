import { useState } from 'react';
import { Table, Card, Space, Tag, Input, Select, Button, Modal, Descriptions, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, EyeOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { BadcaseData } from '../types';
import { mockBadcaseList } from '../api/mockData';
import { getSubjectList, getModelsBySubject, getSubjectLabel } from '../config/subjectModelMapping';
import './BadcaseListPage.css';

const { Option } = Select;

const StatusFlowPage = () => {
  const [dataSource, setDataSource] = useState<BadcaseData[]>(mockBadcaseList);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<BadcaseData | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  const getStatusColor = (status: string) => {
    const colors = {
      resolved: 'success',
      algorithm_processing: 'processing',
      engineering_processing: 'warning',
      pending: 'default',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts = {
      resolved: '已解决',
      algorithm_processing: '算法处理中',
      engineering_processing: '工程处理中',
      pending: '待处理',
      // 兼容旧数据
      processing: '处理中',
    };
    return texts[status as keyof typeof texts] || status;
  };

  // 处理状态变更
  const handleStatusChange = (recordId: string, newStatus: string) => {
    const updatedDataSource = dataSource.map(item => {
      if (item.id === recordId) {
        return {
          ...item,
          status: newStatus as 'pending' | 'processing' | 'resolved',
          updatedAt: new Date().toLocaleString('zh-CN'),
        };
      }
      return item;
    });
    setDataSource(updatedDataSource);
    message.success('状态更新成功');
  };

  const columns: ColumnsType<BadcaseData> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      fixed: 'left',
    },
    {
      title: '提交日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: '学科',
      dataIndex: 'subject',
      key: 'subject',
      width: 100,
      render: (subject: string) => subject ? getSubjectLabel(subject) : '未分类',
      filters: getSubjectList().map(s => ({ text: s.label, value: s.value })),
      onFilter: (value, record) => record.subject === value,
    },
    {
      title: 'CMS课程ID',
      dataIndex: 'cmsId',
      key: 'cmsId',
      width: 120,
      render: (cmsId: string) => cmsId || '-',
    },
    {
      title: '问题提报人',
      dataIndex: 'reporter',
      key: 'reporter',
      width: 120,
      render: (reporter: string) => reporter || '未填写',
    },
    {
      title: '问题模型ID',
      dataIndex: 'modelId',
      key: 'modelId',
      width: 150,
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      filters: [
        { text: '读音错误', value: '读音错误' },
        { text: '停顿不当', value: '停顿不当' },
        { text: '重读不对', value: '重读不对' },
        { text: '语速突变', value: '语速突变' },
        { text: '音量突变', value: '音量突变' },
        { text: '音质问题', value: '音质问题' },
        { text: '其他', value: '其他' },
      ],
      onFilter: (value, record) => record.category === value,
    },
    {
      title: '期望修复时间',
      dataIndex: 'expectedFixDate',
      key: 'expectedFixDate',
      width: 130,
      sorter: (a, b) => new Date(a.expectedFixDate).getTime() - new Date(b.expectedFixDate).getTime(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (status: string, record: BadcaseData) => (
        <Select
          value={status}
          onChange={(value) => handleStatusChange(record.id, value)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="pending">
            <Tag color="default">待处理</Tag>
          </Option>
          <Option value="algorithm_processing">
            <Tag color="processing">算法处理中</Tag>
          </Option>
          <Option value="engineering_processing">
            <Tag color="warning">工程处理中</Tag>
          </Option>
          <Option value="resolved">
            <Tag color="success">已解决</Tag>
          </Option>
        </Select>
      ),
      filters: [
        { text: '待处理', value: 'pending' },
        { text: '算法处理中', value: 'algorithm_processing' },
        { text: '工程处理中', value: 'engineering_processing' },
        { text: '已解决', value: 'resolved' },
        // 兼容旧数据
        { text: '处理中', value: 'processing' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          {record.audioUrl && (
            <Button
              type="link"
              icon={<PlayCircleOutlined />}
              onClick={() => handlePlayAudio(record)}
            >
              播放
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleViewDetail = (record: BadcaseData) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const handlePlayAudio = (record: BadcaseData) => {
    if (record.audioUrl) {
      // 播放音频的逻辑
      console.log('播放音频:', record.audioUrl);
      Modal.info({
        title: '音频播放',
        content: `正在播放: ${record.id} 的音频文件`,
      });
    }
  };

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      let filtered = [...mockBadcaseList];

      if (searchText) {
        filtered = filtered.filter(
          (item) =>
            item.id.toLowerCase().includes(searchText.toLowerCase()) ||
            item.description.toLowerCase().includes(searchText.toLowerCase())
        );
      }

      if (categoryFilter !== 'all') {
        filtered = filtered.filter((item) => item.category === categoryFilter);
      }

      if (statusFilter !== 'all') {
        filtered = filtered.filter((item) => item.status === statusFilter);
      }

      if (subjectFilter !== 'all') {
        filtered = filtered.filter((item) => item.subject === subjectFilter);
      }

      setDataSource(filtered);
      setLoading(false);
    }, 500);
  };

  const handleReset = () => {
    setSearchText('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setSubjectFilter('all');
    setDataSource(mockBadcaseList);
  };

  return (
    <div className="badcase-list-page">
      <Card className="filter-card">
        <Space wrap size="middle" style={{ width: '100%' }}>
          <Input
            placeholder="搜索ID或描述"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
            onPressEnter={handleSearch}
          />
          <Select
            value={subjectFilter}
            onChange={setSubjectFilter}
            style={{ width: 120 }}
            placeholder="选择学科"
          >
            <Option value="all">全部学科</Option>
            {getSubjectList().map(subject => (
              <Option key={subject.value} value={subject.value}>
                {subject.label}
              </Option>
            ))}
          </Select>
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 150 }}
          >
            <Option value="all">全部分类</Option>
            <Option value="读音错误">读音错误</Option>
            <Option value="停顿不当">停顿不当</Option>
            <Option value="重读不对">重读不对</Option>
            <Option value="语速突变">语速突变</Option>
            <Option value="音量突变">音量突变</Option>
            <Option value="音质问题">音质问题</Option>
            <Option value="其他">其他</Option>
          </Select>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
          >
            <Option value="all">全部状态</Option>
            <Option value="pending">待处理</Option>
            <Option value="algorithm_processing">算法处理中</Option>
            <Option value="engineering_processing">工程处理中</Option>
            <Option value="resolved">已解决</Option>
            <Option value="processing">处理中</Option>
          </Select>
          <Button type="primary" onClick={handleSearch}>
            搜索
          </Button>
          <Button onClick={handleReset}>重置</Button>
        </Space>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            defaultPageSize: 10,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
        />
      </Card>

      <Modal
        title="Badcase详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {selectedRecord && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="ID" span={2}>
              {selectedRecord.id}
            </Descriptions.Item>
            <Descriptions.Item label="提交日期" span={2}>
              {selectedRecord.date}
            </Descriptions.Item>
            <Descriptions.Item label="学科" span={2}>
              {selectedRecord.subject ? getSubjectLabel(selectedRecord.subject) : '未分类'}
            </Descriptions.Item>
            <Descriptions.Item label="CMS课程ID" span={2}>
              {selectedRecord.cmsId || '未填写'}
            </Descriptions.Item>
            <Descriptions.Item label="问题提报人" span={2}>
              {selectedRecord.reporter || '未填写'}
            </Descriptions.Item>
            <Descriptions.Item label="问题模型ID" span={2}>
              {selectedRecord.modelId || '未填写'}
            </Descriptions.Item>
            <Descriptions.Item label="分类">
              {selectedRecord.category}
            </Descriptions.Item>
            <Descriptions.Item label="期望修复时间">
              {selectedRecord.expectedFixDate}
            </Descriptions.Item>
            <Descriptions.Item label="状态" span={2}>
              <Tag color={getStatusColor(selectedRecord.status)}>
                {getStatusText(selectedRecord.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>
              {selectedRecord.description}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" span={2}>
              {selectedRecord.createdAt}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间" span={2}>
              {selectedRecord.updatedAt}
            </Descriptions.Item>
            {selectedRecord.audioUrl && (
              <Descriptions.Item label="音频文件" span={2}>
                <Button
                  type="link"
                  icon={<PlayCircleOutlined />}
                  onClick={() => handlePlayAudio(selectedRecord)}
                >
                  播放音频
                </Button>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default StatusFlowPage;

