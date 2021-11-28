import constants from "../constants";
import React,{ useState, useEffect, useRef } from "react";
import { TileLayer, MapContainer, Marker, Popup } from 'react-leaflet'
import L from "leaflet";
import "leaflet.markercluster";
import MarkerClusterGroup from "react-leaflet-markercluster";
import 'react-leaflet-markercluster/dist/styles.min.css';
import Header from "./Header";

const Bicycle = () =>{
    const {ptxBicycleURL,ptxAuthorityURL, userIcon, getAuthorizationHeader, bikeIcon} =constants
    const [currentLocation, setCurrentLocation] = useState([51.505, -0.09])
    const [bikesInfoList, getBikesInfoList] = useState([])
    const [nowCounty,setNowCounty] =useState('')
    const [bikesAvailableList, getBikeAvailableList] = useState([])
    const [zoom, setZoom] = useState(13)
    let [markers, setMarkers] = useState(null);
    const statusList = [{code:0, status:'停止營運'},{code:1, status:'正常營運'},{code:2, status:'暫停營運'}]
    const mapRef = useRef('') 
    const popupRef = useRef('') 
    const bikesList = useRef([]) 
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

            // 取得所選縣市及關鍵字的自行車資訊
            fetch(`${ptxBicycleURL}/Station/NearBy?$spatialFilter=nearby(${currentLocation},1000)&$format=JSON`,
            {
            headers: getAuthorizationHeader()
            }).then(res=>res.json())
            .then(function (response) {
                getBikesInfoList(response)          
            })
            .catch(function (error) {
                console.log(error);
            });
             // 取得該站點的車數資訊(可歸還及可租借)
            fetch(`${ptxBicycleURL}/Availability/NearBy?$spatialFilter=nearby(${currentLocation},1000)&$format=JSON`,
            {
                headers: getAuthorizationHeader()
            }).then(res=>res.json())
            .then(function (response) {
                getBikeAvailableList(response)                             
            })
            .catch(function (error) {
                console.log(error);
            });    

        }, [currentLocation, getAuthorizationHeader, ptxBicycleURL, zoom, userIcon]);              

        useEffect(() => {
            if(bikesInfoList && bikesInfoList.length){
                const splitString = bikesInfoList[0].StationUID.replace(/[0-9]/g, '');           
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
       }, [ptxAuthorityURL, bikesInfoList, getAuthorizationHeader]);
        
        // 把站點的車數資訊放入state中供其他components使用
        useEffect(() => {
            const arr =[]
            bikesInfoList.forEach((item)=>{
                const idx = bikesAvailableList.findIndex((element)=>element.StationUID === item.StationUID)
               if(idx !== -1){
                 arr.push({...item,...bikesAvailableList[idx]})
               }
             })
             bikesList.current = arr
        }, [bikesInfoList, bikesAvailableList]);

       useEffect(() => {
              // 取得該站點的車數資訊(可歸還及可租借)
              if(nowCounty){
                  fetch(`${ptxBicycleURL}/Availability/${nowCounty}?$top=30&$format=JSON`,
                  {
                      headers: getAuthorizationHeader()
                  }).then(res=>res.json())
                  .then(function (response) {
                      getBikeAvailableList(response)                             
                  })
                  .catch(function (error) {
                      console.log(error);
                  });  
              }
       }, [ptxBicycleURL, getAuthorizationHeader,nowCounty]);

       const createClusterCustomIcon = function (cluster) {
        return L.divIcon({
          html: `<span>${cluster.getChildCount()}</span>`,
          className: 'marker-cluster-custom',
          iconSize: L.point(40, 40, true),
        });
      } 

      useEffect(() => {
        //把取得的站點資訊放入popup中  
       if(bikesList.current && bikesList.current.length){
           setMarkers(bikesList.current.map(item=>(
               <Marker position={[item.StationPosition.PositionLat,item.StationPosition.PositionLon]} icon={bikeIcon}  key={item.StationUID}>
                   <Popup ref={popupRef} className="bicycle-container">
                       <div className="station-name">{item.StationName.Zh_tw}</div>
                       <div className="station-address">{item.StationAddress.Zh_tw}</div>
                       <div className="station-updated-time">{item.UpdateTime.slice(0,-9).replace("T", " ")}</div>
                       <div className={'station-status' + (item.ServiceStatus === 2 ? "closed " : "") + (item.ServiceStatus === 0 ? 'stop ' : '')}>{statusList.find(element=>element.code === item.ServiceStatus).status}</div>
                       <div className="station-availability">
                           <div className="rent">
                               <div className="name">可借單車</div> 
                               <div className="number">{item.AvailableRentBikes}</div>
                           </div>
                           <div className="return">
                               <div className="name">可停空位</div>
                               <div className="number">{item.AvailableReturnBikes}</div>
                           </div>                                             
                       </div>
                   </Popup>
               </Marker>
           )))                 
       }
   }, [bikesList.current]);

    return(
        <>
            <Header type="map" text="附近的公共單車" router="/"/>
            <MapContainer className="map markercluster-map" ref={mapRef} useFlyTo={true} zoom={zoom} center={currentLocation} scrollWheelZoom whenCreated={mapInstance => { mapRef.current = mapInstance }}>
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon}>
                    {markers}    
                </MarkerClusterGroup>   
            </MapContainer>
        </>
    );
}
export default Bicycle;