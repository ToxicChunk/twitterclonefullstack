from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
import hashlib

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

DB_FILE = os.path.join(os.path.dirname(__file__), 'twitter.db')

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# -- sign up user --
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    password_hash = hash_password(password)
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
    if user:
        return jsonify({'error': 'Username already exists'}), 409

    conn.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, password_hash))
    conn.commit()
    conn.close()
    return jsonify({'message': 'User created'}), 201

# -- log in user --
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    password_hash = hash_password(password)
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
    conn.close()
    if user and user['password'] == password_hash:
        return jsonify({'message': 'Login successful'}), 200
    elif user:
        return jsonify({'error': 'Incorrect password'}), 401
    else:
        return jsonify({'error': 'User not found'}), 404

# -- post a tweet --
@app.route('/posts', methods=['POST'])
def create_post():
    data = request.get_json()
    content = data.get('content', '')
    if not content:
        return jsonify({'error': 'Post content is required'}), 400
    conn = get_db_connection()
    conn.execute('INSERT INTO posts (content) VALUES (?)', (content,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Post created'}), 201

# -- get all posts --
@app.route('/posts', methods=['GET'])
def get_posts():
    conn = get_db_connection()
    posts = conn.execute('SELECT * FROM posts ORDER BY id DESC').fetchall()
    conn.close()
    return jsonify([dict(post) for post in posts])

# -- search tweets --
@app.route('/search/tweets')
def search_tweets():
    q = request.args.get('q', '')
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM posts WHERE content LIKE ?", ('%' + q + '%',)).fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

# -- search users --
@app.route('/search/users')
def search_users():
    q = request.args.get('q', '')
    conn = get_db_connection()
    rows = conn.execute("SELECT id, username FROM users WHERE username LIKE ?", ('%' + q + '%',)).fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

# -- follow user --
@app.route('/follow', methods=['POST'])
def follow():
    data = request.get_json()
    follower_id = data.get('follower_id')
    followee_id = data.get('followee_id')
    conn = get_db_connection()
    try:
        conn.execute('INSERT INTO followers (follower_id, followee_id) VALUES (?, ?)', (follower_id, followee_id))
        conn.commit()
        return jsonify({'message': 'Followed'}), 201
    except:
        return jsonify({'error': 'Already following or invalid'}), 400
    finally:
        conn.close()

# -- get followers for a user --
@app.route('/followers/<int:user_id>')
def get_followers(user_id):
    conn = get_db_connection()
    rows = conn.execute('''
        SELECT u.id, u.username
        FROM users u
        JOIN followers f ON u.id = f.follower_id
        WHERE f.followee_id = ?
    ''', (user_id,)).fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

if __name__ == '__main__':
    app.run(debug=True)