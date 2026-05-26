// ─── VideoCallModal.jsx ──────────────────────────────────────────────────────
import React, { useEffect, useRef, useState } from "react";
import {
  Mic, MicOff, Video, VideoOff, Phone, Monitor,
  MonitorOff, Loader2,
} from "lucide-react";

const VideoCallModal = ({
  isOpen,
  onClose,
  callType,
  freelancer,   // { _id, name, photo } — the OTHER person
  socket,
  incomingOffer, // { from, offer } — if receiver
  peerId,        // OTHER person's userId string
  callerName,    // my own name — to show to receiver
}) => {
  const localRef        = useRef(null);
  const remoteRef       = useRef(null);
  const pcRef           = useRef(null);
  const localStreamRef  = useRef(null);
  const screenStreamRef = useRef(null);

  const [status,   setStatus]   = useState("connecting");
  const [micOn,    setMicOn]    = useState(true);
  const [camOn,    setCamOn]    = useState(callType === "video");
  const [screenOn, setScreenOn] = useState(false);
  const [duration, setDuration] = useState(0);
  const durationRef             = useRef(null);

  const iceServers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  // ── Who to send signaling to ──────────────────────────────────────────────
  // Caller: peerId = receiver's userId
  // Receiver: incomingOffer.from = caller's userId
  const signalingTarget = incomingOffer ? incomingOffer.from : peerId;

  useEffect(() => {
    if (!isOpen) return;
    initCall();
    return () => cleanup();
  }, [isOpen]);

  const initCall = async () => {
    try {
      const constraints = {
        audio: true,
        video: callType === "video" ? { width: 1280, height: 720 } : false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      if (localRef.current) localRef.current.srcObject = stream;

      const pc = new RTCPeerConnection(iceServers);
      pcRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (e) => {
        if (remoteRef.current) {
          remoteRef.current.srcObject = e.streams[0];
          setStatus("connected");
          startTimer();
        }
      };

      pc.onicecandidate = (e) => {
        if (e.candidate && socket) {
          socket.emit("ice_candidate", { to: signalingTarget, candidate: e.candidate });
        }
      };

      if (!incomingOffer) {
        // ── CALLER ──────────────────────────────────────────────────────────
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket?.emit("call_user", {
          to:         peerId,
          offer,
          callType,
          callerName: callerName || "Unknown", // ← real name
        });
      } else {
        // ── RECEIVER ─────────────────────────────────────────────────────────
        await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket?.emit("call_answer", {
          to:     incomingOffer.from, // ← back to caller, not peerId
          answer,
        });
      }

      socket?.on("call_answered", async ({ answer }) => {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket?.on("ice_candidate", async ({ candidate }) => {
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
      });

      socket?.on("call_ended", () => {
        setStatus("ended");
        cleanup();
        onClose();
      });

    } catch (err) {
      console.error("Call init error:", err);
      setStatus("ended");
    }
  };

  const startTimer = () => {
    durationRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
  };

  const cleanup = () => {
    clearInterval(durationRef.current);
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    pcRef.current           = null;
    localStreamRef.current  = null;
    screenStreamRef.current = null;
  };

  const handleEndCall = () => {
    try { socket?.emit("end_call", { to: signalingTarget }); } catch {}
    cleanup();
    setStatus("ended");
    setTimeout(() => onClose(), 100);
  };

  const toggleMic = () => {
    const t = localStreamRef.current?.getAudioTracks()[0];
    if (t) { t.enabled = !t.enabled; setMicOn(t.enabled); }
  };

  const toggleCam = () => {
    const t = localStreamRef.current?.getVideoTracks()[0];
    if (t) { t.enabled = !t.enabled; setCamOn(t.enabled); }
  };

  const toggleScreen = async () => {
    if (screenOn) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      const videoTrack = localStreamRef.current?.getVideoTracks()[0];
      if (videoTrack && pcRef.current) {
        const sender = pcRef.current.getSenders().find((s) => s.track?.kind === "video");
        if (sender) await sender.replaceTrack(videoTrack);
      }
      if (localRef.current) localRef.current.srcObject = localStreamRef.current;
      setScreenOn(false);
      socket?.emit("screen_share_stopped", { to: signalingTarget });
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];
        if (pcRef.current) {
          const sender = pcRef.current.getSenders().find((s) => s.track?.kind === "video");
          if (sender) await sender.replaceTrack(screenTrack);
        }
        if (localRef.current) localRef.current.srcObject = screenStream;
        screenTrack.onended = () => toggleScreen();
        setScreenOn(true);
        socket?.emit("screen_share_started", { to: signalingTarget });
      } catch {}
    }
  };

  const formatDuration = (s) => {
    const m   = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-950/95 flex flex-col items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center">

        {status === "connecting" ? (
          <div className="flex flex-col items-center gap-4 text-white">
            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-teal-400" />
            </div>
            <p className="text-lg font-semibold">
              {incomingOffer ? "Connecting..." : `Calling ${freelancer?.name}...`}
            </p>
            <p className="text-sm text-gray-400">{callType === "video" ? "Video" : "Voice"} call</p>
          </div>
        ) : (
          <video ref={remoteRef} autoPlay playsInline className="w-full h-full object-cover" />
        )}

        {/* Local PIP */}
        {callType === "video" && (
          <div className="absolute bottom-24 right-6 w-36 h-24 rounded-2xl overflow-hidden border-2 border-gray-700 shadow-xl">
            <video ref={localRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            {!camOn && (
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                <VideoOff size={20} className="text-gray-400" />
              </div>
            )}
          </div>
        )}

        {/* Duration */}
        {status === "connected" && (
          <div className="absolute top-5 left-5 bg-black/40 backdrop-blur-sm rounded-2xl px-4 py-2 text-white">
            <p className="font-semibold text-sm">{freelancer?.name}</p>
            <p className="text-xs text-green-400">{formatDuration(duration)}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-4 pb-10 pt-6 bg-gradient-to-t from-gray-950">
        <button onClick={toggleMic}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
            micOn ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"
          }`}>
          {micOn ? <Mic size={18} /> : <MicOff size={18} />}
        </button>

        {callType === "video" && (
          <button onClick={toggleCam}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
              camOn ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"
            }`}>
            {camOn ? <Video size={18} /> : <VideoOff size={18} />}
          </button>
        )}

        {callType === "video" && (
          <button onClick={toggleScreen} title="Screen share"
            className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
              screenOn ? "bg-teal-600 hover:bg-teal-700 text-white" : "bg-gray-700 hover:bg-gray-600 text-white"
            }`}>
            {screenOn ? <MonitorOff size={18} /> : <Monitor size={18} />}
          </button>
        )}

        <button onClick={handleEndCall} title="End call"
          className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition shadow-lg">
          <Phone size={20} className="rotate-[135deg]" />
        </button>
      </div>
    </div>
  );
};

export default VideoCallModal;