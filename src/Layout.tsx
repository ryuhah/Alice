import React from 'react'
import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';

import Header from './lib/components/Header/Header';
import SideNav from './lib/components/Header/SideNav';
import Member from './lib/components/Member/Member';
import Information from './lib/components/Information/Information';
import Admin from './lib/components/Admin/Admin';

const Layout = () => {
  return (
    <AppContainer>
        <Header />
        <MainContent>
          <SideNav />
          <Routes>
              <Route path="/member" element={<Member />}></Route>
              <Route path="/admin" element={<Admin />}></Route>
          </Routes>
        </MainContent>
        {/* <Bgimg /> */}
      </AppContainer> 
  
  )
}

export default Layout

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background-image: linear-gradient(to top, #dfe9f3 0%, white 100%);
`;

const MainContent = styled.div`
  display : flex;
  flex: 1;
  margin : 100px 50px 50px;
  height: calc(100% - 130px);
  background-color : white;
  border-radius : 30px 30px 0 0;
  box-shadow: #8BC1DE 0px 1px 2px 0px, #8BC1DE 0px 2px 6px 2px;
  z-index : 2;
  
`

const Bgimg = styled.div`
    background-image : url('/bgimg.png');
    width : 850px;
    height : 200px;
    position : absolute;
    bottom : 0;
    right : 0;
    z-index : 1;
    background-size : cover;
    background-repeat : no-repeat;
`