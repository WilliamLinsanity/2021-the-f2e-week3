import constants from '../constants';
import React,{ useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import styled from '@emotion/styled';
import Header from './Header';

const Container = styled.div`
display: flex;
flex-direction: column;
width: 100%;
position: relative;
top: 95px;
max-height: calc(100vh - 120px);
`

const UpdatedTime = styled.div`
display: flex;
padding: 4px 15px 0 0;
justify-content:flex-end;
position: relative;
font-size: 14px;
color: #666666;
`

const StopItem = styled.div`
padding: 12px 15px;
font-size:16px;
text-align: left;

    &:after{
        content:'';
        display: block;
        border-bottom: 1px solid #CCCCCC;
    }
    &:first-of-type{
        padding: 4px 15px 12px 15px;
    }
`

const StopElement = styled.div`
display: flex;
padding-bottom: 12px;
`

const StopContainer = styled.div`
position: relative;
overflow: auto;
top: 25px;
`

const Direction = styled.div`
display: flex;
background-color: #438C6F;
color: #FFFFFF;
padding: 8px 50px;
font-size: 14px;
position: fixed;
top: 55px;
width: 100%;
z-index: 10;
`

const DirectionItem = styled.div`
width: 50%;
display: flex;
justify-content: center;
cursor: pointer;
color: #CCCCCC;

    &.active{
        color: #FFFFFF;
    }
`

const Stop = ()=>{
    const {selectedCounty, routeUID} =useParams()
    const {ptxURL, getAuthorizationHeader, getMinute} = constants
    const [departureList, getDepartureStopsList] = useState([])
    const [returnList, getReturnStopsList] = useState([])
    const [isReturnListShow, handleReturnListShow] = useState(false)
    const [nextFetchSecs, setNextFetch] = useState(0)
    // const [estimatedTimesList, getEstimatedTimesList] = useState([]) 
    function getStopsStatus(direction,stops,estimatedTimes) {
        return stops
          .find(({ Direction }) => Direction === direction)
          ?.Stops.map((stop) => {
            const { PlateNumb, EstimateTime, StopStatus } =
              estimatedTimes.find(
                ({ Direction, StopUID }) =>
                  Direction === direction && StopUID === stop.StopUID
              ) ?? {};
            return {
              stopUID: stop.StopUID,
              stopName: stop.StopName.Zh_tw,
              stopStatus: StopStatus,
              plateNumb: PlateNumb,
              estimatedSeconds: EstimateTime,
            };
          })
          .filter(
            (stop, index, originalArray) =>
              index ===
              originalArray.findIndex(
                (stopDuplicate) => stop.stopUID === stopDuplicate.stopUID
              )
          );
    }
  
    const fetchData = useCallback(() => {
        const fetchingData = async () => {
          const [{value: estimatedTimesList}, {value: stopsList} ] = await Promise.allSettled([fetchEstimatedTimesList(), fetchStops() ]);
          getDepartureStopsList(getStopsStatus(0,stopsList,estimatedTimesList));
          getReturnStopsList(getStopsStatus(1,stopsList,estimatedTimesList));
          setNextFetch(0);
        };
        fetchingData();
      }, []);
      

      const fetchStops =async() =>{
        // 取得站位資料
        const response = await fetch(`${ptxURL}/StopOfRoute/City/${selectedCounty}?$filter=RouteUID%20eq%20'${routeUID}'&$format=JSON`
        , { headers: getAuthorizationHeader() });
        const data = await response.json();
        return data;        
    }

    const fetchEstimatedTimesList =async() =>{
         //取得各個站點預估到站資料
         const response = await fetch(`${ptxURL}/EstimatedTimeOfArrival/City/${selectedCounty}?$filter=RouteUID%20eq%20'${routeUID}'&$format=JSON`
        , { headers: getAuthorizationHeader() });
        const data = await response.json();
        return data;         
    }
    useEffect(() => {
        fetchData();
      }, [fetchData]);

      useEffect(() => {
        const fetchStopInterval = setInterval(fetchData, 60000);
        const countInterval = setInterval(() => {
            setNextFetch((second) => ++second);
          }, 1000)
        fetchData();
        return ()=>{
            clearInterval(fetchStopInterval);
            clearInterval(countInterval);
        }
      }, []);

    return(
        <div>
            <Header type="searchResult" selectedCounty={selectedCounty} routeUID={routeUID}/>
            <Container>
                <Direction>
                    <DirectionItem className={`${isReturnListShow? 'active': ''}`} onClick={()=>handleReturnListShow(true)}>{departureList.length? `往${departureList[departureList.length -1].stopName}` : '沒有去程'}</DirectionItem>
                    <DirectionItem className={`${!isReturnListShow? 'active': ''}`} onClick={()=>handleReturnListShow(false)}>{returnList.length? `往${returnList[returnList.length -1]?.stopName}` : '沒有回程'}</DirectionItem>
                </Direction>
                <UpdatedTime>{nextFetchSecs}秒前更新</UpdatedTime>
                <StopContainer>
                    {
                        isReturnListShow && departureList && departureList.length &&
                        departureList.map(item=>(
                                <StopItem key={item.StopUID}>
                                    <StopElement>
                                        <div>{getMinute(item)}</div>
                                        <div>{item.stopName}</div>
                                    </StopElement>
                                </StopItem>
                        ))
                    }
                </StopContainer>
                <StopContainer>
                    {
                        !isReturnListShow && returnList && returnList.length &&
                        returnList.map(item=>(
                            <StopItem key={item.StopUID}>
                                <StopElement>
                                    <div>{getMinute(item)}</div>
                                    <div>{item.stopName}</div>
                                 </StopElement>
                            </StopItem>
                        )) 
                    }
                </StopContainer>
            </Container>
        </div>
    )
}
export default Stop;