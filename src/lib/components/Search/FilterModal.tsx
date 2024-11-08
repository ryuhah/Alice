import React from 'react'
import styled from 'styled-components';
import { IoMdClose } from "react-icons/io";

interface FilterModalProps {
    isOpen : boolean;
    selectedFilters : string[];
    onClose : () => void;
    onApply : (filters : string[]) => void;
    onFilterClick : (filter : string) => void;
    onReset : () => void;
}

const FilterModal:React.FC<FilterModalProps> = ({isOpen, selectedFilters, onClose, onApply, onFilterClick, onReset}) => {
    if (!isOpen) return null

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <Title>검색조건</Title>
                    <CloseBtn onClick={onClose}>
                        <IoMdClose />
                    </CloseBtn>
                </ModalHeader>
                <hr/>
                <ModalBody>
                    <FilterSection>
                        {['아이디', '이름', '전화번호'].map(filter => (
                            <Filter
                                key = {filter}
                                onClick={() => onFilterClick(filter)}
                                isSelected = {selectedFilters.includes(filter)}
                                >
                                {filter}

                            </Filter>
                        ))}
                    </FilterSection>
                </ModalBody>
                <ModalFooter>
                    <ResetBtn onClick={onReset}>초기화</ResetBtn>
                    <ApplyBtn onClick={() =>onApply(selectedFilters)}>적용하기</ApplyBtn>
                </ModalFooter>
            </ModalContainer>
        </ModalOverlay>
    )
}

export default FilterModal

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.5);
    z-index :3;
`;

const ModalContainer = styled.div`
    margin-top : -300px;
    margin-left : 900px;
    background : white;
    border-radius : 20px;
    width : 380px;
    padding : 15px 20px;

`

const CloseBtn = styled.button`
    font-size : 20px;
    border-style : none;
    cursor : pointer;
    background-color : transparent;
`

const ModalHeader = styled.div`
    display : flex;
    justify-content : space-between;
    align-items : center;   
`

const Title = styled.p`
    font-size : 20px;
    font-weight : bold;
`

const ModalBody = styled.div`
`

const FilterSection = styled.div`
    margin-top : 30px;
    display : flex;
    align-items : center;
    gap: 10;
`

const Filter = styled.button<{isSelected : boolean}>`
    padding : 5px 10px;
    border-radius : 20px;
    margin: 0 5px;
    font-size : 14px;
    color:  ${({ isSelected }) => (isSelected ? '#000000' : '#B4B4B4')};
    cursor: pointer;
    background-color: transparent;
    border-color: ${({ isSelected }) => (isSelected ? '#364954' : '#B4B4B4')};
    border-style: solid;
`

const ModalFooter = styled.div`
    margin-top : 50px;
    display : flex;
    justify-content : center;
    align-items : center;
    gap : 20px;
`

const ApplyButton = styled.button`
    padding : 10px 30px;
    border-radius : 10px;
    font-size : 14px;
    cursor : pointer;
    border-style : none; 
`

const ApplyBtn = styled(ApplyButton)`
    background-color : #364954;
    color : white;
`

const ResetBtn = styled(ApplyButton)`
    background-color : #D9D9D9;
    color : black;
` 