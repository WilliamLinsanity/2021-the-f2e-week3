import styled from "@emotion/styled";
import { useImperativeHandle, useState } from 'react'
import { Link } from "react-router-dom";
import arrow from '../assets/images/arrow.png'
import keyboard from '../assets/images/keyboard.png'
import menu from '../assets/images/menu.png'
import toMap from '../assets/images/toMap.png'

const Container = styled.div`
background-color: #61A68A;
height: 55px;
display: flex;
align-items: center;
justify-content: space-between;
padding:16px 16px;
position: fixed;
z-index:10;
top: 0;
width: 100%;

    &.relative-header{
        position: relative;
    }

`
const LeftArrow = styled.div``

const Description = styled.div`
color: #FFFFFF;
font-size: 20px;
`

const RightArrow = styled.div``

const Header = (props) =>{
    const {type, text, selectedCounty, routeUID, routeName, router, searchText, handleSearch} = props
   
    return(
        <Container className={type === 'map'? 'relative-header':''}>
            <LeftArrow>
                <Link to={router}>
                    <img src={arrow} alt="arrow"/>
                </Link>
            </LeftArrow>
            {
                type === 'map' && 
                <Description>{text}</Description>               
            }
            {
                type ==='input' &&
                <input className="search-input" placeholder="公車查詢" defaultValue={searchText} onChange={(e) =>handleSearch(e.target.value)}/>
            }
            
            <RightArrow>                               
                { 
                    type === 'input' ?                                
                    <img src={keyboard} alt="keyword"/>
                     : 
                     (
                         type === 'searchResult'? 
                         <div className="icon-list">                            
                            <Link to={`/stop/map/${selectedCounty}/${routeUID}/${routeName}`}>
                                <img src={toMap} alt="Map marker"/>
                            </Link>
                            <img src={menu} alt="menu"/>
                         </div>
                         : <img src={menu} alt="menu"/>
                     )                                      
                }
            </RightArrow>            
        </Container>
    )
}

export default Header;