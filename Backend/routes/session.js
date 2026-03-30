const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase.js");

//create session
router.post("/create", async (req, res) => {
  const { mentor_id, role } = req.body;

  // ✅ PASTE HERE
  if (role !== "mentor") {
    return res.status(403).json({ error: "Only mentor can create session" });
  }

  const { data, error } = await supabase
    .from("sessions")
    .insert([
      {
        mentor_id,
        status: "active",
      },
    ])
    .select();

  if (error) return res.status(400).json({ error: error.message });

  res.json(data[0]);
});




// Join session
router.post("/join", async (req, res) => {
  const { session_id, student_id } = req.body;

  const { data, error } = await supabase
    .from("sessions")
    .update({ student_id })
    .eq("id", session_id)
    .select();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data[0]);
});









// End session
router.post("/end", async (req, res) => {
  const { session_id } = req.body;

  const { data, error } = await supabase
    .from("sessions")
    .update({ status: "ended" })
    .eq("id", session_id)
    .select();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data[0]);
});









router.get("/messages/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});
module.exports=router