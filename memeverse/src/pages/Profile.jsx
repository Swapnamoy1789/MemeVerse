import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { motion } from "framer-motion"; // ✅ Animations

export default function Profile() {
  const [name, setName] = useState(localStorage.getItem("name") || "Anonymous");
  const [bio, setBio] = useState(localStorage.getItem("bio") || "");
  const [profilePic, setProfilePic] = useState(localStorage.getItem("profilePic") || "");
  const [likedMemes, setLikedMemes] = useState([]);
  const [userMemes, setUserMemes] = useState([]);

  // ✅ Fetch liked memes from localStorage
  useEffect(() => {
    const storedLikes = JSON.parse(localStorage.getItem("likedMemes")) || [];
    setLikedMemes(storedLikes);
  }, []);

  // ✅ Fetch only user's uploaded memes
  useEffect(() => {
    const fetchUserMemes = async () => {
      try {
        const memesCollection = collection(db, "memes");
        const q = query(memesCollection, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const fetchedMemes = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((meme) => meme.uploadedBy === name); // ✅ Show only current user memes

        setUserMemes(fetchedMemes);
      } catch (error) {
        console.error("🔥 Error fetching user memes:", error);
      }
    };

    fetchUserMemes();
  }, [name]);

  // ✅ Handle profile update
  const handleProfileUpdate = () => {
    localStorage.setItem("name", name);
    localStorage.setItem("bio", bio);
    alert("Profile updated!");
  };

  return (
    <div className="p-5 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center">User Profile</h1>

      {/* Profile Picture & Upload */}
      <div className="flex flex-col items-center mt-4">
        <img
          src={profilePic || "https://via.placeholder.com/100"}
          alt="Profile"
          className="rounded-full w-24 h-24 border-2 object-cover"
        />
      </div>

      {/* Name & Bio Edit */}
      <div className="mt-4">
        <input
          type="text"
          placeholder="Your Name"
          className="w-full p-2 border rounded mt-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          placeholder="Your Bio"
          className="w-full p-2 border rounded mt-2"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
          onClick={handleProfileUpdate}
        >
          Save Profile
        </motion.button>
      </div>

      {/* Liked Memes Section */}
      <h2 className="text-xl font-semibold mt-6">Liked Memes</h2>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {likedMemes.length > 0 ? (
          likedMemes.map((meme) => (
            <motion.img
              key={meme.id}
              src={meme.url}
              alt={meme.name}
              className="rounded-lg shadow-lg w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-3">No liked memes yet.</p>
        )}
      </div>

      {/* User Uploaded Memes */}
      <h2 className="text-xl font-semibold mt-6">Your Uploaded Memes</h2>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {userMemes.length > 0 ? (
          userMemes.map((meme) => (
            <motion.div
              key={meme.id}
              className="rounded-lg shadow-lg overflow-hidden"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <img src={meme.memeUrl} alt="Uploaded Meme" className="w-full h-auto rounded-lg" />
              <p className="text-center font-bold mt-2">{meme.topText} {meme.bottomText}</p>
            </motion.div>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-3">No memes uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
