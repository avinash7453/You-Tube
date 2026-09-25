import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "./firebase";
import axiosInstance from "./axiosinstance";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [User, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getDeviceId = () => {
        const key = "yourtube_device_id";
        const existing = localStorage.getItem(key);
        if (existing) return existing;
        const created = crypto.randomUUID();
        localStorage.setItem(key, created);
        return created;
    };

    const getRegion = () =>
        Intl.DateTimeFormat().resolvedOptions().timeZone || navigator.language || "unknown";

    const applyTheme = (theme) => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        document.documentElement.style.colorScheme = theme;
    };

    const defaultLoginTheme = () => {
        const parts = new Intl.DateTimeFormat("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            hourCycle: "h23",
        }).formatToParts(new Date());
        const hour = Number(parts.find((part) => part.type === "hour")?.value);
        return hour >= 10 && hour < 12 ? "light" : "dark";
    };

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
        applyTheme(userdata.theme || defaultLoginTheme());
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
                image: firebaseuser.photoURL || "https://github.com/shadcn.png",
                deviceId: getDeviceId(),
                region: getRegion(),
            };
            
            const response = await axiosInstance.post("/user/login", payload);
            if (response.data.requiresOtp) {
                const otp = window.prompt("Enter the verification code sent to your email");
                if (!otp) throw new Error("Login verification was cancelled");
                const verified = await axiosInstance.post("/user/verify-otp", {
                    userId: response.data.userId,
                    otp,
                });
                login(verified.data.result);
            } else {
                login(response.data.result);
            }
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
                        image: firebaseuser.photoURL || "https://github.com/shadcn.png",
                        deviceId: getDeviceId(),
                        region: getRegion(),
                    };
                    const response = await axiosInstance.post("/user/login", payload);
                    if (response.data.requiresOtp) {
                        const otp = window.prompt("Enter the verification code sent to your email");
                        if (!otp) throw new Error("Login verification was cancelled");
                        const verified = await axiosInstance.post("/user/verify-otp", {
                            userId: response.data.userId,
                            otp,
                        });
                        login(verified.data.result);
                    } else {
                        login(response.data.result);
                    }
                } catch (error) {
                    console.error(error);
                    await logout();
                }
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                applyTheme(parsed.theme || defaultLoginTheme());
            } catch {}
        } else {
            applyTheme(defaultLoginTheme());
        }
    }, []);

    return (
        <UserContext.Provider value={{ User, user: User, loading, login, logout, handlegooglesignin }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);