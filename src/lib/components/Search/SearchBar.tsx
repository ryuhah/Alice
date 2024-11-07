import React from 'react'
import styled from 'styled-components'
import { IoSearch } from "react-icons/io5";

interface SearchBarProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSearch: () => void;
}

const SearchBar:React.FC<SearchBarProps> = ({ value, onChange, onSearch }) => {
  return (
    <SearchContainer>
        <Input 
            type = 'text'
            placeholder='검색어를 입력해주세요'
            value={value}
            onChange={onChange}/>
        <SearchBtn onClick={onSearch}>
            <IoSearch />
        </SearchBtn>
    </SearchContainer>
  )
}

export default SearchBar

const SearchContainer = styled.div`
    width : 400px;
    height : 40px;
    display : flex;
    align-items : center;
    justify-content : space-between;
    background-color : #F1F1F1;
    border-radius : 20px;
    gap : 5px;
`

const Input = styled.input`
    font-size : 14px;
    border-style : none;
    margin-left : 20px;
    padding : 5px 0;
    background-color: transparent;
`

const SearchBtn = styled.button`
    width : 40px;
    height : 40px;
    margin-right : 10px;
    font-size : 20px;
    cursor : pointer;
    border-style : none;
    background-color: transparent;

`
 