import React,{ useState, useEffect, useRef } from "react";
import styled from "@emotion/styled";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { TileLayer, MapContainer, Marker } from 'react-leaflet'
import constants from '../constants';
import Header from "./Header";

const BusesInfo = styled.div`
display:flex;
flex-direction: column;
`

const MapBlock = styled.div`
flex: 1;
height: 100vh;
`

const StopList = styled.div`
background-color: #FFFFFF;
position: absolute;
bottom: 0;
width: 100%;
z-index: 10000;
`

const Bus= () =>{
    const {ptxURL, ptxAuthorityURL,stationIcon, userIcon, getAuthorizationHeader, getMinute} = constants
    const [currentLocation, setCurrentLocation] = useState([25.04270187676874, 121.54349674470315])
    const [nearStations, getNearStations] = useState([])
    const [stopOfRouteList,setStopOfRouteList] = useState({})
    const [stopName, setStopName] =useState('')
    const [popupList, setPopupList] = useState([])
    const [departureInfo, getDepartureInfo] = useState([])
    const [returnInfo, getReturnStopsInfo] = useState([])
    const [zoom, setZoom] = useState(13)
    const [nowCounty,setNowCounty] =useState('')
    let [markers, setMarkers] = useState(null);
    const mapRef = useRef('') 
    const top = 30

        // 定位
        useEffect(() => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position =>{
                    setCurrentLocation([position.coords.latitude, position.coords.longitude])
                }) 
            }            
        }, []);

        useEffect(() => {
            if(mapRef.current){                
                const map =  mapRef.current.setView(
                    currentLocation,
                    zoom
                );
                const userMarker = L.marker(currentLocation, {
                    icon: userIcon,
                });
                mapRef.current.addLayer(userMarker);   
                map.on('zoomend',function(e){
                    const currZoom = map.getZoom();
                    setZoom(currZoom)
                });                                 
            }        
        }, [currentLocation,zoom,userIcon]); 

    // 取得目前位置附近的站點資訊
    useEffect(() => {
        fetch(`${ptxURL}/Station/NearBy?$top=${top}&$spatialFilter=nearby(${currentLocation},1000)&$format=JSON`,
        {
            headers: getAuthorizationHeader()
        }).then(res=>res.json())
        .then( (response) => {
            getNearStations(response)
        })
        .catch( (error) => {
            console.log(error);
        });

    }, [ptxURL, currentLocation, getAuthorizationHeader]);


    // 把指定路線的站點資料marker到地圖上
    useEffect(() => {
        //把取得的站點資訊放入popup中  
       if(nearStations && nearStations.length){
           setMarkers(nearStations.map(item=>(
               <Marker position={[item.StationPosition.PositionLat,item.StationPosition.PositionLon]} icon={stationIcon}  key={item.StopUID}
               eventHandlers={{
                click: () => {
                    setStopName(item.StationName.Zh_tw)
                    handleSearchRoute(item.Stops)
                },
              }}>                   
               </Marker>
           )))  
        }
    }, [nearStations, stationIcon, nowCounty]);  

    useEffect(() => {
        if(nearStations && nearStations.length){
            const splitString = nearStations[0].StationUID.replace(/[0-9]/g, '');           
            fetch(`${ptxAuthorityURL}?$filter=AuthorityCode%20eq%20'${splitString}'&$top=30&$format=JSON`,
            {
                headers: getAuthorizationHeader()
            }).then(res=>res.json())
            .then( (response) => {
                const county = constants.countyList.find(item=>item.label === response[0].AuthorityName.Zh_tw.slice(0, 3)).value
                setNowCounty(county)
            })
            .catch( (error) => {
                console.log(error);
            });
        }
   }, [ptxAuthorityURL, nearStations, getAuthorizationHeader]); 
   const  handleSearchRoute = (stops)=>{
       stops.forEach(item=>{
        searchStopOfRouteUrl(item.RouteUID)                
       })
   }
   useEffect(() => {
    const {stops, routeUID} = stopOfRouteList

    fetch(`${ptxURL}/EstimatedTimeOfArrival/City/${nowCounty}?$filter=RouteUID%20eq%20'${routeUID}'&$format=JSON`,
    { headers: getAuthorizationHeader() }
    ).then(res=>res.json())
    .then( (response) => {   
        if(stops && stops.length){
            // 去程資訊
            getDepartureInfo(stops[0].Stops.map((stop) => {
                const { PlateNumb, EstimateTime, StopStatus } =
                response.find(
                    (item) =>{
                        return item.StopUID === stop.StopUID
                    }) ?? {};
                
                return {
                    destinationName: `往${stops[0].Stops[stops[0].Stops.length - 1].StopName.Zh_tw}`,
                    routeName: stops[0].RouteName.Zh_tw,
                    stopUID: stop.StopUID,
                    stopName: stop.StopName.Zh_tw,
                    stopStatus: StopStatus,
                    plateNumb: PlateNumb,
                    estimatedSeconds: EstimateTime,
                };
            }))
            //回程資訊
            getReturnStopsInfo(stops[1].Stops.map((stop) => {
                const { PlateNumb, EstimateTime, StopStatus } =
                response.find(
                    (item) =>{
                        return item.StopUID === stop.StopUID
                    }) ?? {};
                
                return {
                    destinationName: `往${stops[0].Stops[stops[0].Stops.length - 1].StopName.Zh_tw}`,
                    routeName: stops[0].RouteName.Zh_tw,
                    stopUID: stop.StopUID,
                    stopName: stop.StopName.Zh_tw,
                    stopStatus: StopStatus,
                    plateNumb: PlateNumb,
                    estimatedSeconds: EstimateTime,
                };
            }))
        }         
    })
    .catch( (error) => {
        console.log(error);
    }); 
   }, [getAuthorizationHeader,ptxURL,stopOfRouteList, nowCounty]);
   
   useEffect(() => {
       if(departureInfo && departureInfo.length){
           setPopupList(departureInfo.filter(item=>item.stopName === stopName))
       }
   }, [departureInfo, stopName]);

   useEffect(() => {
        if(returnInfo && returnInfo.length){
            setPopupList(returnInfo.filter(item=>item.stopName === stopName))
        }
   }, [returnInfo, stopName]);

     function searchStopOfRouteUrl(routeUID){        
        fetch(`${ptxURL}/StopOfRoute/City/${nowCounty}?$filter=RouteUID%20eq%20'${routeUID}'&$top=30&$format=JSON`,
        { headers: getAuthorizationHeader() }
        ).then(res=>res.json())
        .then( (response) => {
            setStopOfRouteList({stops: response, routeUID: response[0].RouteUID})           
        })
        .catch( (error) => {
            console.log(error);
        });          
    }
    return(
        <BusesInfo>
            <Header type="map" text="附近的公車站" router="/"/>
            <MapBlock>
                <MapContainer className="map markercluster-map" ref={mapRef} useFlyTo={true} zoom={zoom} center={currentLocation} 
                scrollWheelZoom whenCreated={mapInstance => { mapRef.current = mapInstance }}>
                    <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {markers}  
                    <StopList>
                        {
                            popupList && popupList.map(item =>(
                                <div className="popup-container" key={item.stopUID}>
                                    <div className="popup-title">{item.stopName}</div>
                                    <div className="popup-wrapper">
                                        {getMinute(item)}
                                        <div>{item.routeName}</div>
                                        <div className="dash">-</div>
                                    <div className="destination-name">{item.destinationName}</div>
                                    </div>
                                </div>
                            ))
                        }
                    </StopList>
                </MapContainer>
            </MapBlock>
        </BusesInfo>
    )
}
export default Bus;