import './App.css';
import { Outlet } from 'react-router-dom';
import { CubeBackground, Header } from './components';

function App() {
  return (
    <>
      <Header />
      <CubeBackground />
      <Outlet />
    </>
  )
}

export default App
