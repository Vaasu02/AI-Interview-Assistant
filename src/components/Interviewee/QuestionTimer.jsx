import React from 'react';
import { Progress, Typography, Space } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const QuestionTimer = ({ timeRemaining, totalTime, isActive }) => {
  const percentage = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;
  
  const getTimerColor = () => {
    if (timeRemaining <= 10) return '#ff4d4f'; // Red for last 10 seconds
    if (timeRemaining <= 30) return '#faad14'; // Orange for last 30 seconds
    return '#52c41a'; // Green for normal time
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="question-timer" style={{ 
      padding: '16px', 
      background: '#f5f5f5', 
      borderRadius: '8px', 
      marginBottom: '16px' 
    }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <ClockCircleOutlined style={{ color: getTimerColor() }} />
          <Text strong style={{ color: getTimerColor() }}>
            Time Remaining: {formatTime(timeRemaining)}
          </Text>
        </Space>
        
        <Progress
          percent={percentage}
          strokeColor={getTimerColor()}
          showInfo={false}
          status={isActive ? 'active' : 'normal'}
        />
        
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Total time: {formatTime(totalTime)} | 
          {timeRemaining <= 10 && isActive && (
            <Text type="danger" strong> Hurry up! </Text>
          )}
          Press Ctrl+Enter to submit quickly
        </Text>
      </Space>
    </div>
  );
};

export default QuestionTimer;
