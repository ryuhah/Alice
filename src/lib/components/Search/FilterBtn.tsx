import React, { useState } from 'react'
import styled from 'styled-components';
import FilterModal from './FilterModal';

interface FilterBtnProps {
    selectedFilters: string[];
    setSelectedFilters: React.Dispatch<React.SetStateAction<string[]>>;
}

const FilterBtn:React.FC<FilterBtnProps> = ({ selectedFilters, setSelectedFilters })=> {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const applyFilters = (filters :string[]) => {
        setSelectedFilters(filters)
        closeModal()
    }

    const handleFilterClick = (filter : string) => {
        setSelectedFilters(prev =>
            prev.includes(filter) ? prev.filter(item => item !== filter) : [...prev, filter]
        )
    }

    const handleReset = () => {
        setSelectedFilters([])
    }

    return (
        <div>
            <Button 
                isSelected = {selectedFilters.length>0}
                onClick={openModal}
                >
                검색조건
            </Button>
            <FilterModal 
                isOpen={isModalOpen}
                selectedFilters={selectedFilters}
                onClose={closeModal}
                onApply={applyFilters}
                onFilterClick={handleFilterClick}
                onReset={handleReset}/>
        </div>
    )
}

export default FilterBtn

const Button = styled.button<{isSelected : boolean}>`
    height : 40px;
    padding : 0 15px;
    border-radius : 20px;
    font-size : 14px;
    color : ${({ isSelected }) => (isSelected ? 'white' : '#b4b4b4')};
    cursor : pointer;
    background-color: ${({ isSelected }) => (isSelected ? '#70BFC9' : 'transparent')};
    border-color : #70BFC9;
    border-style : ${({ isSelected }) => (isSelected ? 'none' : 'solid')};
` 