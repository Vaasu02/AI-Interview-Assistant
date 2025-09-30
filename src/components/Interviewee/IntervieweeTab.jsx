import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Card } from 'antd';
import ResumeUpload from './ResumeUpload';
import ChatInterface from './ChatInterface';
import InterviewProgress from './InterviewProgress';
import { setCurrentCandidate } from '../../store/slices/candidateSlice';

const IntervieweeTab = () => {
  const dispatch = useDispatch();
  const { currentCandidate } = useSelector((state) => state.candidates);
  const { interviewStatus } = useSelector((state) => state.interviews);
  const [candidateData, setCandidateData] = useState(null);

  const handleCandidateReady = (data) => {
    setCandidateData(data);
    dispatch(setCurrentCandidate(data));
  };

  return (
    <div className="interviewee-tab">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Interview Chat" className="chat-card">
            {!candidateData ? (
              <ResumeUpload onCandidateReady={handleCandidateReady} />
            ) : (
              <ChatInterface candidateData={candidateData} />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Interview Progress" className="progress-card">
            <InterviewProgress />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default IntervieweeTab;
