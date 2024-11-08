import React, {useEffect, useState} from 'react'
import styled from 'styled-components'
import { FiTable } from "react-icons/fi"
import { PiUserCircleGear } from "react-icons/pi";
import { Link, useLocation } from 'react-router-dom';


const SideNav = () => {

    const [activeMenu, setActiveMenu] = useState<number | null>(null)
    const locaiton = useLocation()
 
    useEffect(() => {
        switch (locaiton.pathname) {
            case '/member' :
                setActiveMenu(0);
                break;
            case '/admin':
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
            position={activeMenu === 133? 133 : activeMenu === 1 ? 203 : 133}
          >
          </MenuItem>
          <IconContainer>
            <IconButton>
                <Link to = "/member">
                    <FiTable />
                </Link>
            </IconButton>
            <IconButton>
                <Link to = "/admin">
                    <PiUserCircleGear />
                </Link>
            </IconButton>
          </IconContainer>
        </SideNavContainer>
      )
}

export default SideNav

const SideNavContainer = styled.div`
    width : 80px;
    height :95.5%;
    background-color : #364954;
    margin-left : 15px;
    margin-top : 15px;
    border-top-left-radius : 15px;
    display: flex;
    justify-content: center;
`
const MenuItem = styled.div<{ isActive: boolean; position: number }>`
    width: 55px;
    height: 55px;
    background-color: #667a86;
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