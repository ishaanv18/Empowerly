import React from 'react';
import './MeetingControls.css';

const MeetingControls = ({
    isMuted,
    isVideoOff,
    isScreenSharing,
    isRecording,
    isChatOpen,
    isHost,
    onToggleMute,
    onToggleVideo,
    onToggleScreenShare,
    onToggleRecording,
    onToggleChat,
    onLeaveMeeting,
    onEndMeetingForAll,
}) => {
    return (
        <div className="meeting-controls">
            <div className="controls-group">
                <button
                    className={`control-btn ${isMuted ? 'active' : ''}`}
                    onClick={onToggleMute}
                    title={isMuted ? 'Unmute' : 'Mute'}
                >
                    {isMuted ? '🔇' : '🎤'}
                    <span className="control-label">{isMuted ? 'Unmute' : 'Mute'}</span>
                </button>

                <button
                    className={`control-btn ${isVideoOff ? 'active' : ''}`}
                    onClick={onToggleVideo}
                    title={isVideoOff ? 'Start Video' : 'Stop Video'}
                >
                    {isVideoOff ? '📹' : '🎥'}
                    <span className="control-label">{isVideoOff ? 'Start Video' : 'Stop Video'}</span>
                </button>

                <button
                    className={`control-btn ${isScreenSharing ? 'active' : ''}`}
                    onClick={onToggleScreenShare}
                    title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                >
                    🖥️
                    <span className="control-label">{isScreenSharing ? 'Stop Share' : 'Share'}</span>
                </button>

                <button
                    className={`control-btn ${isChatOpen ? 'active' : ''}`}
                    onClick={onToggleChat}
                    title="Chat"
                >
                    💬
                    <span className="control-label">Chat</span>
                </button>

                <button
                    className={`control-btn ${isRecording ? 'recording' : ''}`}
                    onClick={onToggleRecording}
                    title={isRecording ? 'Stop Recording' : 'Start Recording'}
                >
                    {isRecording ? '⏹️' : '⏺️'}
                    <span className="control-label">{isRecording ? 'Stop Rec' : 'Record'}</span>
                </button>
            </div>

            <div className="controls-group">
                <button
                    className="control-btn leave-btn"
                    onClick={onLeaveMeeting}
                    title="Leave Meeting"
                >
                    🚪
                    <span className="control-label">Leave</span>
                </button>

                {isHost && (
                    <button
                        className="control-btn end-btn"
                        onClick={onEndMeetingForAll}
                        title="End Meeting for Everyone"
                    >
                        ⛔
                        <span className="control-label">End for All</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default MeetingControls;
