import React, { useState, useEffect, useRef } from 'react'
import {
  Table,
  Tag,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  Tooltip,
  Modal,
  Form,
  message
} from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import type { FilterValue, SorterResult } from 'antd/es/table/interface'
import dayjs from 'dayjs'
import { getBadcases, createBadcase, updateBadcase, type Badcase } from '../services/api'

const { RangePicker } = DatePicker
const { TextArea } = Input

interface TableParams {
  pagination?: TablePaginationConfig
  sortField?: string
  sortOrder?: string
  filters?: Record<string, FilterValue | null>
}

const BadcaseTable: React.FC = () => {
  const [data, setData] = useState<Badcase[]>([])
  const [loading, setLoading] = useState(false)
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 20,
    },
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Badcase | null>(null)
  const [form] = Form.useForm()
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 搜索和过滤状态
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>()
  const [priorityFilter, setPriorityFilter] = useState<string>()
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)

  useEffect(() => {
    fetchData()
  }, [JSON.stringify(tableParams), searchText, statusFilter, priorityFilter, dateRange])

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await getBadcases({
        page: tableParams.pagination?.current || 1,
        pageSize: tableParams.pagination?.pageSize || 20,
        searchText,
        status: statusFilter,
        priority: priorityFilter,
        startDate: dateRange?.[0].format('YYYY-MM-DD'),
        endDate: dateRange?.[1].format('YYYY-MM-DD'),
      })
      setData(result.data)
      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          total: result.total,
        },
      })
    } catch (error) {
      message.error('加载数据失败')
    }
    setLoading(false)
  }

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<Badcase> | SorterResult<Badcase>[]
  ) => {
    setTableParams({
      pagination,
      filters,
      ...sorter,
    })
  }

  const playAudio = (audioUrl: string, recordId: string) => {
    if (playingAudio === recordId) {
      audioRef.current?.pause()
      setPlayingAudio(null)
    } else {
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.play()
        setPlayingAudio(recordId)
      }
    }
  }

  useEffect(() => {
    const audio = new Audio()
    audio.addEventListener('ended', () => setPlayingAudio(null))
    audioRef.current = audio
    return () => {
      audio.pause()
      audio.remove()
    }
  }, [])

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'P00': '#ff4d4f',
      'P0': '#ff7a45',
      'P1': '#ffa940',
      'P2': '#52c41a',
    }
    return colors[priority] || '#d9d9d9'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      '修复中': '#faad14',
      '待确认': '#1890ff',
      '已上线并验证': '#52c41a',
      '已关闭': '#8c8c8c',
      '停顿': '#d9d9d9',
    }
    return colors[status] || '#d9d9d9'
  }

  const columns: ColumnsType<Badcase> = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      fixed: 'left',
    },
    {
      title: '问题文本',
      dataIndex: 'problemText',
      key: 'problemText',
      width: 250,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: '问题音频',
      dataIndex: 'audioUrl',
      key: 'audioUrl',
      width: 120,
      render: (audioUrl, record) => (
        <div className="audio-player-cell">
          {audioUrl ? (
            <Button
              type="text"
              icon={
                playingAudio === record.id ? (
                  <PauseCircleOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                ) : (
                  <PlayCircleOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                )
              }
              onClick={() => playAudio(audioUrl, record.id)}
              className="audio-play-btn"
            />
          ) : (
            <span style={{ color: '#ccc' }}>无音频</span>
          )}
        </div>
      ),
    },
    {
      title: '问题描述',
      dataIndex: 'problemDescription',
      key: 'problemDescription',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: '问题体描述',
      dataIndex: 'detailDescription',
      key: 'detailDescription',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text || '-'}
        </Tooltip>
      ),
    },
    {
      title: '修复优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 120,
      filters: [
        { text: 'P00', value: 'P00' },
        { text: 'P0', value: 'P0' },
        { text: 'P1', value: 'P1' },
        { text: 'P2', value: 'P2' },
      ],
      render: (priority) => (
        <Tag color={getPriorityColor(priority)} style={{ fontWeight: 'bold' }}>
          {priority}
        </Tag>
      ),
    },
    {
      title: '反馈来源',
      dataIndex: 'feedbackSource',
      key: 'feedbackSource',
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: '反馈日期',
      dataIndex: 'feedbackDate',
      key: 'feedbackDate',
      width: 120,
      sorter: true,
      render: (date) => date ? dayjs(date).format('YYYY/MM/DD') : '-',
    },
    {
      title: '反馈人',
      dataIndex: 'feedbackPerson',
      key: 'feedbackPerson',
      width: 100,
      render: (text) => text || '-',
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      width: 100,
      render: (text) => text || '-',
    },
    {
      title: '问题状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      fixed: 'right',
      filters: [
        { text: '修复中', value: '修复中' },
        { text: '待确认', value: '待确认' },
        { text: '已上线并验证', value: '已上线并验证' },
        { text: '已关闭', value: '已关闭' },
        { text: '停顿', value: '停顿' },
      ],
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
        </Space>
      ),
    },
  ]

  const handleEdit = (record: Badcase) => {
    setEditingRecord(record)
    form.setFieldsValue({
      ...record,
      feedbackDate: record.feedbackDate ? dayjs(record.feedbackDate) : null,
    })
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      const data = {
        ...values,
        feedbackDate: values.feedbackDate?.format('YYYY-MM-DD'),
      }

      if (editingRecord) {
        await updateBadcase(editingRecord.id, data)
        message.success('更新成功')
      } else {
        await createBadcase(data)
        message.success('创建成功')
      }
      
      setIsModalOpen(false)
      fetchData()
    } catch (error) {
      message.error('操作失败')
    }
  }

  return (
    <div>
      <div style={{ 
        marginBottom: 16, 
        background: '#fff', 
        padding: '16px',
        borderRadius: '8px',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <Input
          placeholder="搜索问题文本"
          prefix={<SearchOutlined />}
          style={{ width: 250 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
        <Select
          placeholder="问题状态"
          style={{ width: 150 }}
          value={statusFilter}
          onChange={setStatusFilter}
          allowClear
        >
          <Select.Option value="修复中">修复中</Select.Option>
          <Select.Option value="待确认">待确认</Select.Option>
          <Select.Option value="已上线并验证">已上线并验证</Select.Option>
          <Select.Option value="已关闭">已关闭</Select.Option>
          <Select.Option value="停顿">停顿</Select.Option>
        </Select>
        <Select
          placeholder="修复优先级"
          style={{ width: 150 }}
          value={priorityFilter}
          onChange={setPriorityFilter}
          allowClear
        >
          <Select.Option value="P00">P00</Select.Option>
          <Select.Option value="P0">P0</Select.Option>
          <Select.Option value="P1">P1</Select.Option>
          <Select.Option value="P2">P2</Select.Option>
        </Select>
        <RangePicker
          value={dateRange}
          onChange={setDateRange}
          placeholder={['开始日期', '结束日期']}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          新建问题
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: 1800 }}
        bordered
      />

      <Modal
        title={editingRecord ? '编辑问题' : '新建问题'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 20 }}
        >
          <Form.Item
            name="problemText"
            label="问题文本"
            rules={[{ required: true, message: '请输入问题文本' }]}
          >
            <TextArea rows={3} placeholder="输入问题文本内容" />
          </Form.Item>
          <Form.Item
            name="audioUrl"
            label="音频URL"
          >
            <Input placeholder="输入音频文件URL" />
          </Form.Item>
          <Form.Item
            name="problemDescription"
            label="问题描述"
            rules={[{ required: true, message: '请输入问题描述' }]}
          >
            <TextArea rows={2} placeholder="输入问题描述" />
          </Form.Item>
          <Form.Item
            name="detailDescription"
            label="问题体描述"
          >
            <TextArea rows={2} placeholder="输入详细描述" />
          </Form.Item>
          <Form.Item
            name="priority"
            label="修复优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select>
              <Select.Option value="P00">P00</Select.Option>
              <Select.Option value="P0">P0</Select.Option>
              <Select.Option value="P1">P1</Select.Option>
              <Select.Option value="P2">P2</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="feedbackSource"
            label="反馈来源"
          >
            <Input placeholder="输入反馈来源" />
          </Form.Item>
          <Form.Item
            name="feedbackDate"
            label="反馈日期"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="feedbackPerson"
            label="反馈人"
          >
            <Input placeholder="输入反馈人姓名" />
          </Form.Item>
          <Form.Item
            name="creator"
            label="创建人"
          >
            <Input placeholder="输入创建人姓名" />
          </Form.Item>
          <Form.Item
            name="status"
            label="问题状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Select.Option value="修复中">修复中</Select.Option>
              <Select.Option value="待确认">待确认</Select.Option>
              <Select.Option value="已上线并验证">已上线并验证</Select.Option>
              <Select.Option value="已关闭">已关闭</Select.Option>
              <Select.Option value="停顿">停顿</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default BadcaseTable

