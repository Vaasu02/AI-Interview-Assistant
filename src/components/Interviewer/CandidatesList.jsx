import React, { useState, useMemo } from 'react';
import { 
  Card, 
  Table, 
  Input, 
  Select, 
  Space, 
  Tag, 
  Button, 
  Typography, 
  Avatar,
  Tooltip,
  Empty
} from 'antd';
import { 
  SearchOutlined, 
  UserOutlined, 
  TrophyOutlined,
  EyeOutlined,
  FilterOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

const CandidatesList = ({ candidates, selectedCandidate, onCandidateSelect }) => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const filteredAndSortedCandidates = useMemo(() => {
    let filtered = candidates.filter(candidate => {
      // Search filter
      const searchMatch = !searchText || 
        candidate.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        candidate.email?.toLowerCase().includes(searchText.toLowerCase());
      
      // Status filter
      const statusMatch = statusFilter === 'all' || candidate.status === statusFilter;
      
      return searchMatch && statusMatch;
    });

    // Sort candidates
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'finalScore') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      }
      
      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [candidates, searchText, statusFilter, sortBy, sortOrder]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'processing';
      case 'ready': return 'default';
      case 'paused': return 'warning';
      default: return 'default';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    if (score >= 4) return 'orange';
    return 'error';
  };

  const columns = [
    {
      title: 'Candidate',
      key: 'candidate',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status?.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Score',
      dataIndex: 'finalScore',
      key: 'finalScore',
      render: (score) => (
        score !== undefined ? (
          <Space>
            <TrophyOutlined style={{ color: '#faad14' }} />
            <Tag color={getScoreColor(score)}>{score}/10</Tag>
          </Space>
        ) : (
          <Text type="secondary">-</Text>
        )
      ),
      sorter: true,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <Tooltip title={dayjs(date).format('YYYY-MM-DD HH:mm:ss')}>
          <Text type="secondary">
            {dayjs(date).format('MMM DD, YYYY')}
          </Text>
        </Tooltip>
      ),
      sorter: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => onCandidateSelect(record)}
        >
          View Details
        </Button>
      ),
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    if (sorter.field) {
      setSortBy(sorter.field);
      setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
    }
  };

  return (
    <Card 
      title="Candidates Dashboard" 
      extra={
        <Space>
          <Text type="secondary">
            Total: {candidates.length} | 
            Completed: {candidates.filter(c => c.status === 'completed').length}
          </Text>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Filters */}
        <Space wrap>
          <Search
            placeholder="Search by name or email"
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
          />
          
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            prefix={<FilterOutlined />}
          >
            <Option value="all">All Status</Option>
            <Option value="ready">Ready</Option>
            <Option value="in_progress">In Progress</Option>
            <Option value="completed">Completed</Option>
            <Option value="paused">Paused</Option>
          </Select>
          
          <Select
            value={`${sortBy}-${sortOrder}`}
            onChange={(value) => {
              const [field, order] = value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            style={{ width: 180 }}
          >
            <Option value="createdAt-desc">Latest First</Option>
            <Option value="createdAt-asc">Oldest First</Option>
            <Option value="finalScore-desc">Highest Score</Option>
            <Option value="finalScore-asc">Lowest Score</Option>
            <Option value="name-asc">Name A-Z</Option>
            <Option value="name-desc">Name Z-A</Option>
          </Select>
        </Space>

        {/* Table */}
        {filteredAndSortedCandidates.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredAndSortedCandidates}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} candidates`,
            }}
            onChange={handleTableChange}
            rowSelection={{
              type: 'radio',
              selectedRowKeys: selectedCandidate ? [selectedCandidate.id] : [],
              onSelect: (record) => onCandidateSelect(record),
            }}
            size="middle"
          />
        ) : (
          <Empty 
            description="No candidates found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Space>
    </Card>
  );
};

export default CandidatesList;
