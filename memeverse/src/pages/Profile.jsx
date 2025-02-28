import { useEffect, useState } from "react";
import { db, auth } from "../utils/firebase";
import { doc, getDoc, collection, getDocs, query, where, orderBy, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [userMemes, setUserMemes] = useState([]);
  const navigate = useNavigate();

  // ✅ Fetch user details from Firestore when logged in
  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      setUser(auth.currentUser);

      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setName(userData.name || "Anonymous");
        setBio(userData.bio || "No bio added yet.");
        setProfilePic(userData.profilePic || "");

        console.log("✅ Username fetched from Firestore:", userData.name);
        
        // ✅ Fetch uploaded memes using this username
        fetchUserMemes(userData.name);
      } else {
        console.log("⚠️ No user document found in Firestore.");
      }
    };

    fetchUserData();
  }, []);

  // ✅ Fetch uploaded memes by matching the username
  const fetchUserMemes = async (fetchedUsername) => {
    if (!fetchedUsername) {
      console.log("⚠️ Username is empty, cannot fetch memes.");
      return;
    }

    try {
      console.log("🔍 Fetching memes for username:", fetchedUsername);
      
      const memesCollection = collection(db, "memes");
      const q = query(memesCollection, where("username", "==", fetchedUsername), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const fetchedMemes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("✅ Fetched uploaded memes:", fetchedMemes);
      setUserMemes(fetchedMemes);
    } catch (error) {
      console.error("🔥 Error fetching uploaded memes:", error);
    }
  };

  // ✅ Handle profile update
  const handleProfileUpdate = async () => {
    if (!user) {
      alert("You must be logged in to update your profile!");
      return;
    }

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { name, bio });

    alert("Profile updated successfully!");
  };

  // ✅ Handle profile picture upload
  const handleProfilePicUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      setProfilePic(reader.result);

      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { profilePic: reader.result });
      }
    };
    reader.readAsDataURL(file);
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
        <input type="file" accept="image/*" className="mt-2" onChange={handleProfilePicUpload} />
      </div>

      {/* Name & Bio */}
      <div className="mt-4 text-center">
        <input
          type="text"
          placeholder="Your Name"
          className="w-full p-2 border rounded mt-2 text-center"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          placeholder="Your Bio"
          className="w-full p-2 border rounded mt-2 text-center"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
          onClick={handleProfileUpdate}
        >
          Save Profile
        </button>
      </div>

      {/* Uploaded Memes Section */}
      <h2 className="text-xl font-semibold mt-6">Your Uploaded Memes</h2>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {userMemes.length > 0 ? (
          userMemes.map((meme) => (
            <div key={meme.id} className="rounded-lg shadow-lg overflow-hidden">
              <img src={meme.memeUrl} alt="Uploaded Meme" className="w-full h-auto rounded-lg" />
              <p className="text-center font-bold mt-2">{meme.topText} {meme.bottomText}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-3">No memes uploaded yet.</p>
        )}
      </div>

      {/* Back to Home Button */}
      <button
        className="bg-gray-500 text-white px-4 py-2 mt-4 rounded"
        onClick={() => navigate("/")}
      >
        Back to Home
      </button>
    </div>
  );
}
