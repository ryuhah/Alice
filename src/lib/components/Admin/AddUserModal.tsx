import React, { useState } from 'react';
import styled from 'styled-components';

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void; 
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        contact: '',
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };

    const handleSubmit = () => {
        console.log('새 유저 추가:', userData);
        onClose();
    };

    return (
        <Overlay>
            <Modal>
                <h3>유저 추가</h3>
                <Label>
                    <span>이름</span>
                    <Input 
                        name="name" 
                        value={userData.name} 
                        onChange={handleChange} 
                        placeholder="이름을 입력하세요"
                    />
                </Label>
                <Label>
                    <span>이메일</span>
                    <Input 
                        name="email" 
                        value={userData.email} 
                        onChange={handleChange} 
                        placeholder="이메일을 입력하세요"
                    />
                </Label>
                <Label>
                    <span>연락처</span>
                    <Input 
                        name="contact" 
                        value={userData.contact} 
                        onChange={handleChange} 
                        placeholder="연락처를 입력하세요"
                    />
                </Label>
                <ButtonContainer>
                    <ConfirmButton onClick={onConfirm}>추가</ConfirmButton>
                    <CancelButton onClick={onClose}>취소</CancelButton>
                </ButtonContainer>
            </Modal>
        </Overlay>
    );
};

export default AddUserModal;

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
