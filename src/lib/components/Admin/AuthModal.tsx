import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import instance from '../../../axios';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (id: string, password: string) => void;
    onAuthSuccess: () => void;
    
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onConfirm, onAuthSuccess }) => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setId('')
            setPassword('')
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        try {
            const res = await instance.post('/auth/admin/login', {
                loginId: id,
                password: password,
            });

            // 인증 성공 시 액세스 토큰 저장 및 성공 콜백 호출
            const { accessToken, refreshToken } = res.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            onConfirm(id, password);
            onClose(); // 모달 닫기
        } catch (error) {
            console.error('로그인 오류:', error);
            alert('아이디 또는 비밀번호가 잘못되었습니다.'); // 오류 발생 시 알러트 창 띄우기
        }
    };

    return (
        <Overlay>
            <Modal>
                <h3>관리자 인증</h3>
                <Label>
                    <strong>ID</strong>
                    <Input 
                        type="text" 
                        value={id} 
                        onChange={(e) => setId(e.target.value)}
                        placeholder='아이디를 입력하세요'
                    />
                </Label>
                <Label>
                    <strong>비밀번호</strong>
                    <Input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='비밀번호를 입력하세요'
                    />
                </Label>
                <ButtonContainer>
                    <ConfirmButton onClick={handleConfirm}>확인</ConfirmButton>
                    <CancelButton onClick={onClose}>취소</CancelButton>
                </ButtonContainer>
            </Modal>
        </Overlay>
    );
};

export default AuthModal;

// 스타일 정의
const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
`;

const Modal = styled.div`
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 300px;
    text-align: center;
`;

const Label = styled.label`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 20px 0;
`;

const Input = styled.input`
    padding: 5px;
    width: 180px;
    box-sizing: border-box;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 30px;
    gap: 20px;
`;

const ConfirmButton = styled.button`
    padding: 10px 20px;
    background-color: #364954;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background-color: #4b5b6e;
    }
`;

const CancelButton = styled.button`
    padding: 10px 20px;
    background-color: #ccc;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background-color: #999;
    }
`;
