import React, { createContext, useContext, useEffect, useState } from "react";
import { getRedirectResult, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import axios from "axios";
import { toast } from "sonner";
import { auth, provider } from "./firebase";
import axiosInstance from "./axiosinstance";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [User, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [signInLoading, setSignInLoading] = useState(false);

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
        setSignInLoading(true);
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Popup sign-in error:", error);
            setSignInLoading(false);
            toast.error(
                error?.code === "auth/unauthorized-domain"
                    ? "This domain is not authorized for Firebase sign-in. Add it to Firebase Authentication's authorized domains."
                    : error?.message || "Google sign-in could not be completed."
            );
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseuser) => {
            setSignInLoading(false);
            if (firebaseuser) {
                setLoading(true);
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
                    setUser(null);
                    localStorage.removeItem("user");
                    if (axios.isAxiosError(error) && !error.response) {
                        toast.error("Could not reach the backend. Check NEXT_PUBLIC_BACKEND_URL and confirm your backend service is running.");
                    } else if (axios.isAxiosError(error)) {
                        const responseMessage = error.response?.data?.message;
                        if (error.response?.status === 503 && responseMessage === "Email OTP delivery is not configured") {
                            toast.error("Sign-in needs email verification, but OTP email is not configured on the backend.");
                        } else {
                            toast.error(
                                responseMessage ||
                                `Backend sign-in failed${error.response?.status ? ` (HTTP ${error.response.status})` : ""}.`
                            );
                        }
                    } else {
                        toast.error(error?.message || "Sign-in could not be completed.");
                    }
                    try {
                        await signOut(auth);
                    } catch (signOutError) {
                        console.error("Unable to clear Firebase sign-in after backend failure:", signOutError);
                    }
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        });

        getRedirectResult(auth).catch((error) => {
            console.error("Google sign-in redirect failed:", error);
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
        <UserContext.Provider value={{ User, user: User, loading, signInLoading, login, logout, handlegooglesignin }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);