import React, { useState } from 'react';

const Avatar = ({ children }: { children: React.ReactNode }) => (
    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary overflow-hidden border">
        {children}
    </div>
);

const ChannelHeader = ({ channel, user }: { channel: any; user: any }) => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const channelName = channel?.channelname || channel?.name || "Channel";
    
    // Check if the current logged-in user is the owner of this channel
    const isOwner = user && user.id === channel.id;

    return (
        <div className="w-full bg-card border-b border-border py-6 px-4 md:px-8">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                
                {/* Channel Info Section */}
                <div className="flex items-center gap-5">
                    <Avatar>
                        <span>{channel.channelname ? channel.channelname[0].toUpperCase() : "C"}</span>
                    </Avatar>
                    
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-foreground">{channelName}</h1>
                        <p className="text-sm text-muted-foreground">
                            @{channelName.toLowerCase().replace(/\s+/g, "")} • 1.2K subscribers • 10 videos
                        </p>
                        {channel.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 max-w-xl">
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
                            className={`px-5 py-2 rounded-full font-medium transition-colors ${
                                isSubscribed 
                                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" 
                                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                            }`}
                        >
                            {isSubscribed ? "Subscribed" : "Subscribe"}
                        </button>
                    ) : (
                        <button className="px-5 py-2 rounded-full font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
                            Customize Channel
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ChannelHeader;