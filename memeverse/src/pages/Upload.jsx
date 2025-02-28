import { useState, useEffect } from "react";
import { generateMemeCaption, fetchMemes } from "../utils/api";
import { db, auth } from "../utils/firebase"; 
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";

export default function Upload() {
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [memeUrl, setMemeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [memes, setMemes] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("Anonymous");

  //  Fetch Meme Templates & User Info
  useEffect(() => {
    const fetchData = async () => {
      const memeData = await fetchMemes();
      setMemes(memeData);
      if (memeData.length > 0) setSelectedTemplate(memeData[0].id);
      
      auth.onAuthStateChanged(async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUsername(userSnap.data().name || "Anonymous");
          } else {
            setUsername(currentUser.displayName || "Anonymous");
          }
        } else {
          setUser(null);
          setUsername("Anonymous");
        }
      });
    };

    fetchData();
  }, []);

  //  Handle Meme Upload
  const handleGenerateMeme = async () => {
    if (!selectedTemplate) {
      alert("Please select a meme template!");
      return;
    }
    if (!user) {
      alert("You must be logged in to upload memes!");
      return;
    }

    setLoading(true);
    const url = await generateMemeCaption(selectedTemplate, topText, bottomText);

    if (url) {
      setMemeUrl(url);

      //  Save meme to Firestore
      try {
        await addDoc(collection(db, "memes"), {
          topText,
          bottomText,
          memeUrl: url,
          templateId: selectedTemplate,
          uploadedBy: user.uid,
          username: username, //  Store correct username
          createdAt: serverTimestamp(),
        });

        alert("Meme successfully uploaded!");
      } catch (error) {
        console.error(" Error saving meme to Firestore:", error);
      }
    } else {
      console.error(" Failed to generate meme");
    }
    setLoading(false);
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold text-center">Create Your Own Meme</h1>

      {/* Meme Template Selection */}
      <div className="mt-4">
        <label className="block text-lg font-bold">Choose a Meme Template:</label>
        <select
          className="border p-2 mt-2 w-full"
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
        >
          {memes.length > 0 ? (
            memes.map((meme) => (
              <option key={meme.id} value={meme.id}>
                {meme.name}
              </option>
            ))
          ) : (
            <option disabled>Loading memes...</option>
          )}
        </select>
      </div>

      {/* Meme Preview */}
      {selectedTemplate && (
        <div className="mt-4 flex justify-center">
          <img
            src={memes.find((meme) => meme.id === selectedTemplate)?.url || ""}
            alt="Selected Meme Template"
            className="w-60 h-auto rounded-lg shadow-lg"
          />
        </div>
      )}

      <div className="flex flex-col items-center mt-5">
        <input
          type="text"
          placeholder="Top Text"
          value={topText}
          onChange={(e) => setTopText(e.target.value)}
          className="border p-2 m-2 w-1/2"
        />
        <input
          type="text"
          placeholder="Bottom Text"
          value={bottomText}
          onChange={(e) => setBottomText(e.target.value)}
          className="border p-2 m-2 w-1/2"
        />

        <button
          onClick={handleGenerateMeme}
          className="bg-green-500 text-white p-2 rounded mt-2"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Meme"}
        </button>

        {memeUrl && (
          <div className="mt-4">
            <h2 className="text-xl">Your Meme:</h2>
            <img src={memeUrl} alt="Generated Meme" className="rounded shadow-lg" />
          </div>
        )}
      </div>
    </div>
  );
}
