import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Upload from "./pages/Upload";
import MemeDetails from "./pages/MemeDetails";
import NotFound from "./pages/Notfound";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/meme/:id" element={<MemeDetails />} />
      <Route path="/profile" element={<Profile />} /> 
      <Route path="/leaderboard" element={<Leaderboard/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="*" element={<NotFound/>} /> 

    </Routes>
  );
}
