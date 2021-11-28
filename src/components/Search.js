import Select from 'react-select';
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
height: 100vh;
overflow-y: scroll;
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
    const countyList = constants.countyList
    // const [selectedCounty, handleSelectCounty] = useState({label:'台北市',value:'Taipei'})
    const [routesList, getRoutesList] = useState([])
    const type = 'input'
    const text = '附近的公共單車'

    useEffect(() => {
        fetch(`${ptxURL}/Route/City/${selectedCounty}?$top=400&$format=JSON`,
        {
            headers: getAuthorizationHeader()
        }).then(res=>res.json())
        .then( (response) => {      
            getRoutesList(response)
        })
        .catch( (error) => {
            console.log(error);
        });
       
    }, [selectedCounty, getAuthorizationHeader, ptxURL]);

    return(
        <>
            <Header type={type} text={text}/>
            {/* <SelectBlock>
                <Select options={countyList}  onChange={e => handleSelectCounty({label: e.label, value: e.value})}/>                    
            </SelectBlock> */}
            <RouteList>
                {
                    routesList && routesList.length > 1 &&
                    routesList.map(item=>(
                        <Link className="stop-item" to={`/stop/${selectedCounty}/${item.RouteUID}`}
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