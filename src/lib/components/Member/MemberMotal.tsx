import React from 'react';
import styled from 'styled-components';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    id: number;
    loginId: string;
    name: string;
    phoneNumber: string;
  };
}

const MemberModal: React.FC<ModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <h2>Raw Data 목록</h2>
        {user ? (
          <>
            <p><strong>ID:</strong> {user.loginId}</p>
            <p><strong>이름:</strong> {user.name}</p>
            <p><strong>휴대폰:</strong> {user.phoneNumber}</p>
          </>
        ) : (
          <p>데이터를 불러오는 중입니다...</p>
        )}
        <CloseButton onClick={onClose}>닫기</CloseButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default MemberModal;

const ModalOverlay = styled.div`
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

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  width: 300px;
`;

const CloseButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  border: none;
  background-color: #70BFC9;
  color: white;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #B1DFDC;
  }
`;
