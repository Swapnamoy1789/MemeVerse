import { motion } from "framer-motion";

export default function MemeCard({ meme }) {
  return (
    <motion.div
      className="border rounded-lg p-2 shadow-lg"
      whileHover={{ scale: 1.05 }}
    >
      <img src={meme.url} alt={meme.name} className="rounded-lg w-full" />
      <h2 className="text-center font-bold mt-2">{meme.name}</h2>

      {/*  Display Like & Comment Count */}
      <div className="flex justify-between p-2 text-sm text-gray-600">
        <span>👍 {meme.likes} Likes</span>
        <span>💬 {meme.comments} Comments</span>
      </div>
    </motion.div>
  );
}
