import mongoose from "mongoose";
import users from "../Modals/Auth.js";

export const login = async (req, res) => {
    const { email, name, image } = req.body;
    try {
        const existinguser = await users.findOne({ email });
        if (!existinguser) {
            try {
                const newuser = await users.create({ email, name, image });
                return res.status(200).json({ result: newuser });
            } catch (error) {
                return res.status(500).json({ message: "something went wrong" });
            }
        } else {
            return res.status(200).json({ result: existinguser });
        }
    } catch (error) {
        return res.status(500).json({ message: "something went wrong" });
    }
};

export const updateprofile = async (req, res) => {
    const { id } = req.params;
    const { channelname, description } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            message: "user unavailable"
        });
    }
    
    try {
        const updatedata = await users.findByIdAndUpdate(
            id, 
            {
                $set: {
                    channelname: channelname,
                    description: description,
                },
            },
            { new: true }
        );
        
        if (!updatedata) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ result: updatedata });
    } catch (error) {
         console.error(error);
         return res.status(500).json({ message: "something went wrong" });
    }
};