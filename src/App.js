import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Countdown from "./pages/Countdown";
import Cover from "./pages/Cover";
import Home from "./pages/Home";
import PostMessage from "./components/PostMessage.js";
import ViewMessages from "./pages/ViewMessages";
import Map from "./pages/MapMessages";
import ViewMemoriesByDate from "./pages/ViewMemoriesByDate.js"

// これは消す
import HomeRecently from "./pages/HomeRecently.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/countdown" element={<Countdown />} />
        <Route path="/cover" element={<Cover />} />
        <Route path="/home" element={<Home />} />
        <Route path="/post" element={<PostMessage />} />
        <Route path="/view" element={<ViewMessages />} />
        <Route path="/map" element={<Map />} />
        <Route path="/memories-by-date" element={<ViewMemoriesByDate />} />
        
        {
          // これは消す
        }
        <Route path="/home0" element={<HomeRecently />} />
        <Route path="/" element={<HomeRecently />} />
      </Routes>
    </Router>
  );
}

export default App;
