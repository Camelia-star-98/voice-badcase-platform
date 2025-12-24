import { useState, useEffect } from 'react';
import { Table, Card, Space, Tag, Input, Select, Button, Modal, Descriptions, Form, Upload, message, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import { SearchOutlined, EyeOutlined, PlayCircleOutlined, UploadOutlined, CloudUploadOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { BadcaseData } from '../types';
import { getSubjectList, getModelsBySubject, getSubjectLabel } from '../config/subjectModelMapping';
import { useBadcase } from '../contexts/BadcaseContext';
import dayjs from 'dayjs';
import AudioPlayer from '../components/AudioPlayer';
import './BadcaseListPage.css';

const { Option } = Select;
const { TextArea } = Input;

const BadcaseListPage = () => {
  const { badcaseList, addBadcase } = useBadcase();
  const [dataSource, setDataSource] = useState<BadcaseData[]>(badcaseList);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<BadcaseData | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadForm] = Form.useForm();
  const [audioFileList, setAudioFileList] = useState<UploadFile[]>([]);
  const [videoFileList, setVideoFileList] = useState<UploadFile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [audioPlayerVisible, setAudioPlayerVisible] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState('');
  const [currentRecordId, setCurrentRecordId] = useState('');
  const [videoPlayerVisible, setVideoPlayerVisible] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');

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

  const getStatusColor = (status: string) => {
    const colors = {
      resolved: 'success',
      processing: 'processing',
      algorithm_processing: 'processing',
      engineering_processing: 'warning',
      pending: 'default',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts = {
      resolved: '已解决',
      processing: '处理中',
      algorithm_processing: '算法处理中',
      engineering_processing: '工程处理中',
      pending: '待处理',
    };
    return texts[status as keyof typeof texts] || status;
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
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
      filters: [
        { text: '待处理', value: 'pending' },
        { text: '算法处理中', value: 'algorithm_processing' },
        { text: '工程处理中', value: 'engineering_processing' },
        { text: '已解决', value: 'resolved' },
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
      filters: [
        { text: '全程TTS做课部分', value: 'fullTTS' },
        { text: '行课互动部分', value: 'interactive' },
      ],
      onFilter: (value, record) => record.location === value,
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
      title: '问题模型ID',
      dataIndex: 'modelId',
      key: 'modelId',
      width: 150,
      ellipsis: true,
      filters: (() => {
        // 动态获取所有不重复的问题模型ID
        const uniqueModelIds = Array.from(
          new Set(
            dataSource
              .filter(item => item.modelId && item.modelId.trim() !== '')
              .map(item => item.modelId!)
          )
        ).sort();
        return uniqueModelIds.map(id => ({ text: id, value: id }));
      })(),
      onFilter: (value, record) => record.modelId === value,
      filterSearch: true, // 启用筛选搜索功能
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
              音频
            </Button>
          )}
          {record.videoUrl && (
            <Button
              type="link"
              icon={<VideoCameraOutlined />}
              onClick={() => handlePlayVideo(record)}
            >
              视频
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
      setCurrentAudioUrl(record.audioUrl);
      setCurrentRecordId(record.id);
      setAudioPlayerVisible(true);
    } else {
      message.warning('该记录没有上传音频文件');
    }
  };

  const handlePlayVideo = (record: BadcaseData) => {
    if (record.videoUrl) {
      setCurrentVideoUrl(record.videoUrl);
      setVideoPlayerVisible(true);
    } else {
      message.warning('该记录没有上传视频文件');
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

  const handleOpenUploadModal = () => {
    setUploadModalVisible(true);
    uploadForm.resetFields();
    setAudioFileList([]);
    setVideoFileList([]);
    setSelectedSubject('');
    setAvailableModels([]);
    setSelectedLocation('');
  };

  // 处理学科选择变化
  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    const models = getModelsBySubject(subject);
    setAvailableModels(models);
    // 清空已选择的模型ID
    uploadForm.setFieldsValue({ modelId: undefined });
  };

  const handleUploadSubmit = async () => {
    try {
      const values = await uploadForm.validateFields();
      
      // 生成新的ID：8位短码（BC + 6位随机字符）
      const generateUniqueId = () => {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let id = 'BC';
        for (let i = 0; i < 6; i++) {
          id += chars[Math.floor(Math.random() * chars.length)];
        }
        return id;
      };
      const newId = generateUniqueId();
      
      // 处理分类：如果选择"其他"，使用具体填写的内容
      let finalCategory = values.category;
      if (values.category === '其他' && values.otherCategory) {
        finalCategory = `其他-${values.otherCategory}`;
      }
      
      // 获取当前日期作为提交日期
      const currentDate = dayjs().format('YYYY-MM-DD');
      
      // 将音频文件转换为 Base64
      let audioUrl: string | undefined = undefined;
      if (audioFileList.length > 0 && audioFileList[0].originFileObj) {
        try {
          const file = audioFileList[0].originFileObj as File;
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          audioUrl = base64;
          console.log('✅ 音频文件已成功处理');
        } catch (error) {
          console.error('❌ 音频文件转换失败:', error);
          message.warning('音频文件处理失败，将跳过音频上传');
        }
      }
      
      // 将视频文件转换为 Base64
      let videoUrl: string | undefined = undefined;
      if (videoFileList.length > 0 && videoFileList[0].originFileObj) {
        try {
          const file = videoFileList[0].originFileObj as File;
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          videoUrl = base64;
          console.log('✅ 视频文件已成功处理');
        } catch (error) {
          console.error('❌ 视频文件转换失败:', error);
          message.warning('视频文件处理失败，将跳过视频上传');
        }
      }
      
      // 创建新的Badcase记录
      const newBadcase: BadcaseData = {
        id: newId,
        date: currentDate, // 使用当前日期作为提交日期
        subject: values.subject, // 保存学科
        location: values.location, // 保存出现位置
        fullTtsLessonId: values.location === 'fullTTS' ? values.fullTtsLessonId : undefined, // 全程TTS课节ID
        cmsId: values.location === 'interactive' ? values.cmsId : undefined, // CMS课节ID
        reporter: values.reporter, // 保存问题提报人
        category: finalCategory,
        expectedFixDate: values.expectedFixDate.format('YYYY-MM-DD'),
        status: 'pending',
        description: values.description,
        audioUrl: audioUrl,
        videoUrl: videoUrl,
        modelId: values.location === 'interactive' ? values.modelId : undefined, // 只在行课互动时保存问题模型ID
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };

      // 使用 Context 添加数据
      addBadcase(newBadcase);
      
      message.success('Badcase上传成功！');
      setUploadModalVisible(false);
      uploadForm.resetFields();
      setAudioFileList([]);
      setVideoFileList([]);
      setSelectedCategory('');
      setSelectedSubject('');
      setAvailableModels([]);
      setSelectedLocation('');
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleAudioChange = (info: { fileList: UploadFile[] }) => {
    // 限制只能上传一个文件
    let fileList = [...info.fileList];
    fileList = fileList.slice(-1);
    setAudioFileList(fileList);
  };

  const beforeAudioUpload = (file: File) => {
    const isAudio = file.type.startsWith('audio/');
    if (!isAudio) {
      message.error('只能上传音频文件！');
      return false;
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('音频文件大小不能超过10MB！');
      return false;
    }
    return false; // 阻止自动上传
  };

  const handleVideoChange = (info: { fileList: UploadFile[] }) => {
    // 限制只能上传一个文件
    let fileList = [...info.fileList];
    fileList = fileList.slice(-1);
    setVideoFileList(fileList);
  };

  const beforeVideoUpload = (file: File) => {
    const isVideo = file.type.startsWith('video/');
    if (!isVideo) {
      message.error('只能上传视频文件！');
      return false;
    }
    const isLt50M = file.size / 1024 / 1024 < 50;
    if (!isLt50M) {
      message.error('视频文件大小不能超过50MB！');
      return false;
    }
    return false; // 阻止自动上传
  };

  return (
    <div className="badcase-list-page">
      <Card className="filter-card">
        <Space wrap size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space wrap size="middle">
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
          <Button 
            type="primary" 
            icon={<CloudUploadOutlined />}
            onClick={handleOpenUploadModal}
            size="large"
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
          >
            新建Badcase
          </Button>
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
            {selectedRecord.videoUrl && (
              <Descriptions.Item label="视频文件" span={2}>
                <Button
                  type="link"
                  icon={<VideoCameraOutlined />}
                  onClick={() => handlePlayVideo(selectedRecord)}
                >
                  播放视频
                </Button>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* 上传Badcase Modal */}
      <Modal
        title={
          <Space>
            <CloudUploadOutlined style={{ color: '#667eea', fontSize: 24 }} />
            <span>新建Badcase</span>
          </Space>
        }
        open={uploadModalVisible}
        onCancel={() => {
          setUploadModalVisible(false);
          uploadForm.resetFields();
          setAudioFileList([]);
          setVideoFileList([]);
          setSelectedCategory('');
          setSelectedSubject('');
          setAvailableModels([]);
          setSelectedLocation('');
        }}
        onOk={handleUploadSubmit}
        width={700}
        okText="提交"
        cancelText="取消"
      >
        <Form
          form={uploadForm}
          layout="vertical"
          style={{ marginTop: 20 }}
        >
          <Form.Item
            name="subject"
            label="学科"
            rules={[{ required: true, message: '请选择学科' }]}
          >
            <Select 
              placeholder="请先选择学科"
              onChange={handleSubjectChange}
            >
              {getSubjectList().map(subject => (
                <Option key={subject.value} value={subject.value}>
                  {subject.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="location"
            label="出现位置"
            rules={[{ required: true, message: '请选择出现位置' }]}
          >
            <Select 
              placeholder="请选择出现位置"
              onChange={(value) => {
                setSelectedLocation(value);
                // 清空相关ID字段
                uploadForm.setFieldsValue({ 
                  fullTtsLessonId: undefined,
                  cmsId: undefined,
                  modelId: undefined // 清空问题模型ID
                });
              }}
            >
              <Option value="fullTTS">全程TTS做课部分</Option>
              <Option value="interactive">行课互动部分</Option>
            </Select>
          </Form.Item>

          {/* 根据出现位置显示不同的ID输入框 */}
          {selectedLocation === 'fullTTS' && (
            <Form.Item
              name="fullTtsLessonId"
              label="全程TTS课节ID"
              rules={[{ required: true, message: '请输入全程TTS课节ID' }]}
            >
              <Input placeholder="请输入全程TTS课节ID" />
            </Form.Item>
          )}

          {selectedLocation === 'interactive' && (
            <Form.Item
              name="cmsId"
              label="CMS课节ID"
              rules={[{ required: true, message: '请输入CMS课节ID' }]}
            >
              <Input placeholder="请输入CMS课节ID" />
            </Form.Item>
          )}

          <Form.Item
            name="reporter"
            label="问题提报人"
            rules={[{ required: true, message: '请输入问题提报人姓名' }]}
          >
            <Input placeholder="请输入提报人姓名" />
          </Form.Item>

          {/* 只在选择"行课互动部分"时显示问题模型ID */}
          {selectedLocation === 'interactive' && (
            <Form.Item
              name="modelId"
              label="问题模型ID"
              rules={[{ required: true, message: '请选择问题模型ID' }]}
            >
              <Select 
                placeholder={selectedSubject ? "请选择问题模型ID" : "请先选择学科"}
                disabled={!selectedSubject}
              >
                {availableModels.map(model => (
                  <Option key={model} value={model}>
                    {model}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select 
              placeholder="请选择问题分类"
              onChange={(value) => setSelectedCategory(value)}
            >
              <Option value="读音错误">读音错误</Option>
              <Option value="停顿不当">停顿不当</Option>
              <Option value="重读不对">重读不对</Option>
              <Option value="语速突变">语速突变</Option>
              <Option value="音量突变">音量突变</Option>
              <Option value="音质问题">音质问题</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>

          {/* 当选择"其他"时显示输入框 */}
          {selectedCategory === '其他' && (
            <Form.Item
              name="otherCategory"
              label="请填写具体分类"
              rules={[
                { required: true, message: '请填写具体的分类内容' },
                { min: 2, message: '分类内容至少需要2个字符' },
                { max: 20, message: '分类内容不能超过20个字符' }
              ]}
            >
              <Input 
                placeholder="请输入具体的问题分类..."
                showCount
                maxLength={20}
              />
            </Form.Item>
          )}

          <Form.Item
            name="expectedFixDate"
            label="期望修复时间"
            rules={[{ required: true, message: '请选择期望修复时间' }]}
          >
            <DatePicker 
              placeholder="请选择期望修复时间"
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="问题描述"
            rules={[
              { required: true, message: '请输入问题描述' },
              { min: 10, message: '描述至少需要10个字符' }
            ]}
          >
            <TextArea 
              rows={4} 
              placeholder="请给出以下信息：1、详细的每个问题描述 2、每个问题描述对应的问题文本。可一次提供多个问题，但每个问题需要分别描述并给出对应文本"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            label="音频文件"
            extra="支持 MP3、WAV、AAC 等格式，文件大小不超过10MB"
          >
            <Upload
              fileList={audioFileList}
              onChange={handleAudioChange}
              beforeUpload={beforeAudioUpload}
              accept="audio/*"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />} block>
                {audioFileList.length > 0 ? '重新选择音频文件' : '上传音频文件（可选）'}
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="视频文件"
            extra="支持 MP4、MOV、AVI 等格式，文件大小不超过50MB，方便定位和分类问题"
          >
            <Upload
              fileList={videoFileList}
              onChange={handleVideoChange}
              beforeUpload={beforeVideoUpload}
              accept="video/*"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />} block>
                {videoFileList.length > 0 ? '重新选择视频文件' : '上传视频文件（可选）'}
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* 音频播放器 */}
      <AudioPlayer
        visible={audioPlayerVisible}
        audioUrl={currentAudioUrl}
        recordId={currentRecordId}
        onClose={() => setAudioPlayerVisible(false)}
      />

      {/* 视频播放器 */}
      <Modal
        title="视频播放"
        open={videoPlayerVisible}
        onCancel={() => setVideoPlayerVisible(false)}
        footer={[
          <Button key="close" onClick={() => setVideoPlayerVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
        centered
      >
        {currentVideoUrl && (
          <video
            controls
            style={{ width: '100%', maxHeight: '500px' }}
            src={currentVideoUrl}
          >
            您的浏览器不支持视频播放
          </video>
        )}
      </Modal>
    </div>
  );
};

export default BadcaseListPage;

