import React from 'react';
import styled from 'styled-components';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void; 
    user: { id: number; name: string } | null;
    title : string
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ isOpen, onClose,onConfirm, user, title }) => {
    if (!isOpen || !user) return null;

    return (
        <Overlay>
            <Modal>
                <h3>{title}</h3>
                <p>
                    ID: <strong>{user.id}</strong>, 이름: <strong>{user.name}</strong>님을 
                </p>
                <p>삭제하시겠습니까?</p>
                <ButtonContainer>
                    <ConfirmButton onClick={onConfirm}>확인</ConfirmButton>
                    <CancelButton onClick={onClose}>취소</CancelButton>
                </ButtonContainer>
            </Modal>
        </Overlay>
    );
};

export default DeleteConfirmModal;

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

const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 30px;
    gap : 20px;
`;

const ConfirmButton = styled.button`
    padding: 10px 20px;
    background-color: #ff6b6b;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background-color: #ff4b4b;
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
