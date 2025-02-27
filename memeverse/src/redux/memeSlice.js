import { createSlice } from "@reduxjs/toolkit";

const memeSlice = createSlice({
  name: "memes",
  initialState: { memes: [] },
  reducers: {
    setMemes: (state, action) => {
      state.memes = action.payload;
    },
  },
});

export const { setMemes } = memeSlice.actions;
export default memeSlice.reducer;
