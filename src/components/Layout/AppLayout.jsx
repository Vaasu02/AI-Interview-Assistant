import React from 'react';
import { Layout, Tabs } from 'antd';
import { UserOutlined, DashboardOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab } from '../../store/slices/uiSlice';
import IntervieweeTab from '../Interviewee/IntervieweeTab';
import InterviewerTab from '../Interviewer/InterviewerTab';
import WelcomeBackModal from '../Modals/WelcomeBackModal';
import './AppLayout.css';

const { Header, Content } = Layout;

const AppLayout = () => {
  const dispatch = useDispatch();
  const { activeTab } = useSelector((state) => state.ui);

  const tabItems = [
    {
      key: 'interviewee',
      label: (
        <span>
          <UserOutlined />
          Interviewee
        </span>
      ),
      children: <IntervieweeTab />,
    },
    {
      key: 'interviewer',
      label: (
        <span>
          <DashboardOutlined />
          Interviewer
        </span>
      ),
      children: <InterviewerTab />,
    },
  ];

  const handleTabChange = (key) => {
    dispatch(setActiveTab(key));
  };

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div className="logo">
          <h2>AI Interview Assistant</h2>
        </div>
      </Header>
      <Content className="app-content">
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          size="large"
          className="main-tabs"
        />
      </Content>
      <WelcomeBackModal />
    </Layout>
  );
};

export default AppLayout;
