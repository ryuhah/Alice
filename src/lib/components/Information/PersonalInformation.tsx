import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Header from '../Header/Header'
import { useParams } from 'react-router-dom'
import { TiArrowBackOutline } from "react-icons/ti";
import { Link } from 'react-router-dom'
import instance from '../../../axios'
import ReactApexChart from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'

const PersonalInformation = () => {

    const { no } = useParams<{ no: string }>();
    const [userInfo, setUserInfo] = useState<any | null>(null)
    const [userCondition, setUserConditon] = useState<string | null>(null)
    const [chartData, setChartData] = useState<{ hr: number[]; spo2: number[] }>({ hr: [], spo2: [] });
    const [scoreChartData, setScoreChartData] = useState<{ wellness: number[]; physical: number[]; mental: number[] }>({ wellness: [], physical: [], mental: [] });

    useEffect(() => {
        const fatchMember = async () => {
            try {
                // 개인 정보
                const response = await instance.get(`/admin/members/info/detail/${no}`)
                setUserInfo(response.data.memberDetail)

                // 사용자 상태정보
                const response2 = await instance.get('/admin/members/info/condition')
                const memberConditions = response2.data.memberConditions
                
                // 특정 회원의 상태 정보 필터링
                const condition = memberConditions.find((item:any) => item.member.id.toString() === no)?.member.condition
                setUserConditon(condition || null)

                // 사용자 차트정보
                const response3 = await instance.get(`/admin/members/info/chart/${no}`)
                const memberCharts = response3.data.memberCharts;

                // 차트 데이터를 상태로 설정
                setChartData({
                    hr: memberCharts.hr.map((item: any) => item.value),
                    spo2: memberCharts.spo2.map((item: any) => item.value),
                });
        
                setScoreChartData({
                    wellness: memberCharts.wellness.map((item: any) => item.score),
                    physical: memberCharts.physical.map((item: any) => item.score),
                    mental: memberCharts.mental.map((item: any) => item.score),
                });
  
            } catch (error) {
                console.log("데이터 조회 실패" + error)
            }
        }

        fatchMember()
    },[])

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
            { name: '심박수', data: chartData.hr },
            { name: 'SpO2', data: chartData.spo2 }
        ],
        stroke: {
            curve: 'smooth',
        },
        xaxis: {
            categories: ['7일 전', '6일 전', '5일 전', '4일 전', '3일 전', '2일 전', '1일 전'],
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
            type: 'bar',
            stacked: true,
            width: '50%',
            height: 350,
            toolbar: { show: false }
        },
        series: [
            { name: '웰니스 지수', data: scoreChartData.wellness },
            { name: '신체건강 지수', data: scoreChartData.physical },
            { name: '정신건강 지수', data: scoreChartData.mental }
        ],
        xaxis: {
            categories: ['7일 전', '6일 전', '5일 전', '4일 전', '3일 전', '2일 전', '1일 전'],
        },
        title: {
            text: '지수차트',
            align: 'left',
            style: {
                fontSize:'20px'
            }
        },
        colors: ['#B5E6BE', '#70BFC9', '#B1DFDC'],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
            },
        },
        dataLabels : {
            enabled : false
        },
        legend: {
            position: 'bottom'
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
                {userCondition && <Status status={userCondition}>{userCondition}</Status>}
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
                <MeasureBox>
                    <MeasureBack>
                        <IconCircle>
                            <IconBack />
                            <IconFront style={{backgroundImage : `url('/icon/physicalHealth.svg')`}}/>
                        </IconCircle>
                        <Measure>{userInfo.score.physical}</Measure>
                    </MeasureBack>
                    <MeasureTitle>신체건강 지수</MeasureTitle>
                </MeasureBox>
                <MeasureBox>
                    <MeasureBack>
                        <IconCircle>
                            <IconBack />
                            <IconFront style={{backgroundImage : `url('/icon/mentalHealth.svg')`}}/>
                        </IconCircle>
                        <Measure>{userInfo.score.mental}</Measure>
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
                <div style={{width:'5%' }}/>
                <WellnessCircle>
                    <WellnessCircleBack />
                    <WellnessCircleFront />
                    <WellnessFlex>
                        <MeasureTitle>웰니스 지수</MeasureTitle>
                        <WellnessMeasure>{userInfo.score.wellness}</WellnessMeasure>
                    </WellnessFlex>
                </WellnessCircle>
            </MeasurementIndexContainer>


            <ChartContainer>
                <ChartWrapper>
                    <ReactApexChart options={chartOptions} series={chartOptions.series} type="line" height={350} />
                </ChartWrapper>
                <ChartWrapper>
                    <ReactApexChart options={stackedChartOptions} series={stackedChartOptions.series} type="bar" height={350} />
                </ChartWrapper>
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
            case '양호':
                return '#3CB371';
            case '주의':
                return '#FFA500';
            case '위험':
                return '#FF6347';
            case '미측정':
                return '#A9A9A9';
            default:
                return '#FFFFFF';
        }
    }};
`

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

const ChartContainer = styled.div`
    margin-top: 100px;
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 30px
`;
const ChartWrapper = styled.div`
    flex: 1;
`;
