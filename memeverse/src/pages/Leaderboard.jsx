import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function Leaderboard() {
  const [topMemes, setTopMemes] = useState([]);
  const [userRankings, setUserRankings] = useState([]);

  //  Fetch Top 10 Most Liked Memes from LocalStorage
  useEffect(() => {
    const fetchTopMemes = () => {
      let storedLikedMemes = JSON.parse(localStorage.getItem("likedMemes")) || [];
      let storedMemes = JSON.parse(localStorage.getItem("memes")) || []; //  Fetch memes

      console.log(" Liked Memes from LocalStorage:", storedLikedMemes);
      console.log(" All Memes from LocalStorage:", storedMemes);

      //  Match liked memes with stored memes to get the image URL
      const likedMemesWithImages = storedLikedMemes.map((likedMeme) => {
        const matchingMeme = storedMemes.find((meme) => meme.id === likedMeme.id);
        return {
          ...likedMeme,
          memeUrl: matchingMeme ? matchingMeme.url : null, // Ensure memeUrl is present
        };
      });

      // Filter memes that have images & sort by likes
      const sortedTopMemes = likedMemesWithImages
        .filter((meme) => meme.memeUrl) // Ensure URL exists
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 10); // Get top 10

      console.log(" Top 10 Memes with Images:", sortedTopMemes);
      setTopMemes(sortedTopMemes);
    };

    fetchTopMemes();
  }, []);

  // Fetch User Rankings based on Uploads
  useEffect(() => {
    const fetchUserRankings = async () => {
      try {
        const memesCollection = collection(db, "memes");
        const querySnapshot = await getDocs(memesCollection);

        const userStats = {}; // Store user data (username, uploads)

        querySnapshot.docs.forEach((doc) => {
          const meme = doc.data();
          const username = meme.username || "Anonymous";

          // Track user uploads count
          if (!userStats[username]) {
            userStats[username] = { memesUploaded: 0 };
          }
          userStats[username].memesUploaded += 1;
        });

        // Convert to array and rank users
        const rankedUsers = Object.keys(userStats)
          .filter((username) => username !== "Anonymous")
          .map((username) => ({
            username,
            memesUploaded: userStats[username].memesUploaded,
          }))
          .sort((a, b) => b.memesUploaded - a.memesUploaded); // Sort by uploaded memes

        console.log(" Ranked Users:", rankedUsers);
        setUserRankings(rankedUsers);
      } catch (error) {
        console.error(" Error fetching user rankings:", error);
      }
    };

    fetchUserRankings();
  }, []);

  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold text-center">🏆 Meme Leaderboard</h1>

      {/*  Top 10 Most Liked Memes */}
      <h2 className="text-2xl font-semibold mt-6">🔥 Top 10 Most Liked Memes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {topMemes.length > 0 ? (
          topMemes.map((meme, index) => (
            <div key={meme.id} className="rounded-lg shadow-lg overflow-hidden p-3 border">
              <h3 className="text-lg font-bold">#{index + 1} {meme.username}</h3>
              <img src={meme.memeUrl} alt="Top Meme" className="w-full h-auto rounded-lg" />
              <p className="text-center font-bold mt-2">👍 {meme.likes} Likes</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-3">No memes available.</p>
        )}
      </div>

      {/* 🏅 User Rankings */}
      <h2 className="text-2xl font-semibold mt-8">🏅 Top Users</h2>
      <table className="w-full mt-4 border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Rank</th>
            <th className="p-2">User</th>
            <th className="p-2">Memes Uploaded</th>
          </tr>
        </thead>
        <tbody>
          {userRankings.length > 0 ? (
            userRankings.map((user, index) => (
              <tr key={user.username} className="text-center border-b">
                <td className="p-2 font-bold">#{index + 1}</td>
                <td className="p-2">{user.username}</td>
                <td className="p-2">{user.memesUploaded}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-gray-500 text-center p-3">No user data available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
