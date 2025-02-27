import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Leaderboard() {
  const [topMemes, setTopMemes] = useState([]);
  const [userRankings, setUserRankings] = useState([]);

  // ✅ Fetch Name from LocalStorage
  const savedName = localStorage.getItem("name") || "Anonymous";

  // ✅ Fetch Top 10 Liked Memes from LocalStorage
  useEffect(() => {
    const fetchTopMemes = () => {
      let memes = JSON.parse(localStorage.getItem("cachedMemes")) || [];

      // ✅ Update meme likes from localStorage
      memes = memes.map((meme) => ({
        ...meme,
        likes: Number(localStorage.getItem(`meme_likes_${meme.id}`)) || meme.likes || 0,
      }));

      // ✅ Sort memes by likes & get the top 10
      const sortedMemes = memes.sort((a, b) => b.likes - a.likes).slice(0, 10);
      setTopMemes(sortedMemes);
    };

    fetchTopMemes();
  }, []);

  // ✅ Fetch User Rankings (Memes Uploaded from Firestore + Likes from LocalStorage)
  useEffect(() => {
    const fetchUserRankings = async () => {
      const usersData = JSON.parse(localStorage.getItem("userData")) || {}; // ✅ Likes from LocalStorage
      const userUploads = {}; // ✅ Meme uploads from Firestore

      try {
        // ✅ Fetch all uploaded memes from Firestore
        const querySnapshot = await getDocs(collection(db, "memes"));

        querySnapshot.docs.forEach((doc) => {
          const meme = doc.data();
          const uploadedBy = meme.uploadedBy || "Anonymous"; // ✅ Fetch stored uploader from Firestore

          // ✅ Count memes uploaded per user
          if (userUploads[uploadedBy]) {
            userUploads[uploadedBy]++;
          } else {
            userUploads[uploadedBy] = 1;
          }
        });

        console.log("🔥 Uploaded memes fetched from Firestore:", userUploads);

        // ✅ Merge Firestore meme upload count with LocalStorage user data
        const rankedUsers = Object.keys(usersData).map((username) => ({
          username,
          memesUploaded: userUploads[username] || 0, // ✅ Fetch from Firestore
          totalLikes: usersData[username]?.totalLikes || 0, // ✅ Fetch from LocalStorage
          engagementScore: (userUploads[username] || 0) * 2 + (usersData[username]?.totalLikes || 0), // ✅ Engagement formula
        }));

        // ✅ Sort by engagement score (more memes uploaded & likes = higher rank)
        rankedUsers.sort((a, b) => b.engagementScore - a.engagementScore);

        setUserRankings(rankedUsers);
      } catch (error) {
        console.error("🔥 Error fetching user rankings:", error);
      }
    };

    fetchUserRankings();
  }, []);

  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold text-center">🏆 Meme Leaderboard</h1>

      {/* Top 10 Most Liked Memes */}
      <h2 className="text-2xl font-semibold mt-6">🔥 Top 10 Most Liked Memes</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {topMemes.length > 0 ? (
          topMemes.map((meme, index) => (
            <div key={meme.id} className="rounded-lg shadow-lg overflow-hidden p-3 border">
              <h3 className="text-lg font-bold">#{index + 1} {meme.name}</h3>
              <img src={meme.url} alt="Top Meme" className="w-full h-auto rounded-lg" />
              <p className="text-center font-bold mt-2">👍 {meme.likes} Likes</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-3">No memes available.</p>
        )}
      </div>

      {/* User Rankings */}
      <h2 className="text-2xl font-semibold mt-8">🏅 Top Users</h2>
      <table className="w-full mt-4 border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Rank</th>
            <th className="p-2">User</th>
            <th className="p-2">Memes Uploaded</th>
            <th className="p-2">Total Likes</th>
            <th className="p-2">Engagement Score</th>
          </tr>
        </thead>
        <tbody>
          {userRankings.length > 0 ? (
            userRankings.map((user, index) => (
              <tr key={user.username} className="text-center border-b">
                <td className="p-2 font-bold">#{index + 1}</td>
                <td className="p-2">{user.username}</td>
                <td className="p-2">{user.memesUploaded}</td>
                <td className="p-2">{user.totalLikes}</td>
                <td className="p-2">{user.engagementScore}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-gray-500 text-center p-3">No user data available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
