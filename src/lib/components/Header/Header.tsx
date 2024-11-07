import React from 'react'
import styled from 'styled-components'

const Header = () => {
  return (
    <div>
        <HeaderContainer>
            <TitleNaju>나주시</TitleNaju>
            <Title>건강 모니터링 시스템</Title>
        </HeaderContainer>
    </div>
  )
}

export default Header

const HeaderContainer = styled.header`
    width : 100%;
    height : 100px;
    position : absolute;
    top : 0;
    left : 0;
    display : flex;
    justify-content : flex-start;
    align-items : center;
    gap : 10px;  
    z-index : 2;
`

const TitleFont = styled.span`
    @font-face {
    font-family: 'yg-jalnan';
    src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_four@1.2/JalnanOTF00.woff') format('woff');
    font-weight: normal;
    font-style: normal;
    }
    font-family: 'yg-jalnan', sans-serif;
    font-size : 25px;

`

const TitleNaju = styled(TitleFont)`
    color : #F4B941;
    margin-left : 50px;
`

const Title = styled(TitleFont)`
    color : #245671 
`