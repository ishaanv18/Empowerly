import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { meetingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import webrtcService from '../../services/webrtc';
import socketService from '../../services/socket';
import VideoGrid from './VideoGrid';
import MeetingControls from './MeetingControls';
import MeetingChat from './MeetingChat';
import ParticipantPanel from './ParticipantPanel';
import RecordRTC from 'recordrtc';
import './MeetingRoom.css';

const MeetingRoom = () => {
    const { meetingId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showNotification } = useNotification();

    const [meeting, setMeeting] = useState(null);
    const [loading, setLoading] = useState(true);
    const [participants, setParticipants] = useState([]);
    const [remoteStreams, setRemoteStreams] = useState(new Map());

    // Media states
    const [localStream, setLocalStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    // UI states
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isParticipantsOpen, setIsParticipantsOpen] = useState(true);
    const [chatMessages, setChatMessages] = useState([]);
    const [meetingParticipants, setMeetingParticipants] = useState([]);

    // Timer states
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [meetingEndTime, setMeetingEndTime] = useState(null);
    const timerRef = useRef(null);

    // Recording
    const [isRecording, setIsRecording] = useState(false);
    const recorderRef = useRef(null);

    useEffect(() => {
        initializeMeeting();
        return () => cleanup();
    }, [meetingId]);

    const initializeMeeting = async () => {
        try {
            // Fetch meeting details
            const response = await meetingAPI.getById(meetingId);
            setMeeting(response.data);
            setMeetingParticipants(response.data.participants || []);

            // Calculate meeting end time from NOW (when joining)
            const now = new Date();
            const duration = response.data.duration || 15; // default 15 minutes
            const endTime = new Date(now.getTime() + duration * 60000);
            setMeetingEndTime(endTime);

            // Start countdown timer
            startTimer(endTime);

            // Join meeting
            await meetingAPI.join(meetingId);

            // Get user media
            const stream = await webrtcService.getUserMedia();
            setLocalStream(stream);

            // Connect to WebSocket
            socketService.connect(
                meetingId,
                () => onSocketConnected(),
                (error) => console.error('Socket error:', error)
            );

        } catch (error) {
            console.error('Error initializing meeting:', error);
            showNotification('Failed to join meeting', 'error');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const startTimer = (endTime) => {
        if (timerRef.current) clearInterval(timerRef.current);

        const updateTimer = () => {
            const now = new Date();
            const remaining = endTime - now;

            if (remaining <= 0) {
                setTimeRemaining(0);
                clearInterval(timerRef.current);
                // Auto-end meeting
                handleEndMeeting(true);
            } else {
                setTimeRemaining(remaining);
            }
        };

        updateTimer();
        timerRef.current = setInterval(updateTimer, 1000);
    };

    const formatTime = (milliseconds) => {
        if (!milliseconds || milliseconds <= 0) return '00:00';
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const onSocketConnected = () => {
        // Subscribe to meeting events
        socketService.subscribeTo(`/topic/meeting/${meetingId}/offer`, handleOffer);
        socketService.subscribeTo(`/topic/meeting/${meetingId}/answer`, handleAnswer);
        socketService.subscribeTo(`/topic/meeting/${meetingId}/ice-candidate`, handleIceCandidate);
        socketService.subscribeTo(`/topic/meeting/${meetingId}/join`, handleUserJoined);
        socketService.subscribeTo(`/topic/meeting/${meetingId}/leave`, handleUserLeft);
        socketService.subscribeTo(`/topic/meeting/${meetingId}/chat`, handleChatMessage);

        // Broadcast join
        socketService.broadcastJoin(meetingId, user.id, user.name);
    };

    const handleUserJoined = (data) => {
        if (data.userId === user.id) return;

        console.log('User joined:', data.userName);
        setParticipants(prev => [...prev, { userId: data.userId, userName: data.userName }]);

        // Create peer connection (initiator)
        const peer = webrtcService.createPeer(
            data.userId,
            true,
            localStream,
            (signal) => {
                socketService.sendOffer(meetingId, signal, data.userId);
            },
            (remoteStream) => {
                setRemoteStreams(prev => new Map(prev).set(data.userId, {
                    stream: remoteStream,
                    isMuted: false,
                    isVideoOff: false,
                }));
            },
            () => {
                setRemoteStreams(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(data.userId);
                    return newMap;
                });
            }
        );
    };

    const handleOffer = (data) => {
        if (data.targetUserId !== user.id) return;

        console.log('Received offer');

        // Create peer connection (not initiator)
        const peer = webrtcService.createPeer(
            data.userId,
            false,
            localStream,
            (signal) => {
                socketService.sendAnswer(meetingId, signal, data.userId);
            },
            (remoteStream) => {
                setRemoteStreams(prev => new Map(prev).set(data.userId, {
                    stream: remoteStream,
                    isMuted: false,
                    isVideoOff: false,
                }));
            },
            () => {
                setRemoteStreams(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(data.userId);
                    return newMap;
                });
            }
        );

        webrtcService.signalPeer(data.userId, data.offer);
    };

    const handleAnswer = (data) => {
        if (data.targetUserId !== user.id) return;
        console.log('Received answer');
        webrtcService.signalPeer(data.userId, data.answer);
    };

    const handleIceCandidate = (data) => {
        if (data.targetUserId !== user.id) return;
        webrtcService.signalPeer(data.userId, data.candidate);
    };

    const handleUserLeft = (data) => {
        console.log('User left:', data.userId);
        setParticipants(prev => prev.filter(p => p.userId !== data.userId));
        webrtcService.removePeer(data.userId);
        setRemoteStreams(prev => {
            const newMap = new Map(prev);
            newMap.delete(data.userId);
            return newMap;
        });
    };

    const handleChatMessage = (data) => {
        setChatMessages(prev => [...prev, data]);
    };

    const handleToggleMute = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                if (isMuted) {
                    // Unmute - enable the track
                    audioTrack.enabled = true;
                } else {
                    // Mute - disable the track
                    audioTrack.enabled = false;
                }
                setIsMuted(!isMuted);
                console.log('Audio:', isMuted ? 'UNMUTED' : 'MUTED');
            }
        }
    };

    const handleToggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                if (isVideoOff) {
                    // Turn on - enable the track
                    videoTrack.enabled = true;
                } else {
                    // Turn off - disable the track
                    videoTrack.enabled = false;
                }
                setIsVideoOff(!isVideoOff);
                console.log('Video:', isVideoOff ? 'ON' : 'OFF');
            }
        }
    };

    const handleToggleScreenShare = async () => {
        try {
            if (isScreenSharing) {
                webrtcService.stopScreenShare();
                await webrtcService.replaceVideoTrack(false);
                setIsScreenSharing(false);
            } else {
                await webrtcService.getScreenStream();
                await webrtcService.replaceVideoTrack(true);
                setIsScreenSharing(true);
            }
        } catch (error) {
            console.error('Screen share error:', error);
        }
    };

    const handleToggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const startRecording = () => {
        if (!localStream) return;

        recorderRef.current = new RecordRTC(localStream, {
            type: 'video',
            mimeType: 'video/webm',
        });

        recorderRef.current.startRecording();
        setIsRecording(true);
    };

    const stopRecording = () => {
        if (!recorderRef.current) return;

        recorderRef.current.stopRecording(() => {
            const blob = recorderRef.current.getBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `meeting-${meetingId}-${Date.now()}.webm`;
            a.click();
            setIsRecording(false);
        });
    };

    const handleSendMessage = (message) => {
        socketService.sendChatMessage(meetingId, message, user.name);
    };

    const handleInviteParticipants = async (userIds) => {
        try {
            await meetingAPI.invite(meetingId, userIds);
            // Refresh meeting details to get updated participants
            const response = await meetingAPI.getById(meetingId);
            setMeetingParticipants(response.data.participants || []);
            showNotification('Participants invited successfully!', 'success');
        } catch (error) {
            console.error('Error inviting participants:', error);
            showNotification('Failed to invite participants', 'error');
        }
    };

    const handleEndMeeting = async (isAutoEnd = false) => {
        try {
            if (timerRef.current) clearInterval(timerRef.current);

            if (isAutoEnd) {
                showNotification('Meeting time has expired. The meeting will now end.', 'warning');
            }

            await meetingAPI.end(meetingId);
            socketService.disconnect();
            webrtcService.cleanup();
            if (recorderRef.current && isRecording) {
                recorderRef.current.stopRecording();
            }
            navigate('/dashboard/employee');
        } catch (error) {
            console.error('End meeting error:', error);
            // Still navigate away even if API call fails
            navigate('/dashboard/employee');
        }
    };

    const handleLeaveMeeting = async () => {
        try {
            await meetingAPI.leave(meetingId);
            socketService.broadcastLeave(meetingId, user.id);
            socketService.disconnect();
            webrtcService.cleanup();
            if (recorderRef.current && isRecording) {
                recorderRef.current.stopRecording();
            }
        } catch (error) {
            console.error('Leave error:', error);
        }
        navigate('/dashboard/employee');
    };

    const handleEndMeetingForAll = async () => {
        if (meeting?.hostId !== user?.id) {
            showNotification('Only the host can end the meeting for everyone', 'warning');
            return;
        }

        if (confirm('Are you sure you want to end this meeting for everyone?')) {
            try {
                await meetingAPI.end(meetingId);
                socketService.disconnect();
                webrtcService.cleanup();
                navigate('/dashboard/employee');
            } catch (error) {
                console.error('End meeting error:', error);
            }
        }
    };

    const cleanup = async () => {
        try {
            await meetingAPI.leave(meetingId);
            socketService.broadcastLeave(meetingId, user.id);
            socketService.disconnect();
            webrtcService.cleanup();
            if (recorderRef.current && isRecording) {
                recorderRef.current.stopRecording();
            }
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    };

    if (loading) {
        return (
            <div className="meeting-room-loading">
                <h2>Joining meeting...</h2>
            </div>
        );
    }

    return (
        <div className="meeting-room-container">
            <div className="meeting-room-header">
                <div className="meeting-brand">
                    <h1 className="brand-name">Empowerly Connect</h1>
                </div>
                <div className="meeting-info">
                    <h2>{meeting?.title}</h2>
                    <p>{meeting?.description}</p>
                </div>
                {timeRemaining !== null && (
                    <div className="meeting-timer">
                        <span className="timer-icon">⏱️</span>
                        <span className="timer-value" style={{
                            color: timeRemaining < 60000 ? '#ef4444' : timeRemaining < 300000 ? '#f59e0b' : '#10b981'
                        }}>
                            {formatTime(timeRemaining)}
                        </span>
                        <span className="timer-label">remaining</span>
                    </div>
                )}
                <button
                    className="participants-toggle-btn"
                    onClick={() => setIsParticipantsOpen(!isParticipantsOpen)}
                >
                    👥 Participants ({meetingParticipants.length})
                </button>
            </div>

            <div className="meeting-room-main">
                <div className="video-section">
                    <VideoGrid
                        participants={participants}
                        localStream={{
                            stream: localStream,
                            userName: user?.name,
                            isMuted,
                            isVideoOff,
                        }}
                        remoteStreams={remoteStreams}
                    />
                </div>

                {isChatOpen && (
                    <div className="chat-section">
                        <MeetingChat
                            messages={chatMessages}
                            onSendMessage={handleSendMessage}
                            userName={user?.name}
                        />
                    </div>
                )}

                {isParticipantsOpen && (
                    <div className="participants-section">
                        <ParticipantPanel
                            participants={meetingParticipants}
                            meetingId={meetingId}
                            onInviteParticipants={handleInviteParticipants}
                        />
                    </div>
                )}
            </div>

            <MeetingControls
                isMuted={isMuted}
                isVideoOff={isVideoOff}
                isScreenSharing={isScreenSharing}
                isRecording={isRecording}
                isChatOpen={isChatOpen}
                isHost={meeting?.hostId === user?.id}
                onToggleMute={handleToggleMute}
                onToggleVideo={handleToggleVideo}
                onToggleScreenShare={handleToggleScreenShare}
                onToggleRecording={handleToggleRecording}
                onToggleChat={() => setIsChatOpen(!isChatOpen)}
                onLeaveMeeting={handleLeaveMeeting}
                onEndMeetingForAll={handleEndMeetingForAll}
            />
        </div>
    );
};

export default MeetingRoom;
