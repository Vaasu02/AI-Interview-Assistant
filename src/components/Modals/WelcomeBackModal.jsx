import React, { useEffect } from 'react';
import { Modal, Typography, Space, Button, Card, Tag } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ClockCircleOutlined, 
  UserOutlined, 
  PlayCircleOutlined,
  TrophyOutlined 
} from '@ant-design/icons';
import { setShowWelcomeBackModal, resetWelcomeBackFlag } from '../../store/slices/uiSlice';
import { resumeInterview } from '../../store/slices/interviewSlice';
import { setActiveTab } from '../../store/slices/uiSlice';

const { Title, Text } = Typography;

const WelcomeBackModal = () => {
  const dispatch = useDispatch();
  const { showWelcomeBackModal, hasShownWelcomeBack } = useSelector((state) => state.ui);
  const { currentCandidate } = useSelector((state) => state.candidates);
  const { 
    interviewStatus, 
    currentQuestionIndex, 
    questions 
  } = useSelector((state) => state.interviews);

  useEffect(() => {
    // Only show welcome back modal on initial app load, not during ongoing interview
    // Check if there's an unfinished interview AND we haven't shown the modal yet
    const hasUnfinishedInterview = currentCandidate && 
      (interviewStatus === 'in_progress' || interviewStatus === 'paused') &&
      currentQuestionIndex < questions.length &&
      questions.length > 0 && // Only if questions exist
      !hasShownWelcomeBack; // Haven't shown the modal yet in this session

    if (hasUnfinishedInterview) {
      // Add a delay to ensure this is truly a page reload scenario
      const timer = setTimeout(() => {
        dispatch(setShowWelcomeBackModal(true));
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentCandidate, interviewStatus, currentQuestionIndex, questions.length, hasShownWelcomeBack, dispatch]);

  const handleContinue = () => {
    dispatch(resumeInterview());
    dispatch(setActiveTab('interviewee'));
    dispatch(setShowWelcomeBackModal(false));
  };

  const handleStartOver = () => {
    // This would reset the interview - for now just close modal
    dispatch(setShowWelcomeBackModal(false));
  };

  const handleClose = () => {
    dispatch(setShowWelcomeBackModal(false));
  };

  if (!currentCandidate || !showWelcomeBackModal) {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const completedQuestions = currentQuestionIndex;
  const totalQuestions = questions.length;

  return (
    <Modal
      title={
        <Space>
          <ClockCircleOutlined style={{ color: '#1890ff' }} />
          <span>Welcome Back!</span>
        </Space>
      }
      open={showWelcomeBackModal}
      onCancel={handleClose}
      footer={null}
      width={500}
      centered
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={4}>Resume Your Interview</Title>
          <Text type="secondary">
            We found an unfinished interview session. Would you like to continue where you left off?
          </Text>
        </div>

        <Card size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <UserOutlined />
              <Text strong>{currentCandidate.name}</Text>
            </Space>
            
            <Space>
              <TrophyOutlined />
              <Text>Progress: {completedQuestions}/{totalQuestions} questions completed</Text>
            </Space>

            {currentQuestion && (
              <Space>
                <PlayCircleOutlined />
                <Text>Current: Question {currentQuestionIndex + 1}</Text>
                <Tag color="blue">{currentQuestion.difficulty}</Tag>
                <Tag>{currentQuestion.timeLimit}s</Tag>
              </Space>
            )}

            <Space>
              <ClockCircleOutlined />
              <Text type="secondary">
                Status: <Tag color="warning">{interviewStatus.replace('_', ' ').toUpperCase()}</Tag>
              </Text>
            </Space>
          </Space>
        </Card>

        <Space style={{ width: '100%', justifyContent: 'center' }}>
          <Button onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleStartOver}>
            Start Over
          </Button>
          <Button 
            type="primary" 
            icon={<PlayCircleOutlined />}
            onClick={handleContinue}
          >
            Continue Interview
          </Button>
        </Space>
      </Space>
    </Modal>
  );
};

export default WelcomeBackModal;
