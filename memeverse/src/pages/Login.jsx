import { useState } from "react";
import { auth, db } from "../utils/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      let userCredential;
      
      if (isSignup) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        //  Add new user to Firestore's users collection
        const userRef = doc(db, "users", userCredential.user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            name: "New User",
            email: email,
            bio: "",
            profilePic: "https://via.placeholder.com/100",
          });
          console.log(" New user added to Firestore.");
        }
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      navigate("/profile"); // Redirect to Profile after login/signup
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold">{isSignup ? "Sign Up" : "Login"}</h1>
      <form onSubmit={handleAuth} className="mt-5 space-y-3">
        <input
          type="email"
          placeholder="Email"
          className="w-64 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-64 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {isSignup ? "Sign Up" : "Login"}
        </button>
      </form>
      <p className="mt-4">
        {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
        <button onClick={() => setIsSignup(!isSignup)} className="text-blue-500">
          {isSignup ? "Login" : "Sign Up"}
        </button>
      </p>
    </div>
  );
}
