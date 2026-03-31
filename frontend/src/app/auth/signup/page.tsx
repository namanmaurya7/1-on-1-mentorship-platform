"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const handleSignup = async () => {
    const res = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    alert("Signup successful ✅");

    router.push("/auth/login"); // 👉 go to login
  };

  return (
    <div className="p-10 flex flex-col gap-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold">Signup</h2>

      <input
        className="border p-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border p-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <select
        className="border p-2"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="student">Student</option>
        <option value="mentor">Mentor</option>
      </select>

      <button
        onClick={handleSignup}
        className="bg-blue-500 text-white p-2"
      >
        Signup
      </button>

      <p>
  Already have account?{" "}
  <span
    className="text-blue-500 cursor-pointer"
    onClick={() => router.push("/auth/login")}
  >
    Login
  </span>
</p>
    </div>
  );
}