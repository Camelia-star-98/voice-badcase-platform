import { useState, useEffect } from 'react';
import { Table, Card, Space, Tag, Input, Select, Button, Modal, Descriptions, message, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, EyeOutlined, PlayCircleOutlined, LockOutlined, DeleteOutlined } from '@ant-design/icons';
import { BadcaseData } from '../types';
import { getSubjectList, getSubjectLabel } from '../config/subjectModelMapping';
import { useBadcase } from '../contexts/BadcaseContext';
import AudioPlayer from '../components/AudioPlayer';
import './BadcaseListPage.css';

const { Option } = Select;

const CORRECT_PASSWORD = '1222';
const AUTH_KEY = 'status_flow_auth';

const StatusFlowPage = () => {
  const { badcaseList, updateBadcase, deleteBadcase } = useBadcase();
  const [dataSource, setDataSource] = useState<BadcaseData[]>(badcaseList);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<BadcaseData | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [audioPlayerVisible, setAudioPlayerVisible] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState('');
  const [currentRecordId, setCurrentRecordId] = useState('');
  
  // 密码验证相关状态
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [password, setPassword] = useState('');

  // 检查是否已经验证过
  useEffect(() => {
    const auth = sessionStorage.getItem(AUTH_KEY);
    if (auth === 'true') {
      setIsAuthenticated(true);
    } else {
      setPasswordVisible(true);
    }
  }, []);

  // 处理密码验证
  const handlePasswordSubmit = () => {
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordVisible(false);
      sessionStorage.setItem(AUTH_KEY, 'true');
      message.success('验证成功！');
      setPassword('');
    } else {
      message.error('密码错误，请重试！');
      setPassword('');
    }
  };

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

  // 同步 badcaseList 到 dataSource，并按ID降序排列（新到旧）
  useEffect(() => {
    const sortedList = [...badcaseList].sort((a, b) => {
      // 提取ID中的数字部分进行比较（例如：BC0001 -> 1）
      const numA = parseInt(a.id.replace(/\D/g, ''), 10);
      const numB = parseInt(b.id.replace(/\D/g, ''), 10);
      return numB - numA; // 降序：大的ID在前面（新的在前面）
    });
    setDataSource(sortedList);
  }, [badcaseList]);

  // 处理状态变更
  const handleStatusChange = (recordId: string, newStatus: string) => {
    updateBadcase(recordId, {
      status: newStatus as 'pending' | 'processing' | 'resolved',
    });
    message.success('状态更新成功');
  };

  // 处理删除
  const handleDelete = (recordId: string) => {
    deleteBadcase(recordId);
    message.success('删除成功');
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
      title: '出现位置',
      dataIndex: 'location',
      key: 'location',
      width: 150,
      render: (location: string) => {
        if (location === 'fullTTS') return '全程TTS做课部分';
        if (location === 'interactive') return '行课互动部分';
        return '-';
      },
    },
    {
      title: '课节ID',
      key: 'lessonId',
      width: 150,
      render: (_, record) => {
        if (record.location === 'fullTTS') {
          return record.fullTtsLessonId || '-';
        } else if (record.location === 'interactive') {
          return record.cmsId || '-';
        }
        return '-';
      },
    },
    {
      title: '问题提报人',
      dataIndex: 'reporter',
      key: 'reporter',
      width: 120,
      render: (reporter: string) => reporter || '未填写',
    },
    {
      title: '期望修复时间',
      dataIndex: 'expectedFixDate',
      key: 'expectedFixDate',
      width: 130,
      sorter: (a, b) => new Date(a.expectedFixDate).getTime() - new Date(b.expectedFixDate).getTime(),
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
      width: 220,
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
          <Popconfirm
            title="确认删除"
            description="确定要删除这条记录吗？此操作不可恢复。"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
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
      setCurrentAudioUrl(record.audioUrl);
      setCurrentRecordId(record.id);
      setAudioPlayerVisible(true);
    } else {
      message.warning('该记录没有上传音频文件');
    }
  };

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      let filtered = [...badcaseList];

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

      // 按ID降序排列（新到旧）
      filtered.sort((a, b) => {
        const numA = parseInt(a.id.replace(/\D/g, ''), 10);
        const numB = parseInt(b.id.replace(/\D/g, ''), 10);
        return numB - numA;
      });

      setDataSource(filtered);
      setLoading(false);
    }, 500);
  };

  const handleReset = () => {
    setSearchText('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setSubjectFilter('all');
    // 按ID降序排列（新到旧）
    const sortedList = [...badcaseList].sort((a, b) => {
      const numA = parseInt(a.id.replace(/\D/g, ''), 10);
      const numB = parseInt(b.id.replace(/\D/g, ''), 10);
      return numB - numA;
    });
    setDataSource(sortedList);
  };

  // 如果未验证，只显示密码输入框
  if (!isAuthenticated) {
    return (
      <Modal
        title={
          <Space>
            <LockOutlined />
            <span>密码验证</span>
          </Space>
        }
        open={passwordVisible}
        onOk={handlePasswordSubmit}
        onCancel={() => {
          message.warning('需要验证密码才能访问该页面');
        }}
        okText="确认"
        cancelText="取消"
        closable={false}
        maskClosable={false}
      >
        <div style={{ padding: '20px 0' }}>
          <p style={{ marginBottom: 16, color: '#666' }}>
            该页面需要密码验证才能访问
          </p>
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请输入访问密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onPressEnter={handlePasswordSubmit}
            size="large"
            autoFocus
          />
        </div>
      </Modal>
    );
  }

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
            <Descriptions.Item label="出现位置" span={2}>
              {selectedRecord.location === 'fullTTS' 
                ? '全程TTS做课部分' 
                : selectedRecord.location === 'interactive' 
                ? '行课互动部分' 
                : '未填写'}
            </Descriptions.Item>
            {selectedRecord.location === 'fullTTS' && selectedRecord.fullTtsLessonId && (
              <Descriptions.Item label="全程TTS课节ID" span={2}>
                {selectedRecord.fullTtsLessonId}
              </Descriptions.Item>
            )}
            {selectedRecord.location === 'interactive' && selectedRecord.cmsId && (
              <Descriptions.Item label="CMS课节ID" span={2}>
                {selectedRecord.cmsId}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="问题提报人" span={2}>
              {selectedRecord.reporter || '未填写'}
            </Descriptions.Item>
            {selectedRecord.location === 'interactive' && (
              <Descriptions.Item label="问题模型ID" span={2}>
                {selectedRecord.modelId || '未填写'}
              </Descriptions.Item>
            )}
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

      {/* 音频播放器 */}
      <AudioPlayer
        visible={audioPlayerVisible}
        audioUrl={currentAudioUrl}
        recordId={currentRecordId}
        onClose={() => setAudioPlayerVisible(false)}
      />
    </div>
  );
};

export default StatusFlowPage;

