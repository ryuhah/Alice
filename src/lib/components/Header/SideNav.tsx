import React, {useEffect, useState} from 'react'
import styled, {css}from 'styled-components'
import { FiTable } from "react-icons/fi"
import { FaRegSmile } from "react-icons/fa";
import { Link, useLocation } from 'react-router-dom';


const SideNav = () => {

    const [activeMenu, setActiveMenu] = useState<number | null>(null)
    const locaiton = useLocation()
 
    useEffect(() => {
        switch (locaiton.pathname) {
            case '/member' :
                setActiveMenu(0);
                break;
            case '/information':
                setActiveMenu(1);
                break;
            default :
                setActiveMenu(0);
                break;
        }
    }, [locaiton])

    return (
        <SideNavContainer>
          <MenuItem
            isActive={activeMenu !== null}
            position={activeMenu === 158? 158 : activeMenu === 1 ? 228 : 158}
          >
          </MenuItem>
          <IconContainer>
            <IconButton>
                <Link to = "/member">
                    <FiTable />
                </Link>
            </IconButton>
            <IconButton>
                <Link to = "/information">
                    <FaRegSmile />
                </Link>
            </IconButton>
          </IconContainer>
        </SideNavContainer>
      )
}

export default SideNav

const SideNavContainer = styled.div`
    width : 90px;
    height :95.5%;
    background-color : #70BFC9;
    margin-left : 25px;
    margin-top : 20px;
    border-top-left-radius : 15px;
    display: flex;
    justify-content: center;
`
const MenuItem = styled.div<{ isActive: boolean; position: number }>`
    width: 55px;
    height: 55px;
    background-color: #82c7d0;
    border-radius: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: ${({ position }) => position}px;
    transition: top 0.3s ease;
  
`;

const IconContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top : 20px;
    height: 100%;
    gap: 15px; /* 아이콘 간격 */
`;

const IconButton = styled.div`
    width: 55px;
    height: 55px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 34px;
    color: white;
    z-index : 2;

    a {
        color : white;
        text-decoration : none;
    }
`;