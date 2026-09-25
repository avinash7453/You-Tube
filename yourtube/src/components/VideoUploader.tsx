import axiosInstance from '@/lib/axiosinstance';
import { Check, FileVideo, Upload, X } from 'lucide-react';
import React, { ChangeEvent, useRef, useState } from 'react';
import { toast } from 'sonner';

const VideoUploader = ({ channelId, channelName }: any) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoTitle, setVideoTitle] = useState("");
    const [uploadComplete, setUploadComplete] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlefilechange = (e: ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (fileList && fileList.length > 0) {
            const selectedFile = fileList[0];
            if (!selectedFile.type.startsWith("video/")) {
                toast.error("Please upload a valid video file.");
                return;
            }
            if (selectedFile.size > 100 * 1024 * 1024) {
                toast.error("File size exceeds 100 MB limit.");
                return;
            }
            setVideoFile(selectedFile);
            const filename = selectedFile.name.replace(/\.[^/.]+$/, "");
            if (!videoTitle) {
                setVideoTitle(filename);
            }
        }
    };

    const resetForm = () => {
        setVideoFile(null);
        setVideoTitle("");
        setIsUploading(false);
        setUploadProgress(0);
        setUploadComplete(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const cancelupload = () => {
        if (isUploading) {
            toast.error("Your video upload will be cancelled.");
        }
        resetForm();
    };

    const handleUpload = async () => {
        if (!videoFile || !videoTitle.trim()) {
            toast.error("Please select a video file and enter a title.");
            return;
        }

        const formdata = new FormData();
        formdata.append("video", videoFile, videoFile.name);
        formdata.append("videotitle", videoTitle.trim());
        formdata.append("videochannel", channelName || "My Channel");
        formdata.append("uploader", String(channelId || "guest"));

        try {
            setIsUploading(true);
            setUploadProgress(0);

            await axiosInstance.post("/video/upload", formdata, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent: any) => {
                    if (!progressEvent.total) return;
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(Math.min(progress, 100));
                },
            });

            toast.success("Video uploaded successfully.");
            setUploadComplete(true);
            setTimeout(() => resetForm(), 1200);
        } catch (error: any) {
            console.error("Error uploading video:", error);
            const message = error?.response?.data?.message || "Error uploading video. Please try again.";
            toast.error(message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-6 border border-border rounded-xl bg-card text-card-foreground max-w-xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Upload a video</h2>
            <div>
                {!videoFile ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                    >
                        <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                        <p className="text-sm font-medium">Drag and drop video files to upload</p>
                        <p className="text-xs text-muted-foreground mt-1">or click to select files</p>
                        <p className="text-xs text-muted-foreground mt-2">MP4, WebM, MOV or AVI</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="video/*"
                            className="hidden"
                            onChange={handlefilechange}
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border border-border p-4 rounded-lg bg-background">
                            <div className="flex items-center gap-3">
                                <FileVideo className="w-8 h-8 text-primary" />
                                <div>
                                    <p className="text-sm font-medium truncate max-w-[240px]">{videoFile.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>

                            {!isUploading && !uploadComplete && (
                                <button
                                    onClick={cancelupload}
                                    className="p-1 hover:bg-muted rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            )}

                            {uploadComplete && (
                                <div className="p-1 bg-green-500/10 rounded-full text-green-500">
                                    <Check className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                        <div>
                            <div>
                                <label htmlFor='title'>Title</label>
                                <input id="title" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm mt-1" />
                            </div>
                        </div>
                        {isUploading && (
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>uploading...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <progress value={uploadProgress} max="100" className="w-full" />
                            </div>
                        )}
                        <div className="flex justify-end gap-2">
                            {!uploadComplete && (
                                <>
                                    <button onClick={cancelupload} className="px-4 py-2 border rounded-md text-sm">
                                        cancel
                                    </button>
                                    <button onClick={handleUpload} disabled={isUploading} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm disabled:opacity-50">
                                        {isUploading ? "Uploading..." : "Upload"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoUploader;