import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import axiosInstance from '@/lib/axiosinstance'; // Added 'from' here
import { useUser } from '@/lib/AuthContext';
import { useRouter } from 'next/router';

const Channeldialogue = ({ isopen, onclose, channeldata, mode }: any) => {
    const { User, login } = useUser();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "", description: ""
    });
    const [isSubmitting, setisSubmitting] = useState(false);

    useEffect(() => {
        if (channeldata && mode === "edit") {
            setFormData({
                name: channeldata.channelname || channeldata.name || "",
                description: channeldata.description || ""
            });
        } else {
            setFormData({
                name: User?.name || "",
                description: ""
            });
        }
    }, [channeldata, mode, User]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlesubmit = async (e: FormEvent) => {
        e.preventDefault();
        const payload = {
            channelname: formData.name,
            description: formData.description,
        };
        const userId = User?._id || User?.id;

        if (!userId) {
            return;
        }

        try {
            setisSubmitting(true);
            const response = await axiosInstance.patch(`/user/update/${userId}`, payload);
            login(response.data.result);
            router.push(`/channel/${userId}`);
            setFormData({
                name: "",
                description: "",
            });
            onclose();
        } catch (error) {
            console.error("Error updating channel:", error);
        } finally {
            setisSubmitting(false);
        }
    };

    return (
        <Dialog open={isopen} onOpenChange={onclose}>
            <DialogContent className="sm:max-w-md bg-white p-6 rounded-lg shadow-lg">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        {mode === "create" ? "Create your channel" : "Edit your channel"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handlesubmit} id="channel-form" className="space-y-4">
                    <div className="space-y-1">
                        <label htmlFor='name' className="block text-sm font-medium text-gray-700">
                            Channel name
                        </label>
                        <input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor='description' className="block text-sm font-medium text-gray-700">
                            Channel Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>
                </form>

                <DialogFooter className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onclose}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type='submit'
                        form="channel-form"
                        disabled={isSubmitting}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {isSubmitting ? "Saving..." : mode === "create" ? "Create channel" : "Save changes"}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default Channeldialogue;