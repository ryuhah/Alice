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
            loginId: "admin1",
            password: "12341234"

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
                <Title>LOGIN</Title>

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
  background : linear-gradient(180deg, #E7F4F5 0%, #F0F6EA 100%);
  width : 65%;
  height: 100vh;
  display : flex;
  justify-content : center;
  align-items : center;
`

const LogoImg = styled.div`
  background-image : url('/logo.png');
  width : 200px;
  height : 200px;
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

const Title = styled.h1`
  margin-top : -80px;
  font-size : 50px;
  color : #245671;
`

const Form = styled.form`
  margin-top : 50px;
  display : flex;
  flex-direction : column;
  width : 450px;
  gap : 15px;
`

const Input = styled.input`
  padding : 20px ;
  font-size : 20px;
  border : 1px solid #ccc;
  border-radius : 10px;

  &:focus {
    border : 3px solid #245671;
    outline: none;
  }
`

const LoginButton = styled.button`
  margin-top : 80px;
  padding : 20px;
  font-size : 20px;
  color : white;
  background-color : #245671;
  border : none;
  border-radius : 10px;
  cursor : pointer;
  
  &:hover {
    background-color : #1d4a5e;
  }
`