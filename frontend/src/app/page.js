"use client";
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userContact, setUserContact] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeNav, setActiveNav] = useState('dashboard');
  const [studentTab, setStudentTab] = useState('plan');
  const [professionalTab, setProfessionalTab] = useState('meeting');
  const [focusTab, setFocusTab] = useState('pomodoro');
  const [apiKey, setApiKey] = useState('');
  const [apiSaved, setApiSaved] = useState(false);
  const [apiKeyError, setApiKeyError] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [requestCount, setRequestCount] = useState(0);
  const [streak, setStreak] = useState(1);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [totalFocusMins, setTotalFocusMins] = useState(0);
  const [quizScores, setQuizScores] = useState([]);
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [quizTopic, setQuizTopic] = useState('');
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [flashTopic, setFlashTopic] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [flippedCard, setFlippedCard] = useState(null);
  const [flashLoading, setFlashLoading] = useState(false);
  const [studyTopic, setStudyTopic] = useState('');
  const [studyDays, setStudyDays] = useState('7 Days');
  const [studyLevel, setStudyLevel] = useState('Medium - Little bit hard');
  const [studyHours, setStudyHours] = useState('3 Hours / Day');
  const [libraryFiles, setLibraryFiles] = useState([]);
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryFilter, setLibraryFilter] = useState('All');
  const [chats, setChats] = useState([{ id: '1', title: 'New Chat', messages: [], pinned: false }]);
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
  const [dashboardMessages, setDashboardMessages] = useState([]);
  const [studentMessages, setStudentMessages] = useState([]);
  const [pdfMessages, setPdfMessages] = useState([]);
  const [professionalMessages, setProfessionalMessages] = useState([]);
  const [autoRead, setAutoRead] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [shareMsg, setShareMsg] = useState('');

  // Right Panel & Mobile Menu Toggle States
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false); // Default closed on mobile for clean view
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const bg = '#0A0618';
  const cardBg = 'rgba(255,255,255,0.05)';
  const cardBorder = 'rgba(255,255,255,0.1)';
  const textColor = '#EDE9FE';
  const subText = '#A78BFA';
  const heading = '#FFFFFF';
  const purple = '#8B5CF6';
  const purple2 = '#6D28D9';
  const green = '#22C55E';
  const red = '#EF4444';
  const showBottomBar = ['dashboard', 'student', 'library', 'chatpdf'].includes(activeNav);

  const [weekData, setWeekData] = useState([
    { day: 'Mon', val: 0, mins: '0m' },
    { day: 'Tue', val: 0, mins: '0m' },
    { day: 'Wed', val: 0, mins: '0m' },
    { day: 'Thu', val: 0, mins: '0m' },
    { day: 'Fri', val: 0, mins: '0m' },
    { day: 'Sat', val: 0, mins: '0m' },
    { day: 'Sun', val: 0, mins: '0m' },
  ]);
  const quizAvg = quizScores.length > 0 ? Math.round(quizScores.reduce((a, s) => a + (s.got / s.total) * 100, 0) / quizScores.length) : 0;
  const todayMins = totalFocusMins;
  const goalPercent = Math.min(100, Math.round((todayMins / 120) * 100));

  useEffect(() => {
    const savedName = localStorage.getItem('cramnix_name');
    const savedContact = localStorage.getItem('cramnix_contact');
    if (savedName && savedContact) { setUserName(savedName); setUserContact(savedContact); setIsLoggedIn(true); }
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('cramnix_date');
    const savedCount = parseInt(localStorage.getItem('cramnix_count') || '0');
    if (savedDate !== today) { localStorage.setItem('cramnix_date', today); localStorage.setItem('cramnix_count', '0'); setRequestCount(0); }
    else setRequestCount(savedCount);
    try { const savedLib = JSON.parse(localStorage.getItem('cramnix_library') || '[]'); setLibraryFiles(savedLib); } catch {}
    try { const savedWeek = JSON.parse(localStorage.getItem('cramnix_week') || 'null'); if (savedWeek) setWeekData(savedWeek); } catch {}
    try { const savedScores = JSON.parse(localStorage.getItem('cramnix_scores') || '[]'); setQuizScores(savedScores); } catch {}
    try { const savedFocus = parseInt(localStorage.getItem('cramnix_focus') || '0'); setTotalFocusMins(savedFocus); } catch {}
  }, []);

  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      setPomodoroCount(prev => prev + 1);
      const newTotal = totalFocusMins + parseInt(timerMins);
      setTotalFocusMins(newTotal);
      localStorage.setItem('cramnix_focus', newTotal.toString());
      const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
      const updated = [...weekData];
      updated[todayIndex] = { ...updated[todayIndex], val: Math.min(100, Math.round((newTotal / 120) * 100)), mins: `${newTotal}m` };
      setWeekData(updated);
      localStorage.setItem('cramnix_week', JSON.stringify(updated));
      alert(`Session Complete! +${timerMins} Mins added.`);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, timerMins, totalFocusMins, weekData]);

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [dashboardMessages, studentMessages, pdfMessages, professionalMessages, loading]);

  const handleShare = async () => {
    const textToShare = response || chatPrompt || 'Check out Cramnix AI - My Study App';
    try {
      if (navigator.share) { await navigator.share({ title: 'Cramnix AI Answer', text: textToShare, url: window.location.href }); setShareMsg('Shared successfully!'); }
      else { await navigator.clipboard.writeText(textToShare); setShareMsg('Copied to clipboard!'); }
    } catch (e) { try { await navigator.clipboard.writeText(textToShare); setShareMsg('Copied to clipboard!'); } catch { setShareMsg('Copy failed.'); } }
    setTimeout(() => setShareMsg(''), 3000);
  };
  const handleExport = () => {
    const content = response || chatPrompt || 'No content to export yet.';
    if (!response && !chatPrompt) { alert('Nothing to export yet.'); return; }
    const fullText = `Cramnix AI - Export\nDate: ${new Date().toLocaleString()}\n\nQuestion:\n${chatPrompt || 'N/A'}\n\nAnswer:\n${content}`;
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Cramnix_Answer_${Date.now()}.txt`; a.click(); URL.revokeObjectURL(url);
    setShareMsg('Exported successfully!');
    setTimeout(() => setShareMsg(''), 3000);
  };
  const handleDownloadAnswer = (txt) => {
    const t = txt || response;
    if (!t) return;
    const blob = new Blob([`Cramnix AI Answer\n\n${t}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'Cramnix_Answer.txt'; a.click(); URL.revokeObjectURL(url);
  };
  const handleNewChatClick = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setChatPrompt(''); setPlanPrompt(''); setResponse('');
    if (activeNav === 'dashboard') setDashboardMessages([]);
    if (activeNav === 'student') setStudentMessages([]);
    if (activeNav === 'chatpdf') { setPdfMessages([]); setSharedFile(null); }
    if (activeNav === 'professional') setProfessionalMessages([]);
    setQuizQuestions([]); setFlashcards([]); setQuizTopic(''); setFlashTopic('');
    const newId = Date.now().toString();
    setChats([{ id: newId, title: 'New Chat', messages: [], pinned: false }, ...chats]);
    setCurrentChatId(newId);
    setShareMsg('New chat started!');
    setTimeout(() => setShareMsg(''), 2000);
  };
  const speakAnswer = (text) => {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = 1;
    u.onstart = () => setIsSpeaking(true); u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  };
  const stopSpeaking = () => { if (window.speechSynthesis) window.speechSynthesis.cancel(); setIsSpeaking(false); };
  useEffect(() => { if (autoRead && response) speakAnswer(response); }, [response]);

  const generateRealQuiz = async (topicInput) => {
    const topic = (topicInput || quizTopic || chatPrompt || '').trim();
    if (!topic || topic.toLowerCase() === 'general') { alert('Please enter a valid topic.'); return; }
    setQuizLoading(true); setQuizQuestions([]); setCurrentQ(0); setSelectedQuiz(null);
    try {
      const res = await fetch('https://cramnix-ai-v2.onrender.com/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: `Create 5 multiple choice questions for topic: ${topic}. Format each as Q: question | A) opt1 | B) opt2 | C) opt3 | D) opt4 | Answer: X. English only.`, api_key: apiSaved && apiKey.trim() ? apiKey.trim() : null }) });
      const data = await res.json();
      if (res.ok && data.response && !data.response.includes('429')) { setQuizQuestions([{ q: data.response, opts: [], ans: -1 }]); setQuizTopic(topic); }
      else alert('AI is busy. Try again later.');
    } catch (e) { alert('Connection error.'); }
    setQuizLoading(false);
  };
  const generateRealFlashcards = async (topicInput) => {
    const topic = (topicInput || flashTopic || chatPrompt || '').trim();
    if (!topic || topic.toLowerCase() === 'general') { alert('Please enter a valid topic.'); return; }
    setFlashLoading(true); setFlashcards([]);
    try {
      const res = await fetch('https://cramnix-ai-v2.onrender.com/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: `Create 6 flashcards for topic: ${topic}. English only.`, api_key: apiSaved && apiKey.trim() ? apiKey.trim() : null }) });
      const data = await res.json();
      if (res.ok && data.response && !data.response.includes('429')) { setFlashcards([{ q: data.response, a: 'Generated' }]); setFlashTopic(topic); }
      else alert('AI is busy. Try again later.');
    } catch (e) { alert('Connection error.'); }
    setFlashLoading(false);
  };

  const handleLogin = (e) => {
    e.preventDefault(); setLoginError('');
    const nameValid = userName.trim().length >= 3;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userContact.trim());
    const isPhone = /^\d{10}$/.test(userContact.trim());
    if (nameValid && (isEmail || isPhone)) { localStorage.setItem('cramnix_name', userName.trim()); localStorage.setItem('cramnix_contact', userContact.trim()); setIsLoggedIn(true); }
    else setLoginError('Please enter a valid Name and Email/Mobile!');
  };
  const handleLogout = () => { localStorage.removeItem('cramnix_name'); localStorage.removeItem('cramnix_contact'); setIsLoggedIn(false); setUserName(''); setUserContact(''); };
  const handleSaveApiKey = () => { setApiKeyError(''); if (apiKey.trim().length >= 20) setApiSaved(true); else setApiKeyError('Invalid API Key.'); };

  const handleGenerate = async (e, textToRun, attachedFile = null, isStudent = false) => {
    if (e) e.preventDefault();
    const fileToUse = attachedFile || (activeNav === 'chatpdf' ? sharedFile : null);
    const qText = (textToRun || chatPrompt || '').trim();
    if (!qText && !fileToUse) return;
    let setMsgs = setDashboardMessages;
    if (activeNav === 'student' || isStudent) setMsgs = setStudentMessages;
    else if (activeNav === 'chatpdf') setMsgs = setPdfMessages;
    else if (activeNav === 'professional') setMsgs = setProfessionalMessages;
    if (!apiSaved && requestCount >= 4) { const msg = 'Free limit reached (4/4). Add API Key in Settings for unlimited use.'; setResponse(msg); setMsgs(prev => [...prev, { type: 'user', text: qText }, { type: 'ai', text: msg }]); return; }
    setLoading(true); setResponse('');
    if (qText) setMsgs(prev => [...prev, { type: 'user', text: qText }]);
    else if (fileToUse) setMsgs(prev => [...prev, { type: 'user', text: `📄 ${fileToUse.name}` }]);
    setChatPrompt('');
    const fileContext = fileToUse ? `[File: ${fileToUse.name}]` : '';
    let tabPrefix = '';
    if (isStudent || activeNav === 'student') {
      if (studentTab === 'plan') tabPrefix = 'Create study plan: ';
      if (studentTab === 'notes') tabPrefix = 'Create notes in English: ';
      if (studentTab === 'quiz') tabPrefix = 'Create 5 MCQs: ';
      if (studentTab === 'flashcards') tabPrefix = 'Create flashcards: ';
    }
    const finalPrompt = `[Language: English] ${fileContext} ${tabPrefix}${qText || 'Analyze file.'}`;
    try {
      const res = await fetch('https://cramnix-ai-v2.onrender.com/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: finalPrompt, api_key: apiSaved && apiKey.trim() ? apiKey.trim() : null }) });
      const data = await res.json();
      if (res.ok) {
        setResponse(data.response);
        setMsgs(prev => [...prev, { type: 'ai', text: data.response }]);
        if (!apiSaved) { const nc = requestCount + 1; setRequestCount(nc); localStorage.setItem('cramnix_count', nc.toString()); }
      } else { setMsgs(prev => [...prev, { type: 'ai', text: '⚠️ AI is busy. Try again soon.' }]); }
    } catch (err) { setMsgs(prev => [...prev, { type: 'ai', text: 'Connection error.' }]); }
    finally { setLoading(false); }
  };

  const handleGenerateStudyPlan = async (e) => {
    if (e) e.preventDefault();
    if (!studyTopic.trim()) { alert('Enter topic first.'); return; }
    const fullPrompt = `Create study plan in ENGLISH for ${studyTopic}. Duration: ${studyDays}. Level: ${studyLevel}. Time: ${studyHours}.`;
    setLoading(true);
    setStudentMessages(prev => [...prev, { type: 'user', text: `📝 Study Plan: ${studyTopic}` }]);
    try {
      const res = await fetch('https://cramnix-ai-v2.onrender.com/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: fullPrompt, api_key: apiSaved && apiKey.trim() ? apiKey.trim() : null }) });
      const data = await res.json();
      if (res.ok) {
        setResponse(data.response);
        setStudentMessages(prev => [...prev, { type: 'ai', text: data.response }]);
        if (!apiSaved) { const nc = requestCount + 1; setRequestCount(nc); localStorage.setItem('cramnix_count', nc.toString()); }
      }
    } catch (err) { setStudentMessages(prev => [...prev, { type: 'ai', text: 'Error generating plan.' }]); }
    setLoading(false);
  };

  const handleVoiceInput = (setterFunc) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) { alert('Not supported.'); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR(); rec.lang = 'en-US'; rec.onresult = (ev) => setterFunc(ev.results[0][0].transcript); rec.start();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newFile = { id: Date.now().toString(), name: file.name, type: file.type.includes('image') ? 'Image' : 'PDF', size: (file.size / 1024).toFixed(0) + ' KB', date: new Date().toLocaleDateString() };
      const updated = [newFile, ...libraryFiles];
      setLibraryFiles(updated);
      localStorage.setItem('cramnix_library', JSON.stringify(updated));
      if (activeNav === 'chatpdf') { setSharedFile(file); setShareMsg(`Loaded ${file.name}`); }
      else { setShareMsg(`Saved to Library: ${file.name}`); }
      setTimeout(() => setShareMsg(''), 3000);
    }
  };

  const deleteLibraryFile = (id) => {
    const updated = libraryFiles.filter(f => f.id !== id);
    setLibraryFiles(updated);
    localStorage.setItem('cramnix_library', JSON.stringify(updated));
  };
  const askLibraryFile = (file) => { setActiveNav('chatpdf'); setSharedFile({ name: file.name }); setChatPrompt(`Explain ${file.name}`); };
  const notesLibraryFile = (file) => { setActiveNav('student'); setStudentTab('notes'); setChatPrompt(`Make notes for ${file.name}`); };

  const saveQuizScore = (got, total) => {
    if (!got || !total) return;
    const updated = [...quizScores, { got: parseInt(got), total: parseInt(total) }];
    setQuizScores(updated);
    localStorage.setItem('cramnix_scores', JSON.stringify(updated));
    alert('Score saved!');
  };

  const freeLeft = Math.max(0, 4 - requestCount);
  const glass = { background: cardBg, padding: '12px', borderRadius: '14px', border: `1px solid ${cardBorder}`, backdropFilter: 'blur(10px)' };
  const inputStyle = { width: '100%', padding: '10px', background: 'rgba(0,0,0,0.35)', border: `1px solid ${cardBorder}`, borderRadius: '10px', color: heading, boxSizing: 'border-box', fontSize: '13px' };
  const primaryBtn = { background: `linear-gradient(90deg, ${purple}, ${purple2})`, color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' };
  const filteredLibrary = libraryFiles.filter(f => f.name.toLowerCase().includes(librarySearch.toLowerCase()) && (libraryFilter === 'All' || f.type === libraryFilter));

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', background: bg, color: textColor, fontFamily: 'Inter, sans-serif', padding: '12px', boxSizing: 'border-box', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '400px', background: cardBg, padding: '24px', borderRadius: '18px', border: `1px solid ${cardBorder}` }}>
          <h2 style={{ color: heading, fontSize: '20px', textAlign: 'center', marginBottom: '6px' }}>💠 Cramnix AI</h2>
          <p style={{ color: subText, fontSize: '12px', textAlign: 'center', marginBottom: '20px' }}>Universal AI Workspace</p>
          {loginError && <div style={{ background: 'rgba(239,68,68,0.15)', color: '#FCA5A5', padding: '10px', borderRadius: '8px', marginBottom: '14px', fontSize: '12px' }}>{loginError}</div>}
          <form onSubmit={handleLogin}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '13px', color: heading }}>Full Name</label>
            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Amitkumar Gautam" required style={{ ...inputStyle, marginBottom: '14px' }} />
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '13px', color: heading }}>Email or 10-Digit Mobile</label>
            <input type="text" value={userContact} onChange={(e) => setUserContact(e.target.value)} placeholder="amit@example.com" required style={{ ...inputStyle, marginBottom: '18px' }} />
            <button type="submit" style={{ width: '100%', padding: '11px', background: `linear-gradient(90deg, ${purple}, ${purple2})`, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>🚀 Login</button>
          </form>
          <div style={{ textAlign: 'center', fontSize: '11px', color: subText, marginTop: '16px' }}>Made with ❤️ by <b>Amitkumar Gautam</b></div>
        </div>
      </div>
    );
  }

  const navItem = (id, icon, label, active) => (
    <div key={id} onClick={() => { setActiveNav(id); setChatPrompt(''); setResponse(''); setIsMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: active ? '800' : '500', background: active ? purple : 'transparent', color: active ? '#fff' : '#C4B5FD' }}>
      <span>{icon}</span> {label}
    </div>
  );
  const studentTabBtn = (id, label) => (
    <button key={id} onClick={() => setStudentTab(id)} style={{ background: studentTab === id ? purple : cardBg, border: `1px solid ${cardBorder}`, color: '#fff', padding: '7px 12px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: studentTab === id ? '800' : '500' }}>{label}</button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', md: {flexDirection: 'row'}, minHeight: '100vh', background: `radial-gradient(800px 400px at 15% 0%, #2E1A5E 0%, transparent 60%), ${bg}`, color: textColor, fontFamily: 'Inter, sans-serif', padding: '8px', gap: '8px', boxSizing: 'border-box', position: 'relative', overflowX: 'hidden' }}>
      
      {/* MOBILE TOP BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,21,56,0.95)', padding: '10px 14px', borderRadius: '14px', border: `1px solid ${cardBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.png" alt="Logo" onError={(e) => { e.target.style.display = 'none'; }} style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'white', padding: '2px' }} />
          <span style={{ fontSize: '16px', fontWeight: '900', color: heading }}>Cramnix AI</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ background: purple, border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
          {isMobileMenuOpen ? '✕ Close' : '☰ Menu'}
        </button>
      </div>

      {/* MOBILE / DESKTOP SIDEBAR DRAWER */}
      <aside style={{ 
        width: '100%', 
        maxWidth: isMobileMenuOpen ? '100%' : '0px',
        maxHeight: isMobileMenuOpen ? '75vh' : '0px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        background: 'linear-gradient(180deg, rgba(30,21,56,0.98), rgba(10,6,24,0.98))', 
        borderRadius: '14px', 
        border: isMobileMenuOpen ? `1px solid ${cardBorder}` : 'none', 
        padding: isMobileMenuOpen ? '12px' : '0px', 
        display: isMobileMenuOpen ? 'flex' : 'none', 
        flexDirection: 'column', 
        zIndex: 30,
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {navItem('dashboard', '📄', 'Dashboard', activeNav === 'dashboard')}
          {navItem('student', '✨', 'Student Zone', activeNav === 'student')}
          {navItem('library', '📖', 'Library', activeNav === 'library')}
          {navItem('chatpdf', '💬', 'Chat with PDF', activeNav === 'chatpdf')}
          {navItem('quizzes', '✅', 'Quizzes', activeNav === 'quizzes')}
          {navItem('flashcards', '📄', 'Flashcards', activeNav === 'flashcards')}
          {navItem('goals', '🎯', 'Goals', activeNav === 'goals')}
          {navItem('professional', '💼', 'Professional Zone', activeNav === 'professional')}
          {navItem('focus', '⚡', 'Focus Zone', activeNav === 'focus')}
          {navItem('settings', '⚙️', 'Settings', activeNav === 'settings')}
          
          <div style={{ margin: '8px 2px', background: 'linear-gradient(135deg,#7C3AED,#4C1D95)', padding: '10px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}><span>🎁 Free Left</span><span>{apiSaved ? 'UNLIMITED' : `${freeLeft} / 4`}</span></div>
            <div style={{ fontSize: '16px', fontWeight: '900', margin: '2px 0' }}>{apiSaved ? '∞ Unlimited' : `${freeLeft} Left`}</div>
          </div>
          <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', color: '#FCA5A5' }}><span>↩️</span> Logout</div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, minWidth: 0, background: 'rgba(10,6,24,0.55)', borderRadius: '16px', border: `1px solid ${cardBorder}`, padding: '12px', display: 'flex', flexDirection: 'column', backdropFilter: 'blur(10px)', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: heading }}>{activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}</h1>
            <span style={{ fontSize: '10px', color: '#86EFAC' }}>● Online</span>
          </div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setAutoRead(!autoRead)} style={{ background: autoRead ? green : cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '5px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '700' }}>🔊 {autoRead ? 'ON' : 'OFF'}</button>
            <button onClick={handleShare} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '5px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '700' }}>↗ Share</button>
            <button onClick={handleExport} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '5px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '700' }}>⬇ Export</button>
            <button onClick={handleNewChatClick} style={{ background: green, border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '800' }}>+ New</button>
          </div>
        </div>
        {shareMsg && <div style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid #22C55E', color: '#86EFAC', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', marginBottom: '8px' }}>✅ {shareMsg}</div>}

        {activeNav === 'student' && (<div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>{studentTabBtn('plan', '📝 Plan')}{studentTabBtn('notes', '📄 Notes')}{studentTabBtn('quiz', '🧠 Quiz')}{studentTabBtn('flashcards', '📄 Cards')}</div>)}
        
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', minHeight: '220px' }}>
          {activeNav === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                <div style={{ background: 'linear-gradient(135deg,#7C3AED,#4C1D95)', padding: '12px', borderRadius: '12px' }}><div style={{ fontSize: '9px', opacity: 0.9 }}>📅 TODAY STUDY</div><div style={{ fontSize: '18px', fontWeight: '900', marginTop: '4px' }}>{totalFocusMins}m</div><div style={{ fontSize: '9px', marginTop: '2px', opacity: 0.85 }}>Goal: 180m</div></div>
                <div style={{ ...glass, padding: '12px' }}><div style={{ fontSize: '9px', color: subText }}>🍅 POMODORO</div><div style={{ fontSize: '18px', fontWeight: '900', marginTop: '4px' }}>{pomodoroCount} Sess</div><div style={{ fontSize: '9px', color: subText, marginTop: '2px' }}>🔥 {streak} Streak</div></div>
                <div style={{ ...glass, padding: '12px' }}><div style={{ fontSize: '9px', color: subText }}>🧠 QUIZ AVG</div><div style={{ fontSize: '18px', fontWeight: '900', marginTop: '4px' }}>{quizAvg}%</div><div style={{ fontSize: '9px', color: subText, marginTop: '2px' }}>{quizScores.length} Done</div></div>
                <div style={{ ...glass, padding: '12px' }}><div style={{ fontSize: '9px', color: subText }}>🎯 GOALS</div><div style={{ fontSize: '18px', fontWeight: '900', marginTop: '4px' }}>{goals.filter(g => g.done).length}/{goals.length}</div><div style={{ fontSize: '9px', color: subText, marginTop: '2px' }}>Progress</div></div>
              </div>

              {dashboardMessages.length === 0 && !loading && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '10px' }}>
                  <div style={{ fontSize: '28px' }}>✨</div>
                  <h2 style={{ fontSize: '18px', fontWeight: '900', color: heading, margin: '8px 0 4px 0' }}>Hello, {userName || 'amit'} 👋</h2>
                  <p style={{ color: subText, fontSize: '12px', margin: 0 }}>What do you want to learn today?</p>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '12px' }}>
                    <button onClick={() => setChatPrompt('Explain Photosynthesis')} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '6px 10px', borderRadius: '999px', fontSize: '11px' }}>🌱 Photosynthesis</button>
                    <button onClick={() => setChatPrompt('Make 5 MCQs')} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '6px 10px', borderRadius: '999px', fontSize: '11px' }}>🧠 Quiz</button>
                    <button onClick={() => setChatPrompt('Make flashcards')} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '6px 10px', borderRadius: '999px', fontSize: '11px' }}>📄 Cards</button>
                    <button onClick={() => setChatPrompt('Study plan')} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '6px 10px', borderRadius: '999px', fontSize: '11px' }}>🎯 Plan</button>
                  </div>
                </div>
              )}
              {dashboardMessages.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '4px 0' }}>
                  {dashboardMessages.map((m, i) => (
                    <div key={i}>{m.type === 'user' ? <div style={{ background: purple, color: '#fff', padding: '10px 12px', borderRadius: '12px 12px 4px 12px', maxWidth: '85%', marginLeft: 'auto', fontSize: '12px' }}>{m.text}</div> : <div style={{ background: 'rgba(139,92,246,0.12)', border: `1px solid ${cardBorder}`, padding: '12px', borderRadius: '12px', fontSize: '12px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}><div style={{ fontWeight: '800', color: heading, marginBottom: '4px' }}>✨ Cramnix AI</div>{m.text}</div>}</div>
                  ))}
                  {loading && <div style={{ fontSize: '11px', color: subText }}>✨ Thinking...</div>}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>
          )}

          {activeNav === 'student' && studentTab === 'plan' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ ...glass, padding: '12px' }}>
                <h3 style={{ margin: '0 0 4px 0', color: heading, fontSize: '14px' }}>📝 Study Plan</h3>
                <input value={studyTopic} onChange={(e) => setStudyTopic(e.target.value)} placeholder="Topic e.g. Photosynthesis" style={{ ...inputStyle, margin: '4px 0 8px 0', padding: '8px' }} />
                <button onClick={handleGenerateStudyPlan} style={{ ...primaryBtn, width: '100%', padding: '8px', fontSize: '12px' }}>{loading ? 'Creating...' : '🚀 Generate Plan'}</button>
              </div>
              {studentMessages.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {studentMessages.map((m, i) => (
                    <div key={i}>{m.type === 'user' ? <div style={{ background: purple, color: '#fff', padding: '8px 10px', borderRadius: '10px', maxWidth: '85%', marginLeft: 'auto', fontSize: '12px' }}>{m.text}</div> : <div style={{ background: 'rgba(139,92,246,0.12)', border: `1px solid ${cardBorder}`, padding: '10px', borderRadius: '10px', fontSize: '12px', whiteSpace: 'pre-wrap' }}>{m.text}</div>}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeNav === 'library' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input value={librarySearch} onChange={(e) => setLibrarySearch(e.target.value)} placeholder="Search files..." style={{ ...inputStyle, padding: '8px' }} />
              {filteredLibrary.length === 0 && <div style={{ textAlign: 'center', padding: '20px', color: subText, fontSize: '12px' }}>No files found. Upload below.</div>}
              {filteredLibrary.map((file) => (
                <div key={file.id} style={{ ...glass, padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{file.name}</div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => askLibraryFile(file)} style={{ background: purple, color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '6px', fontSize: '10px' }}>Ask</button>
                    <button onClick={() => deleteLibraryFile(file.id)} style={{ background: red, color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '6px', fontSize: '10px' }}>Del</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeNav === 'chatpdf' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pdfMessages.length === 0 ? <div style={{ textAlign: 'center', padding: '20px', color: subText, fontSize: '12px' }}>Upload a PDF/Image to chat.</div> : pdfMessages.map((m, i) => (
                <div key={i} style={{ fontSize: '12px', padding: '8px', background: m.type === 'user' ? purple : cardBg, borderRadius: '8px' }}>{m.text}</div>
              ))}
            </div>
          )}

          {activeNav === 'quizzes' && (<div style={{ ...glass, padding: '12px' }}><h3 style={{ margin: '0 0 6px 0', fontSize: '14px' }}>🧠 Quizzes</h3><input value={quizTopic} onChange={(e) => setQuizTopic(e.target.value)} placeholder="Topic..." style={{ ...inputStyle, padding: '8px' }} /><button onClick={() => generateRealQuiz(quizTopic)} style={{ ...primaryBtn, marginTop: '6px', width: '100%', padding: '8px', fontSize: '12px' }}>{quizLoading ? 'Generating...' : '⚡ Generate Quiz'}</button>{quizQuestions.length > 0 && <div style={{ marginTop: '8px', fontSize: '12px', whiteSpace: 'pre-wrap' }}>{quizQuestions[0].q}</div>}</div>)}
          {activeNav === 'flashcards' && (<div style={{ ...glass, padding: '12px' }}><h3 style={{ margin: '0 0 6px 0', fontSize: '14px' }}>📄 Flashcards</h3><input value={flashTopic} onChange={(e) => setFlashTopic(e.target.value)} placeholder="Topic..." style={{ ...inputStyle, padding: '8px' }} /><button onClick={() => generateRealFlashcards(flashTopic)} style={{ ...primaryBtn, marginTop: '6px', width: '100%', padding: '8px', fontSize: '12px' }}>{flashLoading ? 'Generating...' : '✨ Generate Cards'}</button></div>)}
          {activeNav === 'goals' && (<div style={{ ...glass, padding: '12px' }}><h3 style={{ margin: '0 0 6px 0', fontSize: '14px' }}>🎯 Goals</h3><div style={{ display: 'flex', gap: '4px' }}><input value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="New goal..." style={{ ...inputStyle, flex: 1, padding: '8px' }} /><button onClick={() => { if (newGoal.trim()) { setGoals([...goals, { text: newGoal, done: false }]); setNewGoal(''); } }} style={{ ...primaryBtn, padding: '8px 10px', fontSize: '11px' }}>Add</button></div>{goals.map((g, i) => <div key={i} onClick={() => setGoals(goals.map((x, xi) => xi === i ? { ...x, done: !x.done } : x))} style={{ fontSize: '12px', marginTop: '6px', cursor: 'pointer' }}>{g.done ? '✅' : '⬜'} {g.text}</div>)}</div>)}

          {activeNav === 'focus' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ ...glass, padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: '800' }}>🍅 Pomodoro Timer</div>
                <div style={{ fontSize: '32px', fontWeight: '900', margin: '4px 0' }}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
                <button onClick={() => setTimerActive(!timerActive)} style={{ ...primaryBtn, padding: '6px 12px', fontSize: '11px' }}>{timerActive ? '⏸️ Pause' : '▶ Start'}</button>
              </div>
            </div>
          )}

          {activeNav === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ ...glass, padding: '12px' }}><label style={{ fontSize: '11px', fontWeight: 'bold' }}>🔑 API Key</label><input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="API Key..." style={{ ...inputStyle, margin: '6px 0', padding: '8px' }} /><button onClick={handleSaveApiKey} style={{ ...primaryBtn, padding: '6px 10px', fontSize: '11px' }}>Save</button>{apiSaved && <div style={{ color: '#86EFAC', fontSize: '10px', marginTop: '4px' }}>🟢 Active</div>}</div>
            </div>
          )}
        </div>

        {/* BOTTOM INPUT BAR */}
        {showBottomBar && (
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => fileInputRef.current.click()} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '5px 10px', borderRadius: '999px', fontSize: '10px', fontWeight: '700' }}>📂 Upload</button>
              <input ref={fileInputRef} type="file" accept=".pdf,.txt,.png,.jpg,.jpeg" hidden onChange={handleFileUpload} />
              <button onClick={() => cameraInputRef.current.click()} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '5px 10px', borderRadius: '999px', fontSize: '10px', fontWeight: '700' }}>📸 Camera</button>
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden onChange={handleCameraCapture} />
              {activeNav === 'chatpdf' && sharedFile && <span style={{ fontSize: '10px', color: '#86EFAC' }}>✅ {sharedFile.name.slice(0, 10)}... <button onClick={() => setSharedFile(null)} style={{ background: 'none', border: 'none', color: '#FCA5A5' }}>❌</button></span>}
            </div>
            <form onSubmit={(e) => handleGenerate(e, chatPrompt, null, activeNav === 'student')} style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.35)', border: `1px solid ${cardBorder}`, borderRadius: '999px', padding: '3px 3px 3px 10px', alignItems: 'center' }}>
              <input value={chatPrompt} onChange={(e) => setChatPrompt(e.target.value)} placeholder="Ask anything..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: heading, fontSize: '12px' }} />
              {chatPrompt && <button type="button" onClick={() => setChatPrompt('')} style={{ background: 'none', border: 'none', color: '#FCA5A5', fontSize: '12px' }}>✕</button>}
              <button type="button" onClick={() => handleVoiceInput(setChatPrompt)} style={{ background: 'none', border: 'none', fontSize: '14px' }}>🎤</button>
              <button type="submit" disabled={loading} style={{ background: purple, border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontSize: '12px' }}>{loading ? '...' : '➤'}</button>
            </form>
          </div>
        )}
      </main>

      {/* FLOATING TOGGLE ARROW FOR RIGHT PANEL */}
      <button 
        onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
        style={{
          position: 'fixed',
          right: isRightPanelOpen ? '260px' : '0px',
          top: '75%',
          transform: 'translateY(-50%)',
          zIndex: 50,
          background: '#1E1538',
          color: '#C4B5FD',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRight: isRightPanelOpen ? 'none' : '1px solid rgba(255,255,255,0.15)',
          borderTopLeftRadius: '8px',
          borderBottomLeftRadius: '8px',
          padding: '8px 4px',
          cursor: 'pointer',
          boxShadow: '-2px 0px 8px rgba(0,0,0,0.4)',
          transition: 'right 0.3s ease',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
        title="Toggle Quiz & Flashcards"
      >
        {isRightPanelOpen ? '❯' : '❮'}
      </button>

      {/* RIGHT PANEL (Quiz Engine & Flashcards Drawer) */}
      <aside 
        style={{
          width: '250px',
          flexShrink: 0,
          background: 'rgba(20,12,40,0.98)',
          borderRadius: '14px',
          border: `1px solid ${cardBorder}`,
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          position: 'fixed',
          right: isRightPanelOpen ? '6px' : '-270px',
          top: '6px',
          bottom: '6px',
          zIndex: 40,
          transition: 'right 0.3s ease',
          overflowY: 'auto',
          boxSizing: 'border-box'
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><b style={{ color: heading, fontSize: '12px' }}>✨ Quiz Engine</b></div>
          <input value={quizTopic} onChange={(e) => setQuizTopic(e.target.value)} placeholder="Topic..." style={{ ...inputStyle, marginTop: '6px', padding: '8px', fontSize: '11px' }} />
          <button onClick={() => generateRealQuiz(quizTopic)} style={{ ...primaryBtn, width: '100%', marginTop: '6px', padding: '6px', fontSize: '11px' }}>{quizLoading ? 'Generating...' : '⚡ Generate Quiz'}</button>
          
          <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: '700', color: heading }}>🎯 Log Score</div>
          <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
            <input placeholder="Got - 8" id="gotScore" style={{ ...inputStyle, marginTop: 0, padding: '6px', fontSize: '10px' }} />
            <input placeholder="Total - 10" id="totalScore" style={{ ...inputStyle, marginTop: 0, padding: '6px', fontSize: '10px' }} />
          </div>
          <button onClick={() => { const got = document.getElementById('gotScore').value; const total = document.getElementById('totalScore').value; saveQuizScore(got, total); }} style={{ background: green, border: 'none', color: '#fff', padding: '6px', borderRadius: '8px', width: '100%', marginTop: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '10px' }}>📊 Save Score</button>
        </div>

        <div>
          <b style={{ color: heading, fontSize: '12px' }}>📄 Flashcards</b>
          <input value={flashTopic} onChange={(e) => setFlashTopic(e.target.value)} placeholder="Topic..." style={{ ...inputStyle, marginTop: '6px', padding: '8px', fontSize: '11px' }} />
          <button onClick={() => generateRealFlashcards(flashTopic)} style={{ ...primaryBtn, width: '100%', marginTop: '6px', padding: '6px', fontSize: '11px' }}>{flashLoading ? 'Generating...' : '✨ Generate Cards'}</button>
        </div>

        <div>
          <b style={{ color: heading, fontSize: '12px' }}>🎯 Goals</b>
          <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
            <input value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="Goal..." style={{ ...inputStyle, marginTop: 0, padding: '6px', fontSize: '10px' }} />
            <button onClick={() => { if (newGoal.trim()) { setGoals([...goals, { text: newGoal, done: false }]); setNewGoal(''); } }} style={{ background: purple, color: '#fff', border: 'none', padding: '0 8px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '10px' }}>Add</button>
          </div>
        </div>
      </aside>

    </div>
  );
}