import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "./firebase";
import axiosInstance from "./axiosinstance";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [User, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem("user");
            }
        }
        setLoading(false);
    }, []);

    const login = (userdata) => {
        setUser(userdata);
        localStorage.setItem("user", JSON.stringify(userdata));
    };

    const logout = async () => {
        setUser(null);
        localStorage.removeItem("user");
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out from Firebase:", error);
        }
    };

    const handlegooglesignin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const firebaseuser = result.user;
            
            const payload = {
                email: firebaseuser.email,
                name: firebaseuser.displayName,
                image: firebaseuser.photoURL || "https://github.com/shadcn.png"
            };
            
            const response = await axiosInstance.post("/user/login", payload);
            login(response.data.result);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseuser) => {
            if (firebaseuser) {
                try {
                    const payload = {
                        email: firebaseuser.email,
                        name: firebaseuser.displayName,
                        image: firebaseuser.photoURL || "https://github.com/shadcn.png"
                    };
                    const response = await axiosInstance.post("/user/login", payload);
                    login(response.data.result);
                } catch (error) {
                    console.error(error);
                    await logout();
                }
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <UserContext.Provider value={{ User, user: User, loading, login, logout, handlegooglesignin }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);