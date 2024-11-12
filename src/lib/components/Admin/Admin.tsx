import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import AddUserModal from './AddUserModal';
import DeleteConfirmModal from './DeleteUserModal';
import AuthModal from './AuthModal';
import instance from '../../../axios';
import { AxiosError } from 'axios';
import { AdminInfo, MemberInfo, ActionType, initMembers, initAdmins } from './types';

const Admin = () => {
    const [members, setMembers] = useState<MemberInfo[]>([]);
    const [admins, setAdmins] = useState<AdminInfo[]>([]);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<{ id: number; name: string } | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [currentAction, setCurrentAction] = useState<ActionType>(null);
    const [userData, setUserData] = useState({
        loginId: '',
        password: '',
        name: '',
        phoneNum: '',
        gender: '',
        age: ''
    });

    const handleOpenModal = (action: ActionType) => {
        setCurrentAction(action);
        setIsAddUserModalOpen(true);
    };

    const openDeleteModal = (id: number, name: string, action: ActionType) => {
        setSelectedUser({ id, name });
        setCurrentAction(action)
        setIsDeleteModalOpen(true);
    };

    const closeModals = () => {
        setIsAddUserModalOpen(false);
        setIsDeleteModalOpen(false);
        setIsAuthModalOpen(false);
        setSelectedUser(null);
    };

    // const requestAuthForAddUser = () => {
    //     setCurrentAction('addUser');
    //     setIsAuthModalOpen(true); // 인증 모달 열기
    // };
    const handleUserConfirm = (data: typeof userData) => {
        setUserData(data);
        setIsAddUserModalOpen(false);
        setIsAuthModalOpen(true); // 인증 모달 열기
    };

    const requestAuthForDeleteUser = () => {
        // setCurrentAction('deleteUser');
        setIsDeleteModalOpen(false)
        setIsAuthModalOpen(true);
    };

    const handleAuthConfirm = async (id: string, password: string) => {
        console.log(`ID: ${id}, Password: ${password}`);

        try {
            if (currentAction === 'addAdmin') {
                await handleAddAdmin();
            } else if (currentAction === 'addUser') {
                await handleAddUser();
            } else if (currentAction === 'deleteUser' && selectedUser) {
                await handleDeleteUser(selectedUser.id);
            } else if (currentAction === 'deleteAdmin' && selectedUser) {
                await handleDeleteAdmin(selectedUser.id);
            }

            closeModals(); // 작업 후 모달 닫기
        } catch (error) {
            console.error('후속 작업 실패:', error);
        }
    };

    const handleAddAdmin = async () => {
        try {
            await instance.post('/bio/auth/admin/add', {
                ...userData,
                phoneNumber: userData.phoneNum,
                age: Number(userData.age)
            });
            setAdmins((prev) => [
                ...prev,
                { ...userData, id: Date.now(), phoneNumber: userData.phoneNum, age: Number(userData.age) }
            ]);
            console.log("관리자 추가 완료");
        } catch (error) {
            console.log("관리자 추가 실패:", error);
        }
    };

    const handleAddUser = async () => {
        try {
            await instance.post('/bio/auth/members/add', {
                ...userData,
                phoneNumber: userData.phoneNum,
                age: Number(userData.age)
            });

            alert("유저 추가에 성공하였습니다.\n내용이 변경되었으니 다시 로그인해주세요."); // 추가된 부분
            window.location.href = '/login'

        } catch (error) {
            console.log("유저 추가 실패:", error);
            // 서버에서 반환된 에러 메시지가 있는 경우, 해당 메시지를 표시
            const axiosError = error as AxiosError;
            const errorMessage = axiosError.response?.data || "";
            alert(`유저 추가에 실패했습니다.\n${errorMessage}`);
        }
    };

    const handleDeleteUser = async (userId: number) => {
        try {
            await instance.delete(`/bio/auth/members/delete/${userId}`);
            setMembers((prev) => prev.filter((member) => member.id !== userId));
            console.log(`유저 ${userId} 삭제 완료`);

            alert("유저 삭제에 성공하였습니다.\n내용이 변경되었으니 다시 로그인해주세요.");
            window.location.href = '/login'

            setSelectedUser(null);
        } catch (error) {
            console.log(`유저 삭제 실패: ${error}`);
            const axiosError = error as AxiosError;
            const errorMessage = axiosError.response?.data || "";
            alert(`유저 삭제에 실패했습니다.\n${errorMessage}`);
        }
    };

    const handleDeleteAdmin = async (userId: number) => {
        try {
            // await instance.delete('/bio/auth/admin/delete', { data: { id: userId } });
            // setAdmins((prev) => prev.filter((admin) => admin.id !== userId));
            // console.log(`관리자 ${userId} 삭제 완료`);
            // setSelectedUser(null);
        } catch (error) {
            console.log(`관리자 삭제 실패: ${error}`);
        }
    };

    const handleAuthSuccess = () => {
        console.log('인증 성공! 후속 작업을 수행합니다.');
    };

    useEffect(() => {
        const fatchAdmins = async () => {
            try {
                const response = await instance.get('bio/admin/info');
                const adminsData = Array.isArray(response.data) ? response.data : [response.data];
                const admins: AdminInfo[] = initAdmins(adminsData)
                setAdmins(admins)
                console.log("Loaded admins data:", response.data)
            } catch (error) {
                console.log("관리자 상세정보 조회 실패 : " + error);
            }
        }
        const fatchMembers = async () => {
            try {
                const response = await instance.get('/bio/admin/members/info')
                const members: MemberInfo[] = initMembers(response.data)
                setMembers(members)
                console.log("Loaded members data:", response.data);
            } catch (error) {
                console.log("전체회원 상세정보 조회 실패 : " + error)
            }
        }
        fatchAdmins();
        fatchMembers();
    }, [])
 
    return (
        <AdminContainer>
            <HeaderContainer>
                <Title>관리자페이지</Title>
            </HeaderContainer>

            <AdminInfoContainer>
                <UserTitleContainer>
                    <SectionTitle>관리자 정보</SectionTitle>
                    {/* <Button onClick={() => handleOpenModal('addAdmin')}>관리자 추가</Button> */}
                </UserTitleContainer>
                <TableContainer>
                    <AdminScrollContainer>
                        <Table>
                            <thead>
                                <tr>
                                    <TableHeader>No.</TableHeader>
                                    <TableHeader>ID</TableHeader>
                                    <TableHeader>이름</TableHeader>
                                    <TableHeader>성별</TableHeader>
                                    <TableHeader>나이</TableHeader>
                                    <TableHeader>휴대폰</TableHeader>
                                    {/* <TableHeader>작업</TableHeader> */}
                                </tr>
                            </thead>

                            <tbody>
                                {admins.map((admin, index) => (
                                    <tr key={admin.id}>
                                        <td>{admin.id}</td>
                                        <td>{admin.loginId}</td>
                                        <td>{admin.name}</td>
                                        <td>{admin.gender}</td>
                                        <td>{admin.age}</td>
                                        <td>{admin.phoneNumber}</td>
                                        {/* <td>
                                            <DeleteButton onClick={() => openDeleteModal(admin.id, admin.name, 'deleteAdmin')}>삭제</DeleteButton>
                                        </td> */}
                                    </tr>
                                ))}

                            </tbody>
                        </Table>
                    </AdminScrollContainer>

                </TableContainer>

            </AdminInfoContainer>
            <hr />
            <Section>
                <UserTitleContainer>
                    <SectionTitle>유저 관리</SectionTitle>
                    <Button onClick={() => handleOpenModal('addUser')}>유저 추가</Button>
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
                                            <DeleteButton onClick={() => openDeleteModal(member.id, member.name, 'deleteUser')}>삭제</DeleteButton>
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
                onConfirm={handleUserConfirm}
                title={currentAction === 'addAdmin' ? "관리자 추가" : "유저 추가"}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={requestAuthForDeleteUser} // 인증 요청 전달
                user={selectedUser}
                title={currentAction === 'deleteAdmin' ? "관리자 삭제" : "유저 삭제"}
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
    margin-top : -20px;
`

const Section = styled.section`
`;

const SectionTitle = styled.h3`
    font-size: 18px;
    color: #364954;
    margin-bottom: 10px;
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

const AdminScrollContainer = styled.div`
    margin-top : 10px;
    height: 80px;
    overflow-y: auto;
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
        padding: 3px;
        text-align: center;
    }


`;
const TableHeader = styled.th`
    position: sticky;
    top: 0;
    background-color: #f5f5f5;
    border: 1px solid #ccc;
    padding: 6px;
    text-align: center;
    z-index: 1;
`;
const ScrollContainer = styled.div`
    margin-top : 10px;
    height: 309px;
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
