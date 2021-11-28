import './App.scss';
import { Route } from 'react-router-dom';
import { Routes, HashRouter } from "react-router-dom";
import Bus from './components/Bus'
import Search from './components/Search';
import Home from './components/Home';
import Stop from './components/Stop';
import StopMap from './components/StopMap';
import Bicycle from './components/Bicycle';

function App() {
  return (
    <div className="App">
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/bus" element={<Bus/>} />
          <Route path="/bicycle" element={<Bicycle/>} />
          <Route path="/search/:selectedCounty" element={<Search/>} />
          <Route path="/stop/:selectedCounty/:routeUID/:routeName" element={<Stop/>} />
          <Route path="/stop/map/:selectedCounty/:routeUID/:routeName" element={<StopMap/>} />
        </Routes>
    </HashRouter>
    </div>
  );
}

export default App;
