import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Card, 
  Descriptions, 
  Tabs, 
  Timeline, 
  Tag, 
  Typography, 
  Space, 
  Button,
  Avatar,
  Progress,
  Divider,
  List,
  Badge
} from 'antd';
import { 
  UserOutlined, 
  CloseOutlined, 
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  MessageOutlined,
  StarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Title, Paragraph } = Typography;

const CandidateDetails = ({ candidate, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get interview data for this candidate
  const allInterviews = useSelector((state) => state.interviews);
  const candidateInterview = candidate.id === allInterviews.currentInterview ? allInterviews : null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'processing';
      case 'ready': return 'default';
      case 'paused': return 'warning';
      default: return 'default';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'green';
      case 'medium': return 'orange';
      case 'hard': return 'red';
      default: return 'default';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return '#52c41a';
    if (score >= 6) return '#faad14';
    if (score >= 4) return '#fa8c16';
    return '#ff4d4f';
  };

  const renderOverview = () => (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {/* Basic Info */}
      <Card size="small" title="Candidate Information">
        <Descriptions column={1}>
          <Descriptions.Item label="Name">
            <Space>
              <Avatar icon={<UserOutlined />} />
              <Text strong>{candidate.name}</Text>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Email">{candidate.email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{candidate.phone}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(candidate.status)}>
              {candidate.status?.replace('_', ' ').toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Applied">
            {dayjs(candidate.createdAt).format('MMMM DD, YYYY [at] HH:mm')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Score Summary */}
      {candidate.finalScore !== undefined && (
        <Card size="small" title="Interview Results">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={(candidate.finalScore / 10) * 100}
                format={() => `${candidate.finalScore}/10`}
                strokeColor={getScoreColor(candidate.finalScore)}
                size={120}
              />
            </div>
            
            {candidate.summary && (
              <>
                <Divider />
                <Title level={5}>Summary</Title>
                <Paragraph>{candidate.summary.summary}</Paragraph>
                
                {candidate.summary.strengths && (
                  <>
                    <Title level={5}>Strengths</Title>
                    <List
                      size="small"
                      dataSource={candidate.summary.strengths}
                      renderItem={(item) => (
                        <List.Item>
                          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                          {item}
                        </List.Item>
                      )}
                    />
                  </>
                )}
                
                {candidate.summary.improvements && (
                  <>
                    <Title level={5}>Areas for Improvement</Title>
                    <List
                      size="small"
                      dataSource={candidate.summary.improvements}
                      renderItem={(item) => (
                        <List.Item>
                          <StarOutlined style={{ color: '#faad14', marginRight: 8 }} />
                          {item}
                        </List.Item>
                      )}
                    />
                  </>
                )}
                
                <Divider />
                <Space>
                  <Text strong>Recommendation:</Text>
                  <Tag 
                    color={
                      candidate.summary.recommendation === 'hire' ? 'success' :
                      candidate.summary.recommendation === 'consider' ? 'warning' : 'error'
                    }
                  >
                    {candidate.summary.recommendation?.toUpperCase()}
                  </Tag>
                </Space>
              </>
            )}
          </Space>
        </Card>
      )}
    </Space>
  );

  const renderQuestions = () => {
    if (!candidateInterview?.questions || candidateInterview.questions.length === 0) {
      return (
        <Card>
          <Text type="secondary">No interview questions available for this candidate.</Text>
        </Card>
      );
    }

    return (
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {candidateInterview.questions.map((question, index) => (
          <Card 
            key={question.id} 
            size="small"
            title={
              <Space>
                <Text strong>Question {index + 1}</Text>
                <Tag color={getDifficultyColor(question.difficulty)}>
                  {question.difficulty}
                </Tag>
                <Tag>{question.timeLimit}s</Tag>
                {question.score !== undefined && (
                  <Tag color={getScoreColor(question.score) === '#52c41a' ? 'success' : 
                              getScoreColor(question.score) === '#faad14' ? 'warning' : 'error'}>
                    {question.score}/10
                  </Tag>
                )}
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Question:</Text>
                <Paragraph>{question.question}</Paragraph>
              </div>
              
              {question.answer && (
                <div>
                  <Text strong>Answer:</Text>
                  <Paragraph>{question.answer}</Paragraph>
                </div>
              )}
              
              {question.timeUsed !== undefined && (
                <Space>
                  <ClockCircleOutlined />
                  <Text type="secondary">
                    Time used: {question.timeUsed}s / {question.timeLimit}s
                  </Text>
                </Space>
              )}
            </Space>
          </Card>
        ))}
      </Space>
    );
  };

  const renderChatHistory = () => {
    if (!candidateInterview?.chatHistory || candidateInterview.chatHistory.length === 0) {
      return (
        <Card>
          <Text type="secondary">No chat history available for this candidate.</Text>
        </Card>
      );
    }

    return (
      <Card title="Interview Conversation">
        <Timeline>
          {candidateInterview.chatHistory.map((message) => (
            <Timeline.Item
              key={message.id}
              dot={
                message.type === 'ai' ? (
                  <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>AI</Avatar>
                ) : message.type === 'system' ? (
                  <Avatar size="small" style={{ backgroundColor: '#faad14' }}>S</Avatar>
                ) : (
                  <Avatar size="small" icon={<UserOutlined />} />
                )
              }
            >
              <Space direction="vertical" size="small">
                <Space>
                  <Text strong>
                    {message.type === 'ai' ? 'AI Interviewer' : 
                     message.type === 'system' ? 'System' : candidate.name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {dayjs(message.timestamp).format('HH:mm:ss')}
                  </Text>
                </Space>
                <Text>{message.content}</Text>
              </Space>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
    );
  };

  const tabItems = [
    {
      key: 'overview',
      label: (
        <Space>
          <UserOutlined />
          Overview
        </Space>
      ),
      children: renderOverview(),
    },
    {
      key: 'questions',
      label: (
        <Space>
          <TrophyOutlined />
          Questions & Answers
          {candidateInterview?.questions && (
            <Badge count={candidateInterview.questions.length} size="small" />
          )}
        </Space>
      ),
      children: renderQuestions(),
    },
    {
      key: 'chat',
      label: (
        <Space>
          <MessageOutlined />
          Chat History
          {candidateInterview?.chatHistory && (
            <Badge count={candidateInterview.chatHistory.length} size="small" />
          )}
        </Space>
      ),
      children: renderChatHistory(),
    },
  ];

  return (
    <Card
      title={`Candidate Details: ${candidate.name}`}
      extra={
        <Button 
          type="text" 
          icon={<CloseOutlined />} 
          onClick={onClose}
        >
          Close
        </Button>
      }
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />
    </Card>
  );
};

export default CandidateDetails;
