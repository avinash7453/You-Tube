import video from "../Modals/video.js";
export const uploadVideo = async (req, res) => {
    if (req.file === undefined) {
       return res.status(404).json({ message: "upload mp4 file only" });
    }else{
        try {
            const file = new video({
                videotitle: req.body.videotitle,
                filename: req.file.originalname, 
                filepath: req.file.path,
                filetype: req.file.mimetype,
                filesize: req.file.size,
                videochannel: req.body.videochannel,
                uploader: req.body.uploader
            });
            await file.save();
            res.status(200).json({ message: "file uploaded successfully" });
        }
        catch (error) {
            console.error("Error saving video:", error);
            res.status(500).json({ message: "Error saving video" });
        }
    }   
};
export const getVideos = async (req, res) => {
    try {
        const files = await video.find();
       return res.status(200).send(files);
    } catch (error) {
        console.error("Error fetching videos:", error);
        res.status(500).json({ message: "Error fetching videos" });
    }
};
