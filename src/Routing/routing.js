import React from 'react'
import {Route,Routes,BrowserRouter as Router} from 'react-router-dom'
import Mainpage from '../component/mainpage'



function Routing() {
  return (
    <Router>
        <Routes>
        <Route path="/" element={<Mainpage/>}/>
        </Routes>
    </Router>
  )
}

export default Routing