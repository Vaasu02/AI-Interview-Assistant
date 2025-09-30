import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import AppLayout from './components/Layout/AppLayout'
import 'react-toastify/dist/ReactToastify.css'
import 'antd/dist/reset.css'

const App = () => {
  return (
    <Router>
      <div className="App">
        <AppLayout />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  )
}

export default App
