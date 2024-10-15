import React, { useEffect, useState } from 'react'
import styled, { css, keyframes } from 'styled-components';
import FilterBtn from '../Search/FilterBtn';
import SearchBar from '../Search/SearchBar';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SortBtn from '../Search/SortBtn';
import instance from '../../../axios';
import { LuSiren } from "react-icons/lu";

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

    const addDummyData = (data : any[]) => {
        const dummyData = [
            {member:{
                id:999,
                loginId:"aaa",
                name:"홍길동",
                phoneNumber:"010-0000-0000",
                supervisorPhoneNumber:"010-1111-1111",
                gpsLocation:"위치없음",
                condition: '위험'
            },
            vital:{
                stress:0,
                depress:2,
                abnormalHr:0,
                spo2:1,
                hr:1,
                step:21,
                recovery:1
            }}
        ]
        return[...data, ...dummyData]
    }

    useEffect(() => {
        const fatchMembers = async () => {
            try{
                // 전체 사용자 정보
                const response = await instance.get('/admin/members/info/detail')
                const updatedData = addDummyData(response.data.memberDetails)
                // setMembers(response.data.memberDetails)
                // setFilteredMembers(response.data.memberDetails)
                setMembers(updatedData)
                setFilteredMembers(updatedData)
                console.log("사용자 정보 조회 성공 " + JSON.stringify(response.data.memberDetails));

                // 사용자 상태정보
                const response2 = await instance.get('/admin/members/info/condition')
                // setMembers(response2.data.memberConditions)
                // setFilteredMembers(response2.data.memberConditions)
                setMembers(addDummyData(response2.data.memberConditions))
                setFilteredMembers(addDummyData(response2.data.memberConditions))
                console.log("사용자 정보 조회 성공 " + JSON.stringify(response2.data.memberConditions));

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
        const sorted = [...filteredMembers].sort((a, b) => 
            order === 'asc'
                ? a.member.name.localeCompare(b.member.name)
                : b.member.name.localeCompare(a.member.name)
        )
        setFilteredMembers(sorted)
    }

    const handleSortByCondition = (order : 'asc' | 'desc') => {

        const conditionPriority:Record<ConditionType, number> = {
            '미측정' : 4,
            '위험' : 3,
            '주의' : 2,
            '양호' : 1
        }

        const sorted = [...filteredMembers].sort((a, b) => {
            const priorityA = conditionPriority[a.member.condition as ConditionType] || 0
            const priorityB = conditionPriority[b.member.condition as ConditionType] || 0

            return order === 'asc' ? priorityA - priorityB : priorityB - priorityA;
        })
        setFilteredMembers(sorted)
    }

    // 위험 사용자 필터링
    const dangerousMembers = filteredMembers.filter(member => member.member.condition === '위험');

    return (
        <InformationContainer>
            <HeaderContainer>
                <Title>사용자 건강상태</Title>
                <DangerMembersBox>
                    <StyledLuSiren danger={dangerousMembers.length > 0} />
                    <DangerousMembersList danger={dangerousMembers.length > 0}>
                        {dangerousMembers.map(member => (
                            <DangerousMemberItem key={member.member.id}>
                                <Link to={`/dashboard/${member.member.id}`}>{member.member.name}-산소포화도 낮음</Link>
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
                        .filter(([key]) => key !== '미측정')
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
    align-items : center;
    
`
const SearchBox = styled.div`
    display : flex;
    align-items : center;
    gap :10px;
`

const DangerMembersBox = styled.div`
    display : flex;
    justify-content : center;
    align-items : center;
    gap :20px;   
`

const StyledLuSiren = styled(LuSiren)<{ danger: boolean }>`
    font-size: 34px;
    color: ${props => (props.danger ? '#FF6347' : '#A9A9A9')}; /* 위험 사용자가 없으면 회색 */
`;

const DangerousMembersList = styled.div<{ danger: boolean }>`
    width: 250px;
    height: 50px;
    overflow-y: auto;
    display: block;
    font-size: 16px;
    color: black;
    padding: 10px;
    border-radius: 10px;
    border: ${props => (props.danger ? '2px solid #70BFC9' : 'none')}; /* 위험 사용자가 없으면 border 제거 */
    margin-top: 10px;
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
`
const SortBtnBox = styled.div`
    display : flex;
    gap : 10px;
`

const Title = styled.h2`
    color : #245671;
    font-size : 26px;
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
    width: ${props => Math.max(props.width, 2)}%;
    background-color: ${props => {
        switch (props.status) {
            case '양호': return '#3CB371';
            case '주의': return '#FFA500';
            case '위험': return '#FF6347';
            case '미측정': return '#A9A9A9';
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
    font-size: 14px;
`;


const ScrollContainer = styled.div`
    height : 75%;
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

    border: 5px solid ${props => (props.status === '위험' ? '#FFFF00' : 'transparent')};

    /* 위급인 경우 border 깜빡이는 애니메이션 적용 */
    animation: ${props => (props.status === '위험' ? css`${blinkAnimation} 1s infinite` : 'none')};
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