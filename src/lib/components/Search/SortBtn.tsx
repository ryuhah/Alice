import React, { useState } from 'react'
import styled from 'styled-components';
import { IoIosArrowUp } from "react-icons/io";
import { IoIosArrowDown } from "react-icons/io";


interface SortBtnProps {
    onSort : (order: 'asc' | 'desc') => void;
    label : string
}
const SortBtn: React.FC<SortBtnProps> = ({onSort, label}) => {
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

    const handleSort = () => {
        const newOrder = sortOrder === 'asc' ? 'desc' : 'asc'
        setSortOrder(newOrder)
        onSort(newOrder);
    }

    return (
        <SortBtnContainer onClick={handleSort}>
            {label}
            {sortOrder === 'asc' ? (
                <IoIosArrowUp style={{marginLeft: '5px'}}/>
            ) : (
                <IoIosArrowDown style={{marginLeft: '5px'}}/>
            )}
        </SortBtnContainer>
    )
}

export default SortBtn

const SortBtnContainer = styled.button`
    height : 40px;
    padding : 0 20px;
    border-radius : 20px;
    font-size : 18px;
    color : #245671;
    cursor : pointer;
    background-color: transparent;
    border-color : #70BFC9;
    border-style : solid; 
`