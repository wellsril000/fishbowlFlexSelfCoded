import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Preview from "./pages/preview";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ImportType from './pages/ImportType';

function App() {
  return (

    <Router>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/preview' element={<Preview />} />
        <Route path='/importtype' element={<ImportType />} />
      </Routes>
    </Router>
  );
}

export default App
