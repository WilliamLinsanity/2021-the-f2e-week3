import styled from "@emotion/styled";
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
`
const LeftArrow = styled.div``

const Description = styled.div`
color: #FFFFFF;
font-size: 20px;
`

const RightArrow = styled.div``

const Header = (props) =>{
    const {type,text, selectedCounty, routeUID} = props
    return(
        <Container>
            <LeftArrow>
                <Link to={`/`}>
                    <img src={arrow} alt="arrow"/>
                </Link>
            </LeftArrow>
            {
                type === 'input' && 
                <Description>{text}</Description>               
            }
            
            <RightArrow>                               
                { 
                    type === 'input' ?                                
                    <img src={keyboard} alt="keyword"/>
                     : 
                     (
                         type === 'searchResult'? 
                         <div className="icon-list">
                            <Link to={`/stop/map/${selectedCounty}/${routeUID}`}>
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