# Twitter Lite — Fullstack Clone Project

This is a fullstack mini Twitter clone built using React for the frontend and Flask for the backend. It supports user login, signup, tweeting, user search, tweet search, and following users (with logical constraints like preventing self-follow).

## Stack Used

- Frontend: React (vanilla, no framework)
- Backend: Python (Flask + SQLite)
- Styling: Basic inline CSS for now
- JSON data: Scraped tweet datasets loaded through scripts

---

## Features

- User login & signup with password hashing
- Prevent duplicate usernames and incorrect login attempts
- Post tweets, view all tweets (reverse chronological order)
- Search tweets by content
- Search users by username
- Follow/unfollow users (cannot follow yourself)
- Auto-load tweets from JSON 
- dummy password for scraped users: "twitter_scraped"
- Modular design — frontend/backend separation

---

## How to Run

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # or venv\Scripts\activate on Windows
pip install flask flask-cors
python init_db.py          # Creates database schema
python load_json.py        # Loads tweets into DB
python main.py             # Launches backend on http://127.0.0.1:5000


Frontend Setup
In the frontend/ directory, this is a plain React project. You can use something like create-react-app, vite, or any bundler — but if you're just running it manually:

cd frontend
npm install
npm start
That will run the frontend on http://localhost:3000 and connect to the Flask backend on http://127.0.0.1:5000.


Challenges & Fixes

1. User auth logic confusion
Initially, the login and signup logic were combined on the backend. This made it difficult to distinguish between valid logins and attempts to signup with existing usernames. I fixed this by separating the login/signup buttons and handling their conditions individually.

2. CORS & HTTP 500 issues
I encountered CORS errors and 500 server errors due to mismatched headers and unhandled exceptions. Fixed by:

Adding explicit error handling and CORS headers
Using OPTIONS response validation to troubleshoot preflight issues
3. Database schema mismatches
Early on, I got errors like no column named password or user_id missing in posts. These were due to stale or incorrectly initialized databases. I fixed this by explicitly running DROP TABLE IF EXISTS statements in init_db.py before creating tables again.

4. Broken tweet loading
The load_json.py script threw NOT NULL constraint failed because of missing password handling and a missing hashlib import. Adding dummy passwords for scraped users and importing hashlib fixed this.

