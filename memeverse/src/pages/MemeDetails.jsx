import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../utils/firebase";

export default function MemeDetails() {
  const { id } = useParams();
  const [meme, setMeme] = useState(null);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  // ✅ Fetch username from localStorage
  const savedName = localStorage.getItem("name") || "Anonymous";

  // ✅ Fetch meme details from localStorage
  useEffect(() => {
    const savedMemes = JSON.parse(localStorage.getItem("memes")) || [];
    const selectedMeme = savedMemes.find((m) => m.id.toString() === id.toString());

    if (selectedMeme) {
      setMeme(selectedMeme);
      setLikes(parseInt(localStorage.getItem(`meme_likes_${id}`)) || selectedMeme.likes || 0);
      setComments(JSON.parse(localStorage.getItem(`meme_comments_${id}`)) || selectedMeme.comments || []);
    }
  }, [id]);

  // ✅ Handle Like Button
  const handleLike = () => {
    const updatedLikes = likes + 1;
    setLikes(updatedLikes);

    // ✅ Store likes for this meme in LocalStorage
    localStorage.setItem(`meme_likes_${id}`, updatedLikes);

    // ✅ Update meme data in LocalStorage
    let cachedMemes = JSON.parse(localStorage.getItem("cachedMemes")) || [];
    cachedMemes = cachedMemes.map((meme) =>
      meme.id === id ? { ...meme, likes: updatedLikes } : meme
    );
    localStorage.setItem("cachedMemes", JSON.stringify(cachedMemes));

    // ✅ Ensure `userData` exists in LocalStorage and update likes count
    const storedUserData = JSON.parse(localStorage.getItem("userData")) || {};
    storedUserData[savedName] = {
      ...storedUserData[savedName],
      totalLikes: (storedUserData[savedName]?.totalLikes || 0) + 1, // ✅ Increment total likes
    };

    localStorage.setItem("userData", JSON.stringify(storedUserData));
  };

  // ✅ Handle Comment Submission
  const handleComment = () => {
    if (commentText.trim() === "") return;

    const updatedComments = [...comments, commentText];
    setComments(updatedComments);
    setCommentText("");

    localStorage.setItem(`meme_comments_${id}`, JSON.stringify(updatedComments));
  };

  // ✅ Handle Share Button (Copies Meme URL to Clipboard)
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Meme link copied to clipboard! 📋");
  };

  if (!meme) return <p className="text-center text-gray-500">Loading meme...</p>;

  return (
    <div className="p-5 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center">{meme.name}</h1>

      {/* Meme Image */}
      <motion.img
        src={meme.url}
        alt={meme.name}
        className="rounded-lg shadow-lg w-full mt-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Like & Share Buttons */}
      <div className="flex justify-center gap-4 mt-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleLike}
        >
          👍 {likes} Likes
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className="bg-gray-600 text-white px-4 py-2 rounded"
          onClick={handleShare}
        >
          🔗 Share
        </motion.button>
      </div>

      {/* Comment Section */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Comments</h2>
        <input
          type="text"
          placeholder="Add a comment..."
          className="w-full p-2 border rounded mt-2"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="bg-green-500 text-white px-4 py-2 mt-2 rounded"
          onClick={handleComment}
        >
          💬 Comment
        </motion.button>

        {/* Display Comments */}
        <ul className="mt-4">
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <motion.li
                key={index}
                className="border-b p-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {comment}
              </motion.li>
            ))
          ) : (
            <p className="text-gray-500 text-center mt-2">No comments yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
