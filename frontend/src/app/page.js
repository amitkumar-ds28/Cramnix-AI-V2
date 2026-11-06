'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userContact, setUserContact] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeZone, setActiveZone] = useState('student');
  const [studentTab, setStudentTab] = useState('plan');
  const [professionalTab, setProfessionalTab] = useState('meeting');
  const [focusTab, setFocusTab] = useState('pomodoro');

  const [apiKey, setApiKey] = useState('');
  const [apiSaved, setApiSaved] = useState(false);
  const [apiKeyError, setApiKeyError] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [theme, setTheme] = useState('dark');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [requestCount, setRequestCount] = useState(0);
  const [streak, setStreak] = useState(1);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [totalFocusMins, setTotalFocusMins] = useState(0);
  const [quizScores, setQuizScores] = useState([]);

  const [chats, setChats] = useState([
    { id: '1', title: 'New Chat', messages: [], pinned: false }
  ]);
  const [currentChatId, setCurrentChatId] = useState('1');

  const [inputMethod, setInputMethod] = useState('file');
  const [sharedFile, setSharedFile] = useState(null);
  const [planPrompt, setPlanPrompt] = useState('');
  const [chatPrompt, setChatPrompt] = useState('');
  const [meetingPrompt, setMeetingPrompt] = useState('');
  const [emailPrompt, setEmailPrompt] = useState('');

  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const [timerMins, setTimerMins] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('cramnix_name');
    const savedContact = localStorage.getItem('cramnix_contact');
    if (savedName && savedContact) {
      setUserName(savedName);
      setUserContact(savedContact);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      setPomodoroCount(prev => prev + 1);
      setTotalFocusMins(prev => prev + parseInt(timerMins));
      alert(`Session Complete! +${timerMins} Mins added to your analytics.`);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, timerMins]);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    const nameValid = userName.trim().length >= 3;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userContact.trim());
    const isPhone = /^\d{10}$/.test(userContact.trim());

    if (nameValid && (isEmail || isPhone)) {
      localStorage.setItem('cramnix_name', userName.trim());
      localStorage.setItem('cramnix_contact', userContact.trim());
      setIsLoggedIn(true);
    } else {
      setLoginError('Please enter a valid Full Name and Email ID or 10-digit Mobile Number!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cramnix_name');
    localStorage.removeItem('cramnix_contact');
    setIsLoggedIn(false);
    setUserName('');
    setUserContact('');
  };

  const handleSaveApiKey = () => {
    setApiKeyError('');
    const trimmedKey = apiKey.trim();
    if (trimmedKey.length >= 20) {
      setApiSaved(true);
    } else {
      setApiSaved(false);
      setApiKeyError('❌ Please enter a valid API Key from Google AI Studio.');
    }
  };

  const createNewChat = () => {
    const newId = Date.now().toString();
    const newChat = { id: newId, title: 'New Chat', messages: [], pinned: false };
    setChats([newChat, ...chats]);
    setCurrentChatId(newId);
  };

  const togglePinChat = (id, e) => {
    e.stopPropagation();
    setChats(chats.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
  };

  const deleteChat = (id, e) => {
    e.stopPropagation();
    const filtered = chats.filter(c => c.id !== id);
    setChats(filtered);
    if (filtered.length > 0) setCurrentChatId(filtered[0].id);
    else createNewChat();
  };

  const handleGenerate = async (e, textToRun, attachedFile = null) => {
    if (e) e.preventDefault();
    const fileToUse = attachedFile || sharedFile;
    if ((!textToRun || !textToRun.trim()) && !fileToUse) return;

    setLoading(true);
    setResponse('');

    const fileContext = fileToUse ? `[Attached File: ${fileToUse.name}]` : '';
    const finalPrompt = `[Language: ${selectedLanguage}] ${fileContext} ${textToRun || 'Analyze the uploaded file and answer questions.'}`;

    try {
      const res = await fetch('https://cramnix-ai-v2.onrender.com/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: finalPrompt, 
          api_key: apiSaved && apiKey.trim() ? apiKey.trim() : null 
        })
      });
      const data = await res.json();

      if (res.ok) {
        setResponse(data.response);
        if (!apiSaved) {
          setRequestCount(prev => Math.min(4, prev + 1));
        }
        const chatTitle = textToRun ? textToRun.slice(0, 18) + '...' : (fileToUse ? fileToUse.name : 'New Chat');
        setChats(chats.map(c => c.id === currentChatId && c.title === 'New Chat' ? { ...c, title: chatTitle } : c));
      } else {
        setResponse(`Error: ${data.detail || 'Failed to fetch AI response. Please check backend connection.'}`);
      }
    } catch (err) {
      setResponse(`Connection Error: ${err.message}. Make sure FastAPI server is running on port 8000.`);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = (setterFunc) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      setterFunc(event.results[0][0].transcript);
    };
    recognition.start();
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#0e1117' : '#f8f9fa';
  const cardBg = isDark ? '#161b22' : '#ffffff';
  const innerBg = isDark ? '#0d1117' : '#f1f3f5';
  const textColor = isDark ? '#c9d1d9' : '#212529';
  const headingColor = isDark ? '#ffffff' : '#111827';
  const borderColor = isDark ? '#30363d' : '#e5e7eb';
  const subTextColor = isDark ? '#8b949e' : '#6b7280';

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', background: bgColor, color: textColor, fontFamily: 'sans-serif' }}>
        <div style={{ width: '320px', background: cardBg, padding: '30px', borderRight: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ color: headingColor, fontSize: '22px', margin: '0 0 10px 0' }}>🧠 Cramnix AI</h2>
            <p style={{ color: subTextColor, fontSize: '13px' }}>Universal AI Workspace for Students and Professionals.</p>
          </div>
          <div style={{ textAlign: 'center', fontSize: '13px', color: subTextColor }}>
            <p style={{ margin: '0 0 5px 0' }}>Made with ❤️ by <br/><strong style={{ color: headingColor }}>Amitkumar Gautam</strong></p>
            <a href="https://github.com/amitkumar-ds28" target="_blank" rel="noreferrer" style={{ color: '#388bfd', textDecoration: 'none', display: 'inline-block', marginBottom: '15px' }}>GitHub Profile</a>
            <div style={{ background: innerBg, padding: '12px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: headingColor }}>💬 Feedback & Support</p>
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSe56UN2ZZe0NfMViO8L6UD_Wdv4a2WBfVEWJIQutF7fpbHmrA/viewform?usp=preview" target="_blank" rel="noreferrer" style={{ display: 'block', background: '#f85149', color: '#fff', padding: '8px', borderRadius: '6px', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}>👉 Give Feedback</a>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '500px', background: cardBg, padding: '40px', borderRadius: '12px', border: `1px solid ${borderColor}`, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
            <h1 style={{ fontSize: '24px', color: headingColor, margin: '0 0 10px 0' }}>🧠 Cramnix AI - Secure Cloud Login</h1>
            <p style={{ color: subTextColor, fontSize: '14px', marginBottom: '30px' }}>Sign in once and access your persistent AI workspace across devices</p>

            {loginError && <div style={{ background: 'rgba(248, 81, 73, 0.15)', color: '#f85149', padding: '12px', borderRadius: '6px', border: '1px solid #f85149', marginBottom: '20px', fontSize: '13px' }}>{loginError}</div>}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: headingColor }}>Full Name</label>
                <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="e.g. Amitkumar Gautam" required style={{ width: '100%', padding: '12px', borderRadius: '6px', background: innerBg, border: `1px solid ${borderColor}`, color: headingColor, boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: headingColor }}>Email ID or 10-Digit Mobile Number</label>
                <input type="text" value={userContact} onChange={(e) => setUserContact(e.target.value)} placeholder="amit@example.com or 9876543210" required style={{ width: '100%', padding: '12px', borderRadius: '6px', background: innerBg, border: `1px solid ${borderColor}`, color: headingColor, boxSizing: 'border-box' }} />
              </div>
              <button type="submit" style={{ width: '100%', padding: '12px', background: '#238636', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>🚀 Login / Get Started</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const freeLeft = Math.max(0, 4 - requestCount);
  const sortedChats = [...chats].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: bgColor, color: textColor, fontFamily: 'sans-serif' }}>
      
      {sidebarOpen && (
        <aside style={{ width: '300px', background: cardBg, padding: '20px', borderRight: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', overflowY: 'auto', flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: headingColor, fontSize: '15px' }}>👤 {userName}</h3>
                <p style={{ margin: 0, fontSize: '11px', color: subTextColor }}>📧 {userContact}</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} title="Hide Sidebar" style={{ background: 'none', border: `1px solid ${borderColor}`, color: headingColor, padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>◀</button>
            </div>

            <div style={{ background: innerBg, padding: '10px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
              <span style={{ fontSize: '11px', color: subTextColor }}>🎁 Free Requests Left</span>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: freeLeft === 0 ? '#f85149' : '#388bfd' }}>{freeLeft} / 4</div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px', color: headingColor }}>🔑 Custom Gemini API Key:</label>
              <input type="password" value={apiKey} onChange={(e) => { setApiKey(e.target.value); setApiSaved(false); setApiKeyError(''); }} placeholder="Enter API Key..." style={{ width: '100%', padding: '7px', borderRadius: '6px', background: innerBg, border: `1px solid ${borderColor}`, color: headingColor, boxSizing: 'border-box', marginBottom: '6px', fontSize: '12px' }} />
              <button onClick={handleSaveApiKey} style={{ width: '100%', padding: '5px', background: cardBg, color: textColor, border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>Save API Key</button>

              {apiKeyError && <span style={{ display: 'block', marginTop: '5px', fontSize: '11px', color: '#f85149' }}>{apiKeyError}</span>}

              {apiSaved ? (
                <span style={{ display: 'block', marginTop: '5px', fontSize: '11px', color: '#3fb950' }}>🟢 API Key Active!</span>
              ) : (
                <div style={{ marginTop: '6px', padding: '6px', background: '#d0e3ff', color: '#093687', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', textAlign: 'center' }}>
                  ℹ️ Using Backend Rotation Pool.
                </div>
              )}

              <div style={{ marginTop: '8px' }}>
                <button onClick={() => setShowGuide(!showGuide)} style={{ background: 'none', border: 'none', color: '#388bfd', fontSize: '11px', cursor: 'pointer', padding: 0 }}>
                  {showGuide ? '📖 Hide Guide' : '📖 How to create Gemini API Key?'}
                </button>
                {showGuide && (
                  <div style={{ marginTop: '6px', padding: '8px', background: innerBg, borderRadius: '6px', fontSize: '10px', color: subTextColor, lineHeight: '1.4' }}>
                    1. Visit <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: '#388bfd' }}>Google AI Studio</a>.<br/>
                    2. Sign in with Google.<br/>
                    3. Click **Get API Key** & paste above.
                  </div>
                )}
              </div>
            </div>

            <div style={{ background: innerBg, padding: '10px', borderRadius: '8px', border: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '10px', color: subTextColor }}>Daily Streak</span>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffa657' }}>🔥 {streak} Days</div>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: subTextColor }}>Pomodoro</span>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#58a6ff' }}>🍅 {pomodoroCount}</div>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: subTextColor }}>Focus Time</span>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#3fb950' }}>⏱️ {totalFocusMins}m</div>
              </div>
            </div>

            <button onClick={createNewChat} style={{ background: '#238636', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', width: '100%', fontSize: '13px' }}>➕ New Chat</button>

            <div>
              <h4 style={{ margin: '8px 0 6px 0', fontSize: '12px', color: subTextColor }}>💬 Chat History</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '130px', overflowY: 'auto' }}>
                {sortedChats.map((chat) => (
                  <div key={chat.id} onClick={() => setCurrentChatId(chat.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderRadius: '6px', background: chat.id === currentChatId ? innerBg : 'transparent', border: chat.id === currentChatId ? `1px solid ${borderColor}` : '1px solid transparent', cursor: 'pointer', fontSize: '11px', color: headingColor }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '150px' }}>{chat.pinned ? '📌 ' : '💬 '}{chat.title}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={(e) => togglePinChat(chat.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px' }}>{chat.pinned ? '📍' : '📌'}</button>
                      <button onClick={(e) => deleteChat(chat.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px' }}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: headingColor }}>Choose Language:</label>
              <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} style={{ width: '100%', padding: '6px', background: innerBg, color: headingColor, border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '12px' }}>
                <optgroup label="Popular Languages">
                  <option>English</option>
                  <option>Hindi (हिन्दी)</option>
                  <option>Hinglish</option>
                  <option>Marathi (मराठी)</option>
                  <option>Gujarati (ગુજરાતી)</option>
                  <option>Urdu (اردو)</option>
                  <option>Spanish (Español)</option>
                  <option>French (Français)</option>
                  <option>German (Deutsch)</option>
                  <option>Chinese (中文)</option>
                  <option>Japanese (日本語)</option>
                  <option>Russian (Русский)</option>
                  <option>Arabic (العربية)</option>
                  <option>Portuguese (Português)</option>
                  <option>Korean (한국어)</option>
                  <option>Italian (Italiano)</option>
                </optgroup>
                <optgroup label="Indian Regional Languages">
                  <option>Bengali (বাংলা)</option>
                  <option>Tamil (தமிழ்)</option>
                  <option>Telugu (తెలుగు)</option>
                  <option>Kannada (ಕನ್ನಡ)</option>
                  <option>Malayalam (മലയാളം)</option>
                  <option>Punjabi (ਪੰਜਾਬੀ)</option>
                  <option>Odia (ଓଡ଼ିଆ)</option>
                  <option>Assamese (অসমীয়া)</option>
                  <option>Sanskrit (संस्कृतम्)</option>
                </optgroup>
              </select>
            </div>

            <button onClick={handleLogout} style={{ background: '#d73a49', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', width: '100%', fontSize: '13px' }}>🚪 Logout</button>

          </div>

          <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: '12px', textAlign: 'center', fontSize: '12px', color: subTextColor }}>
            <p style={{ margin: '0 0 3px 0' }}>Made with ❤️ by <br/><strong style={{ color: headingColor }}>Amitkumar Gautam</strong></p>
            <a href="https://github.com/amitkumar-ds28" target="_blank" rel="noreferrer" style={{ color: '#388bfd', textDecoration: 'none', display: 'inline-block', marginBottom: '10px' }}>GitHub Profile</a>
            <div style={{ background: innerBg, padding: '8px', borderRadius: '6px', border: `1px solid ${borderColor}` }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: headingColor }}>💬 Feedback & Support</p>
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSe56UN2ZZe0NfMViO8L6UD_Wdv4a2WBfVEWJIQutF7fpbHmrA/viewform?usp=preview" target="_blank" rel="noreferrer" style={{ display: 'block', background: '#f85149', color: '#fff', padding: '5px', borderRadius: '4px', textDecoration: 'none', fontSize: '11px', fontWeight: 'bold' }}>👉 Give Feedback</a>
            </div>
          </div>
        </aside>
      )}

      <main style={{ flex: 1, padding: '30px 40px', background: bgColor, color: textColor, overflowY: 'auto', boxSizing: 'border-box' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} title="Show Sidebar" style={{ background: cardBg, border: `1px solid ${borderColor}`, color: headingColor, padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                ▶ Show Sidebar
              </button>
            )}
            <div>
              <h1 style={{ color: headingColor, margin: '0 0 6px 0', fontSize: '24px' }}>🧠 Cramnix AI - Universal Workspace</h1>
              <p style={{ color: subTextColor, margin: 0, fontSize: '13px' }}>Eliminate distractions, execute your study & professional goals with lightning-fast streaming intelligence.</p>
            </div>
          </div>
          <button onClick={() => setTheme(isDark ? 'light' : 'dark')} style={{ padding: '7px 14px', background: cardBg, color: headingColor, border: `1px solid ${borderColor}`, borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
            {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>
          <label style={{ cursor: 'pointer', color: activeZone === 'student' ? headingColor : subTextColor }}>
            <input type="radio" name="zone" checked={activeZone === 'student'} onChange={() => setActiveZone('student')} style={{ marginRight: '6px' }} /> 🎓 Student Zone
          </label>
          <label style={{ cursor: 'pointer', color: activeZone === 'professional' ? headingColor : subTextColor }}>
            <input type="radio" name="zone" checked={activeZone === 'professional'} onChange={() => setActiveZone('professional')} style={{ marginRight: '6px' }} /> 💼 Professional & Work Zone
          </label>
          <label style={{ cursor: 'pointer', color: activeZone === 'focus' ? headingColor : subTextColor }}>
            <input type="radio" name="zone" checked={activeZone === 'focus'} onChange={() => setActiveZone('focus')} style={{ marginRight: '6px' }} /> ⚡ Focus & Productivity Zone
          </label>
        </div>

        <hr style={{ borderColor: borderColor, marginBottom: '25px', borderStyle: 'solid', borderWidth: '1px 0 0 0' }} />

        {activeZone === 'student' && (
          <div>
            <h2 style={{ fontSize: '18px', color: headingColor, marginBottom: '10px' }}>🎓 Student Zone: Goal Planning, Quiz Engine & Document Chat</h2>
            <div style={{ display: 'flex', gap: '15px', margin: '10px 0 20px 0', fontSize: '13px' }}>
              <span onClick={() => setStudentTab('plan')} style={{ cursor: 'pointer', color: studentTab === 'plan' ? '#f85149' : subTextColor, fontWeight: 'bold' }}>🚀 Goal & Plan Generator</span>
              <span onClick={() => setStudentTab('chat')} style={{ cursor: 'pointer', color: studentTab === 'chat' ? '#f85149' : subTextColor, fontWeight: 'bold' }}>💬 Chat with Notes/Files</span>
              <span onClick={() => setStudentTab('quiz')} style={{ cursor: 'pointer', color: studentTab === 'quiz' ? '#f85149' : subTextColor, fontWeight: 'bold' }}>🧠 Interactive Flashcards & Quiz</span>
            </div>

            {studentTab === 'plan' && (
              <div>
                <div style={{ background: cardBg, padding: '18px', borderRadius: '8px', border: `1px solid ${borderColor}`, marginBottom: '20px' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', color: headingColor }}>📁 Upload Study Material or Snap via Camera</h3>
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '10px', fontSize: '13px' }}>
                    <label><input type="radio" name="inputMethod" checked={inputMethod === 'file'} onChange={() => setInputMethod('file')} /> File Upload (PDF, Text, Image)</label>
                    <label><input type="radio" name="inputMethod" checked={inputMethod === 'camera'} onChange={() => setInputMethod('camera')} /> Direct Camera Snapshot</label>
                  </div>
                  
                  <label style={{ display: 'inline-block', background: innerBg, border: `1px solid ${borderColor}`, padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', color: headingColor }}>
                    📂 Browse & Upload File
                    <input type="file" onChange={(e) => setSharedFile(e.target.files[0])} accept={inputMethod === 'file' ? ".pdf,.txt,.png,.jpg,.jpeg" : "image/*"} capture={inputMethod === 'camera' ? "environment" : undefined} style={{ display: 'none' }} />
                  </label>

                  {sharedFile ? (
                    <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#3fb950', fontWeight: 'bold' }}>✅ File Uploaded & Active: {sharedFile.name}</p>
                  ) : (
                    <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: subTextColor }}>ℹ️ No file chosen yet. Click Browse to select a file.</p>
                  )}
                </div>

                <div style={{ background: cardBg, padding: '18px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', color: headingColor }}>🎯 Today's Goal (Type or Voice Input)</h3>
                    <button type="button" onClick={() => handleVoiceInput(setPlanPrompt)} style={{ background: '#388bfd', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>🎤 Click Mic & Speak</button>
                  </div>
                  <form onSubmit={(e) => handleGenerate(e, planPrompt)}>
                    <textarea rows="4" value={planPrompt} onChange={(e) => setPlanPrompt(e.target.value)} placeholder="Enter your main goal or task..." style={{ width: '100%', padding: '12px', background: innerBg, color: headingColor, border: `1px solid ${borderColor}`, borderRadius: '6px', marginBottom: '15px', boxSizing: 'border-box' }} />
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <button type="submit" style={{ flex: 1, background: '#238636', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>{loading ? 'Thinking...' : '🚀 Generate Execution Plan'}</button>
                      <button type="button" onClick={(e) => handleGenerate(e, `Create 5 interactive MCQs for: ${planPrompt}`)} style={{ flex: 1, background: '#8957e5', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>🧠 Generate AI Quiz</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {studentTab === 'chat' && (
              <div style={{ background: cardBg, padding: '20px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', color: headingColor }}>💬 Chat with Notes & Documents</h3>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'inline-block', background: innerBg, border: `1px solid ${borderColor}`, padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', color: headingColor }}>
                    📂 Browse & Upload File
                    <input type="file" onChange={(e) => setSharedFile(e.target.files[0])} accept=".pdf,.txt,.png,.jpg,.jpeg" style={{ display: 'none' }} />
                  </label>

                  {sharedFile ? (
                    <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#3fb950', fontWeight: 'bold' }}>✅ File Uploaded & Active: {sharedFile.name}</p>
                  ) : (
                    <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: subTextColor }}>ℹ️ No file chosen (You can upload above or it syncs from Goal Plan)</p>
                  )}
                </div>
                <textarea rows="4" value={chatPrompt} onChange={(e) => setChatPrompt(e.target.value)} placeholder="Ask anything about uploaded notes..." style={{ width: '100%', padding: '10px', background: innerBg, color: headingColor, border: `1px solid ${borderColor}`, borderRadius: '6px', marginBottom: '10px', boxSizing: 'border-box' }} />
                <button onClick={(e) => handleGenerate(e, chatPrompt)} style={{ background: '#238636', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Send Message 🚀</button>
              </div>
            )}

            {studentTab === 'quiz' && (
              <div style={{ background: cardBg, padding: '20px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', color: headingColor }}>🧠 Quick Revision Flashcards & Quiz Score Tracker</h3>
                <button onClick={(e) => handleGenerate(e, "Generate 5 concise flashcards for revision.")} style={{ background: '#388bfd', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px' }}>⚡ Generate Flashcards</button>
                
                <hr style={{ borderColor: borderColor, marginBottom: '20px' }} />
                
                <h4 style={{ margin: '0 0 10px 0', color: headingColor }}>🎯 Log Quiz Score</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input type="text" placeholder="Quiz Topic / Subject Name" id="quizTitle" style={{ padding: '8px', background: innerBg, color: headingColor, border: `1px solid ${borderColor}`, borderRadius: '6px' }} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="number" placeholder="Score Obtained" defaultValue="10" id="quizScore" style={{ flex: 1, padding: '8px', background: innerBg, color: headingColor, border: `1px solid ${borderColor}`, borderRadius: '6px' }} />
                    <input type="number" placeholder="Total Marks" defaultValue="10" id="quizTotal" style={{ flex: 1, padding: '8px', background: innerBg, color: headingColor, border: `1px solid ${borderColor}`, borderRadius: '6px' }} />
                  </div>
                  <button onClick={() => {
                    const title = document.getElementById('quizTitle').value || 'General Quiz';
                    const score = Number(document.getElementById('quizScore').value);
                    const total = Number(document.getElementById('quizTotal').value);
                    const percentage = Math.round((score / total) * 100);
                    setQuizScores([...quizScores, { title, score, total, percentage }]);
                    alert(`Quiz score saved! Percentage: ${percentage}%`);
                  }} style={{ background: '#238636', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>📊 Save Quiz Score & Track Analytics</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeZone === 'professional' && (
          <div>
            <h2 style={{ fontSize: '18px', color: headingColor, marginBottom: '10px' }}>💼 Professional Zone: Meeting Summarizer & Emails</h2>
            <div style={{ display: 'flex', gap: '15px', margin: '10px 0 20px 0', fontSize: '13px' }}>
              <span onClick={() => setProfessionalTab('meeting')} style={{ cursor: 'pointer', color: professionalTab === 'meeting' ? '#f85149' : subTextColor, fontWeight: 'bold' }}>📝 Meeting Notes & Action Extractor</span>
              <span onClick={() => setProfessionalTab('email')} style={{ cursor: 'pointer', color: professionalTab === 'email' ? '#f85149' : subTextColor, fontWeight: 'bold' }}>✉️ Corporate Email Generator</span>
            </div>

            {professionalTab === 'meeting' && (
              <div style={{ background: cardBg, padding: '20px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', color: headingColor }}>📝 Meeting Notes & Action Item Extractor</h3>
                <textarea rows="5" value={meetingPrompt} onChange={(e) => setMeetingPrompt(e.target.value)} placeholder="Paste raw meeting transcript / notes..." style={{ width: '100%', padding: '12px', background: innerBg, color: headingColor, border: `1px solid ${borderColor}`, borderRadius: '6px', marginBottom: '15px', boxSizing: 'border-box' }} />
                <button onClick={(e) => handleGenerate(e, `Extract summary and action items from these notes: ${meetingPrompt}`)} style={{ background: '#238636', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>⚡ Extract Summary & Action Items</button>
              </div>
            )}

            {professionalTab === 'email' && (
              <div style={{ background: cardBg, padding: '20px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', color: headingColor }}>✉️ Professional Corporate Email Generator</h3>
                <input type="text" value={emailPrompt} onChange={(e) => setEmailPrompt(e.target.value)} placeholder="What is the email about?" style={{ width: '100%', padding: '10px', background: innerBg, color: headingColor, border: `1px solid ${borderColor}`, borderRadius: '6px', marginBottom: '15px', boxSizing: 'border-box' }} />
                <button onClick={(e) => handleGenerate(e, `Draft a professional corporate email for: ${emailPrompt}`)} style={{ background: '#238636', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>✨ Draft Email</button>
              </div>
            )}
          </div>
        )}

        {activeZone === 'focus' && (
          <div>
            <h2 style={{ fontSize: '18px', color: headingColor, marginBottom: '10px' }}>⚡ Focus Zone: Pomodoro Timer & Performance Analytics</h2>
            <div style={{ display: 'flex', gap: '15px', margin: '10px 0 20px 0', fontSize: '13px' }}>
              <span onClick={() => setFocusTab('pomodoro')} style={{ cursor: 'pointer', color: focusTab === 'pomodoro' ? '#f85149' : subTextColor, fontWeight: 'bold' }}>⏱️ Focus Zone (Pomodoro)</span>
              <span onClick={() => setFocusTab('analytics')} style={{ cursor: 'pointer', color: focusTab === 'analytics' ? '#f85149' : subTextColor, fontWeight: 'bold' }}>📊 Performance Analytics & Scores</span>
            </div>

            {focusTab === 'pomodoro' && (
              <div style={{ background: cardBg, padding: '30px', borderRadius: '8px', border: `1px solid ${borderColor}`, textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: headingColor }}>⏱️ Pomodoro Focus Timer</h3>
                <select value={timerMins} onChange={(e) => { setTimerMins(e.target.value); setTimeLeft(e.target.value * 60); }} style={{ padding: '8px', background: innerBg, color: headingColor, border: `1px solid ${borderColor}`, borderRadius: '6px', marginBottom: '20px' }}>
                  <option value={25}>25 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={15}>15 Minutes</option>
                </select>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#58a6ff', margin: '10px 0' }}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
                <button onClick={() => setTimerActive(!timerActive)} style={{ background: timerActive ? '#d73a49' : '#238636', color: '#fff', border: 'none', padding: '10px 25px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {timerActive ? '⏸️ Pause Timer' : '🚀 Start Focus Session'}
                </button>
              </div>
            )}

            {focusTab === 'analytics' && (
              <div style={{ background: cardBg, padding: '20px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: headingColor }}>📊 Performance Analytics & Scores</h3>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                  <div style={{ flex: 1, background: innerBg, padding: '15px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                    <span style={{ fontSize: '12px', color: subTextColor }}>Streak</span>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffa657' }}>🔥 {streak} Days</div>
                  </div>
                  <div style={{ flex: 1, background: innerBg, padding: '15px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                    <span style={{ fontSize: '12px', color: subTextColor }}>Pomodoros</span>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#58a6ff' }}>🍅 {pomodoroCount}</div>
                  </div>
                  <div style={{ flex: 1, background: innerBg, padding: '15px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                    <span style={{ fontSize: '12px', color: subTextColor }}>Focus Time</span>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3fb950' }}>⏱️ {totalFocusMins} Mins</div>
                  </div>
                </div>

                <h4 style={{ color: headingColor }}>📈 Recorded Quiz Scores</h4>
                {quizScores.length > 0 ? (
                  quizScores.map((q, idx) => (
                    <div key={idx} style={{ background: innerBg, padding: '10px', borderRadius: '6px', marginBottom: '8px', fontSize: '13px' }}>
                      <strong>{q.title}</strong> — Score: {q.score}/{q.total} ({q.percentage}%)
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '13px', color: subTextColor }}>No quiz scores logged yet.</p>
                )}
              </div>
            )}
          </div>
        )}

        {response && (
          <div style={{ marginTop: '25px', background: cardBg, padding: '20px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
            <h3 style={{ color: '#58a6ff', marginTop: 0, fontSize: '15px' }}>✨ AI Response:</h3>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', margin: '0 0 15px 0' }}>{response}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => {
                const utterance = new SpeechSynthesisUtterance(response);
                window.speechSynthesis.speak(utterance);
              }} style={{ background: '#f85149', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>🔊 Read Aloud</button>
              
              <button onClick={() => {
                const blob = new Blob([response], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Cramnix_Output.txt';
                a.click();
              }} style={{ background: '#21262d', color: '#c9d1d9', border: `1px solid ${borderColor}`, padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>📥 Download (.txt)</button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}