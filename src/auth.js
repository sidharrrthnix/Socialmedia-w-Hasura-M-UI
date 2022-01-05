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
  apiKey: "AIzaSyBerHiaxFNGl3ZA94FWCPW7ptrdU2PaA9o",
  authDomain: "instar-12.firebaseapp.com",
  projectId: "instar-12",
  storageBucket: "instar-12.appspot.com",
  messagingSenderId: "1083840487432",
  appId: "1:1083840487432:web:4cac31b01a1ad8f0b1b1bd",
  databaseURL: "https://instar-12-default-rtdb.firebaseio.com/",
});

function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({ status: "loading" });
  const [createUser] = useMutation(CREATE_USER);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(async (user) => {
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
          console.log("refreshing", metadataRef);
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

  async function loginInWithGoogle() {
    const data = await firebase.auth().signInWithPopup(provider);
    console.log("google-oauth", data);
    if (data?.additionalUserInfo?.isNewUser) {
      const { uid, displayName, email, photoURL } = data.user;
      const username = `${displayName.replace(/\s+/g, "")}${uid.slice(-5)}`;

      const newGmailUser = await createUser({
        variables: {
          userId: uid,
          name: displayName,
          username,
          email,
          bio: "",
          website: "",
          phoneNumber: "",
          profileImage: photoURL,
        },
      });
      console.log("gmailuser", newGmailUser);
    }
  }
  async function loginWithEmailAndPassword(email, password) {
    const data = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password);
    console.log(data);
    return data;
  }

  async function signUpWithEmailAndPassword(formData) {
    const result = await firebase
      .auth()
      .createUserWithEmailAndPassword(formData.email, formData.password);

    if (result?.additionalUserInfo?.isNewUser) {
      // const variable = {
      //   userId: result.user.uid,
      //   name: formData.name,
      //   username: formData.username,
      //   email: result.user.email,
      //   bio: "default bio",
      //   website: "sid12.com",
      //   phoneNumber: "7375392384",
      //   profileImage: pp,
      // };
      const newUser = await createUser({
        variables: {
          userId: result.user.uid,
          name: formData.name,
          username: formData.username,
          email: result.user.email,
          bio: "",
          website: "",
          phoneNumber: "",
          profileImage: pp,
        },
      });
      console.log("newUser", newUser);
    }
  }
  async function updateEmail(email) {
    await authState.user.updateEmail(email);
  }

  async function signOut() {
    setAuthState({ status: "loading" });
    await firebase.auth().signOut();
    setAuthState({ status: "out" });
  }

  if (authState.status === "loading") {
    return null;
  } else {
    return (
      <AuthContext.Provider
        value={{
          authState,
          loginInWithGoogle,
          signOut,
          signUpWithEmailAndPassword,
          loginWithEmailAndPassword,
          updateEmail,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }
}
export default AuthProvider;
