import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { motion } from "framer-motion";

export default function Profile() {
  const [name, setName] = useState(localStorage.getItem("name") || "Anonymous");
  const [bio, setBio] = useState(localStorage.getItem("bio") || "");
  const [profilePic, setProfilePic] = useState(localStorage.getItem("profilePic") || "");
  const [likedMemes, setLikedMemes] = useState([]);
  const [userMemes, setUserMemes] = useState([]);

  // ✅ Fetch liked memes from localStorage properly
  useEffect(() => {
    const fetchLikedMemes = () => {
      const storedLikes = Object.keys(localStorage)
        .filter((key) => key.startsWith("meme_likes_"))
        .map((key) => {
          const memeId = key.replace("meme_likes_", "");
          return {
            id: memeId,
            likes: Number(localStorage.getItem(key)),
            url: JSON.parse(localStorage.getItem("cachedMemes") || "[]").find((m) => m.id === memeId)?.url || "",
          };
        })
        .filter((meme) => meme.url !== ""); // Remove memes without a valid URL

      setLikedMemes(storedLikes);
    };

    fetchLikedMemes();
  }, []);

  // ✅ Fetch user-uploaded memes from Firestore
  useEffect(() => {
    const fetchUserMemes = async () => {
      try {
        const memesCollection = collection(db, "memes");
        const q = query(memesCollection, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const fetchedMemes = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((meme) => meme.uploadedBy === name); // Show only current user's uploaded memes

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

  // ✅ Handle profile picture upload
  const handleProfilePicUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      localStorage.setItem("profilePic", reader.result);
      setProfilePic(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-5 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center">User Profile</h1>

      {/* Profile Picture & Upload */}
      <div className="flex flex-col items-center mt-4">
        <motion.img
          src={profilePic || "https://via.placeholder.com/100"}
          alt="Profile"
          className="rounded-full w-24 h-24 border-2 object-cover"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        />
        <input type="file" accept="image/*" className="mt-2" onChange={handleProfilePicUpload} />
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
          whileTap={{ scale: 0.9 }}
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
              alt="Liked Meme"
              className="rounded-lg shadow-lg w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
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
