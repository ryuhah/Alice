import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { IoIosArrowBack, IoIosArrowForward, IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from "react-icons/md";
import instance from '../../../axios';
import { FileList } from './types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    id: number;
    loginId: string;
    name: string;
    phoneNumber: string;
  };
}

const MemberModal: React.FC<ModalProps> = ({ isOpen, onClose, user }) => {

  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<FileList[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const itemsPerPage = 10;
  const maxVisiblePages = 10;
  const totalPages = Math.ceil(fileList.length / itemsPerPage);
  const currentItems = fileList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (isOpen) {
      setFileList([]); // Clear file list when the modal opens
      setCurrentPage(1); // Optionally reset the page to the first
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getS3List = async (filePath: string) => {
    try {
      setLoading(true);
      const response = await instance.get(`/aws/s3/pre-signed-list/${filePath}`);
      const data = await response.data;
      setFileList(data)
    } catch (error) {
      console.error('Error fetching presigned URL:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }

  const getPresignedUrl = async (fileName: string) => {
    try {
      const response = await instance.get(`/aws/s3/pre-signed-get/${fileName}`);
      const data = await response.data.preSignedUrl;
      return data;
    } catch (error) {
      console.error('Error fetching presigned URL:', error);
      return null;
    } finally {
    }
  };

  const handleDownload = async (fileName: string) => {
    const url = await getPresignedUrl(fileName); //파일 다운로드 URL

    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName; // 파일 이름
      link.click(); // 자동으로 다운로드 실행
    }
  };

  const handleGetList = async (filePath: string) => {
    await getS3List(filePath)
  }

  const handleSort = (key: keyof FileList) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    // 파일 목록 정렬
    const sortedList = [...fileList].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFileList(sortedList); // 정렬된 파일 목록 업데이트
  };

  const renderSortIcon = (key: keyof FileList) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? (
        <IoIosArrowUp style={{ color: '#000' }} />
      ) : (
        <IoIosArrowDown style={{ color: '#000' }} />
      );
    }
    // 비활성 상태 기본 화살표
    return <IoIosArrowUp style={{ color: '#ccc' }} />;
  };

  const handleDownloadSurvey = async () => {
    try {
      // 설문 데이터 API 호출
      const response = await instance.get(`/bio/admin/members/info/survey/${user?.id}`);
      const surveyData = response.data;

      if (surveyData.surveyResults.length === 0) {
        alert('다운로드할 설문응답 데이터가 없습니다.');
        return;
      }

      // 한글 갈망 상황을 숫자로 매핑 (한글 -> 번호)
      const situationToNumber: { [key: string]: number } = {
        "인간 관계 스트레스 (가족/연인 등)": 1,
        "업무 스트레스": 2,
        "약물관련 미디어 시청": 3,
        "불면 및 불규칙한 일상": 4,
        "음주 및 유흥업소 방문 (클럽/라운지 등)": 5,
        "성충동": 6,
        "집중도 향상을 위한 상황": 7,
        "감정조절의 어려움": 8,
        "지인과 약물관련 대화(말뽕)": 9,
        "날씨변화": 10,
        "신체적 피로감, 통증": 11,
        "지인의 재발": 12,
        "무료함, 지루함": 13,
        "법적 스트레스": 14,
        "기타 (직접입력)": 15,
      };

      // 첫 번째 설문 결과 가져오기
      const firstResult = surveyData.surveyResults[0];
      const firstDegree = firstResult?.degree || "N/A"; // 갈망 정도
      const firstSituation = firstResult?.situation || "기타"; // 갈망 상황 (한글)

      // 한글 갈망 상황을 숫자로 변환
      const firstSituationNumber = situationToNumber[firstSituation] || 0;

      // 설문 데이터를 CSV로 변환
      const csvContent = [
        ['번호', '갈망 정도', '갈망상황 번호', '갈망 상황', '설문 시간'], // 헤더
        ...surveyData.surveyResults.map((result: any, index: number) => [
          index + 1,
          result.degree,
          situationToNumber[result.situation],
          result.situation,
          result.surveyTs,
        ]),
      ]
        .map((row) => row.join(',')) // 각 행을 ','로 구분
        .join('\n'); // 줄바꿈 처리

      // 파일 이름 생성
      const timestamp = new Date().toISOString(); // 현재 날짜와 시간
      const [date, time] = timestamp.split('T');
      const formattedDate = date.replace(/-/g, ''); // YYYYMMDD 형식
      const [hour, minute] = time.split(':');
      const fileName = `${user?.loginId}_${user?.name}_${formattedDate}_${parseInt(hour, 10)}시${minute}분_${firstDegree}_${firstSituationNumber}.csv`;

      // 다운로드 실행
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    } catch (error) {
      console.error('파일 다운로드 중 오류 발생:', error);
    }
  };

  // pagination
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
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


  return (
    <ModalOverlay>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <h2>Raw Data 목록</h2>
        {user ? (
          <UserContainer>
            <div ><strong>ID:</strong> {user.loginId}</div>
            <div><strong>이름:</strong> {user.name}</div>
            <div><strong>휴대폰:</strong> {user.phoneNumber}</div>
            <Button onClick={() => handleGetList(`${user?.name}(${user?.loginId})`)}>
              {loading ? 'Loading...' : 'Get RawData list'}
            </Button>
            <Button onClick={handleDownloadSurvey}>설문응답 download</Button>
          </UserContainer>
        ) : (
          <p>데이터를 불러오는 중입니다...</p>
        )}
        <TableHeader>
          <div style={{ width: "10%" }}>No.</div>
          <div style={{ width: "10%" }}>ID</div>
          <div style={{ width: "10%" }}>이름</div>
          <div
            style={{ width: "20%", cursor: "pointer" }}
            onClick={() => handleSort('date')}
          >
            업로드일 {renderSortIcon('date')}
          </div>
          <div
            style={{ width: "10%", cursor: "pointer" }}
            onClick={() => handleSort('size')}
          >
            용량 {renderSortIcon('size')}
          </div>
          <div
            style={{ width: "40%", cursor: "pointer" }}
            onClick={() => handleSort('fileName')}
          >
            파일명 {renderSortIcon('fileName')}
          </div>
        </TableHeader>
        <hr />
        <TableBody>
          {currentItems.map((item, index) => {
            return (
              <TableRow key={index}>
                <div style={{ width: "10%" }}>{(index + 1) % 10 !== 0 ? (currentPage - 1).toString() + (index + 1) : (index + 1) * currentPage}</div>
                <div style={{ width: "10%" }}>{item.loginId}</div>
                <div style={{ width: "10%" }}>{item.name}</div>
                <div style={{ width: "20%" }}>{item.date}</div>
                <div style={{ width: "10%" }}>{item.size}</div>
                <div style={{ width: "40%", cursor: "pointer" }} onClick={() => handleDownload(item.fileName)}>{item.fileName}</div>
              </TableRow>
            )
          })}
        </TableBody>
        <Pagination>
          <Pagination>
            {/* 10 페이지 뒤로 버튼 */}
            <PageBtn onClick={handleJumpBackward} disabled={currentPage <= 10}>
              <MdKeyboardDoubleArrowLeft />
            </PageBtn>

            {/* 이전 페이지 버튼 */}
            <PageBtn onClick={handlePrevPage} disabled={currentPage === 1}>
              <IoIosArrowBack />
            </PageBtn>

            {/* 숫자 버튼 (동적 범위) */}
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

            {/* 다음 페이지 버튼 */}
            <PageBtn
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <IoIosArrowForward />
            </PageBtn>

            {/* 10 페이지 앞으로 버튼 */}
            <PageBtn
              onClick={handleJumpForward}
              disabled={currentPage > totalPages - 10}
            >
              <MdKeyboardDoubleArrowRight />
            </PageBtn>
          </Pagination>
        </Pagination>
        <CloseButton onClick={onClose}>닫기</CloseButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default MemberModal;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  width: 900px;
`;

const UserContainer = styled.div`
  display : flex;
  justify-content : center;
  align-items : center;
  gap : 20px;  
`

const TableHeader = styled.div`
    display : flex;
    justify-content : space-between;
    text-align : center;
    font-weight : bold;
    padding : 10px 0;
    margin-top : 10px;
    font-size : 14px;
`

const TableBody = styled.div`
    height : 68%;
`

const TableRow = styled.div`
    display : flex;
    justify-content : space-between;
    text-align : center;
    padding : 8px 0;
    font-size : 14px;
`

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  background-color: #364954;
  color: white;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #4b5b6e;
  }
`;

const Pagination = styled.div`
    bottom : 7%;
    display : flex;
    justify-content : center;
    margin-top: 10px;
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

const CloseButton = styled.button`
    margin-top : 20px;
    padding: 10px;
    border: none;
    background-color: #364954;
    color: white;
    border-radius: 5px;
    cursor: pointer;
    align-self: flex-start;

    &:hover {
        background-color: #4b5b6e;
    }
`
