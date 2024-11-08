import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import AddUserModal from './AddUserModal';
import DeleteConfirmModal from './DeleteUserModal';
import AuthModal from './AuthModal';
import instance from '../../../axios';
import { initMembers, MemberSummary } from '../Member/types';

type ActionType = 'addUser' | 'deleteUser' | null;

const Admin = () => {
    const [members, setMembers] = useState<MemberSummary[]>([])
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<{ id: number; name: string } | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [currentAction, setCurrentAction] = useState<ActionType>(null);

    const handleOpenModal = () => setIsAddUserModalOpen(true);

    const openDeleteModal = (id: number, name: string) => {
        setSelectedUser({ id, name });
        setIsDeleteModalOpen(true);
    };

    const closeModals = () => {
        setIsAddUserModalOpen(false);
        setIsDeleteModalOpen(false);
        setIsAuthModalOpen(false);
        setSelectedUser(null);
    };

    const requestAuthForAddUser = () => {
        setCurrentAction('addUser');
        setIsAuthModalOpen(true); // 인증 모달 열기
    };

    const requestAuthForDeleteUser = () => {
        setCurrentAction('deleteUser');
        setIsAuthModalOpen(true); // 인증 모달 열기
        setIsDeleteModalOpen(false); // 삭제 모달 닫기
    };

    const handleAuthConfirm = async (id: string, password: string) => {
        console.log(`ID: ${id}, Password: ${password}`);
        
        // 인증이 완료되면 작업을 수행
        if (currentAction === 'addUser') {
            setIsAddUserModalOpen(true);
        } else if (currentAction === 'deleteUser' && selectedUser) {
            await handleDeleteUser(selectedUser.id);
        }
        closeModals();
    };

    const handleDeleteUser = async (userId: number) => {
        try {
            await instance.delete(`/admin/members/${userId}`);
            setMembers((prev) => prev.filter((member) => member.id !== userId));
            console.log(`유저 ${userId} 삭제 완료`);
        } catch (error) {
            console.log(`유저 삭제 실패: ${error}`);
        }
    };

    const handleAuthSuccess = () => {
        console.log('인증 성공! 후속 작업을 수행합니다.');
        // 인증 성공 시 수행할 추가 작업 (예: 페이지 이동, 상태 업데이트 등)
    };

    useEffect(() => {
        const fatchMembers = async () => {
            try {
                const response = await instance.get('/admin/members/info')
                const members : MemberSummary[] = initMembers(response.data)
                setMembers(members)
                console.log("Loaded members data:", response.data);
            } catch (error) {
                console.log("전체회원 상세정보 조회 실패 : " + error)
            }
        }
        fatchMembers()
    }, [])

    return (
        <AdminContainer>
            <HeaderContainer>
                <Title>관리자페이지</Title>
            </HeaderContainer>

            <AdminInfoContainer>
                <SectionTitle>관리자 정보</SectionTitle>
                <Form>
                    <Label>
                        이름:
                        <Input type="text" defaultValue="관리자" />
                    </Label>
                    <Label>
                        아이디:
                        <Span>admin1</Span>
                    </Label>
                    <Label>
                        비밀번호:
                        <Input type="password" placeholder="비밀번호 입력" />
                    </Label>
                    <div style={{ flex: 1 }} />
                    <SaveButton>저장</SaveButton>
                </Form>
            </AdminInfoContainer>
            <hr />
            <Section>
                <UserTitleContainer>
                    <SectionTitle>유저 관리</SectionTitle>
                    <Button onClick={handleOpenModal}>유저 추가</Button>
                </UserTitleContainer>
                <TableContainer>
                <ScrollContainer>
                    <Table>
                        <thead>
                            <tr>
                                <TableHeader>No.</TableHeader>
                                <TableHeader>ID</TableHeader>
                                <TableHeader>이름</TableHeader>
                                <TableHeader>휴대폰</TableHeader>
                                <TableHeader>작업</TableHeader>
                            </tr>
                        </thead>
                        
                        <tbody>
                            {members.map((member, index) => (
                                <tr key={member.id}>
                                    <td>{member.id}</td>
                                    <td>{member.loginId}</td>
                                    <td>{member.name}</td>
                                    <td>{member.phoneNumber}</td>
                                    <td>
                                        <DeleteButton onClick={() => openDeleteModal(member.id, member.name)}>삭제</DeleteButton>
                                    </td>
                                </tr>
                            ))}
                                
                        </tbody>
                    </Table>
                </ScrollContainer>

                </TableContainer>
            </Section>

            <AddUserModal
                isOpen={isAddUserModalOpen}
                onClose={() => setIsAddUserModalOpen(false)}
                onConfirm={requestAuthForAddUser} // 인증 요청 전달
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={requestAuthForDeleteUser} // 인증 요청 전달
                user={selectedUser}
            />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={closeModals}
                onConfirm={handleAuthConfirm}
                onAuthSuccess={handleAuthSuccess}
            />
        </AdminContainer>
    );
};

export default Admin;

const AdminContainer = styled.div`
    flex: 1;
    height: 95.5%;
    margin: 10px 25px 0;
`;

const HeaderContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: start;
`;

const Title = styled.h2`
    color: #364954;
    font-size: 22px;
    margin-right: 20px;
`;

const AdminInfoContainer = styled.div`
    margin: 20px 0;
`

const Section = styled.section`
    margin-top: 20px;
`;

const SectionTitle = styled.h3`
    font-size: 18px;
    color: #364954;
    margin-bottom: 10px;
`;

const Form = styled.form`
    display: flex;
    align-items : center;
    gap: 30px;
`;

const Label = styled.label`
    font-size: 14px;
    color: #364954;
`;

const Input = styled.input`
    margin-left: 10px;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
`;

const Span = styled.span`
    margin-left: 10px;
    font-size: 14px;
    color: #364954;
`;

const SaveButton = styled.button`
    padding: 10px;
    border: none;
    background-color: #364954;
    color: white;
    border-radius: 5px;
    cursor: pointer;
    align-self: flex-start;

    &:hover {
        background-color: #4b5b6e;
    }
`;

const Button = styled.button`
    padding: 10px;
    border: none;
    background-color: #364954;
    color: white;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background-color: #4b5b6e;
    }
`;

const UserTitleContainer = styled.div`
    display : flex;
    justify-content : space-between;
    align-items : center;
`
const TableContainer = styled.div`
    width: 100%;

`


const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    
    td {
        margin-top : 10px;
        border: 1px solid #ccc;
        padding: 7px;
        text-align: center;
    }


`;
const TableHeader = styled.th`
    position: sticky;
    top: 0;
    background-color: #f5f5f5;
    border: 1px solid #ccc;
    padding: 10px;
    text-align: center;
    z-index: 1;
`;
const ScrollContainer = styled.div`
    margin-top : 10px;
    height: 312px;
    overflow-y: auto;
`;

const DeleteButton = styled.button`
    padding: 5px 10px;
    border: none;
    background-color: #ff6b6b;
    color: white;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background-color: #ff4b4b;
    }
`;
