import { useMutation } from "@apollo/client";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import React, { useState, useEffect, createContext } from "react";
import { CREATE_USER } from "./graphql/mutations";
import pp from "./images/pp.jpeg";
const provider = new firebase.auth.GoogleAuthProvider();
export const AuthContext = createContext();

// Find these options in your Firebase console
firebase.initializeApp({
  apiKey: "AIzaSyB1S0-0O1xt6Kg3Xi4BG6oFIdcPAuVv2kI",
  authDomain: "insta-r12-954ba.firebaseapp.com",
  databaseURL: "https://insta-r12-954ba-default-rtdb.firebaseio.com",
  projectId: "insta-r12-954ba",
  storageBucket: "insta-r12-954ba.appspot.com",
  messagingSenderId: "185148686863",
  appId: "1:185148686863:web:920f6882893772be9b997a",
  measurementId: "G-NNP6QH1JT4",
});
export default function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({ status: "loading" });
  const [createUsers] = useMutation(CREATE_USER);

  useEffect(() => {
    return firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        const idTokenResult = await user.getIdTokenResult();
        const hasuraClaim =
          idTokenResult.claims["https://hasura.io/jwt/claims"];

        if (hasuraClaim) {
          setAuthState({ status: "in", user, token });
        } else {
          // Check if refresh is required.
          const metadataRef = firebase
            .database()
            .ref(`metadata/${user.uid}/refreshTime`);

          metadataRef.on("value", async (data) => {
            if (!data.exists) return;
            // Force refresh to pick up the latest custom claims changes.
            const token = await user.getIdToken(true);
            setAuthState({ status: "in", user, token });
          });
        }
      } else {
        setAuthState({ status: "out" });
      }
    });
  }, []);

  const signInWithGoogle = async () => {
    await firebase.auth().signInWithPopup(provider);
  };
  const signUpWithEmailAndPassword = async (formData) => {
    const data = await firebase
      .auth()
      .createUserWithEmailAndPassword(formData.email, formData.password);

    if (data.additionalUserInfo.isNewUser) {
      const variables = {
        userId: data.user.uid,
        name: formData.name,
        username: formData.username,
        email: data.user.email,
        bio: "",
        website: "",
        phoneNumber: "",
        profileImage: pp,
      };
      const newUser = await createUsers({ variables });
      console.log(newUser);
    }
  };

  const signOut = async () => {
    setAuthState({ status: "loading" });
    await firebase.auth().signOut();
    setAuthState({ status: "out" });
  };

  if (authState.status === "loading") {
    return null;
  } else {
    return (
      <AuthContext.Provider
        value={{
          authState,
          signInWithGoogle,
          signOut,
          signUpWithEmailAndPassword,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }
}
