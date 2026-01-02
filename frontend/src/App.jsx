import './App.css';
import { Outlet } from 'react-router-dom';
import { CubeBackground, Header, MeshBG } from './components';

function App() {
  return (
    <>
      {/* <MeshBG /> */}
      <Header />
      {/* <CubeBackground /> */}
      <Outlet />
    </>
  )
}

export default App
