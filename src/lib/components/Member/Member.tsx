import React, { useEffect, useState } from 'react'
import styled from 'styled-components';
import SearchBar from '../Search/SearchBar'
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { CSVLink } from "react-csv";
import SortBtn from '../Search/SortBtn';
import FilterBtn from '../Search/FilterBtn';
import instance from '../../../axios';

const Member = () => {
    const [members, setMembers] = useState<any[]>([])
    const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage= 10;
    const [selectedFilters, setSelectedFilters] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        const fatchMembers = async () => {
            try{
                const response = await instance.get('/admin/members/info/detail')
                setMembers(response.data.memberDetails)
                setFilteredMembers(response.data.memberDetails)
            } catch (error) {
                console.log("전체회원 상세정보 조회 실패 : "+ error)
            }
        }

        fatchMembers()
    }, [])

    // filter
    const handleSearch = () => {
        const filteredData = members.filter(member =>
            member.member.loginId.includes(searchTerm) ||
            member.member.name.includes(searchTerm) ||
            member.member.phoneNumber.includes(searchTerm)
        );
        setFilteredMembers(filteredData);
        setCurrentPage(1);
    };

    // sort
    const handleSortByName = (order : 'asc' | 'desc') => {
        const sorted = [...members].sort((a, b) => order === 'asc'
            ? a.member.name.localeCompare(b.member.name)
            : b.member.name.localeCompare(a.member.name)
        )
        setMembers(sorted)
        setCurrentPage(1);
    }

    // pagination
    const currentItems = filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);
    const handleNextPage = () => currentPage < Math.ceil(members.length / itemsPerPage) && setCurrentPage(currentPage + 1);
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
                        setSelectedFilters={setSelectedFilters}/>
                    <SearchBar 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        onSearch={handleSearch}/>
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
                <div style={{width : "10%"}}>No.</div>
                <div style={{width : "10%"}}>ID</div>
                <div style={{width : "10%"}}>이름</div>
                <div style={{width : "10%"}}>휴대폰</div>
                <div style={{width : "10%"}}>위치</div>
                <div style={{width : "10%"}}>스트레스</div>
                <div style={{width : "10%"}}>우울증</div>
                <div style={{width : "10%"}}>심박이벤트여부</div>
                <div style={{width : "10%"}}>혈중산소포화도</div>
                <div style={{width : "10%"}}>심박수</div>
                <div style={{width : "10%"}}>활동량</div>
            </TableHeader>
            <hr />
            <TableBody>
                {currentItems.map((item, index) => (
                    <TableRow key = {index}>
                        <div style={{width : "10%"}}>{item.member.id}</div>
                        <div style={{width : "10%"}}>{item.member.loginId}</div>
                        <div style={{width : "10%"}}>{item.member.name}</div>
                        <div style={{width : "10%"}}>{item.member.phoneNumber}</div>
                        <div style={{width : "10%"}}>{item.member.gpsLocation}</div>
                        <div style={{width : "10%"}}>{item.vital.stress}</div>
                        <div style={{width : "10%"}}>{item.vital.depress}</div>
                        <div style={{width : "10%"}}>{item.vital.abnormalHr}</div>
                        <div style={{width : "10%"}}>{item.vital.spo2}%</div>
                        <div style={{width : "10%"}}>{item.vital.hr}</div>
                        <div style={{width : "10%"}}>{item.vital.step}</div>
                    </TableRow>
                ))}
            </TableBody>
            <Pagination>
                <PageBtn
                    onClick={handlePrevPage}
                    disabled ={currentPage === 1}>
                    <IoIosArrowBack />
                </PageBtn>
                {Array.from({ length: Math.ceil(members.length / itemsPerPage) }).map((_, index) => (
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
                    disabled ={currentPage === Math.ceil(members.length / itemsPerPage)}>
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
    margin-left: 10px;
    border-radius: 10px;
    background-color: #70BFC9;
    color: white;
    cursor: pointer;
    font-size : 18px;
    

    &:hover {
        background-color: #B1DFDC;
    }
`

const Title = styled.h2`
    color : #245671;
    font-size : 26px;
`

const TableHeader = styled.div`
    display : flex;
    justify-content : space-between;
    text-align : center;
    font-weight : bold;
    padding : 10px 0;
    margin-top : 10px;
    font-size : 18px;
`

const TableBody = styled.div`
    height : 68%;
`

const TableRow = styled.div`
    display : flex;
    justify-content : space-between;
    text-align : center;
    padding : 13px 0;
    font-size : 16px;
`

const Pagination = styled.div`
    position : absolute;
    bottom : 7%;
    left : 50%;
    display : flex;
    justify-content : center;
    margin-top: 20px;
`

const PageBtn = styled.button<{isActive? : boolean}>`
    padding: 10px;
    margin: 0 5px;
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