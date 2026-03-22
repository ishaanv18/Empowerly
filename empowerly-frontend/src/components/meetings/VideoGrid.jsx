import React, { useRef, useEffect } from 'react';
import './VideoGrid.css';

const VideoTile = ({ stream, userName, isLocal, isMuted, isVideoOff }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="video-tile">
            {isVideoOff ? (
                <div className="video-placeholder">
                    <div className="avatar-large">{userName?.charAt(0)?.toUpperCase() || '?'}</div>
                </div>
            ) : (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={isLocal}
                    className="video-element"
                />
            )}
            <div className="video-overlay">
                <span className="participant-name">{userName} {isLocal && '(You)'}</span>
                {isMuted && <span className="muted-indicator">🔇</span>}
            </div>
        </div>
    );
};

const VideoGrid = ({ participants, localStream, remoteStreams }) => {
    const getGridClass = () => {
        const total = participants.length;
        if (total <= 1) return 'grid-1';
        if (total <= 4) return 'grid-4';
        if (total <= 9) return 'grid-9';
        return 'grid-16';
    };

    return (
        <div className={`video-grid ${getGridClass()}`}>
            {/* Local video */}
            {localStream && (
                <VideoTile
                    stream={localStream.stream}
                    userName={localStream.userName}
                    isLocal={true}
                    isMuted={localStream.isMuted}
                    isVideoOff={localStream.isVideoOff}
                />
            )}

            {/* Remote videos */}
            {participants.map((participant) => {
                const remoteStream = remoteStreams.get(participant.userId);
                return (
                    <VideoTile
                        key={participant.userId}
                        stream={remoteStream?.stream}
                        userName={participant.userName}
                        isLocal={false}
                        isMuted={remoteStream?.isMuted}
                        isVideoOff={remoteStream?.isVideoOff || !remoteStream}
                    />
                );
            })}
        </div>
    );
};

export default VideoGrid;
