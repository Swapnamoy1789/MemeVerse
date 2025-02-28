import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setMemes } from "../redux/memeSlice";
import { fetchMemes } from "../utils/api";
import { motion } from "framer-motion"; // ✅ Import Framer Motion for animations
import { getAuth, signOut } from "firebase/auth"; // ✅ Firebase Authentication

export default function Home() {
  const dispatch = useDispatch();
  const memes = useSelector((state) => state.memes.memes);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  // ✅ Firebase Authentication State
  const auth = getAuth();
  const user = auth.currentUser; // ✅ Get logged-in user

  useEffect(() => {
    fetchMemes().then((data) => dispatch(setMemes(data)));
  }, [dispatch]);

  // ✅ Handle Logout
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login"); // ✅ Redirect to login page
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} // ✅ Page Transition Animation
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} min-h-screen p-5`}
    >
      {/* Dark Mode & Login/Logout Buttons */}
      <div className="flex justify-between">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 bg-gray-700 text-white rounded-lg"
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </motion.button>

        {user ? (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
            className="p-2 bg-red-500 text-white rounded-lg"
          >
            🚪 Logout
          </motion.button>
        ) : (
          <Link to="/login">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-blue-500 text-white rounded-lg"
            >
              🔑 Login
            </motion.button>
          </Link>
        )}
      </div>

      <h1 className="text-3xl font-bold text-center mt-4">🔥 Trending Memes</h1>

      {/* Upload, Explore, Profile & Leaderboard Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mt-5 w-full max-w-xl mx-auto">
        {[
          { to: "/upload", text: "Upload Your Meme", color: "bg-blue-500" },
          { to: "/explore", text: "Explore Memes", color: "bg-green-500" },
          { to: "/profile", text: "Profile", color: "bg-red-400" },
          { to: "/leaderboard", text: "Leaderboard", color: "bg-purple-500" }
        ].map((button, index) => (
          <Link key={index} to={button.to}>
            <motion.button
              whileHover={{ scale: 1.05, opacity: 0.9 }} // ✅ Hover Animation
              whileTap={{ scale: 0.95 }} // ✅ Click Animation
              transition={{ duration: 0.2 }}
              className={`${button.color} text-white px-4 py-2 rounded-lg shadow-lg w-full sm:w-auto`}
            >
              {button.text}
            </motion.button>
          </Link>
        ))}
      </div>

      {/* Trending Memes Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-5 p-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
        }}
      >
        {memes.map((meme, index) => (
          <motion.div
            key={meme.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
            className="rounded-lg shadow-lg overflow-hidden"
          >
            <Link to={`/meme/${meme.id}`}>
              <img src={meme.url} alt={meme.name} className="w-full h-auto rounded-lg cursor-pointer" />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
