"use client";

import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function SessionPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Start coding...");
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  //..
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  //..
  const startCall = async () => {
    const offer = await peerRef.current?.createOffer();
    await peerRef.current?.setLocalDescription(offer);

    socketRef.current?.emit("offer", {
      offer,
      sessionId: id,
    });
  };

  const endCall = () => {
    console.log("❌ Ending call");

    // 🛑 stop camera & mic
    localStreamRef.current?.getTracks().forEach((track) => track.stop());

    // 🛑 clear video
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // 🛑 close peer connection
    peerRef.current?.close();
    peerRef.current = null;
  };

  //mic on/off
  const toggleMic = () => {
    if (!localStreamRef.current) return;

    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsMicOn(track.enabled);
    });
  };

  //camera on/off
  const toggleCamera = () => {
    if (!localStreamRef.current) return;

    localStreamRef.current.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsCameraOn(track.enabled);
    });
  };

  // ✅ get user safely
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const sendMessage = () => {
    if (!input) return;

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      console.log("No user found");
      return;
    }

    const user = JSON.parse(storedUser);

    socketRef.current?.emit("send-message", {
      sessionId: id,
      senderId: user.id,
      content: input,
    });
    console.log("📨 Sending message from:", user.id);

    setInput("");
  };

  // ✅ create socket ONLY ONCE
  useEffect(() => {
    socketRef.current = io("http://localhost:5000", {
      transports: ["websocket"],
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // ✅ join session + listen

  useEffect(() => {
    if (!id || !socketRef.current) return;

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);

      socket.emit("join-session", id);
      console.log("🚀 Joined session:", id);
    });

    socket.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("code-update", (newCode) => {
      setCode(newCode);
    });
    //..
    // 📩 receive offer
    socket.on("offer", async (offer) => {
      await peerRef.current?.setRemoteDescription(offer);

      const answer = await peerRef.current?.createAnswer();
      await peerRef.current?.setLocalDescription(answer);

      socket.emit("answer", { answer, sessionId: id });
    });

    // 📩 receive answer
    socket.on("answer", async (answer) => {
      await peerRef.current?.setRemoteDescription(answer);
    });

    // 📩 receive ICE
    socket.on("ice-candidate", async (candidate) => {
      await peerRef.current?.addIceCandidate(candidate);
    });

    socket.on("user-disconnected", () => {
      console.log("⚠️ Other user left");

      // clear remote video
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    socket.on("connect", () => {
      console.log("✅ Reconnected:", socket.id);

      socket.emit("join-session", id);
    });
    //;
    socket.on("user-disconnected", () => {
      setMessages((prev) => [
        ...prev,
        { content: "User left the session", system: true },
      ]);
    });

    return () => {
      socket.off("connect");
      socket.off("receive-message");
      socket.off("code-update");
    };
  }, [id]);

  // ✅ 👉 PASTE YOUR NEW useEffect HERE
  useEffect(() => {
    if (!id) return;

    const fetchMessages = async () => {
      const res = await fetch(
        `http://localhost:5000/api/session/messages/${id}`,
      );
      const data = await res.json();

      console.log("📦 Messages API:", data);

      setMessages(Array.isArray(data) ? data : []);
    };

    fetchMessages();
  }, [id]);
  useEffect(() => {
    console.log("📦 Messages:", messages);
  }, [messages]);
  //..
  useEffect(() => {
    const startMedia = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // create peer
      peerRef.current = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      // add tracks
      stream.getTracks().forEach((track) => {
        peerRef.current?.addTrack(track, stream);
      });

      // receive remote stream
      peerRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // send ICE candidates
      peerRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current?.emit("ice-candidate", {
            candidate: event.candidate,
            sessionId: id,
          });
        }
      };
    };

    startMedia();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      socketRef.current?.disconnect();

      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        alert("Session expired");

        router.push("/dashboard");
      },
      60 * 60 * 1000,
    ); // 1 hour

    return () => clearTimeout(timer);
  }, []);

  const timeoutRef = useRef<any>(null);

  const handleChange = (value: string | undefined) => {
    setCode(value || "");

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("code-change", {
        sessionId: id,
        code: value,
      });
    }, 300);
  };

  return (
    <div className="h-screen flex flex-col bg-[#1e1f25] text-gray-200">
      {/* 🔝 HEADER */}
      <div className="flex justify-between items-center px-6 py-3 bg-[#2a2b32] border-b border-gray-700 shadow">
        <h2 className="font-semibold text-lg tracking-wide">
          🚀 Session: <span className="text-indigo-400">{id}</span>
        </h2>

        <select
          className="bg-[#1e1f25] border border-gray-600 px-3 py-1 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
      </div>

      {/* 🔥 MAIN */}
      <div className="flex flex-1 overflow-hidden">
        {/* 💻 LEFT */}
        <div className="w-2/3 flex flex-col p-5 gap-5">
          {/* EDITOR */}
          <div className="flex-[2] bg-[#25262d] rounded-xl shadow-lg border border-gray-700 overflow-hidden">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={handleChange}
            />
          </div>

          {/* 🎥 VIDEO */}
          <div className="flex gap-4 justify-center">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className="w-48 h-32 rounded-lg border border-gray-600 shadow bg-black object-cover"
            />
            <video
              ref={remoteVideoRef}
              autoPlay
              className="w-48 h-32 rounded-lg border border-gray-600 shadow bg-black object-cover"
            />
          </div>

          {/* 🎛️ CONTROLS */}
          <div className="flex gap-3 flex-wrap justify-center">
            <button
              onClick={startCall}
              className="bg-green-500 hover:bg-green-600 transition text-white px-5 py-2 rounded-lg shadow"
            >
              ▶ Start
            </button>

            <button
              onClick={endCall}
              className="bg-red-500 hover:bg-red-600 transition text-white px-5 py-2 rounded-lg shadow"
            >
              ⛔ End
            </button>

            <button
              onClick={toggleMic}
              className="bg-yellow-500 hover:bg-yellow-600 transition text-black px-5 py-2 rounded-lg shadow"
            >
              {isMicOn ? "🎤 Mic ON" : "🔇 Mic OFF"}
            </button>

            <button
              onClick={toggleCamera}
              className="bg-blue-500 hover:bg-blue-600 transition text-white px-5 py-2 rounded-lg shadow"
            >
              {isCameraOn ? "📷 Camera ON" : "🚫 Camera OFF"}
            </button>
          </div>
        </div>

        {/* 💬 RIGHT CHAT */}
        <div className="w-1/3 flex flex-col bg-[#2a2b32] border-l border-gray-700">
          {/* HEADER */}
          <div className="p-4 font-semibold border-b border-gray-700 bg-[#25262d]">
            💬 Chat
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {(messages || []).map((msg, i) => (
              <div key={i}>
                {msg.system ? (
                  <div className="text-center text-gray-400 text-sm italic">
                    {msg.content}
                  </div>
                ) : (
                  <div
                    className={`flex ${
                      msg.sender_id === currentUser?.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-xl text-sm shadow ${
                        msg.sender_id === currentUser?.id
                          ? "bg-indigo-500 text-white"
                          : "bg-[#1e1f25] border border-gray-600 text-gray-200"
                      }`}
                    >
                      <div className="text-xs mb-1 opacity-70">
                        {msg.sender_id === currentUser?.id ? "You" : "Other"}
                       
                      </div>

                      <div>{msg.content}</div>

                      <div className="text-[10px] mt-1 opacity-60">
                        {new Date(msg.created_at).toLocaleTimeString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* INPUT */}
          <div className="p-3 border-t border-gray-700 flex gap-2 bg-[#25262d]">
            <input
              className="flex-1 bg-[#1e1f25] border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type message..."
            />
            <button
              onClick={sendMessage}
              className="bg-indigo-500 hover:bg-indigo-600 transition text-white px-4 py-2 rounded-lg shadow"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

//  <div className="h-screen">
//       <h2 className="p-2 bg-gray-200">Session ID: {id}</h2>
//       <select onChange={(e) => setLanguage(e.target.value)}>
//         <option value="javascript">JavaScript</option>
//         <option value="python">Python</option>
//       </select>
//       <Editor
//         height="100%"
//         language={language}
//         value={code}
//         onChange={handleChange}
//       />

//       <div className="h-1/3 border-t p-2">
//         <div className="h-40 overflow-y-auto border mb-2 p-2">
//           {(messages || []).map((msg, i) => (
//             <div key={i}>
//               {msg.system ? (
//                 <div className="text-center text-gray-500 italic">
//                   {msg.content}
//                 </div>
//               ) : (
//                 <div
//                   className={`p-1 ${
//                     msg.sender_id === currentUser?.id
//                       ? "text-right text-blue-600"
//                       : "text-left text-green-600"
//                   }`}
//                 >
//                   <b>{msg.sender_id === currentUser?.id ? "You" : "Other"}:</b>{" "}
//                   {msg.content}
//                   <div className="text-xs text-gray-500">
//                     {new Date(msg.created_at).toLocaleTimeString("en-IN", {
//                       timeZone: "Asia/Kolkata",
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>

//         <div className="flex gap-2">
//           <input
//             className="border p-2 flex-1"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             placeholder="Type message..."
//           />
//           <button onClick={sendMessage} className="bg-blue-500 text-white px-4">
//             Send
//           </button>
//         </div>
//       </div>
//       {/* klklklk */}
//       <div className="flex gap-4">
//         <video ref={localVideoRef} autoPlay muted className="w-1/2" />
//         <video ref={remoteVideoRef} autoPlay className="w-1/2" />
//       </div>

//       <div className="flex gap-4 mt-2 flex-wrap">
//         <button
//           onClick={startCall}
//           className="bg-green-500 text-white px-4 py-2"
//         >
//           Start Call
//         </button>

//         <button onClick={endCall} className="bg-red-500 text-white px-4 py-2">
//           End Call
//         </button>

//         <button
//           onClick={toggleMic}
//           className="bg-yellow-500 text-white px-4 py-2"
//         >
//           {isMicOn ? "Mic ON 🎤" : "Mic OFF 🔇"}
//         </button>

//         <button
//           onClick={toggleCamera}
//           className="bg-purple-500 text-white px-4 py-2"
//         >
//           {isCameraOn ? "Camera ON 📷" : "Camera OFF 🚫"}
//         </button>
//       </div>
//     </div>
