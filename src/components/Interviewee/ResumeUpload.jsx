import React, { useState } from 'react';
import { Upload, Button, message, Form, Input, Space, Alert } from 'antd';
import { InboxOutlined, FileTextOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import resumeParser from '../../utils/resumeParser';
import { addCandidate } from '../../store/slices/candidateSlice';

const { Dragger } = Upload;

const ResumeUpload = ({ onCandidateReady }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [missingFields, setMissingFields] = useState([]);
  const [form] = Form.useForm();

  const handleFileUpload = async (file) => {
    setLoading(true);
    try {
      const result = await resumeParser.parseFile(file);
      const validation = resumeParser.validateFields(result);
      
      setExtractedData(validation.extractedFields);
      setMissingFields(validation.missingFields);
      
      // Pre-fill form with extracted data
      form.setFieldsValue(validation.extractedFields);
      
      if (validation.isValid) {
        message.success('Resume parsed successfully! All required fields found.');
      } else {
        message.warning(`Resume parsed. Please fill in missing fields: ${validation.missingFields.join(', ')}`);
      }
    } catch (error) {
      message.error(`Failed to parse resume: ${error.message}`);
    } finally {
      setLoading(false);
    }
    
    return false; // Prevent automatic upload
  };

  const handleSubmit = (values) => {
    const candidateData = {
      id: uuidv4(),
      name: values.name,
      email: values.email,
      phone: values.phone,
      resumeUploaded: true,
      status: 'ready',
      createdAt: new Date().toISOString(),
    };

    dispatch(addCandidate(candidateData));
    onCandidateReady(candidateData);
    message.success(`Welcome ${values.name}! Ready to start your interview.`);
  };

  return (
    <div className="resume-upload">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          message="Welcome to AI Interview Assistant"
          description="Please upload your resume (PDF or DOCX) to get started. We'll extract your basic information and begin the interview process."
          type="info"
          showIcon
        />

        <Dragger
          name="resume"
          multiple={false}
          accept=".pdf,.docx"
          beforeUpload={handleFileUpload}
          loading={loading}
          disabled={loading}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag resume file to this area to upload</p>
          <p className="ant-upload-hint">
            Support for PDF and DOCX files only. We'll automatically extract your contact information.
          </p>
        </Dragger>

        {extractedData && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="candidate-form"
          >
            <Alert
              message="Please verify and complete your information"
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Form.Item
              label="Full Name"
              name="name"
              rules={[{ required: true, message: 'Please enter your full name' }]}
              validateStatus={missingFields.includes('name') ? 'error' : ''}
            >
              <Input 
                placeholder="Enter your full name"
                prefix={<FileTextOutlined />}
              />
            </Form.Item>

            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
              validateStatus={missingFields.includes('email') ? 'error' : ''}
            >
              <Input 
                placeholder="Enter your email address"
                prefix="@"
              />
            </Form.Item>

            <Form.Item
              label="Phone Number"
              name="phone"
              rules={[{ required: true, message: 'Please enter your phone number' }]}
              validateStatus={missingFields.includes('phone') ? 'error' : ''}
            >
              <Input 
                placeholder="Enter your phone number"
                prefix="+"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large"
                block
              >
                Start Interview
              </Button>
            </Form.Item>
          </Form>
        )}
      </Space>
    </div>
  );
};

export default ResumeUpload;
