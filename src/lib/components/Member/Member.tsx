import React, { useEffect, useState } from 'react'
import styled from 'styled-components';
import SearchBar from '../Search/SearchBar'
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { CSVLink } from "react-csv";
import SortBtn from '../Search/SortBtn';
import FilterBtn from '../Search/FilterBtn';
import instance from '../../../axios';
import { initMembers, MemberSummary, patchMembers } from './types';

const Member = () => {
    const [members, setMembers] = useState<MemberSummary[]>([])
    const [filteredMembers, setFilteredMembers] = useState<MemberSummary[]>([]);
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10;
    const [selectedFilters, setSelectedFilters] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState<string>('');
    // TODO: 기본정보 받아오기 -> 생체데이터 페이징 형태로 받아오기 
    useEffect(() => {
        const fatchMembers = async () => {
            try {
                const response = await instance.get('/admin/members/info')
                const members: MemberSummary[] = initMembers(response.data);
                setMembers(members)
                setFilteredMembers(members)
                console.log("Loaded members data:", response.data);
            } catch (error) {
                console.log("전체회원 상세정보 조회 실패 : " + error)
            }
        }

        const fatchVitals = async () => {
            try {
                const response = await instance.get('/admin/members/info/detail')
                const members: MemberSummary[] = patchMembers(response.data.memberDetails);
                setMembers(members)
                setFilteredMembers(members)
                console.log("Loaded members data:", response.data.memberDetails);
            } catch (error) {
                console.log("전체회원 상세정보 조회 실패 : " + error)
            }
        }

        fatchMembers()
        fatchVitals()
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

    const csvHeaders = [
        { label: "No.", key: "member.id" },
        { label: "ID", key: "member.loginId" },
        { label: "이름", key: "member.name" },
        { label: "휴대폰", key: "member.phoneNumber" },
        { label: "위치", key: "member.gpsLocation" },
        { label: "스트레스", key: "vital.stress" },
        { label: "우울증", key: "vital.depress" },
        { label: "심박이벤트여부", key: "vital.abnormalHr" },
        { label: "혈중산소포화도", key: "vital.spo2" },
        { label: "심박수", key: "vital.hr" },
        { label: "활동량", key: "vital.step" }
    ]

    const getFormattedDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`
    };


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
                <CSVLinkBtn
                    data={filteredMembers}
                    headers={csvHeaders}
                    filename={`사용자정보_${getFormattedDate()}.csv`}>
                    엑셀 다운로드
                </CSVLinkBtn>
                <SortBtn label='이름순' onSort={handleSortByName} />
            </SortContainer>
            <TableHeader>
                <div style={{ width: "10%" }}>No.</div>
                <div style={{ width: "10%" }}>ID</div>
                <div style={{ width: "10%" }}>이름</div>
                <div style={{ width: "15%" }}>휴대폰</div>
                <div style={{ width: "10%" }}>위치</div>
                <div style={{ width: "10%" }}>스트레스</div>
                <div style={{ width: "10%" }}>우울증</div>
                <div style={{ width: "15%" }}>심박이벤트여부</div>
                <div style={{ width: "15%" }}>혈중산소포화도</div>
                <div style={{ width: "10%" }}>심박수</div>
                <div style={{ width: "10%" }}>활동량</div>
            </TableHeader>
            <hr />
            <TableBody>
                {currentItems.map((item, index) => {
                    console.log("Loaded members data2:", members);
                    return (
                        <TableRow key={index}>
                            <div style={{ width: "10%" }}>{item.id}</div>
                            <div style={{ width: "10%" }}>{item.loginId}</div>
                            <div style={{ width: "10%" }}>{item.name}</div>
                            <div style={{ width: "15%" }}>{item.phoneNumber}</div>
                            <div style={{ width: "10%" }}>{item.gpsLocation}</div>
                            <div style={{ width: "10%" }}>{item?.stress}</div>
                            <div style={{ width: "10%" }}>{item?.depress}</div>
                            <div style={{ width: "15%" }}>{item?.abnormalHr}</div>
                            <div style={{ width: "15%" }}>{item?.spo2}%</div>
                            <div style={{ width: "10%" }}>{item?.hr}</div>
                            <div style={{ width: "10%" }}>{item?.step}</div>
                        </TableRow>
                    )
                })}
            </TableBody>
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
    justify-content : space-between;
`

const CSVLinkBtn = styled(CSVLink)`
    text-decoration: none;
    padding: 10px;
    border-radius: 10px;
    background-color: #70BFC9;
    color: white;
    cursor: pointer;
    font-size : 14px;
    
    &:hover {
        background-color: #B1DFDC;
    }
`

const Title = styled.h2`
    color : #245671;
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
    background-color: ${({ isActive }) => (isActive ? '#70BFC9' : '#f1f1f1')};
    color: ${({ isActive }) => (isActive ? 'white' : 'black')};
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background-color: #B1DFDC;
        color: white;
    }
    
    &:disabled {
        background-color: #e0e0e0;
        color: #a0a0a0;
    }
`