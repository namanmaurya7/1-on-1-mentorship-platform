const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase.js");


router.post("/signup", async (req, res) => {
  const { email, password, role } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const user = data.user;

  // ✅ IMPORTANT: check user exists
  if (!user) {
    return res.status(400).json({ error: "User not created" });
  }

  // ✅ Insert role into users table
  const { error: dbError } = await supabase.from("users").insert([
    {
      id: user.id,
      email,
      role,
    },
  ]);

  if (dbError) {
    return res.status(400).json({ error: dbError.message });
  }

  res.json({ message: "Signup successful", user });
});

  





router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const user = data.user;

  // Get role from DB
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  res.json({
    user,
    //role: userData.role,
    role: userData ? userData.role : null,
    session: data.session,
  });
});

module.exports = router;