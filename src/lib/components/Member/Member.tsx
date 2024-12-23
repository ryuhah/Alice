import React, { useEffect, useState } from 'react'
import styled from 'styled-components';
import SearchBar from '../Search/SearchBar'
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from "react-icons/md";
import SortBtn from '../Search/SortBtn';
import FilterBtn from '../Search/FilterBtn';
import instance from '../../../axios';
import { initMembers, MemberSummary, patchMembers } from './types';
import MemberModal from './MemberModal';

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
    const maxVisiblePages = 10;
    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
    const currentItems = filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const [selectedFilters, setSelectedFilters] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedUser, setSelectedUser] = useState<MemberSummary | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // TODO: 기본정보 받아오기 -> 생체데이터 페이징 형태로 받아오기 
    useEffect(() => {
        const fatchInfo = async () => {
            try {
                const response = await instance.get('/bio/admin/members/info/condition')
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
    const handleNextPage = () => currentPage < Math.ceil(filteredMembers.length / itemsPerPage) && setCurrentPage(currentPage + 1);
    const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
    const handleJumpBackward = () => {
        const newPage = Math.max(1, Math.floor((currentPage - 1) / 10) * 10 - 9); // 이전 10의 배수로 이동
        setCurrentPage(newPage);
    };
    const handleJumpForward = () => {
        const newPage = Math.min(totalPages, Math.floor((currentPage - 1) / 10) * 10 + 11); // 다음 10의 배수로 이동
        setCurrentPage(newPage);
    };

    // 현재 페이지를 기준으로 시작/끝 페이지 계산
    const startPage = Math.floor((currentPage - 1) / 10) * 10 + 1;
    const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);


    // Row 클릭
    const handleRowClick = async (member: MemberSummary) => {
        setSelectedUser(member);
        setIsModalOpen(true);

        try {
            // 설문 API 호출
            const response = await instance.get(`/bio/admin/members/info/survey/${member.id}`);
            console.log("Survey data for member:", response.data);
        } catch (error) {
            console.error("설문 조회 실패:", error);
        }
    };

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
                <div style={{ width: "5%" }}>No.</div>
                <div style={{ width: "10%" }}>ID</div>
                <div style={{ width: "10%" }}>이름</div>
                <div style={{ width: "10%" }}>휴대폰</div>
                <div style={{ width: "15%" }}>설문시간</div>
                <div style={{ width: "10%" }}>갈망정도</div>
                <div style={{ width: "20%" }}>갈망상황</div>
                <div style={{ width: "10%" }}>측정여부</div>
                <div style={{ width: "15%" }}>측정시간</div>
            </TableHeader>
            <hr />
            <TableBody>
                {currentItems.map((item, index) => {
                    console.log("Loaded members data2:", members);
                    return (
                        <TableRow key={index} onClick={() => handleRowClick(item)}>
                            <div style={{ width: "5%" }}>{item.id}</div>
                            <div style={{ width: "10%" }}>{item.loginId}</div>
                            <div style={{ width: "10%" }}>{item.name}</div>
                            <div style={{ width: "10%" }}>{item.phoneNumber}</div>
                            <div style={{ width: "15%" }}>{item.surveyTs}</div>
                            <div style={{ width: "10%" }}>{item.degree}</div>
                            <div style={{ width: "20%" }}>{item.situation}</div>

                            <div style={{ width: "10%" }}>{conditionLabels[item.measureState as ConditionType]}</div>
                            <div style={{ width: "15%" }}>{item.uploadTs}</div>
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
                <PageBtn onClick={handleJumpBackward} disabled={currentPage <= 10}>
                    <MdKeyboardDoubleArrowLeft />
                </PageBtn>
                <PageBtn
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}>
                    <IoIosArrowBack />
                </PageBtn>
                {Array.from({ length: endPage - startPage + 1 }).map((_, index) => {
                    const page = startPage + index;
                    return (
                        <PageBtn
                            key={page}
                            isActive={currentPage === page}
                            onClick={() => handlePageChange(page)}
                        >
                            {page}
                        </PageBtn>
                    );
                })}
                <PageBtn
                    onClick={handleNextPage}
                    disabled={currentPage === Math.ceil(filteredMembers.length / itemsPerPage)}>
                    <IoIosArrowForward />
                </PageBtn>
                <PageBtn
                    onClick={handleJumpForward}
                    disabled={currentPage > totalPages - 10}
                >
                    <MdKeyboardDoubleArrowRight />
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