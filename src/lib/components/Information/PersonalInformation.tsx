import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Header from '../Header/Header'
import { useParams } from 'react-router-dom'
import { TiArrowBackOutline } from "react-icons/ti";
import { Link } from 'react-router-dom'
import instance from '../../../axios'
import ReactApexChart from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'

const dummyData = {
    member: {
        id: 999,
        loginId: "aaa",
        name: "홍길동",
        phoneNumber: "010-0000-0000",
        supervisorPhoneNumber: "010-1111-1111",
        gpsLocation: "위치없음",
        condition: 'DANGER'
    },
    vital: {
        stress: 0,
        depress: 2,
        abnormalHr: 0,
        spo2: 1,
        hr: 1,
        step: 21,
        recovery: 1
    }
};

const conditionLabels: Record<string, string> = {
    NOT_MEASUREMENT: '미측정',
    DANGER: '위험',
    CAUTION: '주의',
    GOOD: '양호',
};

const PersonalInformation =() => {
    const { no } = useParams<{ no: string }>();
    const [userInfo, setUserInfo] = useState<any | null>(null)
    const [userCondition, setUserConditon] = useState<string | null>(null)
    const [chartData, setChartData] = useState<{ hr: { value: number; Ts: string }[]; spo2: { value: number; Ts: string }[] }>({ hr: [], spo2: [] });
    const [scoreChartData, setScoreChartData] = useState<{ wellness: {score: number; Ts: string}[]; physical: {score: number; Ts: string}[]; mental: {score: number; Ts: string}[] }>({ wellness: [], physical: [], mental: [] });
    const [selectedTimeFrame, setSelectedTimeFrame] = useState<'day' | 'hour' | 'minute'>('day');
    const [scoreSelectedTimeFrame, setScoreSelectedTimeFrame] = useState<'day' | 'hour' | 'minute'>('day');
    const [buttonDisabled, setButtonDisabled] = useState(userCondition !== 'DANGER');

    const date = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (userCondition === 'DANGER') {
            setButtonDisabled(false); // 상태가 위험일 때 버튼 활성화
        } else {
            setButtonDisabled(true); // 다른 상태일 때 버튼 비활성화
        }
    }, [userCondition]);

    useEffect(() => {
        const fatchMember = async () => {
            try {
                // 개인 정보
                const response = await instance.get(`/admin/members/info/detail/${no}`)
                setUserInfo(response.data.memberDetail)
                console.log("Result: " + JSON.stringify(response.data.memberDetail));

                // 사용자 상태정보
                const response2 = await instance.get('/admin/members/info/condition')
                const memberConditions = response2.data.memberConditions
                
                // 특정 회원의 상태 정보 필터링
                const condition = memberConditions.find((item:any) => item.member.id.toString() === no)?.member.condition
                setUserConditon(condition || null)
                console.log("사용자 상태 : " + JSON.stringify(condition))

                // 사용자 차트정보
                const response3 = await instance.get(`/admin/members/info/chart/${no}`,{
                    params : {date}
                })
                const memberCharts = response3.data.memberCharts;
                console.log("사용자 차트 정보" + JSON.stringify(response3.data))

                // 차트 데이터를 상태로 설정
                setChartData({
                    hr: memberCharts.hr.map((item: any) => ({ value: item.value, Ts: item.Ts })),
                    spo2: memberCharts.spo2.map((item: any) => ({ value: item.value, Ts: item.Ts })),
                });
        
                setScoreChartData({
                    wellness: memberCharts.wellness.map((item: any) => ({ score: item.score, Ts: item.Ts })),
                    physical: memberCharts.physical.map((item: any) => ({ score: item.score, Ts: item.Ts })),
                    mental: memberCharts.mental.map((item: any) => ({ score: item.score, Ts: item.Ts })),
                });

            } catch (error) {
                console.log("데이터 조회 실패" + error)

                setUserInfo(dummyData);
                setUserConditon(dummyData.member.condition);

                const dummyTime = new Date().toISOString();

                // 임시 차트 데이터 설정
                setChartData({
                    hr: [
                        { value: 70, Ts: dummyTime },
                        { value: 75, Ts: dummyTime },
                        { value: 72, Ts: dummyTime },
                        { value: 71, Ts: dummyTime },
                        { value: 73, Ts: dummyTime },
                        { value: 74, Ts: dummyTime },
                        { value: 76, Ts: dummyTime }
                    ],
                    spo2: [
                        { value: 98, Ts: dummyTime },
                        { value: 97, Ts: dummyTime },
                        { value: 99, Ts: dummyTime },
                        { value: 98, Ts: dummyTime },
                        { value: 96, Ts: dummyTime },
                        { value: 95, Ts: dummyTime },
                        { value: 94, Ts: dummyTime }
                    ],
                });

                setScoreChartData({
                    wellness: [
                        { score: 70, Ts: dummyTime },
                        { score: 72, Ts: dummyTime },
                        { score: 74, Ts: dummyTime },
                        { score: 76, Ts: dummyTime },
                        { score: 75, Ts: dummyTime },
                        { score: 77, Ts: dummyTime },
                        { score: 73, Ts: dummyTime }
                    ],
                    physical: [
                        { score: 80, Ts: dummyTime },
                        { score: 82, Ts: dummyTime },
                        { score: 81, Ts: dummyTime },
                        { score: 83, Ts: dummyTime },
                        { score: 85, Ts: dummyTime },
                        { score: 86, Ts: dummyTime },
                        { score: 84, Ts: dummyTime }
                    ],
                    mental: [
                        { score: 90, Ts: dummyTime },
                        { score: 88, Ts: dummyTime },
                        { score: 89, Ts: dummyTime },
                        { score: 91, Ts: dummyTime },
                        { score: 92, Ts: dummyTime },
                        { score: 93, Ts: dummyTime },
                        { score: 94, Ts: dummyTime }
                    ],
                });

            }
        }

        fatchMember()
    },[no, date])

    const handleTimeFrameChange = (timeFrame: 'day' | 'hour' | 'minute') => {
        setSelectedTimeFrame(timeFrame);
    };
    const handleScoreTimeFrameChange = (timeFrame: 'day' | 'hour' | 'minute') => {
        setScoreSelectedTimeFrame(timeFrame);
    };

    // x축 레이블 설정 함수
    const getXaxisCategories = (data: { Ts: string }[], timeFrame: 'day' | 'hour' | 'minute') => {
        return data.map((item) => {
            const date = new Date(item.Ts);
            if (timeFrame === 'day') {
                // 월/일 형식
                return `${date.getMonth() + 1}/${date.getDate()}`;
            } else if (timeFrame === 'hour') {
                // 일 시 형식
                return `${date.getDate()}일 ${date.getHours()}시`;
            } else if (timeFrame === 'minute') {
                // 일 시 분 형식
                return `${date.getDate()}일 ${date.getHours()}시 ${date.getMinutes()}분`;
            }
        });
    };
    
    if (!userInfo) {
        return <div>유저를 찾을 수 없습니다.</div>;
    }
    
    // hr, spo2 차트 옵션 설정
    const chartOptions: ApexOptions = {
        chart: {
            type: 'line',
            height: 350,
            toolbar: { show: false },
        },
        series: [
            { name: '심박수', data: chartData.hr.map((item) => item.value) },
            { name: 'SpO2', data: chartData.spo2.map((item) => item.value) }
        ],
        stroke: {
            curve: 'smooth',
            width:2
        },
        xaxis: {
            // categories: ['7일 전', '6일 전', '5일 전', '4일 전', '3일 전', '2일 전', '1일 전'],
            categories: getXaxisCategories(chartData.hr, selectedTimeFrame)
        },
        title: {
            text: '심박수 / 혈중 산소 차트',
            align: 'left',
            style: {
                fontSize:'20px'
            }
        },
        colors: ['#BBE6B5','#70BFC9'],
    };

    // score 차트 옵션 설정
    const stackedChartOptions: ApexOptions = {
        chart: {
            type: 'line',
            height: 350,
            toolbar: { show: false }
        },
        series: [
            { name: '웰니스 지수', data: scoreChartData.wellness.map((item) => item.score) },
            { name: '신체건강 지수', data: scoreChartData.physical.map((item) => item.score) },
            { name: '정신건강 지수', data: scoreChartData.mental.map((item) => item.score) }
        ],
        stroke: {
            curve: 'smooth',
            width:2
        },
        xaxis: {
            // categories: ['7일 전', '6일 전', '5일 전', '4일 전', '3일 전', '2일 전', '1일 전'],
            categories: getXaxisCategories(scoreChartData.physical, scoreSelectedTimeFrame)
        },
        title: {
            text: '지수차트',
            align: 'left',
            style: {
                fontSize: '20px'
            }
        },
        colors: ['#B5E6BE', '#70BFC9', '#B1DFDC'],
        legend: {
            position: 'bottom'
        }
    };

   

    const handleConfirmClick = () => {
        const userConfirmed = window.confirm('상태를 확인하시겠습니까?');
        if (userConfirmed) {
            setButtonDisabled(true);
        }
    };

    return (
        <DashboardContainer>
            <Header/>
            <Bgimg />
            <DetailContainer>
            <HeaderContainer>
                <Title>개인 건강 상태</Title>
                <PrevPageBtn as={Link} to="/information">
                    <TiArrowBackOutline />
                    돌아가기
                </PrevPageBtn>
            </HeaderContainer>
            
            <TitleStatusBox>
                <DetailTitle>{userInfo.member.name}님의 상세정보</DetailTitle>
                {userCondition && <Status status={userCondition}>{conditionLabels[userCondition] || '미측정'}</Status>}
                <ConfirmButton
                onClick={handleConfirmClick}
                disabled={buttonDisabled}
            >
                상태 확인
            </ConfirmButton>
            </TitleStatusBox>

            <InfoGrid>
                <InfoItem>
                    <Content>이름</Content>
                    <Content>{userInfo.member.name}</Content>
                </InfoItem>
                <InfoItem>
                    <Content>아이디</Content>
                    <Content>{userInfo.member.loginId}</Content>
                </InfoItem>
                <InfoItem>
                    <Content>생년월일</Content>
                    {/* <Content>{user.date}</Content> */}
                </InfoItem>
                <InfoItem>
                    <Content>휴대폰</Content>
                    <Content>{userInfo.member.phoneNumber}</Content>
                </InfoItem>
                <InfoItem>
                    <Content>보호자휴대폰</Content>
                    <Content>{userInfo.member.supervisorPhoneNumber}</Content>
                </InfoItem>
            </InfoGrid>

            

            <MeasurementIndexContainer>
                <MeasurementContainer>
                    <MeasureBox>
                        <MeasureBack>
                            <IconCircle>
                                <IconBack />
                                <IconFront style={{backgroundImage : `url('/icon/physicalHealth.svg')`}}/>
                            </IconCircle>
                            <Measure>{userInfo?.score?.physical || '5'}</Measure>
                        </MeasureBack>
                        <MeasureTitle>신체건강 지수</MeasureTitle>
                    </MeasureBox>
                    <MeasureBox>
                        <MeasureBack>
                            <IconCircle>
                                <IconBack />
                                <IconFront style={{backgroundImage : `url('/icon/hr.svg')`}}/>
                            </IconCircle>
                            <MeasureFlex>
                                <Measure>{userInfo.vital.hr}</Measure>
                                <Content>회/분</Content>
                            </MeasureFlex>
                        </MeasureBack>
                        <MeasureTitle>심박수</MeasureTitle>
                    </MeasureBox>
                    <MeasureBox>
                        <MeasureBack>
                            <IconCircle>
                                <IconBack />
                                <IconFront style={{backgroundImage : `url('/icon/spo2.svg')`}}/>
                            </IconCircle>
                            <MeasureFlex>
                                <Measure>{userInfo.vital.spo2}</Measure>
                                <Content>%</Content>
                            </MeasureFlex>
                        </MeasureBack>
                        <MeasureTitle>혈중산소</MeasureTitle>
                    </MeasureBox>
                </MeasurementContainer>
                <MeasurementContainer>
                <MeasureBox>
                    <MeasureBack>
                        <IconCircle>
                            <IconBack />
                            <IconFront style={{backgroundImage : `url('/icon/mentalHealth.svg')`}}/>
                        </IconCircle>
                        <Measure>{userInfo?.score?.mental ||'5'}</Measure>
                    </MeasureBack>
                    <MeasureTitle>정신건강 지수</MeasureTitle>
                </MeasureBox>
                <MeasureBox>
                    <MeasureBack>
                            <IconCircle>
                                <IconBack />
                                <IconFront style={{backgroundImage : `url('/icon/depress.svg')`}}/>
                            </IconCircle>
                            <Measure>{userInfo.vital.depress}</Measure>
                        </MeasureBack>
                        <MeasureTitle>우울증 지수</MeasureTitle>
                    </MeasureBox>
                    <MeasureBox>
                        <MeasureBack>
                            <IconCircle>
                                <IconBack />
                                <IconFront style={{backgroundImage : `url('/icon/recovery.svg')`}}/>
                            </IconCircle>
                            <Measure>{userInfo.vital.recovery}</Measure>
                        </MeasureBack>
                        <MeasureTitle>회복탄력성 지수</MeasureTitle>
                    </MeasureBox>
                    <MeasureBox>
                        <MeasureBack>
                            <IconCircle>
                                <IconBack />
                                <IconFront style={{backgroundImage : `url('/icon/stress.svg')`}}/>
                            </IconCircle>
                            <Measure>{userInfo.vital.stress}</Measure>
                        </MeasureBack>
                        <MeasureTitle>스트레스 지수</MeasureTitle>
                    </MeasureBox>
                </MeasurementContainer>
                
                
                <div style={{width:'5%' }}/>
                <WellnessCircle>
                    <WellnessCircleBack />
                    <WellnessCircleFront />
                    <WellnessFlex>
                        <MeasureTitle>웰니스 지수</MeasureTitle>
                        <WellnessMeasure>{userInfo?.score?.wellness||'5'}</WellnessMeasure>
                    </WellnessFlex>
                </WellnessCircle>
            </MeasurementIndexContainer>

            
            <ChartContainer>
                <ChartDiv>
                    <ButtonContainer>
                        <TimeButton onClick={() => handleTimeFrameChange('day')}>일</TimeButton>
                        <TimeButton onClick={() => handleTimeFrameChange('hour')}>시</TimeButton>
                        <TimeButton onClick={() => handleTimeFrameChange('minute')}>분</TimeButton>
                    </ButtonContainer>
                    <ChartWrapper>
                        <ReactApexChart options={chartOptions} series={chartOptions.series} type="line" height={350} />
                    </ChartWrapper>
                </ChartDiv>
                <ChartDiv>
                    <ButtonContainer>
                        <TimeButton onClick={() => handleScoreTimeFrameChange('day')}>일</TimeButton>
                        <TimeButton onClick={() => handleScoreTimeFrameChange('hour')}>시</TimeButton>
                        <TimeButton onClick={() => handleScoreTimeFrameChange('minute')}>분</TimeButton>
                    </ButtonContainer>
                    <ChartWrapper>
                        <ReactApexChart options={stackedChartOptions} series={stackedChartOptions.series} type="line" height={350} />
                    </ChartWrapper>
                </ChartDiv>
            </ChartContainer>

            </DetailContainer>
            
        </DashboardContainer>
    )
}

export default PersonalInformation

interface UserStatusProps {
    status : string;
}

const DashboardContainer = styled.div`
    display: flex;
    height: 100vh;
    justify-content : center;
`

const Bgimg = styled.div`
    background-image : url('/bgimg.png');
    width : 850px;
    height : 200px;
    position : absolute;
    top : 0;
    left : 0;
    transform : rotate(180deg);
    background-size : cover;
    background-repeat : no-repeat;
`

const DetailContainer = styled.div`
    z-index : 3;
    width :80%;
    height: 90%;
    position : absolute;
    bottom : 0;
`

const HeaderContainer = styled.div`
    display : flex;
    justify-content : space-between;
    align-items : center;
    
`
const Title = styled.h2`
    color : #245671;
    font-size : 26px;
`

const PrevPageBtn = styled.button`
    padding : 10px 20px;
    font-size : 18px;
    font-weight : bold;
    background-color : #70BFC9;
    color : white;
    border: none;
    border-radius : 10px;
    cursor: pointer;
    text-decoration : none;

    &:hover {
        background-color: #B1DFDC;
        color: white;
    }
`

const TitleStatusBox = styled.div`
    display : flex;
    align-items : center;
    gap : 30px;
`
const DetailTitle = styled.h2`
    font-size : 20px;
    font-weight : bold;
`

const Status = styled.div<UserStatusProps>`
    font-size : 14px;
    padding : 5px 20px;
    color : white;
    border-radius : 20px;
    background-color: ${props => {
        switch (props.status) {
            case 'GOOD':
                return '#3CB371';
            case 'CAUTION':
                return '#FFA500';
            case 'DANGER':
                return '#FF6347';
            case 'NOT_MEASUREMENT':
                return '#A9A9A9';
            default:
                return '#FFFFFF';
        }
    }};
`

const ConfirmButton = styled.button`
    padding: 10px 20px;
    font-size: 14px;
    background-color: ${(props) => (props.disabled ? '#CCCCCC' : '#70BFC9')};
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer
    &:hover {
        background-color: ${(props) => (props.disabled ? '#CCCCCC' : '#B1DFDC')};
    }
`;

const InfoGrid = styled.div`
    width : 70%;
    margin-top : 10px;
    display : grid;
    grid-template-columns : repeat(3, 1fr);
    gap : 15px;
`

const InfoItem = styled.div`
    display : grid;
    grid-template-columns : repeat(2, 1fr);
`

const Content = styled.div`
    font-size : 17px;
    font-weight : 600;
`

const MeasurementIndexContainer = styled.div`
    display : flex;
    margin-top : 40px;
    justify-content : space-between;
    gap : 5px;
`

const MeasurementContainer = styled.div`
    display : flex;
    gap : 15px;
`

const MeasureBox = styled.div`
    display : flex;
    flex-direction : column;
    justify-content : center;
`

const MeasureBack = styled.div`
    width : 150px;
    height : 212px;
    background-color : #E7F4F5;
    border-radius : 10px;
    display : flex;
    justify-content : center;
    flex-direction : column;
    gap : 20px;
    margin-bottom : 10px;
`

const MeasureTitle = styled.div`
    font-size : 18px;
    font-weight : 600;
    text-align : center;
`

const IconCircle = styled.div`
    margin : 15px 0 25px;
    display : flex;
    justify-content : center;
    align-items : center;

`

const IconBack = styled.div`
    width : 90px;
    height : 90px;
    border-radius : 50%;
    background-color : white;
    position : absolute;
    z-index : 1;
`
const IconFront = styled.div`
    width : 45px;
    height: 45px;
    z-index : 2;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
`

const MeasureFlex = styled.div`
    display : flex;
    justify-content : center;
    align-items : baseline;
    gap : 5px;
`

const Measure = styled.div`
    font-size : 36px;
    font-weight : bold;
    text-align : center;
`

const WellnessCircle = styled.div`
    display : flex;
    margin-right : 10px;
    justify-content : center;
    align-items : center;
`

const WellnessCircleBack = styled.div`
    position : absolute;
    width : 290px;
    height : 290px;
    border-radius : 50%;
    background : linear-gradient(180deg, #E7F4F5 0%, #F0F6EA 100%);
    z-index : 1;
    filter: blur(16px);
    -webkit-filter: blur(16px)
`

const WellnessCircleFront = styled.div`
    position : absolute;
    width : 240px;
    height : 240px;
    border-radius : 50%;
    background : radial-gradient(transparent, white);
    z-index : 2;
`

const WellnessFlex = styled.div`
    display : flex;
    justify-content : center;
    align-items : center;
    gap : 5px;
    z-index : 3;
`

const WellnessMeasure = styled.div`
    font-size : 60px;
    font-weight : bold;
    text-align : center;
`

const ButtonContainer = styled.div`
    display: flex;
    gap: 5px;
    justify-content : flex-end;
`;

const TimeButton = styled.button`
    padding: 10px 15px;
    font-size: 14px;
    background-color: #70BFC9;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;

    &:hover {
        background-color: #B1DFDC;
    }
`;

const ChartContainer = styled.div`
    margin-top: 100px;
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 30px
`;

const ChartDiv = styled.div`
    flex : 1;
`
const ChartWrapper = styled.div`
    flex: 1;
`;
