import jsSHA from 'jssha';
import L from "leaflet";

const constant = {
  ptxURL: 'https://ptx.transportdata.tw/MOTC/v2/Bus',
  ptxBicycleURL: 'https://ptx.transportdata.tw/MOTC/v2/Bike',
  ptxAuthorityURL: 'https://ptx.transportdata.tw/MOTC/v2/Basic/Authority',
  getAuthorizationHeader:() =>{
    const AppID = '675dad84079841b3a881006714b3d91e'
    const AppKey= 'D0MV31l-dasLMnv5qe9Ly56Rm6Y'        
    let GMTString = new Date().toGMTString();
    let ShaObj = new jsSHA('SHA-1', 'TEXT');
    ShaObj.setHMACKey(AppKey, 'TEXT');
    ShaObj.update('x-date: ' + GMTString);
    let HMAC = ShaObj.getHMAC('B64');
    let Authorization = 'hmac username="' + AppID + '", algorithm="hmac-sha1", headers="x-date", signature="' + HMAC + '"';
    return { 'Authorization': Authorization, 'X-Date': GMTString }; 
  },
   stationIcon : L.divIcon({
    className: 'map-marker',
    iconSize:null,
    html:'<div class="stationIcon"></div>'
  }),
  userIcon : L.divIcon({
    className: 'map-marker',
    iconSize:null,
    html:'<div class="userIcon"></div>'
  }),
  bikeIcon : L.divIcon({
    className: 'map-marker',
    iconSize:null,
    html:'<div class="bikeIcon"></div>'
  }),
  emptyPositionIcon : L.divIcon({
    className: 'map-marker',
    iconSize:null,
    number: 1,
    html:`<div class="emptyIcon"></div>`
  }),
  getMinute : ({stopStatus, estimatedSeconds}) =>{
    if (stopStatus === 4)
      return <span className="estimated_time off">未營運</span>;
    if (stopStatus === 3)
      return <span className="estimated_time off">末班已過</span>;
    if (stopStatus === 2)
      return <span className="estimated_time off">交管不停</span>;
    if (stopStatus === 1 || stopStatus === undefined)
      return <span className="estimated_time off">未發車</span>;
    if (estimatedSeconds < 120)
      return <span className="estimated_time approaching">進站中</span>;
    return (
      <span className="estimated_time">
        <span className="minute">{Math.floor(estimatedSeconds / 60)}</span>
        &nbsp;分
      </span>
    );
  },
  countyList : [
    {label:'台北市',value:'Taipei'},
    {label:'新北市',value:'NewTaipei'},
    {label:'桃園市',value:'Taoyuan'},
    {label:'苗栗縣',value:'MiaoliCounty'},
    {label:'新竹市',value:'Hsinchu'},
    {label:'台中市',value:'Taichung'},
    {label:'臺南市',value:'Tainan'},
    {label:'嘉義市',value:'Chiayi'},
    {label:'高雄市',value:'Kaohsiung'},
    {label:'屏東縣',value:'PingtungCounty'},
    {label:'金門縣',value:'KinmenCounty'},
  ],
  routesList:[
    {label:'雙北',value:'taipei'},
    {label:'桃園市',value:'taoyuan'},
    {label:'台中市',value:'taichung'},
    {label:'台南市',value:'tainan'},
    {label:'高雄市',value:'kaohsiung'},
    {label:'公路客運',value:'highWayBus'},
    {label:'其他',value:'other'},
    {label:'已存路線',value:'savedRoad'},
  ]

}


export default constant;