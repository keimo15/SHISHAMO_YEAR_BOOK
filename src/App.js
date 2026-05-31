import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Countdown from "./pages/Countdown";
import Cover from "./pages/Cover";
import PostMessage from "./components/PostMessage.js";
import ViewMessages from "./pages/ViewMessages";
import Map from "./pages/MapMessages";
import Song from "./pages/Song.js";
import ViewMemoriesByDate from "./pages/ViewMemoriesByDate.js"
import Thanks from "./pages/ThanksForEveryThing.js";
import Contact from "./pages/Contact.js";

// これは消す
import HomeRecently from "./pages/HomeRecently.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/countdown" element={<Countdown />} />
        <Route path="/cover" element={<Cover />} />
        <Route path="/home" element={<HomeRecently />} />
        <Route path="/post" element={<PostMessage />} />
        <Route path="/view" element={<ViewMessages />} />
        <Route path="/map" element={<Map />} />
        <Route path="/song" element={<Song />} />
        <Route path="/memories-by-date" element={<ViewMemoriesByDate />} />
        <Route path="/thanks" element={<Thanks />} />
        <Route path="/contact" element={<Contact />} />
        
        {
          // これは消す
        }
        <Route path="/home0" element={<HomeRecently />} />
        <Route path="/" element={<Countdown />} />
      </Routes>
    </Router>
  );
}

export default App;
