import React from 'react'
import styled from 'styled-components'

const Header = () => {
  return (
    <div>
        <HeaderContainer>
            <LogoImg/>
            <TitleBIO>BIO</TitleBIO>
            <TitleLogger>Logger</TitleLogger>
            
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

const LogoImg = styled.div`
  background-image : url('/biologger_logo.png');
  width : 18px;
  height : 30px;
  background-size : cover;
  background-repeat : no-repeat;
  margin-left : 50px;
`

const TitleFont = styled.span`
    @font-face {
    font-family: 'GmarketSansMedium';
    src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff') format('woff');
    font-weight: normal;
    font-style: normal;
    }
    font-family: 'yg-jalnan', sans-serif;
    color : #364954;
    font-size : 25px;

`

const TitleBIO = styled(TitleFont)`
    font-weight : bold;
`

const TitleLogger = styled(TitleFont)`
    font-weight : light;
`