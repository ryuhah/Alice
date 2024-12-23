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
        loginId: "",
        name: "",
        phoneNumber: "010-0000-0000",
        supervisorPhoneNumber: "010-1111-1111",
        gpsLocation: "위치없음",
        condition: 'DANGER'
    },
    vital: {
        stress: 0,
        depress: 0,
        abnormalHr: 0,
        spo2: 0,
        hr: 0,
        step: 0,
        recovery: 0,
        skinTemp: 0,
        bodyTemp: 0,
    },
    score: {
        wellness: 0,
        physical: 0,
        mental: 0,
    }
};

const conditionLabels: Record<string, string> = {
    NOT_MEASUREMENT: '미측정',
    DANGER: '위험',
    CAUTION: '주의',
    GOOD: '양호',
};

const PersonalInformation = () => {
    const { no } = useParams<{ no: string }>();
    const [userInfo, setUserInfo] = useState<any>(dummyData)
    const [userCondition, setUserConditon] = useState<string | null>(null)
    const [chartData, setChartData] = useState<{ hr: { value: number; Ts: string }[]; spo2: { value: number; Ts: string }[] }>({ hr: [], spo2: [] });
    const [scoreChartData, setScoreChartData] = useState<{ wellness: { score: number; Ts: string }[]; physical: { score: number; Ts: string }[]; mental: { score: number; Ts: string }[] }>({ wellness: [], physical: [], mental: [] });
    const [selectedTimeFrame, setSelectedTimeFrame] = useState<'day' | 'hour' | 'minute'>('day');
    const [scoreSelectedTimeFrame, setScoreSelectedTimeFrame] = useState<'day' | 'hour' | 'minute'>('day');
    const [buttonDisabled, setButtonDisabled] = useState(userCondition !== 'DANGER');
    const [loadingChartData, setLoadingChartData] = useState(true);
    const date = new Date().toISOString().split('T')[0];
    // const date = '2024-10-26'

    useEffect(() => {
        if (userCondition === 'DANGER') {
            setButtonDisabled(false); // 상태가 위험일 때 버튼 활성화
        } else {
            setButtonDisabled(true); // 다른 상태일 때 버튼 비활성화
        }
    }, [userCondition]);

    useEffect(() => {
        const fetchBasicInfo = async () => {
            try {
                // 개인 정보
                const response = await instance.get(`/admin/members/info/detail/${no}`)
                setUserInfo(response.data.memberDetail)
                console.log("Result: " + JSON.stringify(response.data.memberDetail));
               
            } catch (error) {
                console.error("기본 정보 조회 실패", error)
                setUserInfo(dummyData);
            }
        }
        
        const fetchChartData = async () => {
            try {
                // 사용자 상태정보
                const response2 = await instance.get('/admin/members/info/condition')
                const condition = response2.data.memberConditions.find((item: any) => item.id.toString() === no)?.condition
                setUserConditon(condition || null)
                console.log("사용자 상태 : " + JSON.stringify(condition))

                // 사용자 차트정보
                const response3 = await instance.get(`/admin/members/info/chart/${no}`, {
                    params: { date }
                })
                const memberCharts = response3.data.memberCharts;

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
                console.error("차트 데이터 조회 실패", error)
                setUserConditon(dummyData.member.condition)
            } finally {
                setLoadingChartData(false);
            }
        }
        fetchBasicInfo()
        fetchChartData()
    }, [no, date])

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
            return '';
        });
    };

    if (!userInfo) {
        return <div>유저를 찾을 수 없습니다.</div>;
    }

    // hr, spo2 차트 옵션 설정
    const chartOptions: ApexOptions = {
        chart: {
            type: 'line',
            height: 300,
            toolbar: { show: false },
        },
        series: [
            { name: '심박수', data: chartData.hr.map((item) => item.value) },
            { name: 'SpO2', data: chartData.spo2.map((item) => item.value) }
        ],
        stroke: {
            curve: 'smooth',
            width: 2
        },
        xaxis: {
            // categories: ['7일 전', '6일 전', '5일 전', '4일 전', '3일 전', '2일 전', '1일 전'],
            categories: getXaxisCategories(chartData.hr, selectedTimeFrame)
        },
        title: {
            text: '심박수 / 혈중 산소 차트',
            align: 'left',
            style: {
                fontSize: '18px'
            }
        },
        colors: ['#BBE6B5', '#70BFC9'],
        legend: {
            offsetY : -5
        }
    };

    // score 차트 옵션 설정
    const stackedChartOptions: ApexOptions = {
        chart: {
            type: 'line',
            height: 300,
            toolbar: { show: false }
        },
        series: [
            { name: '웰니스 지수', data: scoreChartData.wellness.map((item) => item.score) },
            { name: '신체건강 지수', data: scoreChartData.physical.map((item) => item.score) },
            { name: '정신건강 지수', data: scoreChartData.mental.map((item) => item.score) }
        ],
        stroke: {
            curve: 'smooth',
            width: 2
        },
        xaxis: {
            // categories: ['7일 전', '6일 전', '5일 전', '4일 전', '3일 전', '2일 전', '1일 전'],
            categories: getXaxisCategories(scoreChartData.physical, scoreSelectedTimeFrame)
        },
        title: {
            text: '지수차트',
            align: 'left',
            style: {
                fontSize: '18px'
            }
        },
        colors: ['#B5E6BE', '#70BFC9', '#B1DFDC'],
        legend: {
            position: 'bottom',
            offsetY : -5
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
            <Header />
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
                        <Content>위치정보</Content>
                        <Content>{userInfo.member.gpsLocation}</Content>
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
                                    <IconFront style={{ backgroundImage: `url('/icon/physicalHealth.svg')` }} />
                                </IconCircle>
                                <Measure>{userInfo.score.physical}</Measure>
                            </MeasureBack>
                            <MeasureTitle>신체건강 지수</MeasureTitle>
                        </MeasureBox>
                        <MeasureBox>
                            <MeasureBack>
                                <IconCircle>
                                    <IconBack />
                                    <IconFront style={{ backgroundImage: `url('/icon/hr.svg')` }} />
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
                                    <IconFront style={{ backgroundImage: `url('/icon/spo2.svg')` }} />
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
                                    <IconFront style={{ backgroundImage: `url('/icon/mentalHealth.svg')` }} />
                                </IconCircle>
                                <Measure>{userInfo.score.mental}</Measure>
                            </MeasureBack>
                            <MeasureTitle>정신건강 지수</MeasureTitle>
                        </MeasureBox>
                        <MeasureBox>
                            <MeasureBack>
                                <IconCircle>
                                    <IconBack />
                                    <IconFront style={{ backgroundImage: `url('/icon/depress.svg')` }} />
                                </IconCircle>
                                <Measure>{userInfo.vital.depress}</Measure>
                            </MeasureBack>
                            <MeasureTitle>우울증 지수</MeasureTitle>
                        </MeasureBox>
                        <MeasureBox>
                            <MeasureBack>
                                <IconCircle>
                                    <IconBack />
                                    <IconFront style={{ backgroundImage: `url('/icon/recovery.svg')` }} />
                                </IconCircle>
                                <Measure>{userInfo.vital.recovery}</Measure>
                            </MeasureBack>
                            <MeasureTitle>회복탄력성 지수</MeasureTitle>
                        </MeasureBox>
                        <MeasureBox>
                            <MeasureBack>
                                <IconCircle>
                                    <IconBack />
                                    <IconFront style={{ backgroundImage: `url('/icon/stress.svg')` }} />
                                </IconCircle>
                                <Measure>{userInfo.vital.stress}</Measure>
                            </MeasureBack>
                            <MeasureTitle>스트레스 지수</MeasureTitle>
                        </MeasureBox>
                    </MeasurementContainer>


                    <div style={{ width: '18px' }} />
                    <WellnessCircle>
                        <WellnessCircleBack />
                        <WellnessCircleFront />
                        <WellnessFlex>
                            <MeasureTitle>웰니스 지수</MeasureTitle>
                            <WellnessMeasure>{userInfo.score.wellness}</WellnessMeasure>
                        </WellnessFlex>
                    </WellnessCircle>
                </MeasurementIndexContainer>

                {/* 차트 로딩 중이면 로딩 표시, 아니면 차트 표시 */}
                {loadingChartData ? (
                    <div>차트 데이터를 불러오는 중...</div>
                ) : (
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
                )}

                

            </DetailContainer>

        </DashboardContainer>
    )
}

export default PersonalInformation

interface UserStatusProps {
    status: string;
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
    font-size : 22px;
`

const PrevPageBtn = styled.button`
    padding : 10px 15px;
    font-size : 14px;
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
    gap : 15px;
`
const DetailTitle = styled.h2`
    font-size : 18px;
    font-weight : bold;
`

const Status = styled.div<UserStatusProps>`
    font-size : 14px;
    padding : 5px 20px;
    color : white;
    border-radius : 20px;
    margin-left : 25px;
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
    font-size : 16px;
    font-weight : 600;
`

const MeasurementIndexContainer = styled.div`
    display : flex;
    margin-top : 40px;
    justify-content : space-between;
    gap : 25px;
`

const MeasurementContainer = styled.div`
    display : flex;
    gap : 10px;
`

const MeasureBox = styled.div`
    display : flex;
    flex-direction : column;
    justify-content : center;
`

const MeasureBack = styled.div`
    width : 120px;
    height : 180px;
    background-color : #E7F4F5;
    border-radius : 10px;
    display : flex;
    justify-content : center;
    flex-direction : column;
    gap : 20px;
    margin-bottom : 10px;
`

const MeasureTitle = styled.div`
    font-size : 15px;
    font-weight : 600;
    text-align : center;
`

const IconCircle = styled.div`
    margin : 20px 0 20px;
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
    font-size : 32px;
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
    width : 250px;
    height : 250px;
    border-radius : 50%;
    background : linear-gradient(180deg, #E7F4F5 0%, #F0F6EA 100%);
    z-index : 1;
    filter: blur(16px);
    -webkit-filter: blur(16px)
`

const WellnessCircleFront = styled.div`
    position : absolute;
    width : 210px;
    height : 210px;
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
    font-size : 50px;
    font-weight : bold;
    text-align : center;
`

const ButtonContainer = styled.div`
    display: flex;
    gap: 5px;
    justify-content : flex-end;
`;

const TimeButton = styled.button`
    padding: 6px 12px;
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
    margin-top: 70px;
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
