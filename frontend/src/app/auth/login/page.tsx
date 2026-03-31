// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const router = useRouter();

//   const handleLogin = async () => {
//     const res = await fetch("http://localhost:5000/api/auth/login", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ email, password }),
//     });

//     const data = await res.json();
//      if (data.error) {
//     alert(data.error);
//     return;
//   }

//     // ✅ SAVE TOKEN HERE
//     localStorage.setItem("token", data.session.access_token);
//     localStorage.setItem(
//   "user",
//   JSON.stringify({
//     ...data.user,
//     role: data.role,
//   })
// );

//     alert("Login successful!");

//     // Redirect to protected page
//     router.push("/dashboard");
//   };

//   return (
//     <div className="flex flex-col gap-4 p-10">
//       <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />

//       <input
//         type="password"
//         placeholder="Password"
//         onChange={(e) => setPassword(e.target.value)}
//       />

//       <button
//         style={{
//           backgroundColor: "black",
//           color: "white",
//           padding: "10px 18px",

//           borderRadius: "8px",

//           cursor: "pointer",
//         }}
//         onClick={handleLogin}
//       >
//         Login
//       </button>
//     </div>
//   );
// }



"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    // ✅ STORE DATA
    localStorage.setItem("token", data.session.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("role", data.role);

    alert("Login successful ✅");

    router.push("/dashboard");
  };

  return (
    <div className="p-10 flex flex-col gap-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold">Login</h2>

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

      <button
        onClick={handleLogin}
        className="bg-green-500 text-white p-2"
      >
        Login
      </button>


      <p>
  Don't have account?{" "}
  <span
    className="text-blue-500 cursor-pointer"
    onClick={() => router.push("/auth/signup")}
  >
    Signup
  </span>
</p>
    </div>
  );
}
