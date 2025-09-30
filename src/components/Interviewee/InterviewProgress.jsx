import React from 'react';
import { useSelector } from 'react-redux';
import { Card, Progress, Steps, Typography, Space, Tag } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  PlayCircleOutlined,
  TrophyOutlined 
} from '@ant-design/icons';

const { Text, Title } = Typography;
const { Step } = Steps;

const InterviewProgress = () => {
  const { 
    questions, 
    currentQuestionIndex, 
    interviewStatus 
  } = useSelector((state) => state.interviews);
  
  const { currentCandidate } = useSelector((state) => state.candidates);

  const getOverallProgress = () => {
    if (interviewStatus === 'not_started') return 0;
    if (interviewStatus === 'completed') return 100;
    return Math.round((currentQuestionIndex / questions.length) * 100);
  };

  const getQuestionStatus = (index) => {
    if (index < currentQuestionIndex) return 'finish';
    if (index === currentQuestionIndex && interviewStatus === 'in_progress') return 'process';
    return 'wait';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'green';
      case 'medium': return 'orange';
      case 'hard': return 'red';
      default: return 'default';
    }
  };

  const getTotalScore = () => {
    return questions.reduce((sum, q) => sum + (q.score || 0), 0);
  };

  const getAverageScore = () => {
    const completedQuestions = questions.filter(q => q.score !== undefined);
    if (completedQuestions.length === 0) return 0;
    return (getTotalScore() / completedQuestions.length).toFixed(1);
  };

  if (!currentCandidate) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Text type="secondary">Upload your resume to start the interview</Text>
      </div>
    );
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {/* Candidate Info */}
      <Card size="small">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={5} style={{ margin: 0 }}>
            {currentCandidate.name}
          </Title>
          <Text type="secondary">{currentCandidate.email}</Text>
          <Text type="secondary">{currentCandidate.phone}</Text>
        </Space>
      </Card>

      {/* Overall Progress */}
      <Card size="small" title="Interview Progress">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Progress 
            percent={getOverallProgress()} 
            status={interviewStatus === 'completed' ? 'success' : 'active'}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
          <Text>
            Question {Math.min(currentQuestionIndex + 1, questions.length)} of {questions.length}
          </Text>
          
          {interviewStatus === 'completed' && (
            <Space>
              <TrophyOutlined style={{ color: '#faad14' }} />
              <Text strong>Average Score: {getAverageScore()}/10</Text>
            </Space>
          )}
        </Space>
      </Card>

      {/* Question Progress */}
      {questions.length > 0 && (
        <Card size="small" title="Questions">
          <Steps 
            direction="vertical" 
            size="small"
            current={currentQuestionIndex}
          >
            {questions.map((question, index) => (
              <Step
                key={question.id}
                status={getQuestionStatus(index)}
                title={
                  <Space>
                    <Text>Q{index + 1}</Text>
                    <Tag color={getDifficultyColor(question.difficulty)}>
                      {question.difficulty}
                    </Tag>
                    {question.score !== undefined && (
                      <Tag color="blue">{question.score}/10</Tag>
                    )}
                  </Space>
                }
                description={
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {question.timeLimit}s • {question.difficulty}
                  </Text>
                }
                icon={
                  getQuestionStatus(index) === 'finish' ? <CheckCircleOutlined /> :
                  getQuestionStatus(index) === 'process' ? <PlayCircleOutlined /> :
                  <ClockCircleOutlined />
                }
              />
            ))}
          </Steps>
        </Card>
      )}

      {/* Status */}
      <Card size="small">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong>Status:</Text>
          <Tag 
            color={
              interviewStatus === 'completed' ? 'success' :
              interviewStatus === 'in_progress' ? 'processing' :
              interviewStatus === 'paused' ? 'warning' : 'default'
            }
          >
            {interviewStatus.replace('_', ' ').toUpperCase()}
          </Tag>
          
          {interviewStatus === 'in_progress' && (
            <Text type="secondary">
              Answer the current question within the time limit
            </Text>
          )}
          
          {interviewStatus === 'completed' && (
            <Text type="success">
              🎉 Great job! Your interview is complete.
            </Text>
          )}
        </Space>
      </Card>
    </Space>
  );
};

export default InterviewProgress;
