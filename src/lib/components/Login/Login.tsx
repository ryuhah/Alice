import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import instance, {setHeader} from '../../../axios'

const Login = () => {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        instance.post("/auth/admin/login", {
            // loginId: "admin1",
            // password: "12341234"
            loginId: username,
            password: password

        }).then((res) => {
            const {accessToken, refreshToken} = res.data

            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)

            console.log("Result: " + JSON.stringify(res.data));

            setHeader(accessToken)
            navigate('/member')
        }).catch((error) => {
            console.error('로그인 오류:', error);
            alert('로그인 과정에서 오류가 발생했습니다.');
        });
    }

    return (
        <LoginContainer>
            <BgBox>
                <LogoImg />
            </BgBox>
            <LoginBox>
              <TitleBox>
                <TitleBIO>BIO</TitleBIO>
                <TitleLogger>Logger</TitleLogger>
              </TitleBox>
              
                <Form onSubmit={handleLogin}>
                    <Input
                        type="text"
                        placeholder="아이디"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} />
                    <Input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} />
                    <LoginButton type='submit'>로그인</LoginButton>
                </Form>
            </LoginBox>
        </LoginContainer>
    )
}

export default Login

const LoginContainer = styled.div`
  display : flex;
`

const BgBox = styled.div`
  background-image: linear-gradient(to top, #dfe9f3 0%, white 100%);
  width : 65%;
  height: 100vh;
  display : flex;
  justify-content : center;
  align-items : center;
`

const LogoImg = styled.div`
  background-image : url('/biologger_logo.svg');
  width : 100px;
  height : 168px;
  background-size : cover;
  background-repeat : no-repeat;
`


const LoginBox = styled.div`
  flex : 1;
  display : flex;
  flex-direction : column;
  justify-content : center;
  align-items : center;
`

const TitleBox = styled.div`
  display : flex;
  gap : 15px;
`

const TitleFont = styled.span`
    @font-face {
    font-family: 'GmarketSansMedium';
    src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff') format('woff');
    font-weight: normal;
    font-style: normal;
    }
    font-family: 'yg-jalnan', sans-serif;
    
    font-size : 40px;

`

const TitleBIO = styled(TitleFont)`
    color : #364954;
    font-weight : bold;
`

const TitleLogger = styled(TitleFont)`
    color : #364954;
    font-weight : light;
`

const Form = styled.form`
  margin-top : 50px;
  display : flex;
  flex-direction : column;
  width : 450px;
  gap : 8px;
`

const Input = styled.input`
  padding : 20px 15px ;
  font-size : 18px;
  border : 1px solid #ccc;
  border-radius : 10px;

  &:focus {
    border : 3px solid #364954;
    outline: none;
  }
`

const LoginButton = styled.button`
  margin-top : 80px;
  padding : 20px;
  font-size : 20px;
  color : white;
  background-color : #364954;
  border : none;
  border-radius : 10px;
  cursor : pointer;
  
  &:hover {
    background-color : #4b5b6e;
  }
` 