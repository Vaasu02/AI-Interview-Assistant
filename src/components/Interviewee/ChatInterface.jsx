import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Input, List, Avatar, Typography, Space, message } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { 
  startInterview, 
  addChatMessage, 
  submitAnswer, 
  nextQuestion, 
  completeInterview,
  setCurrentQuestion,
  startTimer,
  stopTimer
} from '../../store/slices/interviewSlice';
import { updateCandidateScore } from '../../store/slices/candidateSlice';
import { resetWelcomeBackFlag } from '../../store/slices/uiSlice';
import geminiService from '../../utils/geminiAI';
import QuestionTimer from './QuestionTimer';

const { TextArea } = Input;
const { Text } = Typography;

const ChatInterface = ({ candidateData }) => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);
  
  const { 
    questions, 
    currentQuestionIndex, 
    interviewStatus, 
    chatHistory,
    timeRemaining,
    isTimerActive 
  } = useSelector((state) => state.interviews);

  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(null);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    if (interviewStatus === 'not_started') {
      initializeInterview();
    }
  }, [interviewStatus]);

  useEffect(() => {
    if (isTimerActive && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        dispatch({ type: 'interviews/setTimer', payload: timeRemaining - 1 });
      }, 1000);
    } else if (isTimerActive && timeRemaining === 0) {
      handleTimeUp();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isTimerActive, timeRemaining]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeInterview = async () => {
    setLoading(true);
    try {
      // Reset welcome back flag for new interview
      dispatch(resetWelcomeBackFlag());
      
      // Add welcome message
      dispatch(addChatMessage({
        id: Date.now(),
        type: 'ai',
        content: `Hello ${candidateData.name}! Welcome to your Full Stack Developer interview. I'll be asking you 6 questions: 2 easy (20s each), 2 medium (60s each), and 2 hard (120s each). Let's begin!`,
        timestamp: new Date().toISOString()
      }));

      // Generate questions
      const questionsData = await geminiService.generateInterviewQuestions();
      
      // Start interview
      dispatch(startInterview({
        candidateId: candidateData.id,
        questions: questionsData.questions
      }));

      // Ask first question
      setTimeout(() => askQuestion(0, questionsData.questions), 1000);
      
    } catch (error) {
      message.error('Failed to start interview. Please try again.');
      console.error('Interview initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = (questionIndex, questionsList = questions) => {
    const question = questionsList[questionIndex];
    if (!question) return;

    dispatch(addChatMessage({
      id: Date.now(),
      type: 'ai',
      content: `Question ${questionIndex + 1}/6 (${question.difficulty.toUpperCase()}): ${question.question}`,
      timestamp: new Date().toISOString()
    }));

    dispatch(setCurrentQuestion({
      index: questionIndex,
      timeLimit: question.timeLimit
    }));

    setQuestionStartTime(Date.now());
    dispatch(startTimer());
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      message.warning('Please provide an answer before submitting.');
      return;
    }

    setLoading(true);
    dispatch(stopTimer());

    try {
      const timeUsed = Math.floor((Date.now() - questionStartTime) / 1000);
      const currentQuestion = questions[currentQuestionIndex];

      // Add user message to chat
      dispatch(addChatMessage({
        id: Date.now(),
        type: 'user',
        content: currentAnswer,
        timestamp: new Date().toISOString()
      }));

      // Evaluate answer with AI
      const evaluation = await geminiService.evaluateAnswer(
        currentQuestion.question,
        currentAnswer,
        timeUsed,
        currentQuestion.timeLimit
      );

      // Submit answer with score
      dispatch(submitAnswer({
        answer: currentAnswer,
        timeUsed,
        score: evaluation.score
      }));

      // Add AI feedback
      dispatch(addChatMessage({
        id: Date.now() + 1,
        type: 'ai',
        content: `Score: ${evaluation.score}/10. ${evaluation.feedback}`,
        timestamp: new Date().toISOString()
      }));

      // Move to next question or complete interview
      if (currentQuestionIndex < questions.length - 1) {
        setTimeout(() => {
          dispatch(nextQuestion());
          askQuestion(currentQuestionIndex + 1);
          setCurrentAnswer('');
        }, 2000);
      } else {
        setTimeout(() => completeInterviewProcess(), 2000);
      }

    } catch (error) {
      message.error('Failed to submit answer. Please try again.');
      console.error('Answer submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUp = async () => {
    if (currentAnswer.trim()) {
      await handleSubmitAnswer();
    } else {
      // Auto-submit empty answer
      dispatch(addChatMessage({
        id: Date.now(),
        type: 'system',
        content: 'Time\'s up! Moving to the next question.',
        timestamp: new Date().toISOString()
      }));

      dispatch(submitAnswer({
        answer: 'No answer provided (time expired)',
        timeUsed: questions[currentQuestionIndex]?.timeLimit || 0,
        score: 0
      }));

      if (currentQuestionIndex < questions.length - 1) {
        setTimeout(() => {
          dispatch(nextQuestion());
          askQuestion(currentQuestionIndex + 1);
        }, 1500);
      } else {
        setTimeout(() => completeInterviewProcess(), 1500);
      }
    }
  };

  const completeInterviewProcess = async () => {
    setLoading(true);
    try {
      // Generate final summary
      const summary = await geminiService.generateFinalSummary(candidateData, questions);
      
      // Update candidate with final score
      dispatch(updateCandidateScore({
        candidateId: candidateData.id,
        score: summary.overallScore,
        summary: summary
      }));

      // Complete interview
      dispatch(completeInterview());

      // Add completion message
      dispatch(addChatMessage({
        id: Date.now(),
        type: 'ai',
        content: `Interview completed! Your final score is ${summary.overallScore}/10. ${summary.summary}`,
        timestamp: new Date().toISOString()
      }));

      message.success('Interview completed successfully!');
      
    } catch (error) {
      message.error('Failed to complete interview evaluation.');
      console.error('Interview completion error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg) => {
    const isAI = msg.type === 'ai';
    const isSystem = msg.type === 'system';
    
    return (
      <List.Item key={msg.id} className={`message-item ${msg.type}`}>
        <List.Item.Meta
          avatar={
            <Avatar 
              icon={isAI ? <RobotOutlined /> : <UserOutlined />} 
              style={{ 
                backgroundColor: isAI ? '#1890ff' : isSystem ? '#faad14' : '#52c41a' 
              }}
            />
          }
          title={
            <Text strong>
              {isAI ? 'AI Interviewer' : isSystem ? 'System' : candidateData.name}
            </Text>
          }
          description={
            <div>
              <Text>{msg.content}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </Text>
            </div>
          }
        />
      </List.Item>
    );
  };

  const canSubmit = interviewStatus === 'in_progress' && 
                   currentQuestionIndex < questions.length && 
                   !loading;

  return (
    <div className="chat-interface">
      <div className="chat-messages" style={{ height: '400px', overflowY: 'auto', marginBottom: '16px' }}>
        <List
          dataSource={chatHistory}
          renderItem={renderMessage}
          loading={loading && chatHistory.length === 0}
        />
        <div ref={messagesEndRef} />
      </div>

      {interviewStatus === 'in_progress' && currentQuestionIndex < questions.length && (
        <QuestionTimer 
          timeRemaining={timeRemaining}
          totalTime={questions[currentQuestionIndex]?.timeLimit || 0}
          isActive={isTimerActive}
        />
      )}

      {canSubmit && (
        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={3}
            disabled={loading}
            onPressEnter={(e) => {
              if (e.ctrlKey || e.metaKey) {
                handleSubmitAnswer();
              }
            }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSubmitAnswer}
            loading={loading}
            disabled={!currentAnswer.trim()}
          >
            Submit
          </Button>
        </Space.Compact>
      )}

      {interviewStatus === 'completed' && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Text type="success" style={{ fontSize: '16px' }}>
            🎉 Interview Completed! Check the Interviewer tab to see your results.
          </Text>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
