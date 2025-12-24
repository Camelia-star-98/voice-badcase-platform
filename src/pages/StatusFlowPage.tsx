import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Space, Tag, Input, Select, Button, Modal, message, Popconfirm, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, EyeOutlined, PlayCircleOutlined, LockOutlined, DeleteOutlined } from '@ant-design/icons';
import { BadcaseData } from '../types';
import { getSubjectList, getSubjectLabel } from '../config/subjectModelMapping';
import { useBadcase } from '../contexts/BadcaseContext';
import AudioPlayer from '../components/AudioPlayer';
import dayjs from 'dayjs';
import './BadcaseListPage.css';

const { Option } = Select;

const CORRECT_PASSWORD = '1222';
const AUTH_KEY = 'status_flow_auth';

const StatusFlowPage = () => {
  const navigate = useNavigate();
  const { badcaseList, updateBadcase, deleteBadcase } = useBadcase();
  const [dataSource, setDataSource] = useState<BadcaseData[]>(badcaseList);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [audioPlayerVisible, setAudioPlayerVisible] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState('');
  const [currentRecordId, setCurrentRecordId] = useState('');
  
  // 编辑模式状态
  const [editedRecord, setEditedRecord] = useState<BadcaseData | null>(null);
  const [saving, setSaving] = useState(false);
  
  // 密码验证相关状态
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(true); // 默认显示密码弹窗
  const [password, setPassword] = useState('');

  // 检查是否已经验证过
  useEffect(() => {
    const auth = sessionStorage.getItem(AUTH_KEY);
    if (auth === 'true') {
      setIsAuthenticated(true);
      setPasswordVisible(false); // 已验证，关闭密码弹窗
    }
    // 未验证的情况下，passwordVisible 默认为 true，不需要额外设置
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
      status: newStatus as 'pending' | 'algorithm_processing' | 'engineering_processing' | 'resolved' | 'processing',
    });
    message.success('状态更新成功');
  };

  // 处理删除
  const handleDelete = async (recordId: string) => {
    try {
      console.log('🗑️ StatusFlowPage: 准备删除 Badcase:', recordId);
      await deleteBadcase(recordId);
      console.log('✅ StatusFlowPage: 删除成功:', recordId);
      message.success('删除成功');
    } catch (error: any) {
      console.error('❌ StatusFlowPage: 删除失败:', error);
      console.error('❌ 错误详情:', error?.message);
      message.error(error?.message || '删除失败，请重试');
    }
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
    setEditedRecord(record); // 初始化编辑数据
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

  // 保存编辑
  const handleSave = async () => {
    if (!editedRecord) return;
    
    setSaving(true);
    try {
      // 更新数据
      await updateBadcase(editedRecord.id, editedRecord);
      message.success('保存成功');
      setDetailModalVisible(false);
      setEditedRecord(null);
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // 更新编辑数据
  const handleFieldChange = (field: keyof BadcaseData, value: any) => {
    if (!editedRecord) return;
    setEditedRecord({
      ...editedRecord,
      [field]: value,
    });
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
          navigate('/'); // 返回首页
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
        onCancel={() => {
          setDetailModalVisible(false);
          setEditedRecord(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setDetailModalVisible(false);
            setEditedRecord(null);
          }}>
            取消
          </Button>,
          <Button key="save" type="primary" loading={saving} onClick={handleSave}>
            保存
          </Button>,
        ]}
        width={800}
      >
        {editedRecord && (
          <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {/* ID - 不可编辑 */}
              <div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>ID</div>
                <Input value={editedRecord.id} disabled />
              </div>

              {/* 提交日期 */}
              <div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>提交日期</div>
                <DatePicker
                  value={dayjs(editedRecord.date)}
                  onChange={(date) => handleFieldChange('date', date?.format('YYYY-MM-DD'))}
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                />
              </div>

              {/* 学科 */}
              <div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>学科</div>
                <Select
                  value={editedRecord.subject}
                  onChange={(value) => handleFieldChange('subject', value)}
                  style={{ width: '100%' }}
                >
                  {getSubjectList().map(subject => (
                    <Option key={subject.value} value={subject.value}>
                      {subject.label}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* 出现位置 */}
              <div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>出现位置</div>
                <Select
                  value={editedRecord.location}
                  onChange={(value) => handleFieldChange('location', value)}
                  style={{ width: '100%' }}
                >
                  <Option value="fullTTS">全程TTS做课部分</Option>
                  <Option value="interactive">行课互动部分</Option>
                </Select>
              </div>

              {/* CMS课节ID */}
              {editedRecord.location === 'interactive' && (
                <div>
                  <div style={{ marginBottom: 8, fontWeight: 500 }}>CMS课节ID</div>
                  <Input
                    value={editedRecord.cmsId}
                    onChange={(e) => handleFieldChange('cmsId', e.target.value)}
                    placeholder="请输入CMS课节ID"
                  />
                </div>
              )}

              {/* 全程TTS课节ID */}
              {editedRecord.location === 'fullTTS' && (
                <div>
                  <div style={{ marginBottom: 8, fontWeight: 500 }}>全程TTS课节ID</div>
                  <Input
                    value={editedRecord.fullTtsLessonId}
                    onChange={(e) => handleFieldChange('fullTtsLessonId', e.target.value)}
                    placeholder="请输入全程TTS课节ID"
                  />
                </div>
              )}

              {/* 问题提报人 */}
              <div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>问题提报人</div>
                <Input
                  value={editedRecord.reporter}
                  onChange={(e) => handleFieldChange('reporter', e.target.value)}
                  placeholder="请输入问题提报人"
                />
              </div>

              {/* 问题模型ID */}
              {editedRecord.location === 'interactive' && (
                <div>
                  <div style={{ marginBottom: 8, fontWeight: 500 }}>问题模型ID</div>
                  <Input
                    value={editedRecord.modelId}
                    onChange={(e) => handleFieldChange('modelId', e.target.value)}
                    placeholder="请输入问题模型ID"
                  />
                </div>
              )}

              {/* 分类 */}
              <div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>分类</div>
                <Select
                  value={editedRecord.category}
                  onChange={(value) => handleFieldChange('category', value)}
                  style={{ width: '100%' }}
                >
                  <Option value="读音错误">读音错误</Option>
                  <Option value="停顿不当">停顿不当</Option>
                  <Option value="重读不对">重读不对</Option>
                  <Option value="语速突变">语速突变</Option>
                  <Option value="音量突变">音量突变</Option>
                  <Option value="音质问题">音质问题</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </div>

              {/* 期望修复时间 */}
              <div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>期望修复时间</div>
                <DatePicker
                  value={dayjs(editedRecord.expectedFixDate)}
                  onChange={(date) => handleFieldChange('expectedFixDate', date?.format('YYYY-MM-DD'))}
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                />
              </div>

              {/* 状态 */}
              <div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>状态</div>
                <Select
                  value={editedRecord.status}
                  onChange={(value) => handleFieldChange('status', value)}
                  style={{ width: '100%' }}
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
              </div>

              {/* 描述 */}
              <div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>描述</div>
                <Input.TextArea
                  value={editedRecord.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="请输入问题描述"
                  rows={4}
                />
              </div>

              {/* 创建时间和更新时间 - 只读 */}
              <div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>创建时间</div>
                <Input value={editedRecord.createdAt} disabled />
              </div>

              <div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>更新时间</div>
                <Input value={editedRecord.updatedAt} disabled />
              </div>

              {/* 音频文件 */}
              {editedRecord.audioUrl && (
                <div>
                  <div style={{ marginBottom: 8, fontWeight: 500 }}>音频文件</div>
                  <Button
                    type="link"
                    icon={<PlayCircleOutlined />}
                    onClick={() => handlePlayAudio(editedRecord)}
                  >
                    播放音频
                  </Button>
                </div>
              )}
            </Space>
          </div>
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

