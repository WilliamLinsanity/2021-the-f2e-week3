import constants from '../constants';
import React,{ useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import styled from '@emotion/styled';
import Header from './Header';
import Wkt from 'wicket'
import L from "leaflet";
import { TileLayer, MapContainer, Marker, Popup } from 'react-leaflet'

const Container = styled.div`
display: flex;
flex-direction: column;
width: 100%;
position: relative;
max-height: calc(100vh - 95px);
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

const StopMap = ()=>{
    const {selectedCounty, routeUID} =useParams()
    const {ptxURL, emptyPositionIcon, getAuthorizationHeader} = constants
    const [currentLocation, setCurrentLocation] = useState([25.04270187676874, 121.54349674470315])
    const [departureList, getDepartureStopsList] = useState([])
    const [returnList, getReturnStopsList] = useState([])
    const [isReturnListShow, handleReturnListShow] = useState(false)
    const [busShape,getBusShape] = useState([])
    const [markers, setMarkers] = useState(null);
    const mapRef = useRef('')
    const popupRef = useRef('')
    const top = 100
    const zoom = 15

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
             //指定縣市和公車的路線圖
            fetch(`${ptxURL}/Shape/City/${selectedCounty}?$filter=RouteUID%20eq%20'${routeUID}'&$top=${top}&$format=JSON`,
            {
               headers: getAuthorizationHeader()
            }).then(res=>res.json())
            .then(function (response) {
                getBusShape(response)          
            })
            .catch(function (error) {
                console.log(error);
            });       
      }, [selectedCounty]);

      // 畫路線圖
      useEffect(() => {
        const wkt = new Wkt.Wkt();
        if(busShape && busShape.length){
            wkt.read(busShape[0].Geometry)
            wkt.write();           
            // 依照第一個點去做地圖的中心點
            setCurrentLocation([wkt.toJson().coordinates[0][1],wkt.toJson().coordinates[0][0]])
            setMarkers( wkt.toJson().coordinates.map((item, index)=>( 
              <Marker position={[item[1],item[0]]} icon={emptyPositionIcon}  key={index}>
                 <Popup ref={popupRef}>
                       <div className="station-name">{item.StationName.Zh_tw}</div>
                   </Popup>
              </Marker>
                           
            )))
            const feature = { "type": "Feature", 'properties': {}, "geometry": wkt.toJson()  };
            L.geoJSON(feature).addTo(mapRef.current);
        }
    }, [busShape]);

     //移至目標位置
     useEffect(() => {
      if(mapRef && mapRef.current ){
          mapRef.current.flyTo(currentLocation, 14) 
      }
  }, [currentLocation]);

    return(
        <div>
            <Header type="searchResult"/>
            <Container>
                <Direction>
                    <DirectionItem className={`${isReturnListShow? 'active': ''}`} onClick={()=>handleReturnListShow(true)}>{departureList.length? `往${departureList[departureList.length -1].stopName}` : '沒有去程'}</DirectionItem>
                    <DirectionItem className={`${!isReturnListShow? 'active': ''}`} onClick={()=>handleReturnListShow(false)}>{returnList.length? `往${returnList[returnList.length -1]?.stopName}` : '沒有回程'}</DirectionItem>
                </Direction>
                <MapContainer className="map markercluster-map" ref={mapRef} useFlyTo={true} zoom={zoom} center={currentLocation} 
                scrollWheelZoom whenCreated={mapInstance => { mapRef.current = mapInstance }}
                >
                  <TileLayer
                      attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />               
                    {markers}
                </MapContainer>
            </Container>
        </div>
    )
}
export default StopMap;