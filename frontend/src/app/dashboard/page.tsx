// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";

// export default function Dashboard() {
//   const router = useRouter();

//   useEffect(() => {
//     const token = localStorage.getItem("token");

//     if (!token) {
//       router.push("/auth/login");
//     }
//   }, []);

//   return <div>Dashboard (Protected) ✅</div>;
// }


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedRole) setRole(storedRole);
  }, []);

  // ✅ CREATE SESSION (MENTOR)
  const createSession = async () => {
    if (!user) return;

    const res = await fetch("http://localhost:5000/api/session/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mentor_id: user.id, role }),
    });

    const data = await res.json();

    router.push(`/session/${data.id}`);
  };

  // ✅ JOIN SESSION (STUDENT)
  const joinSession = () => {
    if (!sessionId) return;

    router.push(`/session/${sessionId}`);
  };

  return (
    <div className="p-10">
      <h2 className="text-xl font-bold mb-4">Dashboard ✅</h2>

      {/* 👨‍🏫 MENTOR VIEW */}
      {role === "mentor" && (
        <div>
          <h3 className="mb-2">Mentor Panel</h3>
          <button
            onClick={createSession}
            className="bg-blue-500 text-white px-4 py-2"
          >
            Create Session
          </button>
        </div>
      )}

      {/* 👨‍🎓 STUDENT VIEW */}
      {role === "student" && (
        <div>
          <h3 className="mb-2">Student Panel</h3>

          <input
            className="border p-2 mr-2"
            placeholder="Enter Session ID"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
          />

          <button
            onClick={joinSession}
            className="bg-green-500 text-white px-4 py-2"
          >
            Join Session
          </button>
        </div>
      )}
    </div>
  );
}