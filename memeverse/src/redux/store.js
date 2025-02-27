import { configureStore } from "@reduxjs/toolkit";
import memeReducer from "./memeSlice";

export const store = configureStore({
  reducer: {
    memes: memeReducer,
  },
});
