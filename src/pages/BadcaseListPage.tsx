import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Card, Space, Tag, Input, Select, Button, Modal, Descriptions, Form, Upload, message, DatePicker } from 'antd';
import type { Dayjs } from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import { SearchOutlined, EyeOutlined, PlayCircleOutlined, UploadOutlined, CloudUploadOutlined, VideoCameraOutlined, DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { BadcaseData } from '../types';
import { getSubjectList, getModelsBySubjectAndLocation, getSubjectLabel, locationOptions, getLocationLabel, requiresCmsId, requiresModelId } from '../config/subjectModelMapping';
import { useBadcase } from '../contexts/BadcaseContext';
import { CATEGORY_OPTIONS } from '../constants/categories';
import { 
  getPriorityOptions, 
  getPriorityColor, 
  getPriorityText,
  getCategoryOptions,
  getAllCategoryOptions,
  getCategoryLabel,
  getSubcategoryOptions,
  type BusinessType
} from '../constants/businessConfig';
import dayjs from 'dayjs';
import AudioPlayer from '../components/AudioPlayer';
import BackButton from '../components/BackButton';
import './BadcaseListPage.css';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const BadcaseListPage = () => {
  const [searchParams] = useSearchParams();
  const { badcaseList, addBadcase, currentBusiness, setCurrentBusiness } = useBadcase();
  
  // 从 URL 参数获取业务方向
  useEffect(() => {
    const business = searchParams.get('business') || 'next';
    setCurrentBusiness(business);
  }, [searchParams, setCurrentBusiness]);
  
  // 获取当前业务方向，用于返回按钮
  const business = (searchParams.get('business') || 'next') as BusinessType;
  
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
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>(''); // 风灵：主分类
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');   // 风灵：子分类
  const [selectedCategory, setSelectedCategory] = useState<string>('');         // Next：分类
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [audioPlayerVisible, setAudioPlayerVisible] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState('');
  const [currentRecordId, setCurrentRecordId] = useState('');
  const [videoPlayerVisible, setVideoPlayerVisible] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

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

  // 移除本地的优先级函数，使用导入的统一配置
  // const getPriorityColor 和 getPriorityText 现在从 businessConfig 导入
  
  // 根据业务方向生成分类筛选器
  const getCategoryFilters = () => {
    const options = getAllCategoryOptions(business);
    return options.map(opt => ({ text: opt.label, value: opt.value }));
  };
  
  // 根据业务方向生成优先级筛选器
  const getPriorityFilters = () => {
    const options = getPriorityOptions(business);
    const filters = options.map(opt => ({ text: opt.label, value: opt.value }));
    return [...filters, { text: '未填写', value: '__none__' }];
  };
  
  // 根据业务方向验证优先级值
  const getValidPriorities = () => {
    return getPriorityOptions(business).map(opt => opt.value);
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
      render: (category: string) => getCategoryLabel(category, business),
      filters: getCategoryFilters(),
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
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 180,
      render: (priority?: string) => (
        <Tag 
          color={getPriorityColor(priority, business)}
          style={{ 
            margin: 0,
            padding: '4px 12px',
            fontSize: '13px',
            lineHeight: '1.5',
            whiteSpace: 'nowrap'
          }}
        >
          {getPriorityText(priority, business)}
        </Tag>
      ),
      filters: getPriorityFilters(),
      onFilter: (value, record) => {
        if (value === '__none__') {
          // 未设置：排除所有有效的优先级值
          const validPriorities = getValidPriorities();
          return !record.priority || !validPriorities.includes(record.priority);
        }
        return record.priority === value;
      },
      sorter: (a, b) => {
        // 动态生成优先级排序
        const validPriorities = getValidPriorities();
        const priorityOrder: Record<string, number> = {};
        validPriorities.forEach((p, index) => {
          priorityOrder[p] = validPriorities.length - index;
        });
        const aPriority = priorityOrder[a.priority || ''] || 0;
        const bPriority = priorityOrder[b.priority || ''] || 0;
        return bPriority - aPriority; // 最高优先级在前
      },
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
        return location ? getLocationLabel(location) : '-';
      },
      filters: locationOptions.map(loc => ({ text: loc.label, value: loc.value })),
      onFilter: (value, record) => record.location === value,
    },
    {
      title: '相关课节ID',
      dataIndex: 'cmsId',
      key: 'cmsId',
      width: 150,
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
      title: '大小模型',
      dataIndex: 'modelSize',
      key: 'modelSize',
      width: 100,
      render: (modelSize: string) => {
        if (!modelSize) return '-';
        const text = modelSize === 'large_model' ? '大模型' : '小模型';
        return <span style={{ whiteSpace: 'nowrap' }}>{text}</span>;
      },
      filters: [
        { text: '大模型', value: 'large_model' },
        { text: '小模型', value: 'small_model' },
      ],
      onFilter: (value, record) => record.modelSize === value,
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

      if (priorityFilter !== 'all') {
        filtered = filtered.filter((item) => {
          if (priorityFilter === 'none') return !item.priority;
          return item.priority === priorityFilter;
        });
      }

      // 日期范围筛选
      if (dateRange && dateRange[0] && dateRange[1]) {
        const [startDate, endDate] = dateRange;
        filtered = filtered.filter((item) => {
          const itemDate = dayjs(item.date);
          return (itemDate.isAfter(startDate.subtract(1, 'day'), 'day') || itemDate.isSame(startDate, 'day')) &&
                 (itemDate.isBefore(endDate.add(1, 'day'), 'day') || itemDate.isSame(endDate, 'day'));
        });
      } else if (dateRange && dateRange[0]) {
        // 只选择了起始日期
        const startDate = dateRange[0];
        filtered = filtered.filter((item) => {
          const itemDate = dayjs(item.date);
          return itemDate.isAfter(startDate.subtract(1, 'day'), 'day') || itemDate.isSame(startDate, 'day');
        });
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
    setPriorityFilter('all');
    setDateRange(null);
    // 按ID降序排列（新到旧）
    const sortedList = [...badcaseList].sort((a, b) => {
      const numA = parseInt(a.id.replace(/\D/g, ''), 10);
      const numB = parseInt(b.id.replace(/\D/g, ''), 10);
      return numB - numA;
    });
    setDataSource(sortedList);
  };

  // 处理长文本，避免Excel单元格超过32767字符限制
  const truncateText = (text: string, maxLength: number = 32000): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...(已截断)';
  };

  // 处理URL，如果是base64编码的，只显示标识
  const formatUrl = (url: string | undefined): string => {
    if (!url) return '';
    // 如果是base64编码的数据URL，只显示类型标识
    if (url.startsWith('data:')) {
      const match = url.match(/data:([^;]+)/);
      if (match) {
        return `[${match[1]}文件]`;
      }
      return '[文件]';
    }
    // 普通URL，如果太长则截断
    return truncateText(url, 200);
  };

  // 导出Excel功能
  const handleExportExcel = () => {
    // 获取选中的记录
    const selectedRecords = dataSource.filter(record => selectedRowKeys.includes(record.id));
    
    if (selectedRecords.length === 0) {
      message.warning('请先选择要导出的case');
      return;
    }

    // 按照图2的表头格式准备数据
    const excelData = selectedRecords.map((record) => {
      // 格式化优先级
      let priorityText = '';
      if (record.priority) {
        priorityText = getPriorityText(record.priority, business);
      } else {
        priorityText = '未填写';
      }

      return {
        'ID': record.id || '',
        '问题文本': truncateText(record.problemText || ''),
        '问题链接': '', // 直接为空，不读取数据表
        '问题截图': '', // 直接为空，不读取数据表
        '问题录屏': '', // 直接为空，不读取数据表
        '问题音频': '', // 直接为空，不读取数据表
        '问题描述': truncateText(record.problemDescription || record.description || ''),
        '修复优先级': priorityText,
        '反馈日期': record.date || '',
        '反馈人': record.reporter || '', // 问题提报人，放在最后一列
      };
    });

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // 设置列宽
    ws['!cols'] = [
      { wch: 15 }, // ID
      { wch: 30 }, // 问题文本
      { wch: 20 }, // 问题链接
      { wch: 20 }, // 问题截图
      { wch: 30 }, // 问题录屏
      { wch: 30 }, // 问题音频
      { wch: 40 }, // 问题描述
      { wch: 20 }, // 修复优先级
      { wch: 15 }, // 反馈日期
      { wch: 15 }, // 反馈人
    ];

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, 'Badcase列表');

    // 生成文件名（包含当前日期）
    const fileName = `Next方向Badcase列表_${dayjs().format('YYYY-MM-DD')}.xlsx`;

    // 导出文件
    XLSX.writeFile(wb, fileName);
    message.success(`成功导出 ${selectedRecords.length} 条数据`);
    // 清空选择
    setSelectedRowKeys([]);
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
    // 根据学科和当前选择的出现位置获取模型ID列表
    const models = getModelsBySubjectAndLocation(subject, selectedLocation);
    setAvailableModels(models);
    // 清空已选择的模型ID
    uploadForm.setFieldsValue({ modelId: undefined });
  };

  // 处理出现位置选择变化
  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    // 如果已经选择了学科，需要根据新的出现位置更新模型ID列表
    if (selectedSubject) {
      const models = getModelsBySubjectAndLocation(selectedSubject, location);
      setAvailableModels(models);
      // 清空已选择的模型ID
      uploadForm.setFieldsValue({ modelId: undefined });
    }
    // 清空相关ID字段
    uploadForm.setFieldsValue({ 
      fullTtsLessonId: undefined,
      cmsId: undefined,
    });
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
        cmsId: requiresCmsId(values.location) ? values.cmsId : undefined, // 相关课节ID
        reporter: values.reporter, // 保存问题提报人
        category: finalCategory,
        expectedFixDate: values.expectedFixDate.format('YYYY-MM-DD'),
        status: 'pending',
        priority: values.priority || undefined,
        // Next方向：保存两个独立字段；风灵方向：保存description字段
        description: business === 'next' 
          ? (values.problemDescription || '') + (values.problemText ? `\n\n问题文本：${values.problemText}` : '')
          : values.description,
        problemDescription: business === 'next' ? values.problemDescription : undefined,
        problemText: business === 'next' ? values.problemText : undefined,
        remark: business === 'next' ? values.remark : undefined,
        audioUrl: audioUrl,
        videoUrl: videoUrl,
        modelSize: requiresModelId(values.location) ? values.modelSize : undefined, // 只在需要时保存大小模型
        modelId: requiresModelId(values.location) ? values.modelId : undefined, // 只在需要时保存问题模型ID
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
      <BackButton to={`/business-portal?business=${business}`} />
      
      {/* 页面标题 */}
      <h2 style={{ marginBottom: 16, fontSize: 24, fontWeight: 'bold' }}>
        {business === 'fengling' ? '风灵方向badcase跟进' : 'NEXT方向badcase跟进'}
      </h2>
      
      <Card className="filter-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 第一行：搜索和基础筛选 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <Input
              placeholder="搜索ID或描述"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 220 }}
              onPressEnter={handleSearch}
              allowClear
            />
            <Select
              value={subjectFilter}
              onChange={setSubjectFilter}
              style={{ width: 130 }}
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
              placeholder="全部分类"
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
              placeholder="全部状态"
            >
              <Option value="all">全部状态</Option>
              <Option value="pending">待处理</Option>
              <Option value="algorithm_processing">算法处理中</Option>
              <Option value="engineering_processing">工程处理中</Option>
              <Option value="resolved">已解决</Option>
            </Select>
            <Select
              value={priorityFilter}
              onChange={setPriorityFilter}
              style={{ width: 180 }}
              placeholder="全部优先级"
            >
              <Option value="all">全部优先级</Option>
              <Option value="P00">P00：立刻修复</Option>
              <Option value="P0">P0：多天内修复</Option>
              <Option value="P1">P1：多周内修复</Option>
              <Option value="P2">P2：可先不修</Option>
              <Option value="none">未设置</Option>
            </Select>
          </div>
          
          {/* 第二行：日期筛选和操作按钮 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
                format="YYYY-MM-DD"
                placeholder={['起始日期', '结束日期']}
                style={{ width: 280 }}
              />
              <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </div>
            <Space>
              {business === 'next' && (
                <Button 
                  type="default"
                  icon={<DownloadOutlined />}
                  onClick={handleExportExcel}
                  size="large"
                  disabled={selectedRowKeys.length === 0}
                  style={{ 
                    height: 40,
                    fontWeight: 500
                  }}
                >
                  导出Excel{selectedRowKeys.length > 0 ? ` (${selectedRowKeys.length})` : ''}
                </Button>
              )}
              <Button 
                type="primary" 
                icon={<CloudUploadOutlined />}
                onClick={handleOpenUploadModal}
                size="large"
                style={{ 
                  height: 40,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  fontWeight: 500
                }}
              >
                新建Badcase
              </Button>
            </Space>
          </div>
        </div>
      </Card>

      <Card style={{ marginTop: 16 }}>
        {business === 'next' && selectedRowKeys.length > 0 && (
          <div style={{ marginBottom: 16, padding: '8px 16px', background: '#e6f7ff', borderRadius: 4 }}>
            <Space>
              <span>已选择 {selectedRowKeys.length} 条数据</span>
              <Button size="small" onClick={() => setSelectedRowKeys([])}>清空选择</Button>
            </Space>
          </div>
        )}
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1200 }}
          rowSelection={business === 'next' ? {
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys as string[]),
            getCheckboxProps: (record) => ({
              name: record.id,
            }),
          } : undefined}
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
              {selectedRecord.location ? getLocationLabel(selectedRecord.location) : '未填写'}
            </Descriptions.Item>
            {requiresCmsId(selectedRecord.location || '') && selectedRecord.cmsId && (
              <Descriptions.Item label="相关课节ID" span={2}>
                {selectedRecord.cmsId}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="问题提报人" span={2}>
              {selectedRecord.reporter || '未填写'}
            </Descriptions.Item>
            {requiresModelId(selectedRecord.location || '') && selectedRecord.modelSize && (
              <Descriptions.Item label="大小模型" span={2}>
                {selectedRecord.modelSize === 'large_model' ? '大模型' : '小模型'}
              </Descriptions.Item>
            )}
            {requiresModelId(selectedRecord.location || '') && (
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
            <Descriptions.Item label="状态">
              <Tag color={getStatusColor(selectedRecord.status)}>
                {getStatusText(selectedRecord.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="优先级">
              <Tag color={getPriorityColor(selectedRecord.priority, business)}>
                {getPriorityText(selectedRecord.priority, business)}
              </Tag>
            </Descriptions.Item>
            {business === 'next' ? (
              <>
                <Descriptions.Item label="问题文本" span={2}>
                  {selectedRecord.problemText || '未填写'}
                </Descriptions.Item>
                <Descriptions.Item label="问题描述" span={2}>
                  {selectedRecord.problemDescription || selectedRecord.description || '未填写'}
                </Descriptions.Item>
                <Descriptions.Item label="备注" span={2}>
                  {selectedRecord.remark || '未填写'}
                </Descriptions.Item>
              </>
            ) : (
              <Descriptions.Item label="描述" span={2}>
                {selectedRecord.description}
              </Descriptions.Item>
            )}
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
              onChange={handleLocationChange}
            >
              {locationOptions.map(loc => (
                <Option key={loc.value} value={loc.value}>
                  {loc.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* 根据出现位置显示不同的ID输入框 */}
          {requiresCmsId(selectedLocation) && (
            <Form.Item
              name="cmsId"
              label="相关课节ID"
              rules={[{ required: true, message: '请输入相关课节ID' }]}
            >
              <Input placeholder="请输入相关课节ID" />
            </Form.Item>
          )}

          <Form.Item
            name="reporter"
            label="问题提报人"
            rules={[{ required: true, message: '请输入问题提报人姓名' }]}
          >
            <Input placeholder="请输入提报人姓名" />
          </Form.Item>

          {/* 只在需要问题模型ID的位置显示大小模型和问题模型ID */}
          {requiresModelId(selectedLocation) && (
            <>
              <Form.Item
                name="modelSize"
                label="大小模型"
                rules={[{ required: true, message: '请选择大小模型' }]}
              >
                <Select placeholder="请选择大小模型">
                  <Option value="large_model">大模型</Option>
                  <Option value="small_model">小模型</Option>
                </Select>
              </Form.Item>

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
            </>
          )}

          {/* 风灵方向：先选主分类，再选子分类 */}
          {business === 'fengling' ? (
            <>
              <Form.Item
                name="mainCategory"
                label="主分类"
                rules={[{ required: true, message: '请选择主分类' }]}
              >
                <Select 
                  placeholder="请选择主分类（TTS/ASR/VAD）"
                  onChange={(value) => {
                  setSelectedMainCategory(value);
                  setSelectedSubcategory('');
                  // 清空子分类表单值
                  uploadForm.setFieldsValue({ category: undefined });
                }}
              >
                {getCategoryOptions(business).map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="category"
              label="子分类"
              rules={[{ required: true, message: '请选择子分类' }]}
            >
              <Select 
                placeholder={selectedMainCategory ? "请选择具体问题类型" : "请先选择主分类"}
                disabled={!selectedMainCategory}
                onChange={(value) => setSelectedSubcategory(value)}
              >
                {getSubcategoryOptions(selectedMainCategory, business).map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
              </Form.Item>
            </>
          ) : (
            /* Next方向：直接选择分类 */
            <Form.Item
              name="category"
              label="分类"
              rules={[{ required: true, message: '请选择分类' }]}
            >
              <Select 
                placeholder="请选择问题分类"
                onChange={(value) => setSelectedCategory(value)}
              >
                {CATEGORY_OPTIONS.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

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
            name="priority"
            label="修复优先级（可选）"
          >
            <Select placeholder="请选择修复优先级（可留空）" allowClear>
              {getPriorityOptions(business).map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {business === 'next' ? (
            <>
              <Form.Item
                name="problemText"
                label="问题文本"
                rules={[
                  { required: true, message: '请输入问题文本' },
                  { min: 5, message: '问题文本至少需要5个字符' }
                ]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="出现问题的原始文本，至少是一条完整单句"
                  showCount
                  maxLength={500}
                />
              </Form.Item>
              <Form.Item
                name="problemDescription"
                label="问题描述"
                rules={[
                  { required: true, message: '请输入问题描述' },
                  { min: 10, message: '描述至少需要10个字符' }
                ]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="出现的问题，以及期望的结果"
                  showCount
                  maxLength={500}
                />
              </Form.Item>
              <Form.Item
                name="remark"
                label="备注"
              >
                <TextArea 
                  rows={4} 
                  placeholder="可在此处备注复现反馈、跟进状态、流转状态、当前效果说明等"
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </>
          ) : (
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
          )}

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

