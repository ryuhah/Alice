import React, { useEffect, useState } from 'react'
import styled from 'styled-components';
import SearchBar from '../Search/SearchBar'
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import SortBtn from '../Search/SortBtn';
import FilterBtn from '../Search/FilterBtn';
import instance from '../../../axios';
import { initMembers, MemberSummary, patchMembers } from './types';
import MemberModal from './MemberMotal';

type ConditionType = 'NOT_MEASUREMENT' | 'MEASURING';

const conditionLabels: Record<ConditionType, string> = {
    NOT_MEASUREMENT: '미측정',
    MEASURING: '측정'
};

const Member = () => {
    const [members, setMembers] = useState<MemberSummary[]>([])
    const [filteredMembers, setFilteredMembers] = useState<MemberSummary[]>([]);
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10;
    const [selectedFilters, setSelectedFilters] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedUser, setSelectedUser] = useState<MemberSummary | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // TODO: 기본정보 받아오기 -> 생체데이터 페이징 형태로 받아오기 
    useEffect(() => {
        const fatchInfo = async () => {
            try {
                const response = await instance.get('/bio/admin/members/info')
                const members: MemberSummary[] = initMembers(response.data);
                setMembers(members)
                setFilteredMembers(members)
                console.log("Loaded members data:", response.data);
            } catch (error) {
                console.log("전체회원 상세정보 조회 실패 : " + error)
            }
        }

        const fatchDetail = async () => {
            try {
                const response = await instance.get('/bio/admin/members/info/detail')
                const members: MemberSummary[] = patchMembers(response.data.memberDetails);
                setMembers(members)
                setFilteredMembers(members)
                console.log("Loaded members data_patch:", response.data.memberDetails);
            } catch (error) {
                console.log("전체회원 상세정보 조회 실패 : " + error)
            }
        }

        fatchInfo()
        setTimeout(fatchDetail, 500);

        const intervalId = setInterval(fatchDetail, 10 * 60 * 1000); // 10분마다 호출
        return () => clearInterval(intervalId)
    }, [])

    // filter
    const handleSearch = () => {
        const filteredData = members.filter(member =>
            member.loginId.includes(searchTerm) ||
            member.name.includes(searchTerm) ||
            member.phoneNumber.includes(searchTerm)
        );
        setFilteredMembers(filteredData);
        setCurrentPage(1);
    };

    // sort
    const handleSortByName = (order: 'asc' | 'desc') => {
        const sorted = [...filteredMembers].sort((a, b) => order === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        );
        setFilteredMembers(sorted);
        setCurrentPage(1); // 정렬 후 페이지를 처음으로 설정
    };

    // pagination
    const currentItems = filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);
    const handleNextPage = () => currentPage < Math.ceil(filteredMembers.length / itemsPerPage) && setCurrentPage(currentPage + 1);
    const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

    // Row 클릭
    const handleRowClick = (member: MemberSummary) => {
        setSelectedUser(member);
        setIsModalOpen(true);
    }

    // 모달 닫기
    const closeModal = () => {
        setSelectedUser(undefined);
        setIsModalOpen(false);
    }

    return (
        <MemberContainer>
            <HeaderContainer>
                <Title>사용자 정보</Title>
                <SearchBox>
                    <FilterBtn
                        selectedFilters={selectedFilters}
                        setSelectedFilters={setSelectedFilters} />
                    <SearchBar
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onSearch={handleSearch} />
                </SearchBox>
            </HeaderContainer>
            <SortContainer>
                <SortBtn label='이름순' onSort={handleSortByName} />
            </SortContainer>
            <TableHeader>
                <div style={{ width: "10%" }}>No.</div>
                <div style={{ width: "10%" }}>ID</div>
                <div style={{ width: "10%" }}>이름</div>
                <div style={{ width: "10%" }}>휴대폰</div>
                <div style={{ width: "10%" }}>갈망정도</div>
                <div style={{ width: "10%" }}>갈망상황</div>
                <div style={{ width: "10%" }}>측정여부</div>
            </TableHeader>
            <hr />
            <TableBody>
                {currentItems.map((item, index) => {
                    console.log("Loaded members data2:", members);
                    return (
                        <TableRow key={index} onClick={() => handleRowClick(item)}>
                            <div style={{ width: "10%" }}>{item.id}</div>
                            <div style={{ width: "10%" }}>{item.loginId}</div>
                            <div style={{ width: "10%" }}>{item.name}</div>
                            <div style={{ width: "10%" }}>{item.phoneNumber}</div>
                            <div style={{ width: "10%" }}>{item.degree}</div>
                            <div style={{ width: "10%" }}>{item.situation}</div>
                            <div style={{ width: "10%" }}>{conditionLabels[item.measureState as ConditionType]}</div>
                        </TableRow>
                    )
                })}
            </TableBody>
            <MemberModal
                isOpen={isModalOpen}
                onClose={closeModal}
                user={selectedUser}
            />
            <Pagination>
                <PageBtn
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}>
                    <IoIosArrowBack />
                </PageBtn>
                {Array.from({ length: Math.ceil(filteredMembers.length / itemsPerPage) }).map((_, index) => (
                    <PageBtn
                        key={index + 1}
                        isActive={currentPage === index + 1}
                        onClick={() => handlePageChange(index + 1)}
                    >
                        {index + 1}
                    </PageBtn>
                ))}
                <PageBtn
                    onClick={handleNextPage}
                    disabled={currentPage === Math.ceil(filteredMembers.length / itemsPerPage)}>
                    <IoIosArrowForward />
                </PageBtn>
            </Pagination>
        </MemberContainer>
    )
}

export default Member

const MemberContainer = styled.div`
    flex: 1;
    height :95.5%;
    margin : 10px 25px 0;
`;

const HeaderContainer = styled.div`
    display : flex;
    justify-content : space-between;
    align-items : center;
    
`
const SearchBox = styled.div`
    display : flex;
    align-items : center;
    gap :10px;
`


const SortContainer = styled.div`
    display : flex;
    justify-content : end;
`

const Title = styled.h2`
    color : #364954;
    font-size : 22px;
`

const TableHeader = styled.div`
    display : flex;
    justify-content : space-between;
    text-align : center;
    font-weight : bold;
    margin-top : 10px;
    font-size : 16px;
`

const TableBody = styled.div`
    height : 64%;
`

const TableRow = styled.div`
    display : flex;
    justify-content : space-between;
    text-align : center;
    padding : 9.5px 0;
    font-size : 14px;   
    cursor : pointer;
`

const Pagination = styled.div`
    bottom : 7%;
    display : flex;
    justify-content : center;
    margin-top: 20px;
`

const PageBtn = styled.button<{ isActive?: boolean }>`
    width : 30px;
    height : 30px;
    margin: 0 3px;
    border: none;
    background-color: ${({ isActive }) => (isActive ? '#364954' : '#f1f1f1')};
    color: ${({ isActive }) => (isActive ? 'white' : 'black')};
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background-color: #4b5b6e;
        color: white;
    }
    
    &:disabled {
        background-color: #e0e0e0;
        color: #a0a0a0;
    }
`