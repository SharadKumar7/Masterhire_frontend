// ─── useWorkspaceSocket.js ────────────────────────────────────────────────────
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { BASE_URL, getToken } from "./Shared";

const SOCKET_URL = BASE_URL.replace("/workspace", "");

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      auth:              { token: getToken() },
      transports:        ["websocket"],
      reconnection:      true,
      reconnectionDelay: 1000,
    });
  }
  return socketInstance;
};

export const useWorkspaceSocket = ({ projectId, freelancerId, onSwitchToMessages }) => {
  const socketRef                       = useRef(null);
  const [incomingCall, setIncomingCall] = useState(null);

  // ── Connect socket immediately — no wait for freelancerId ─────────────────
  useEffect(() => {
    if (!projectId) return;

    const socket      = getSocket();
    socketRef.current = socket;

    // Join room immediately
    socket.emit("join_room", projectId);

    const handleIncoming = ({ from, offer, callType, callerName }) => {
      setIncomingCall({ from, offer, callType, callerName });
      onSwitchToMessages?.();
    };

    const handleMissed  = () => setIncomingCall(null);
    const handleEnded   = () => setIncomingCall(null);

    socket.on("incoming_call", handleIncoming);
    socket.on("call_missed",   handleMissed);
    socket.on("call_ended",    handleEnded);

    return () => {
      socket.off("incoming_call", handleIncoming);
      socket.off("call_missed",   handleMissed);
      socket.off("call_ended",    handleEnded);
    };
  }, [projectId]); // ← only projectId, no freelancerId dependency

  const clearIncomingCall = () => setIncomingCall(null);

  return { socketRef, incomingCall, clearIncomingCall };
};