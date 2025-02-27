import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { motion } from "framer-motion"; // ✅ Import for animations

export default function Profile() {
  const [name, setName] = useState(localStorage.getItem("name") || "");
  const [bio, setBio] = useState(localStorage.getItem("bio") || "");
  const [profilePic, setProfilePic] = useState(localStorage.getItem("profilePic") || "");
  const [likedMemes, setLikedMemes] = useState([]);
  const [userMemes, setUserMemes] = useState([]);

  // ✅ Fetch liked memes from localStorage
  useEffect(() => {
    const storedLikes = JSON.parse(localStorage.getItem("likedMemes")) || [];
    setLikedMemes(storedLikes);
  }, []);

  // ✅ Fetch user-uploaded memes from Firestore
  useEffect(() => {
    const fetchUserMemes = async () => {
      try {
        const memesCollection = collection(db, "memes");
        const q = query(memesCollection, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const fetchedMemes = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUserMemes(fetchedMemes);
      } catch (error) {
        console.error("🔥 Error fetching user memes:", error);
      }
    };

    fetchUserMemes();
  }, []);

  // ✅ Handle Profile Picture Change
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
        localStorage.setItem("profilePic", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Handle profile update
  const handleProfileUpdate = () => {
    localStorage.setItem("name", name);
    localStorage.setItem("bio", bio);
    alert("Profile updated!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="p-5 max-w-3xl mx-auto"
    >
      <h1 className="text-3xl font-bold text-center">🎭 Your Profile</h1>

      {/* Profile Picture & Upload */}
      <div className="flex flex-col items-center mt-4">
        <motion.label
          htmlFor="profilePicUpload"
          className="cursor-pointer flex flex-col items-center"
          whileHover={{ scale: 1.1 }}
        >
          <img
            src={profilePic || "https://via.placeholder.com/100"}
            alt="Profile"
            className="rounded-full w-24 h-24 border-4 border-gray-300 object-cover shadow-md"
          />
          <span className="text-blue-500 text-sm mt-2">📸 Change Profile Picture</span>
        </motion.label>
        <input
          type="file"
          id="profilePicUpload"
          accept="image/*"
          className="hidden"
          onChange={handleProfilePicChange}
        />
      </div>

      {/* Name & Bio Edit */}
      <motion.div
        className="mt-6 bg-gray-100 p-4 rounded-lg shadow-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
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
          className="bg-blue-500 text-white px-4 py-2 mt-2 rounded-lg shadow-lg w-full"
          onClick={handleProfileUpdate}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          💾 Save Profile
        </motion.button>
      </motion.div>

      {/* Liked Memes Section */}
      <h2 className="text-xl font-semibold mt-8">❤️ Liked Memes</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
        {likedMemes.length > 0 ? (
          likedMemes.map((meme) => (
            <motion.img
              key={meme.id}
              src={meme.url}
              alt={meme.name}
              className="rounded-lg shadow-lg w-full cursor-pointer"
              whileHover={{ scale: 1.05 }}
            />
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-3">No liked memes yet.</p>
        )}
      </div>

      {/* User Uploaded Memes */}
      <h2 className="text-xl font-semibold mt-8">🖼️ Your Uploaded Memes</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
        {userMemes.length > 0 ? (
          userMemes.map((meme, index) => (
            <motion.div
              key={meme.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="rounded-lg shadow-lg overflow-hidden"
            >
              <img src={meme.memeUrl} alt="Uploaded Meme" className="w-full h-auto rounded-lg" />
              <p className="text-center font-bold mt-2 text-sm">{meme.topText} {meme.bottomText}</p>
            </motion.div>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-3">No memes uploaded yet.</p>
        )}
      </div>
    </motion.div>
  );
}
