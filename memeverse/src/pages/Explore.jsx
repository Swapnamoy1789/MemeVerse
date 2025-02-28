import { useEffect, useState, useCallback } from "react";
import { fetchMemes } from "../utils/api";
import MemeCard from "../components/MemeCard.jsx";
import { debounce } from "../utils/helpers";
import { Link } from "react-router-dom";

export default function Explore() {
  const [memes, setMemes] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredMemes, setFilteredMemes] = useState([]);
  const [sortBy, setSortBy] = useState("likes");
  const [category, setCategory] = useState("Trending");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  //  Fetch memes with pagination
  useEffect(() => {
    setLoading(true);
    fetchMemes(page, category).then((newMemes) => {
      setMemes((prev) => (page === 1 ? newMemes : [...prev, ...newMemes]));
      setLoading(false);
    });
  }, [page, category]);

  //  Fetch likes from localStorage and merge with memes
  useEffect(() => {
    const likedMemes = JSON.parse(localStorage.getItem("likedMemes")) || [];
    const likesMap = Object.fromEntries(likedMemes.map((m) => [m.id, m.likes])); // Create a map of likes

    const updatedMemes = memes.map((meme) => ({
      ...meme,
      likes: likesMap[meme.id] || 0, // Use likes from localStorage if available
      comments: JSON.parse(localStorage.getItem(`meme_comments_${meme.id}`))?.length || 0,
    }));

    setFilteredMemes(updatedMemes);
  }, [memes, sortBy]);

  //  Search with debounce
  const handleSearch = useCallback(
    debounce((query) => {
      setSearch(query);
      setPage(1);
    }, 500),
    []
  );

  useEffect(() => {
    if (search.trim()) {
      setFilteredMemes(
        memes.filter((meme) =>
          meme.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    } else {
      setFilteredMemes(memes);
    }
  }, [search, memes]);

  //  Sorting function (likes & comments)
  useEffect(() => {
    setFilteredMemes((prev) =>
      [...prev].sort((a, b) => {
        if (sortBy === "likes") return b.likes - a.likes;
        if (sortBy === "comments") return b.comments - a.comments;
        return 0;
      })
    );
  }, [sortBy]);

  //  Infinite Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 && !loading) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading]);

  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold text-center">Meme Explorer</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search memes..."
        className="w-full p-2 border rounded mt-4"
        onChange={(e) => handleSearch(e.target.value)}
      />

      {/* Sorting & Category Filters */}
      <div className="flex justify-between mt-4">
        <select className="p-2 border rounded" onChange={(e) => setSortBy(e.target.value)}>
          <option value="likes">Sort by Likes</option>
          <option value="comments">Sort by Comments</option>
        </select>

        <select className="p-2 border rounded" onChange={(e) => setCategory(e.target.value)}>
          <option value="Trending">Trending</option>
          <option value="New">New</option>
          <option value="Classic">Classic</option>
          <option value="Random">Random</option>
        </select>
      </div>

      {/* Meme Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-5">
        {filteredMemes.length > 0 ? (
          filteredMemes.map((meme) => (
            <Link key={meme.id} to={`/meme/${meme.id}`}>
              <MemeCard meme={meme} />
            </Link>
          ))
        ) : (
          <p className="text-center text-gray-500">No memes found.</p>
        )}
      </div>

      {/* Infinite Scroll Loader */}
      {loading && <p className="text-center text-gray-500 mt-4">Loading more memes...</p>}
    </div>
  );
}
