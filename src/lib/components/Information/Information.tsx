import React, { useEffect, useState } from 'react'
import styled from 'styled-components';
import FilterBtn from '../Search/FilterBtn';
import SearchBar from '../Search/SearchBar';
import { Link } from 'react-router-dom';
import SortBtn from '../Search/SortBtn';
import instance from '../../../axios';

type ConditionType = '미측정' | '위험' | '주의' | '양호';

const Information = () => {
    const [members, setMembers] = useState<any[]>([]);
    const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
    const [selectedFilters, setSelectedFilters] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [conditionCounts, setConditionCounts] = useState<Record<ConditionType, number>>({
        미측정: 0,
        위험: 0,
        주의: 0,
        양호: 0
    })

    useEffect(() => {
        const fatchMembers = async () => {
            try{
                // 전체 사용자 정보
                const response = await instance.get('/admin/members/info/detail')
                setMembers(response.data.memberDetails)
                setFilteredMembers(response.data.memberDetails)

                // 사용자 상태정보
                const response2 = await instance.get('/admin/members/info/condition')
                setMembers(response2.data.memberConditions)
                setFilteredMembers(response2.data.memberConditions)

                // 상태별 사용자 수 계산
                calculateConditionCounts(response2.data.memberConditions)
            } catch (error) {
                console.log("데이터 조회 실패:"+error)
            }
        }
        fatchMembers()
    },[])

    // progressbar
    const calculateConditionCounts = (membersData : any[]) => {
        const counts: Record<ConditionType, number> = {
            미측정: 0,
            위험: 0,
            주의: 0,
            양호: 0
        }

        membersData.forEach((member) => {
            const condition = member.member.condition as ConditionType
            if (counts[condition] !== undefined) {
                counts[condition]++
            }
        })

        setConditionCounts(counts)
    }

    // 총 사용자 수 계산
    const totalMembers = members.length;

    // filter
    const handleSearch = () => {
        if (!searchTerm.trim()) {
            // 검색어가 비어 있을 경우 전체 데이터 표시
            setFilteredMembers(members);
        } else {
            // 검색어가 있을 경우 필터링
            const filteredData = members.filter(
                (member) =>
                    member.member &&
                    (
                        (member.member.loginId && member.member.loginId.includes(searchTerm)) ||
                        (member.member.name && member.member.name.includes(searchTerm)) ||
                        (member.member.phoneNumber && member.member.phoneNumber.includes(searchTerm))
                    )
            );
            setFilteredMembers(filteredData);
        }
    };

    // sort
    const handleSortByName = (order : 'asc' | 'desc') => {
        const sorted = [...filteredMembers].sort((a, b) => {
            if (order === 'asc') {
                return a.member.name.localeCompare(b.member.name)
            } else {
                return b.member.name.localeCompare(a.member.name)
            }
        })
        setFilteredMembers(sorted)
    }

    const conditionPriority:Record<ConditionType, number> = {
        '미측정' : 4,
        '위험' : 3,
        '주의' : 2,
        '양호' : 1
    }

    const handleSortByCondition = (order : 'asc' | 'desc') => {
        const sorted = [...filteredMembers].sort((a, b) => {
            const priorityA = conditionPriority[a.member.condition as ConditionType] || 0
            const priorityB = conditionPriority[b.member.condition as ConditionType] || 0

            if (order === 'asc') {
                return priorityA - priorityB
            } else {
                return priorityB - priorityA
            }
        })
        setFilteredMembers(sorted)
    }

    
    return (
        <InformationContainer>
            <HeaderContainer>
                <Title>사용자 건강상태</Title>
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
                <div />
                <SortBtnBox>
                    <SortBtn label='위험도순' onSort={handleSortByCondition} />
                    <SortBtn label='이름순' onSort={handleSortByName} />
                </SortBtnBox>
            </SortContainer>

            <ProgressBarContainer>
                <ProgressText>전체 사용자 건강 상태 ({totalMembers}명)</ProgressText>
                <ProgressBar>
                    {Object.entries(conditionCounts).map(([key, value]) => (
                        <ProgressSegment
                            key={key}
                            status={key as ConditionType}
                            width={(value / totalMembers) * 100}
                        >
                            {value}명
                        </ProgressSegment>
                    ))}
                </ProgressBar>
            </ProgressBarContainer>

            <ScrollContainer>
                <UserContainer>
                    {filteredMembers.map((item, index) => (
                        <UserCard key={index} status={item.member.condition}>
                            <UserName>{item.member.name}</UserName>
                            <UserId>{item.member.loginId}</UserId>
                            <Status>{item.member.condition}</Status>
                            <DetailButton as={Link} to={`/dashboard/${item.member.id}`}>상세정보</DetailButton>
                        </UserCard>
                    ))}
                </UserContainer>
            </ScrollContainer>
            

        </InformationContainer>
    )
}

export default Information

interface UserCardProps {
    status: string;
}

const InformationContainer = styled.div`
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
const SortBtnBox = styled.div`
    display : flex;
    gap : 10px;
`

const Title = styled.h2`
    color : #245671;
    font-size : 26px;
`

const ProgressBarContainer = styled.div`
    margin: 0;
`;

const ProgressText = styled.div`
    font-size: 16px;
    margin-bottom: 8px;
`;

const ProgressBar = styled.div`
    display: flex;
    width: 100%;
    height: 20px;
    border-radius: 14px;
    overflow: hidden;
    background-color: #e0e0e0;
`;

const ProgressSegment = styled.div<{ status: ConditionType; width: number }>`
    width: ${props => props.width}%;
    background-color: ${props => {
        switch (props.status) {
            case '양호':
                return '#3CB371'; // 초록색
            case '주의':
                return '#FFA500'; // 주황색
            case '위험':
                return '#FF6347'; // 빨간색
            case '미측정':
                return '#A9A9A9'; // 회색
            default:
                return '#FFFFFF'; // 기본값 흰색
        }
    }};
    color: white;
    text-align: center;
    line-height: 20px;
    font-size: 14px;
`;


const ScrollContainer = styled.div`
    height : 75.7%;
    overflow-y : auto;
    margin-top : 20px;
`



const UserContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 15px;
    padding-right : 10px;
    
`

const UserCard = styled.div<UserCardProps>`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 10px 20px;
    border-radius: 8px;
    background-color: ${props => {
        switch (props.status) {
            case '양호':
                return '#3CB371'; // 초록색
            case '주의':
                return '#FFA500'; // 주황색
            case '위험':
                return '#FF6347'; // 빨간색
            case '미측정':
                return '#A9A9A9'; // 회색
            default:
                return '#FFFFFF'; // 기본값 흰색
        }
    }};
    color: white;
    text-align: center;
`;

const UserName = styled.div`
    font-size: 18px;
    font-weight: bold;
`;

const Status = styled.div`
    margin-top: 5px;
    font-size: 16px;
`;

const UserId = styled.div`
    margin-top: 5px;
    font-size: 16px;
`;

const DetailButton = styled.button`
    margin-top: 15px;
    padding: 8px 16px;
    background-color: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 8px;
    color: white;
    font-size : 16px;
    cursor: pointer;
    text-decoration : none;

    &:hover {
        background-color: rgba(255, 255, 255, 0.3);
    }
`;