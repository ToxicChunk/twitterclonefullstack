#this code was written to solve an error regarding the initial table structure
import sqlite3

conn = sqlite3.connect('twitter.db')
cursor = conn.cursor()

cursor.execute('DROP TABLE IF EXISTS posts')
cursor.execute('''
CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
)
''')
conn.commit()
conn.close()
print("✅ 'posts' table reset successfully.")
