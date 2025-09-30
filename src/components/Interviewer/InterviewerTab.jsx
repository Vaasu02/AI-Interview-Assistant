import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Row, Col } from 'antd';
import CandidatesList from './CandidatesList';
import CandidateDetails from './CandidateDetails';

const InterviewerTab = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const { candidates } = useSelector((state) => state.candidates);

  const handleCandidateSelect = (candidate) => {
    setSelectedCandidate(candidate);
  };

  return (
    <div className="interviewer-tab">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={selectedCandidate ? 10 : 24}>
          <CandidatesList 
            candidates={candidates}
            selectedCandidate={selectedCandidate}
            onCandidateSelect={handleCandidateSelect}
          />
        </Col>
        {selectedCandidate && (
          <Col xs={24} lg={14}>
            <CandidateDetails 
              candidate={selectedCandidate}
              onClose={() => setSelectedCandidate(null)}
            />
          </Col>
        )}
      </Row>
    </div>
  );
};

export default InterviewerTab;
