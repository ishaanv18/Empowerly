import Peer from 'simple-peer';

class WebRTCService {
    constructor() {
        this.peers = new Map(); // Map of userId -> Peer instance
        this.localStream = null;
        this.screenStream = null;
        this.isScreenSharing = false;
    }

    // Get user media (camera + microphone)
    async getUserMedia(constraints = { video: true, audio: true }) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.localStream = stream;
            return stream;
        } catch (error) {
            console.error('Error getting user media:', error);
            throw error;
        }
    }

    // Get screen sharing stream
    async getScreenStream() {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always',
                },
                audio: false,
            });

            this.screenStream = stream;
            this.isScreenSharing = true;

            // Listen for when user stops sharing via browser UI
            stream.getVideoTracks()[0].onended = () => {
                this.stopScreenShare();
            };

            return stream;
        } catch (error) {
            console.error('Error getting screen stream:', error);
            throw error;
        }
    }

    // Stop screen sharing
    stopScreenShare() {
        if (this.screenStream) {
            this.screenStream.getTracks().forEach((track) => track.stop());
            this.screenStream = null;
            this.isScreenSharing = false;
        }
    }

    // Create a peer connection
    createPeer(userId, initiator, stream, onSignal, onStream, onClose) {
        const peer = new Peer({
            initiator,
            trickle: true,
            stream,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                ],
            },
        });

        peer.on('signal', (signal) => {
            if (onSignal) onSignal(signal);
        });

        peer.on('stream', (remoteStream) => {
            if (onStream) onStream(remoteStream);
        });

        peer.on('close', () => {
            if (onClose) onClose();
            this.removePeer(userId);
        });

        peer.on('error', (err) => {
            console.error('Peer error:', err);
            this.removePeer(userId);
        });

        this.peers.set(userId, peer);
        return peer;
    }

    // Signal to existing peer
    signalPeer(userId, signal) {
        const peer = this.peers.get(userId);
        if (peer) {
            peer.signal(signal);
        }
    }

    // Remove peer
    removePeer(userId) {
        const peer = this.peers.get(userId);
        if (peer) {
            peer.destroy();
            this.peers.delete(userId);
        }
    }

    // Toggle audio
    toggleAudio() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                return audioTrack.enabled;
            }
        }
        return false;
    }

    // Toggle video
    toggleVideo() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                return videoTrack.enabled;
            }
        }
        return false;
    }

    // Replace video track with screen share
    async replaceVideoTrack(isScreenShare) {
        const stream = isScreenShare ? this.screenStream : this.localStream;
        const videoTrack = stream?.getVideoTracks()[0];

        if (videoTrack) {
            this.peers.forEach((peer) => {
                const sender = peer._pc
                    .getSenders()
                    .find((s) => s.track?.kind === 'video');
                if (sender) {
                    sender.replaceTrack(videoTrack);
                }
            });
        }
    }

    // Clean up all connections
    cleanup() {
        this.peers.forEach((peer) => peer.destroy());
        this.peers.clear();

        if (this.localStream) {
            this.localStream.getTracks().forEach((track) => track.stop());
            this.localStream = null;
        }

        if (this.screenStream) {
            this.screenStream.getTracks().forEach((track) => track.stop());
            this.screenStream = null;
        }

        this.isScreenSharing = false;
    }

    // Get all peer IDs
    getPeerIds() {
        return Array.from(this.peers.keys());
    }
}

export default new WebRTCService();
