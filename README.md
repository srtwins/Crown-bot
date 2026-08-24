# Crown Bot (!steal / !king) — StreamElements Setup

This is a tiny backend that gives StreamElements a way to run your "king of the hill"
crown game. StreamElements' built-in commands can't remember who the king is or
roll random odds on their own, so this server does that part, and StreamElements
just calls it and posts whatever it says back to chat.

## 1. Deploy the server

You need to host `server.js` somewhere it gets a public URL. Easiest free options:

- **Render.com** — New → Web Service → connect/upload this folder → Build command
  `npm install`, Start command `npm start`.
- **Railway.app** — New Project → Deploy from folder/GitHub → it auto-detects Node.
- **Glitch.com** — Import/upload this folder, it runs automatically.

Once deployed, you'll get a URL like `https://your-app-name.onrender.com`.
Test it by visiting `https://your-app-name.onrender.com/king` in a browser —
it should say "The throne is empty!".

> Note: free tiers on some hosts "sleep" after inactivity, which can cause the
> first command after a while to respond slowly. If that's an issue, Railway's
> free tier tends to stay warmer than Render's.

## 2. Set up the commands in StreamElements

Go to your **StreamElements Dashboard → Chatbot → Commands → Add Command**.

### `!steal`
- **Command:** `!steal`
- **Cooldown:** whatever you'd like as a floor (the server also enforces its own
  30s per-user cooldown, adjustable in `server.js`)
- **Response:**
  ```
  $(customapi.https://your-app-name.onrender.com/steal?user=$(user))
  ```

### `!king`
- **Command:** `!king`
- **Response:**
  ```
  $(customapi.https://your-app-name.onrender.com/king)
  ```

Replace `your-app-name.onrender.com` with your actual deployed URL in both.

## 3. How it behaves

- `!steal` — 50/50 chance. Win: you become king. Lose: crown stays put.
- Can't steal the crown if you already have it.
- 30-second cooldown per user on steal attempts (change `STEAL_COOLDOWN_SECONDS`
  in `server.js`).
- `!king` — reports who currently holds the crown, or says the throne is empty
  if no one has claimed it yet.
- State is saved to `crown-data.json` on the server, so it survives restarts
  (as long as your host keeps a persistent disk — Render/Railway free tiers do
  for the app's lifetime, but wipe on redeploy).

## 4. Tuning it

Open `server.js` and adjust these two lines near the top:

```js
const STEAL_SUCCESS_CHANCE = 0.5; // 0.3 = 30% success, 0.7 = 70% success, etc.
const STEAL_COOLDOWN_SECONDS = 30; // increase to slow the game down
```

## 5. Optional: manual override

Visiting `/setking?user=SomeName` on your deployed URL manually sets the king —
handy for testing or if you want to seed a starting king before going live.
