const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "crown-data.json");
// ---- Settings you can tweak ----
const STEAL_SUCCESS_CHANCE = 0.5; // 50/50
const STEAL_COOLDOWN_SECONDS = 30; // per-user cooldown on !steal attempts
// ---------------------------------
// Load or initialize persistent state
function loadState() {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  }
  return { king: null, lastCrowned: null, cooldowns: {} };
}
function saveState(state) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
}
let state = loadState();
app.get("/", (req, res) => {
  res.send("Crown bot is running.");
});
// GET /king -> reports current king
app.get("/king", (req, res) => {
  if (!state.king) {
    return res.send("The throne is empty! Type !steal to claim the crown.");
  }
  res.send(`This user @${state.king} has the crown!`);
});
// GET /steal?user=NAME -> attempt to steal the crown
app.get("/steal", (req, res) => {
  const user = (req.query.user || "").trim();
  if (!user) {
    return res.send("Couldn't identify who's trying to steal the crown.");
  }
  // Can't steal from yourself
  if (state.king && state.king.toLowerCase() === user.toLowerCase()) {
    return res.send(`@${user} already has the crown, you can't steal from yourself!`);
  }
  // Cooldown check
  const now = Date.now();
  const lastAttempt = state.cooldowns[user.toLowerCase()];
  if (lastAttempt && now - lastAttempt < STEAL_COOLDOWN_SECONDS * 1000) {
    const remaining = Math.ceil((STEAL_COOLDOWN_SECONDS * 1000 - (now - lastAttempt)) / 1000);
    return res.send(`@${user} you need to wait ${remaining}s before trying to steal the crown again!`);
  }
  state.cooldowns[user.toLowerCase()] = now;
  // 50/50 roll
  const success = Math.random() < STEAL_SUCCESS_CHANCE;
  if (success) {
    state.king = user;
    state.lastCrowned = now;
    saveState(state);
    return res.send(`@${user} has stolen the crown, they're the new king! Crown`);
  } else {
    saveState(state);
    return res.send(`@${user} tried to steal the crown but failed! The crown remains safe.`);
  }
});
// Optional: manually set the king (useful for testing or mod override)
app.get("/setking", (req, res) => {
  const user = (req.query.user || "").trim();
  if (!user) return res.send("Missing ?user=");
  state.king = user;
  saveState(state);
  res.send(`Crown manually set to @${user}.`);
});
app.listen(PORT, () => {
  console.log(`Crown bot listening on port ${PORT}`);
});
