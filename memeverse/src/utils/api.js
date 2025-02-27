import axios from "axios";

// Fetch memes from Imgflip API
export const fetchMemes = async (page = 1) => {
    const cachedMemes = JSON.parse(localStorage.getItem("memes"));
  
    if (cachedMemes && page === 1) return cachedMemes; // ✅ Use cache if available
  
    try {
      const response = await fetch("https://api.imgflip.com/get_memes");
      const data = await response.json();
  
      if (data.success) {
        localStorage.setItem("memes", JSON.stringify(data.data.memes)); // ✅ Store memes
        return data.data.memes;
      }
    } catch (error) {
      console.error("Error fetching memes:", error);
      return [];
    }
  };
  
  
  

// Generate a meme with custom captions
export const generateMemeCaption = async (templateId, topText, bottomText) => {
  try {
    const response = await axios.post("https://api.imgflip.com/caption_image", null, {
      params: {
        template_id: templateId,
        text0: topText,
        text1: bottomText,
        username: "Swapnamoy", // Replace with your Imgflip username
        password: "Memebanabo@25", // Replace with your Imgflip password
      },
    });

    return response.data.data.url; // Returns the generated meme URL
  } catch (error) {
    console.error("Error generating meme caption:", error);
    return null;
  }
};
