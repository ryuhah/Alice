import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { IoIosArrowBack, IoIosArrowForward} from "react-icons/io";
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
  const itemsPerPage = 5;

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

  const currentItems = fileList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);
  const handleNextPage = () => currentPage < Math.ceil(fileList.length / itemsPerPage) && setCurrentPage(currentPage + 1);
  const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  return (
    <ModalOverlay>
      <ModalContent onClick={(e) => e.stopPropagation()}>
          <h2>Raw Data 목록</h2>
        {user ? (
          <UserContainer>
            <div><strong>ID:</strong> {user.loginId}</div>
            <div><strong>이름:</strong> {user.name}</div>
            <div><strong>휴대폰:</strong> {user.phoneNumber}</div>
            <Button onClick={() => handleGetList(`${user?.name}(${user?.loginId})`)}>
              {loading ? 'Loading...' : 'GET LIST'}
            </Button>
          </UserContainer>
        ) : (
          <p>데이터를 불러오는 중입니다...</p>
        )}
        <TableHeader>
          <div style={{ width: "10%" }}>No.</div>
          <div style={{ width: "10%" }}>ID</div>
          <div style={{ width: "10%" }}>이름</div>
          <div style={{ width: "20%" }}>업로드일</div>
          <div style={{ width: "10%" }}>용량</div>
          <div style={{ width: "40%" }}>파일명</div>
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
          <PageBtn
            onClick={handlePrevPage}
            disabled={currentPage === 1}>
            <IoIosArrowBack />
          </PageBtn>
          {Array.from({ length: Math.ceil(fileList.length / itemsPerPage) }).map((_, index) => (
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
            disabled={currentPage === Math.ceil(fileList.length / itemsPerPage)}>
            <IoIosArrowForward />
          </PageBtn>
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
  width: 800px;
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
