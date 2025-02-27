import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold">404 - Meme Not Found!</h1>
      <img
        src="https://i.imgflip.com/30b1gx.jpg"
        alt="Meme Not Found"
        className="w-1/4 mt-4 rounded-lg shadow-lg"
      />
      <p className="mt-4 text-lg font-semibold">
        "When you take a wrong turn in the MemeVerse and end up in the void..."
      </p>
      <p className="text-md text-gray-500 italic">Not all who wander are lost... but you are. 🤡</p>
      <Link to="/" className="bg-blue-500 text-white px-4 py-2 mt-4 rounded hover:bg-blue-600">
        Take Me Back
      </Link>
    </div>
  );
}
