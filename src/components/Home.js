import styled from "@emotion/styled";
import bikeMark from "../assets/images/bikeMark.png";
import mapMark from "../assets/images/mapMark.png";
import constants from '../constants'
import { useNavigate, Link  } from "react-router-dom";

const Container = styled.div`
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
width: 100%;
height: 100vh;
`

const HomeBg = styled.div``

const Logo = styled.div`
padding-top: 82px;
padding-bottom: 55px;
`

const ChooseContainer = styled.div`
display:flex;
justify-content: center;
margin: 10px 0 24px 0;
`

const ChooseButton = styled.div`
background-color: #F8F8F8;
box-shadow: 0px 2px 1px 1px rgba(0, 0, 0, 0.15);
border-radius: 4px;
padding: 8px 40px;
display: flex;
justify-content: center;
align-items: center;
flex-wrap: nowrap;
cursor: pointer;
    
    &:first-of-type{
        margin-right:5px;
    }

    &:last-child{
        margin-left:5px;
    }

    .choose-btn{
        display: flex;
        align-items: center;
    }
`

const SearchBlock = styled.div``

const SearchTitle = styled.div`
font-size: 16px;
margin-bottom: 6px;
text-align: center;
width: 100%;
padding-left: 15px;
`

const RoutesList = styled.div`
display: flex;
flex-wrap: wrap;
justify-content: center;
padding: 0 15px;
`

const Home = ()=>{
    const routesList = constants.routesList
    const navigate  = useNavigate();

    return (
        <Container>
            <Logo>
                <div className="logo"/>
            </Logo>
            <div className="home-title">台灣搭公車</div>
            <HomeBg className="home"/>
            <ChooseContainer>
                <ChooseButton>
                    <Link className="choose-btn" to={`/bus`}>
                        <img src={mapMark} alt="stop"/>附近站牌
                    </Link>
                </ChooseButton>
                <ChooseButton>
                    <Link className="choose-btn" to={`/bus`}>
                        <img src={bikeMark} alt="bike"/>附近單車
                    </Link>
                </ChooseButton>
            </ChooseContainer>
            <SearchBlock>
                <SearchTitle>查詢公車</SearchTitle>
                <RoutesList>
                    {
                        routesList && routesList.map(item=>(
                            <Link className="route-item" to={`/search/${item.value}`}>
                                {item.label}
                            </Link>
                        ))
                    }
                </RoutesList>
            </SearchBlock>
        </Container>
    )
}
export default Home;