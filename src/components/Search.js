import styled from "@emotion/styled";
import React,{ useState, useEffect } from "react";
import constants from '../constants';
import Header from './Header';
import { Link, useParams } from "react-router-dom";

const SelectBlock = styled.div`
flex: 0 1 auto;
width:30%;

    div{
        width: 100%;
        margin-right: 12px;
    }
`

const RouteList =styled.div`
display: flex;
flex-wrap: wrap;
align-content: flex-start;
height: 100vh;
overflow-y: auto;
position: relative;
top: 55px;
max-height: calc(100vh - 70px);
`

const StopName = styled.div`
display: flex;
padding-top: 1px;
font-size: 14px;
`

const Search =()=>{
    const {selectedCounty} = useParams()
    const {ptxURL, getAuthorizationHeader} = constants  
    let [routesList, getRoutesList] = useState([])
    let [searchResultList, setSearchResult] = useState([])
    const type = 'input'
    const text = '附近的公共單車'
    let searchText = ''
    let list =[]

    useEffect(() => {
        fetch(`${ptxURL}/Route/City/${selectedCounty}?$top=400&$format=JSON`,
        {
            headers: getAuthorizationHeader()
        }).then(res=>res.json())
        .then( (response) => {      
            getRoutesList(response)
            setSearchResult(response)
        })
        .catch( (error) => {
            console.log(error);
        });
       
    }, [selectedCounty, getAuthorizationHeader, ptxURL]);
 
    const handleSearch =(value) =>{
        list = []

        if(value){
            routesList.forEach(item=>{
                if(item.RouteName.Zh_tw.indexOf(value) >= 0){
                    list.push(item)
                }
            })
            setSearchResult(list)
        }else{
            setSearchResult(routesList)
        }
    }
    return(
        <>
            <Header type={type} text={text} router="/" searchText={searchText} handleSearch={handleSearch}/>       
            <RouteList>
                {
                    searchResultList && searchResultList.length >= 1 &&
                    searchResultList.map(item=>(
                        <Link className="stop-item" to={`/stop/${selectedCounty}/${item.RouteUID}/${item.RouteName.Zh_tw}`}
                            key={item.RouteUID}>
                            <div className="name">{item.RouteName.Zh_tw}</div>
                            <StopName key={item.RouteUID}>
                                <div className="stop-name">{item.DepartureStopNameZh}</div>
                                <div className="dash">-</div>
                                <div className="stop-name"> {item.DestinationStopNameZh}</div>
                            </StopName>
                        </Link>
                    ))
                }
            </RouteList>
        </>
    )
}

export default Search;