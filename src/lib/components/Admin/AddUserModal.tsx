import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import instance from '../../../axios';

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (userData: { loginId: string; password: string; name: string; phoneNum: string; gender: string; age: string }) => void;
    title: string;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onConfirm, title }) => {
    const [userData, setUserData] = useState({
        loginId: '',
        password: '',
        name: '',
        phoneNum: '',
        gender: '',
        age: ''
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [helperText, setHelperText] = useState<string | null>(null);
    const [isDuplicateId, setIsDuplicateId] = useState<boolean | null>(null);

    const validationMessages = {
        loginId: "영문자와 숫자를 조합하여 3~15자로 입력해주세요.",
        password: "비밀번호는 8자 이상 20자 이하로 입력해주세요.",
        name: "이름은 2~5자의 한글로 입력해주세요.",
        age: "나이는 0세 이상 120세 이하이어야 합니다.",
        gender: "",
        phoneNum: "유효한 전화번호를 입력해주세요. (예: 010-1111-1111)"
    };

    

    useEffect(() => {
        if (!isOpen) {
            setErrorMessage(null)
            setHelperText(null)
            setIsDuplicateId(null)
            setUserData({
                loginId: '',
        password: '',
        name: '',
        phoneNum: '',
        gender: '',
        age: ''
            })
        }
    }, [isOpen]);
    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };

    const checkDuplicateId = async () => {
        if (!userData.loginId) {
            setErrorMessage('아이디를 입력해주세요.');
            return;
        }
        try {
            const response = await instance.get(`/bio/members/dup/${userData.loginId}`);
            setIsDuplicateId(response.data.isDuplicate);
            setErrorMessage(response.data.isDuplicate ? '중복된 아이디입니다.' : '사용 가능한 아이디입니다.');
        } catch (error) {
            console.error('아이디 중복 확인 오류:', error);
            setErrorMessage('중복된 아이디입니다.');
        }
    };

    const handleConfirm = () => {
        if (isDuplicateId) {
            setErrorMessage('중복된 아이디입니다. 다른 아이디를 사용해주세요.');
            return;
        }

        for (const field in userData) {
            if (userData[field as keyof typeof userData] === '') {
                setErrorMessage('모든 필드를 입력해주세요.');
                return;
            }
        }
        setErrorMessage(null);
        onConfirm(userData);
    };

    return (
        <Overlay>
            <Modal>
                <h3>{title}</h3>
                <Label>
                    <strong>아이디</strong>
                    <InputContainer>
                        <Input 
                            name="loginId" 
                            value={userData.loginId} 
                            onChange={handleChange} 
                            placeholder="아이디를 입력하세요"
                            onFocus={() => setHelperText(validationMessages.loginId)}
                            onBlur={() => setHelperText(null)}
                            style={isDuplicateId ? { borderColor: 'red' } : {}}
                        />
                        <DuplicateButton onClick={checkDuplicateId}>중복 확인</DuplicateButton>
                    </InputContainer>
                    {isDuplicateId && <DuplicateWarning>중복된 아이디입니다.</DuplicateWarning>}
                </Label>
                <Label>
                    <strong>비밀번호</strong>
                    <Input 
                        name="password" 
                        type="password"
                        value={userData.password} 
                        onChange={handleChange} 
                        placeholder="비밀번호를 입력하세요"
                        onFocus={() => setHelperText(validationMessages.password)}
                        onBlur={() => setHelperText(null)}
                    />
                </Label>
                <Label>
                    <strong>이름</strong>
                    <Input 
                        name="name" 
                        value={userData.name} 
                        onChange={handleChange} 
                        placeholder="이름을 입력하세요"
                        onFocus={() => setHelperText(validationMessages.name)}
                        onBlur={() => setHelperText(null)}
                    />
                </Label>
                <Label>
                    <strong>연락처</strong>
                    <Input 
                        name="phoneNum" 
                        value={userData.phoneNum} 
                        onChange={handleChange} 
                        placeholder="연락처를 입력하세요"
                        onFocus={() => setHelperText(validationMessages.phoneNum)}
                        onBlur={() => setHelperText(null)}
                    />
                </Label>
                <Label>
                    <strong>성별</strong>
                    <GenderContainer>
                        <GenderLabel>
                            <input
                                type="radio"
                                name="gender"
                                value="MALE"
                                checked={userData.gender === 'MALE'}
                                onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
                                onFocus={() => setHelperText(validationMessages.gender)}
                                onBlur={() => setHelperText(null)}
                            />
                            남성
                        </GenderLabel>
                        <GenderLabel>
                            <input
                                type="radio"
                                name="gender"
                                value="FEMALE"
                                checked={userData.gender === 'FEMALE'}
                                onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
                                onFocus={() => setHelperText(validationMessages.gender)}
                                onBlur={() => setHelperText(null)}
                            />
                            여성
                        </GenderLabel>
                    </GenderContainer>
                </Label>
                <Label>
                    <strong>나이</strong>
                    <Input 
                        name="age" 
                        value={userData.age} 
                        onChange={handleChange} 
                        placeholder="나이를 입력하세요"
                        onFocus={() => setHelperText(validationMessages.age)}
                        onBlur={() => setHelperText(null)}
                    />
                </Label>
                <HelperText>{helperText}</HelperText>
                {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
                <ButtonContainer>
                    <ConfirmButton onClick={handleConfirm}>추가</ConfirmButton>
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
    width: 350px;
    text-align: center;
`;

const Label = styled.label`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 15px 0;
`;

const InputContainer = styled.div`
    display: flex;
    align-items: center;
`;

const Input = styled.input`
    padding: 5px;
    width: 200px;
    margin-right: 5px;
    box-sizing: border-box;
`;

const DuplicateButton = styled.button`
    padding: 5px 10px;
    background-color: #364954;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background-color: #4b5b6e;
    }
`;

const GenderContainer = styled.div`
    display: flex;
    gap: 10px;
`;

const GenderLabel = styled.label`
    display: flex;
    align-items: center;
`;

const HelperText = styled.div`
    font-size: 12px;
    color: #888;
    margin-top: 10px;
    min-height: 18px;
    text-align: left;
`;

const DuplicateWarning = styled.div`
    color: red;
    font-size: 12px;
    margin-top: 5px;
    text-align: left;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 20px;
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

const ErrorMessage = styled.div`
    color: red;
    margin-top: 10px;
    font-size: 14px;
`;
