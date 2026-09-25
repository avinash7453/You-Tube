import React, { useState } from 'react';

const Avatar = ({ children }: { children: React.ReactNode }) => (
    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-400 text-3xl font-bold text-white shadow-lg ring-2 ring-violet-100">
        {children}
    </div>
);

const ChannelHeader = ({ channel, user }: { channel: any; user: any }) => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const channelName = channel?.channelname || channel?.name || "Channel";
    
    // Check if the current logged-in user is the owner of this channel
    const isOwner = user && user.id === channel.id;

    return (
        <div className="relative w-full overflow-hidden border-b border-border bg-white px-4 pb-7 pt-20 md:px-8">
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 opacity-95" />
            <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,.35),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(255,255,255,.25),transparent_28%)]" />
            <div className="relative mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 md:flex-row md:items-end">
                
                {/* Channel Info Section */}
                <div className="flex items-center gap-4 md:gap-5">
                    <Avatar>
                        <span>{channel.channelname ? channel.channelname[0].toUpperCase() : "C"}</span>
                    </Avatar>
                    
                    <div className="space-y-1">
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{channelName}</h1>
                        <p className="text-sm text-muted-foreground">
                            @{channelName.toLowerCase().replace(/\s+/g, "")} <span className="mx-1">•</span> 1.2K subscribers <span className="mx-1">•</span> 10 videos
                        </p>
                        {channel.description && (
                            <p className="max-w-xl text-sm text-muted-foreground line-clamp-2">
                                {channel.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    {!isOwner ? (
                        <button 
                            onClick={() => setIsSubscribed(!isSubscribed)}
                            className={`rounded-full px-6 py-2.5 font-semibold shadow-sm transition-colors ${
                                isSubscribed 
                                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" 
                                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                            }`}
                        >
                            {isSubscribed ? "Subscribed" : "Subscribe"}
                        </button>
                    ) : (
                        <button className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 font-semibold text-white shadow-md shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-lg">
                            Customize channel
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ChannelHeader;