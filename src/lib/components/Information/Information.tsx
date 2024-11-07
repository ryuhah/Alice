import React, { useEffect, useState } from 'react'
import styled, { css, keyframes } from 'styled-components';
import FilterBtn from '../Search/FilterBtn';
import SearchBar from '../Search/SearchBar';
import { Link } from 'react-router-dom';
import SortBtn from '../Search/SortBtn';
import instance from '../../../axios';
import { LuSiren } from "react-icons/lu";
import { initCondition, MemberCondition } from './types';

type ConditionType = 'NOT_MEASUREMENT' | 'DANGER' | 'CAUTION' | 'GOOD';

const conditionLabels: Record<ConditionType, string> = {
    NOT_MEASUREMENT: '미측정',
    DANGER: '위험',
    CAUTION: '주의',
    GOOD: '양호',
}; 

const Information = () => {
    const [members, setMembers] = useState<MemberCondition[]>([]);
    const [filteredMembers, setFilteredMembers] = useState<MemberCondition[]>([]);
    const [selectedFilters, setSelectedFilters] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [conditionCounts, setConditionCounts] = useState<Record<ConditionType, number>>({
        NOT_MEASUREMENT: 0,
        CAUTION: 0,
        DANGER: 0,
        GOOD: 0
    })

    const addDummyData = (data: MemberCondition[]) => {
        const dummyData = [
            {
                id: 999,
                loginId: "hong1234",
                name: "홍길동",
                condition: 'DANGER'

            }
        ]
        return [...data, ...dummyData]
    }

    useEffect(() => {
        const fatchMembers = async () => {
            try {
                const response = await instance.get('/admin/members/info')
                const conditions: MemberCondition[] = initCondition(response.data);
                const updatedData: MemberCondition[] = addDummyData(conditions);
                setMembers(updatedData)
                setFilteredMembers(updatedData)
                console.log("사용자 정보 조회 성공 " + JSON.stringify(response.data));

                // 상태별 사용자 수 계산
                calculateConditionCounts(updatedData)
            } catch (error) {
                console.log("데이터 조회 실패:" + error)
            }
        }
        const fatchConditions = async () => {
            try {
                const response = await instance.get('/admin/members/info/condition')
                const updatedData = addDummyData(response.data.memberConditions);
                setMembers(updatedData)
                setFilteredMembers(updatedData)
                console.log("사용자 정보 조회 성공 " + JSON.stringify(response.data.memberConditions));

                // 상태별 사용자 수 계산
                calculateConditionCounts(updatedData)
            } catch (error) {
                console.log("데이터 조회 실패:" + error)
            }
        }
        fatchMembers()
        fatchConditions()
    }, [])

    // progressbar
    const calculateConditionCounts = (membersData: any[]) => {
        const counts: Record<ConditionType, number> = {
            NOT_MEASUREMENT: 0,
            DANGER: 0,
            CAUTION: 0,
            GOOD: 0
        }

        membersData.forEach((member) => {
            const condition = member.condition as ConditionType
            if (counts[condition] !== undefined) {
                counts[condition]++
            }
        })

        setConditionCounts(counts)
    }


    // filter
    const handleSearch = () => {
        if (!searchTerm.trim()) {
            // 검색어가 비어 있을 경우 전체 데이터 표시
            setFilteredMembers(members);
        } else {
            // 검색어가 있을 경우 필터링
            const filteredData = members.filter(
                (member) =>
                    member &&
                    (
                        (member.loginId && member.loginId.includes(searchTerm)) ||
                        (member.name && member.name.includes(searchTerm))
                        // || (member.phoneNumber && member.phoneNumber.includes(searchTerm))
                    )
            );
            setFilteredMembers(filteredData);
        }
    };

    // sort
    const handleSortByName = (order: 'asc' | 'desc') => {
        const sorted = [...filteredMembers].sort((a, b) =>
            order === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name)
        )
        setFilteredMembers(sorted)
    }

    const handleSortByCondition = (order: 'asc' | 'desc') => {

        const conditionPriority: Record<ConditionType, number> = {
            'NOT_MEASUREMENT': 0,
            'DANGER': 3,
            'CAUTION': 2,
            'GOOD': 1
        }

        const sorted = [...filteredMembers].sort((a, b) => {
            const priorityA = conditionPriority[a.condition as ConditionType] || 0
            const priorityB = conditionPriority[b.condition as ConditionType] || 0

            return order === 'asc' ? priorityA - priorityB : priorityB - priorityA;
        })
        setFilteredMembers(sorted)
    }

    // 위험 사용자 필터링
    const dangerousMembers = filteredMembers.filter(member => member.condition === 'DANGER');

    return (
        <InformationContainer>
            <HeaderContainer>
                <Title>사용자 건강상태</Title>
                <DangerMembersBox>
                    <StyledLuSiren danger={dangerousMembers.length > 0} />
                    <DangerousMembersList danger={dangerousMembers.length > 0}>
                        {dangerousMembers.map(member => (
                            <DangerousMemberItem key={member.id}>
                                <Link to={`/dashboard/${member.id}`}>{member.name}-산소포화도 낮음</Link>
                            </DangerousMemberItem>
                        ))}
                    </DangerousMembersList>
                </DangerMembersBox>

                <div style={{ flex: 1 }} />
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
                <ProgressText>전체 사용자 건강 상태 ({members.length}명)</ProgressText>
                <ProgressBar>
                    {Object.entries(conditionCounts)
                        .filter(([key]) => key !== 'NOT_MEASUREMENT')
                        .map(([key, value]) => (
                            <ProgressSegment
                                key={key}
                                status={key as ConditionType}
                                width={(value / members.length) * 100}
                            >
                                {value}명
                            </ProgressSegment>
                        ))}
                </ProgressBar>
            </ProgressBarContainer>

            <ScrollContainer>
                <UserContainer>
                    {filteredMembers.map((item, index) => (
                        <UserCard key={index} status={item.condition}>
                            <UserName>{item.name}</UserName>
                            <UserId>{item.loginId}</UserId>
                            <Status>{conditionLabels[item.condition as ConditionType]}</Status>
                            <DetailButton as={Link} to={`/dashboard/${item.id}`}>상세정보</DetailButton>
                        </UserCard>
                    ))}
                </UserContainer>
            </ScrollContainer>


        </InformationContainer>
    )
}

export default Information

const blinkAnimation = keyframes`
  0% {
    border-color: '#FFFF00';
  }
  50% {
    border-color: transparent;
  }
  100% {
    border-color: '#FFFF00';
  }
`;

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
    align-items : start ;
    
`
const SearchBox = styled.div`
    display : flex;
    align-items : center;
    gap :10px;
    margin-top : 13.5px;
`

const DangerMembersBox = styled.div`
    display : flex;
    justify-content : center;
    align-items : center;
    gap :15px;   
`

const StyledLuSiren = styled(LuSiren) <{ danger: boolean }>`
    font-size: 30px;
    color: ${props => (props.danger ? '#FF6347' : '#A9A9A9')}; /* 위험 사용자가 없으면 회색 */
`;

const DangerousMembersList = styled.div<{ danger: boolean }>`
    width: 250px;
    height: 50px;
    overflow-y: auto;
    // display: block;
    font-size: 14px;
    color: black;
    padding: 10px;
    border-radius: 10px;
    border: ${props => (props.danger ? '2px solid #70BFC9' : 'none')}; /* 위험 사용자가 없으면 border 제거 */
`;

const DangerousMemberItem = styled.div`
    margin-bottom: 10px;
    a {
        text-decoration: none;
        color: inherit; /* 링크 색상 상속 */
    }

    &:hover {
        text-decoration: underline; /* 호버 시 밑줄 추가 */
    }
`;

const SortContainer = styled.div`
    display : flex;
    justify-content : space-between;
    margin-top : -5.5px;
`
const SortBtnBox = styled.div`
    display : flex;
    gap : 10px;
`

const Title = styled.h2`
    color : #245671;
    font-size : 22px;
    margin-right : 20px;
`
const stripeAnimation = keyframes`
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 40px 0;
  }
`;

const ProgressBarContainer = styled.div`
    margin: 0;
`;

const ProgressText = styled.div`
    font-size: 14px;
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
    width: ${props => Math.max(props.width, 2)}%;
    background-color: ${props => {
        switch (props.status) {
            case 'GOOD': return '#3CB371';
            case 'CAUTION': return '#FFA500';
            case 'DANGER': return '#FF6347';
            case 'NOT_MEASUREMENT': return '#A9A9A9';
            default: return '#FFFFFF';
        }
    }};
    background-image: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.2) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.2) 50%,
        rgba(255, 255, 255, 0.2) 75%,
        transparent 75%,
        transparent
    );
    background-size: 40px 40px;
    animation: ${stripeAnimation} 2s linear infinite;
    color: white;
    text-align: center;
    line-height: 20px;
    font-size: 13px;
`;


const ScrollContainer = styled.div`
    height : 72%;
    overflow-y : auto;
    margin-top : 10px;
`



const UserContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 10px;
    padding-right : 10px;
    
`

const UserCard = styled.div<UserCardProps>`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 5px 15px;
    border-radius: 8px;
    background-color: ${props => {
        switch (props.status) {
            case 'GOOD':
                return '#3CB371'; // 초록색
            case 'CAUTION':
                return '#FFA500'; // 주황색
            case 'DANGER':
                return '#FF6347'; // 빨간색
            case 'NOT_MEASUREMENT':
                return '#A9A9A9'; // 회색
            default:
                return '#FFFFFF'; // 기본값 흰색
        }
    }};
    color: white;
    text-align: center;

    border: 5px solid ${props => (props.status === 'DANGER' ? '#FFFF00' : 'transparent')};

    /* 위급인 경우 border 깜빡이는 애니메이션 적용 */
    animation: ${props => (props.status === 'DANGER' ? css`${blinkAnimation} 1s infinite` : 'none')};
`;

const UserName = styled.div`
    font-size: 15px;
    font-weight: bold;
`;

const Status = styled.div`
    margin-top: 5px;
    font-size: 14px;
`;

const UserId = styled.div`
    margin-top: 5px;
    font-size: 14px;
`;

const DetailButton = styled.button`
    margin-top: 10px;
    padding: 8px 16px;
    background-color: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 8px;
    color: white;
    font-size : 14px;
    cursor: pointer;
    text-decoration : none;

    &:hover {
        background-color: rgba(255, 255, 255, 0.3);
    }
`;