import sqlite3
import json
import os
import hashlib

DB_FILE = os.path.join(os.path.dirname(__file__), 'twitter.db')
JSON_FILE = os.path.join(os.path.dirname(__file__), '../100.json')

#loads JSON data
with open(JSON_FILE, 'r', encoding='utf-8') as f:
    lines = f.read().splitlines()

conn = sqlite3.connect(DB_FILE)

for line in lines:
    try:
        tweet = json.loads(line)
        username = tweet['user']['username']
        content = tweet['content']

        #adding user if user doesn't exist
        user = conn.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
        if not user:
            dummy_password = "twitter_scraped"
            hashed = hashlib.sha256(dummy_password.encode()).hexdigest()
            conn.execute("INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)", (username, hashed))

            conn.commit()
            user_id = conn.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()[0]
        else:
            user_id = user[0]

        conn.execute("INSERT INTO posts (content, user_id) VALUES (?, ?)", (content, user_id))

    except Exception as e:
        print(f"Error on line: {line[:100]}... → {e}")

conn.commit()
conn.close()

print("Tweets loaded into DB!!!")

import sqlite3
conn = sqlite3.connect('twitter.db')
count = conn.execute('SELECT COUNT(*) FROM posts').fetchone()[0]
print(f'Total tweets: {count}')
conn.close()

