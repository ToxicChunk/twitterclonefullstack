import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';

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
  const [darkMode, setDarkMode] = useState(false);

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
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.status === 200) {
      setLoggedInUser({ username });
      alert("✅ Logged in successfully!");
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

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const buttonStyle = {
    backgroundColor: '#1DA1F2',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '20px',
    cursor: 'pointer',
    marginTop: '10px'
  };

  const appBackground = darkMode ? '#15202B' : '#E8F5FD';
  const cardBackground = darkMode ? '#192734' : 'white';
  const textColor = darkMode ? 'white' : 'black';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: appBackground }}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div style={{
        width: '100%',
        maxWidth: '600px',
        margin: '30px auto',
        backgroundColor: cardBackground,
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        fontFamily: 'Arial, sans-serif',
        color: textColor
      }}>

        {/* Your login/signup area */}
        {!loggedInUser ? (
          <div>
            <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '5px' }} />
            <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '5px' }} />
            <div>
              <button onClick={handleSignup} style={buttonStyle}>Sign Up</button>
              <button onClick={handleLogin} style={{ ...buttonStyle, marginLeft: '10px' }}>Log In</button>
            </div>
          </div>
        ) : (
          <div>
            <p>👤 Logged in as <strong>@{loggedInUser.username}</strong></p>
            <button onClick={handleLogout} style={buttonStyle}>Log out</button>
            <button style={{ ...buttonStyle, backgroundColor: 'grey', marginLeft: '10px' }}>Profile (Coming Soon)</button>
          </div>
        )}

        {/* Tweet form */}
        {loggedInUser && (
          <form onSubmit={handleSubmit}>
            <textarea placeholder="What's happening?" value={newPost} onChange={(e) => setNewPost(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '15px' }} />
            <button type="submit" style={buttonStyle}>Tweet</button>
          </form>
        )}

        {/* Search and display tweets */}
        <form onSubmit={handleSearch}>
          <input placeholder="Search tweets" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '20px' }} />
          <button type="submit" style={buttonStyle}>Search Tweets</button>
        </form>

        {searchResults.length > 0 && (
          <div>
            <h3 style={{ marginTop: '30px' }}>📃 Search Results</h3>
            {searchResults.map(post => (
              <div key={post.id} style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '12px',
                marginTop: '12px',
                backgroundColor: darkMode ? '#253341' : '#f9f9f9'
              }}>
                {post.content}
              </div>
            ))}
          </div>
        )}

        {/* Search and display users */}
        <form onSubmit={handleUserSearch}>
          <input placeholder="Search users" value={userQuery} onChange={(e) => setUserQuery(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '20px' }} />
          <button type="submit" style={buttonStyle}>Search Users</button>
        </form>

        {userResults.length > 0 && (
          <div>
            <h3 style={{ marginTop: '30px' }}>👥 User Results</h3>
            {userResults.map(user => (
              <div key={user.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '10px',
                marginTop: '10px',
                backgroundColor: darkMode ? '#253341' : '#f1f1f1'
              }}>
                @{user.username}
                {loggedInUser && (
                  <button onClick={() => handleFollow(user.id)} style={buttonStyle}>Follow</button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* All Tweets */}
        <div>
          <h3 style={{ marginTop: '30px' }}>📰 All Tweets</h3>
          {posts.map(post => (
            <div key={post.id} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '12px',
              backgroundColor: darkMode ? '#253341' : '#f9f9f9'
            }}>
              {post.content}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default App;
