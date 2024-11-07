import React, { useEffect } from 'react';
import Layout from './Layout';
import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './lib/components/Login/Login';
import PersonalInformation from './lib/components/Information/PersonalInformation';

const App : React.FC = () => {
  return (
    <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path ="/login" element = {<Login />} />
        <Route path="/dashboard/:no" element={<PersonalInformation />} />
        <Route path ="/*" element = {<Layout />} />
      </Routes>

  )
} 

export default App;