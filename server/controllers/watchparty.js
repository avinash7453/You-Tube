import crypto from "crypto";

const rooms = new Map();

const getRoom = (roomId) => rooms.get(roomId);
const pruneParticipants = (room) => {
    const cutoff = Date.now() - 30_000;
    room.participants = room.participants.filter((participant) => participant.lastSeen > cutoff);
};

export const createParty = (req, res) => {
    const { videoId, videoPath, hostId, name } = req.body;
    if (!videoId || !hostId) return res.status(400).json({ message: "Video and host are required" });
    const roomId = crypto.randomBytes(5).toString("hex");
    rooms.set(roomId, {
        roomId,
        videoId,
        videoPath,
        hostId,
        playing: false,
        currentTime: 0,
        updatedAt: Date.now(),
        participants: [{ id: hostId, name: name || "Host", muted: false, cameraOn: false, lastSeen: Date.now() }],
        messages: [],
    });
    return res.status(201).json({ roomId });
};

export const joinParty = (req, res) => {
    const room = getRoom(req.params.roomId);
    const { userId, name } = req.body;
    if (!room) return res.status(404).json({ message: "Watch party not found or expired" });
    if (!userId) return res.status(400).json({ message: "User is required" });
    pruneParticipants(room);
    const participant = room.participants.find((entry) => entry.id === userId);
    if (participant) {
        participant.lastSeen = Date.now();
    } else {
        room.participants.push({ id: userId, name: name || "Guest", muted: false, cameraOn: false, lastSeen: Date.now() });
    }
    return res.status(200).json(room);
};

export const getParty = (req, res) => {
    const room = getRoom(req.params.roomId);
    if (!room) return res.status(404).json({ message: "Watch party not found or expired" });
    pruneParticipants(room);
    return res.status(200).json(room);
};

export const updateParty = (req, res) => {
    const room = getRoom(req.params.roomId);
    const { userId, playing, currentTime } = req.body;
    if (!room) return res.status(404).json({ message: "Watch party not found or expired" });
    if (userId !== room.hostId) return res.status(403).json({ message: "Only the host controls playback" });
    room.playing = Boolean(playing);
    room.currentTime = Number.isFinite(Number(currentTime)) ? Number(currentTime) : room.currentTime;
    room.updatedAt = Date.now();
    return res.status(200).json(room);
};

export const heartbeat = (req, res) => {
    const room = getRoom(req.params.roomId);
    const { userId, muted, cameraOn } = req.body;
    if (!room) return res.status(404).json({ message: "Watch party not found or expired" });
    const participant = room.participants.find((entry) => entry.id === userId);
    if (!participant) return res.status(404).json({ message: "Participant is not in this party" });
    Object.assign(participant, { muted: Boolean(muted), cameraOn: Boolean(cameraOn), lastSeen: Date.now() });
    return res.status(204).send();
};

export const postMessage = (req, res) => {
    const room = getRoom(req.params.roomId);
    const { userId, name, text } = req.body;
    if (!room) return res.status(404).json({ message: "Watch party not found or expired" });
    if (!text?.trim()) return res.status(400).json({ message: "Message is required" });
    if (!room.participants.some((entry) => entry.id === userId)) return res.status(403).json({ message: "Join the party first" });
    room.messages.push({ id: crypto.randomUUID(), userId, name: name || "Guest", text: text.trim().slice(0, 500), createdAt: new Date().toISOString() });
    room.messages = room.messages.slice(-100);
    return res.status(201).json(room.messages[room.messages.length - 1]);
};
