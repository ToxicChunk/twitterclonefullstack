import React, { useState, useEffect } from 'react';

function App() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);

  const API = 'http://127.0.0.1:5000';

  const fetchPosts = async () => {
    const res = await fetch(`${API}/posts`);
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSignup = async () => {
    if (!username || !password) return alert("⚠️ Fill in both username and password.");
    const res = await fetch(`${API}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.status === 201) {
      setLoggedInUser({ username });
      alert("✅ Account created & logged in!");
    } else if (res.status === 409) {
      alert("⚠️ Username already exists. Please log in.");
    } else {
      alert("❌ Signup failed: " + data.error);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) return alert("⚠️ Fill in both fields.");
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.status === 200) {
      setLoggedInUser({ username });
      alert("✅ Logged in successfully! ");
    } else {
      alert("❌ Login failed: " + data.error);
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setUsername('');
    setPassword('');
    alert("👋 Logged out.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || !loggedInUser) return alert("⚠️ You must be logged in to post.");
    const res = await fetch(`${API}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newPost })
    });
    const data = await res.json();
    if (res.ok) {
      alert("✅ Tweet posted!");
      setNewPost('');
      fetchPosts();
    } else {
      alert("❌ Failed to post: " + data.error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/search/tweets?q=${encodeURIComponent(searchQuery)}`);
    const data = await res.json();
    setSearchResults(data);
  };

  const handleUserSearch = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/search/users?q=${encodeURIComponent(userQuery)}`);
    const data = await res.json();
    setUserResults(data);
  };

  const handleFollow = async (targetId) => {
    const userRes = await fetch(`${API}/search/users?q=${encodeURIComponent(loggedInUser.username)}`);
    const userData = await userRes.json();
    const followerId = userData[0]?.id;
    if (followerId === targetId) return alert("🚫 You cannot follow yourself :( 🚫");

    const res = await fetch(`${API}/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ follower_id: followerId, followee_id: targetId })
    });
    const data = await res.json();
    if (res.ok) alert("✅ Followed!");
    else alert("❌ Failed: " + data.error);
  };

  return (
    <div style={{ width: '500px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <h1>🧵 Twitter Lite</h1>

      {!loggedInUser && (
        <div>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
          />
          <button onClick={handleSignup}>Sign Up</button>
          <button onClick={handleLogin} style={{ marginLeft: '10px' }}>Log In</button>
        </div>
      )}

      {loggedInUser && (
        <div>
          <p>👤 Logged in as <strong>@{loggedInUser.username}</strong></p>
          <button onClick={handleLogout}>Log out</button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="What's happening?"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          style={{ width: '100%', padding: '10px', marginTop: '15px' }}
        />
        <button type="submit">Tweet</button>
      </form>

      <form onSubmit={handleSearch}>
        <input
          placeholder="Search tweets"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '10px', marginTop: '20px' }}
        />
        <button type="submit">Search Tweets</button>
      </form>

      {searchResults.length > 0 && (
        <div>
          <h3>📃 Search Results</h3>
          {searchResults.map(post => (
            <div key={post.id} style={{ border: '1px solid #ccc', margin: '8px 0', padding: '8px' }}>
              {post.content}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleUserSearch}>
        <input
          placeholder="Search users"
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          style={{ width: '100%', padding: '10px', marginTop: '20px' }}
        />
        <button type="submit">Search Users</button>
      </form>

      {userResults.length > 0 && (
        <div>
          <h3>👥 User Results</h3>
          {userResults.map(user => (
            <div key={user.id}>
              @{user.username}
              {loggedInUser && (
                <button onClick={() => handleFollow(user.id)} style={{ marginLeft: '10px' }}>
                  Follow
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div>
        <h3>📰 All Tweets</h3>
        {posts.map(post => (
          <div key={post.id} style={{ borderBottom: '1px solid #ccc', padding: '10px' }}>
            {post.content}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
