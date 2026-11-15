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
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const bg = '#0A0618';
  const cardBg = 'rgba(255,255,255,0.06)';
  const cardBorder = 'rgba(255,255,255,0.12)';
  const textColor = '#EDE9FE';
  const subText = '#A78BFA';
  const heading = '#FFFFFF';
  const purple = '#8B5CF6';
  const purple2 = '#6D28D9';
  const green = '#22C55E';
  const red = '#EF4444';
  const showBottomBar = ['dashboard', 'student', 'library', 'chatpdf', 'professional'].includes(activeNav);

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
      else { await navigator.clipboard.writeText(textToShare); setShareMsg('Copied to clipboard! You can paste anywhere.'); }
    } catch (e) { try { await navigator.clipboard.writeText(textToShare); setShareMsg('Copied to clipboard!'); } catch { setShareMsg('Copy failed.'); } }
    setTimeout(() => setShareMsg(''), 3000);
  };
  const handleExport = () => {
    const content = response || chatPrompt || 'No content to export yet.';
    if (!response && !chatPrompt) { alert('Nothing to export yet. Ask a question first.'); return; }
    const fullText = `Cramnix AI - Export\nDate: ${new Date().toLocaleString()}\n\nQuestion:\n${chatPrompt || 'N/A'}\n\nAnswer:\n${content}\n\n---\nGenerated by Cramnix AI`;
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Cramnix_Answer_${Date.now()}.txt`; a.click(); URL.revokeObjectURL(url);
    setShareMsg('Exported! File downloaded.');
    setTimeout(() => setShareMsg(''), 3000);
  };
  const handleDownloadAnswer = (txt) => {
    const t = txt || response;
    if (!t) { alert('No answer to download yet.'); return; }
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
    setShareMsg('New chat started for this section!');
    setTimeout(() => setShareMsg(''), 2000);
  };
  const speakAnswer = (text) => {
    if (!text) { alert('No answer to read yet.'); return; }
    if (!('speechSynthesis' in window)) { alert('Read aloud not supported.'); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = 1;
    u.onstart = () => setIsSpeaking(true); u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  };
  const stopSpeaking = () => { if (window.speechSynthesis) window.speechSynthesis.cancel(); setIsSpeaking(false); };
  useEffect(() => { if (autoRead && response) speakAnswer(response); }, [response]);

  const generateRealQuiz = async (topicInput) => {
    const topic = (topicInput || quizTopic || chatPrompt || '').trim();
    if (!topic) { alert('Please enter a topic first.'); return; }
    if (topic.toLowerCase() === 'general') { alert('Please enter a real topic, not General.'); return; }
    setQuizLoading(true); setQuizQuestions([]); setCurrentQ(0); setSelectedQuiz(null);
    try {
      const res = await fetch('https://cramnix-ai-v2.onrender.com/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: `Create 5 multiple choice questions for topic: ${topic}. Format each as Q: question | A) opt1 | B) opt2 | C) opt3 | D) opt4 | Answer: X. Keep it in English only.`, api_key: apiSaved && apiKey.trim() ? apiKey.trim() : null }) });
      const data = await res.json();
      if (res.ok && data.response && !data.response.includes('429')) { setQuizQuestions([{ q: data.response, opts: [], ans: -1 }]); setQuizTopic(topic); }
      else alert('AI is busy. Please try again after some time.');
    } catch (e) { alert('Connection error. Try again.'); }
    setQuizLoading(false);
  };
  const generateRealFlashcards = async (topicInput) => {
    const topic = (topicInput || flashTopic || chatPrompt || '').trim();
    if (!topic) { alert('Please enter a topic first.'); return; }
    if (topic.toLowerCase() === 'general') { alert('Please enter a real topic, not General.'); return; }
    setFlashLoading(true); setFlashcards([]);
    try {
      const res = await fetch('https://cramnix-ai-v2.onrender.com/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: `Create 6 flashcards for topic: ${topic}. Each flashcard: Question and Answer. Keep it in English only.`, api_key: apiSaved && apiKey.trim() ? apiKey.trim() : null }) });
      const data = await res.json();
      if (res.ok && data.response && !data.response.includes('429')) { setFlashcards([{ q: data.response, a: 'AI Generated Flashcards' }]); setFlashTopic(topic); }
      else alert('AI is busy. Please try again after some time.');
    } catch (e) { alert('Connection error. Try again.'); }
    setFlashLoading(false);
  };

  const handleLogin = (e) => {
    e.preventDefault(); setLoginError('');
    const nameValid = userName.trim().length >= 3;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userContact.trim());
    const isPhone = /^\d{10}$/.test(userContact.trim());
    if (nameValid && (isEmail || isPhone)) { localStorage.setItem('cramnix_name', userName.trim()); localStorage.setItem('cramnix_contact', userContact.trim()); setIsLoggedIn(true); }
    else setLoginError('Please enter a valid Full Name and Email ID or 10-digit Mobile Number!');
  };
  const handleLogout = () => { localStorage.removeItem('cramnix_name'); localStorage.removeItem('cramnix_contact'); setIsLoggedIn(false); setUserName(''); setUserContact(''); };
  const handleSaveApiKey = () => { setApiKeyError(''); if (apiKey.trim().length >= 20) setApiSaved(true); else { setApiSaved(false); setApiKeyError('Please enter a valid API Key from Google AI Studio.'); } };
  const createNewChat = () => { handleNewChatClick(); };
  const togglePinChat = (id, e) => { e.stopPropagation(); setChats(chats.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c)); };
  const deleteChat = (id, e) => { e.stopPropagation(); const f = chats.filter(c => c.id !== id); setChats(f); if (f.length > 0) setCurrentChatId(f[0].id); else createNewChat(); };

  const handleGenerate = async (e, textToRun, attachedFile = null, isStudent = false) => {
    if (e) e.preventDefault();
    const fileToUse = attachedFile || (activeNav === 'chatpdf' ? sharedFile : null);
    const qText = (textToRun || chatPrompt || '').trim();
    if (!qText && !fileToUse) return;
    let setMsgs = setDashboardMessages;
    if (activeNav === 'student' || isStudent) setMsgs = setStudentMessages;
    else if (activeNav === 'chatpdf') setMsgs = setPdfMessages;
    else if (activeNav === 'professional') setMsgs = setProfessionalMessages;
    else setMsgs = setDashboardMessages;
    if (!apiSaved && requestCount >= 4) { const msg = 'Free limit reached (0/4). You will get 4 more tomorrow at 12 AM. Or add your API Key for unlimited use.'; setResponse(msg); setMsgs(prev => [...prev, { type: 'user', text: qText }, { type: 'ai', text: msg }]); return; }
    setLoading(true); setResponse('');
    if (qText) setMsgs(prev => [...prev, { type: 'user', text: qText }]);
    else if (fileToUse) setMsgs(prev => [...prev, { type: 'user', text: `📄 ${fileToUse.name} - Please explain this file` }]);
    setChatPrompt('');
    const fileContext = fileToUse ? `[Attached File: ${fileToUse.name}]` : '';
    let tabPrefix = '';
    if (isStudent || activeNav === 'student') {
      if (studentTab === 'plan') tabPrefix = 'Create a detailed study plan for: ';
      if (studentTab === 'notes') tabPrefix = 'Create clean study notes in English for: ';
      if (studentTab === 'quiz') tabPrefix = 'Create 5 MCQs in English for: ';
      if (studentTab === 'flashcards') tabPrefix = 'Create flashcards in English for: ';
    }
    const finalPrompt = `[Language: English] ${fileContext} ${tabPrefix}${qText || 'Analyze the uploaded file.'}`;
    try {
      const res = await fetch('https://cramnix-ai-v2.onrender.com/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: finalPrompt, api_key: apiSaved && apiKey.trim() ? apiKey.trim() : null }) });
      const data = await res.json();
      const raw = JSON.stringify(data);
      if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED') || raw.includes('Quota exceeded')) {
        const friendly = '⚠️ AI is busy right now (Daily free limit reached).\n\nPlease try again after 15-20 minutes.\n\nTip: Add your own Gemini API Key in Settings for unlimited use.';
        setResponse(friendly); setMsgs(prev => [...prev, { type: 'ai', text: friendly }]); setLoading(false); return;
      }
      if (res.ok) {
        setResponse(data.response);
        setMsgs(prev => [...prev, { type: 'ai', text: data.response }]);
        if (!apiSaved) { const nc = requestCount + 1; setRequestCount(nc); localStorage.setItem('cramnix_count', nc.toString()); localStorage.setItem('cramnix_date', new Date().toDateString()); }
        const chatTitle = qText ? qText.slice(0, 18) + '...' : (fileToUse ? fileToUse.name : 'New Chat');
        setChats(chats.map(c => c.id === currentChatId && c.title === 'New Chat' ? { ...c, title: chatTitle } : c));
      } else { const friendly = '⚠️ Something went wrong. Please try again in a few minutes.'; setResponse(friendly); setMsgs(prev => [...prev, { type: 'ai', text: friendly }]); }
    } catch (err) { const msg = 'Connection Error. Please check your internet and try again.'; setResponse(msg); setMsgs(prev => [...prev, { type: 'ai', text: msg }]); }
    finally { setLoading(false); }
  };

  const handleGenerateStudyPlan = async (e) => {
    if (e) e.preventDefault();
    if (!studyTopic.trim()) { alert('Please enter your topic first.'); return; }
    const fullPrompt = `Create a complete study plan in ENGLISH ONLY for topic: ${studyTopic}. Duration: ${studyDays}. Level: ${studyLevel}. Daily Time: ${studyHours}. Make the plan like this: 1. TODAY'S PLAN - Hour by hour timetable. 2. HOW TO BREAK HARD TOPIC - Easy, Medium, Hard. 3. DAY-WISE PLAN for ${studyDays}. 4. YEAR PLAN. 5. REVISION + QUIZ + FLASHCARDS. 6. MOTIVATION TIP. Keep it simple, clear, and in English only.`;
    setLoading(true);
    setStudentMessages(prev => [...prev, { type: 'user', text: `📝 Study Plan for ${studyTopic} - ${studyDays} - ${studyLevel} - ${studyHours}` }]);
    try {
      const res = await fetch('https://cramnix-ai-v2.onrender.com/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: fullPrompt, api_key: apiSaved && apiKey.trim() ? apiKey.trim() : null }) });
      const data = await res.json();
      const raw = JSON.stringify(data);
      if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED')) {
        const friendly = '⚠️ AI is busy right now (Daily free limit reached).\n\nPlease try again after 15-20 minutes.';
        setResponse(friendly); setStudentMessages(prev => [...prev, { type: 'ai', text: friendly }]); setLoading(false); return;
      }
      if (res.ok) {
        setResponse(data.response);
        setStudentMessages(prev => [...prev, { type: 'ai', text: data.response }]);
        if (!apiSaved) { const nc = requestCount + 1; setRequestCount(nc); localStorage.setItem('cramnix_count', nc.toString()); localStorage.setItem('cramnix_date', new Date().toDateString()); }
      } else {
        const friendly = '⚠️ Something went wrong. Please try again in a few minutes.';
        setResponse(friendly); setStudentMessages(prev => [...prev, { type: 'ai', text: friendly }]);
      }
    } catch (err) {
      const msg = 'Connection Error. Please check your internet and try again.';
      setResponse(msg); setStudentMessages(prev => [...prev, { type: 'ai', text: msg }]);
    }
    setLoading(false);
  };

  const handleVoiceInput = (setterFunc) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) { alert('Speech recognition not supported.'); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR(); rec.lang = 'en-US'; rec.onresult = (ev) => setterFunc(ev.results[0][0].transcript); rec.start();
  };
  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newFile = { id: Date.now().toString(), name: file.name, type: file.type.includes('image') ? 'Image' : 'PDF', size: (file.size / 1024).toFixed(0) + ' KB', date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) };
      const updated = [newFile, ...libraryFiles];
      setLibraryFiles(updated);
      localStorage.setItem('cramnix_library', JSON.stringify(updated));
      if (activeNav === 'chatpdf') {
        setSharedFile(file);
        setPdfMessages(prev => [...prev, { type: 'user', text: `📸 Camera Photo: ${file.name} - Please explain this image` }]);
        handleGenerate(null, `Please explain this image: ${file.name}`, file, false);
      } else {
        setShareMsg(`Photo added to Library: ${file.name}`);
        setTimeout(() => setShareMsg(''), 3000);
      }
    }
  };
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newFile = { id: Date.now().toString(), name: file.name, type: file.type.includes('image') || file.name.match(/\.(jpg|jpeg|png)/i) ? 'Image' : 'PDF', size: file.size > 1024*1024 ? (file.size / (1024*1024)).toFixed(1) + ' MB' : (file.size / 1024).toFixed(0) + ' KB', date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) };
      const updated = [newFile, ...libraryFiles];
      setLibraryFiles(updated);
      localStorage.setItem('cramnix_library', JSON.stringify(updated));
      if (activeNav === 'chatpdf') {
        setSharedFile(file);
        setShareMsg(`File added: ${file.name}. Now ask a question about this PDF.`);
      } else if (activeNav === 'library') {
        setShareMsg(`File added to Library: ${file.name}.`);
      } else {
        setShareMsg(`File saved to Library: ${file.name}. Open Chat with PDF to chat with it.`);
      }
      setTimeout(() => setShareMsg(''), 3000);
    }
  };

  const deleteLibraryFile = (id) => {
    const updated = libraryFiles.filter(f => f.id !== id);
    setLibraryFiles(updated);
    localStorage.setItem('cramnix_library', JSON.stringify(updated));
  };
  const askLibraryFile = (file) => {
    setActiveNav('chatpdf');
    setSharedFile({ name: file.name });
    setChatPrompt(`Explain this file: ${file.name} in simple English`);
    setShareMsg(`Selected ${file.name}. Ask your question below.`);
    setTimeout(() => setShareMsg(''), 3000);
  };
  const notesLibraryFile = (file) => {
    setActiveNav('student');
    setStudentTab('notes');
    setChatPrompt(`Make clean notes in English for file: ${file.name}`);
    setShareMsg(`Making notes for ${file.name}...`);
    setTimeout(() => setShareMsg(''), 3000);
  };

  const saveQuizScore = (got, total) => {
    if (!got || !total) { alert('Please fill both boxes!'); return; }
    const updated = [...quizScores, { got: parseInt(got), total: parseInt(total) }];
    setQuizScores(updated);
    localStorage.setItem('cramnix_scores', JSON.stringify(updated));
    alert('Score saved! It will show in Focus Zone.');
  };

  const freeLeft = Math.max(0, 4 - requestCount);
  const sortedChats = [...chats].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  const glass = { background: cardBg, padding: '16px', borderRadius: '18px', border: `1px solid ${cardBorder}`, backdropFilter: 'blur(12px)' };
  const inputStyle = { width: '100%', padding: '12px', background: 'rgba(0,0,0,0.35)', border: `1px solid ${cardBorder}`, borderRadius: '12px', color: heading, boxSizing: 'border-box' };
  const primaryBtn = { background: `linear-gradient(90deg, ${purple}, ${purple2})`, color: '#fff', border: 'none', padding: '11px 16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
  const filteredLibrary = libraryFiles.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(librarySearch.toLowerCase());
    const matchFilter = libraryFilter === 'All' || f.type === libraryFilter;
    return matchSearch && matchFilter;
  });

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', background: bg, color: textColor, fontFamily: 'Inter, sans-serif' }}>
        <div style={{ width: '320px', background: 'linear-gradient(180deg,#1E1538,#0F0A1E)', padding: '30px', borderRight: `1px solid ${cardBorder}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div><h2 style={{ color: heading, fontSize: '22px' }}>💠 Cramnix AI</h2><p style={{ color: subText, fontSize: '13px' }}>Universal AI Workspace for Students and Professionals.</p></div>
          <div style={{ textAlign: 'center', fontSize: '13px', color: subText }}><p>Made with ❤️ by <br/><strong style={{ color: heading }}>Amitkumar Gautam</strong></p><a href="https://github.com/amitkumar-ds28" target="_blank" rel="noreferrer" style={{ color: '#A78BFA', textDecoration: 'none' }}>GitHub Profile</a></div>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '500px', background: cardBg, padding: '40px', borderRadius: '20px', border: `1px solid ${cardBorder}` }}>
            <h1 style={{ fontSize: '24px', color: heading }}>💠 Cramnix AI - Secure Cloud Login</h1>
            <p style={{ color: subText, fontSize: '14px', marginBottom: '28px' }}>Sign in once and access your persistent AI workspace</p>
            {loginError && <div style={{ background: 'rgba(239,68,68,0.15)', color: '#FCA5A5', padding: '12px', borderRadius: '10px', marginBottom: '18px', fontSize: '13px' }}>{loginError}</div>}
            <form onSubmit={handleLogin}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: heading }}>Full Name</label>
              <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="e.g. Amitkumar Gautam" required style={{ ...inputStyle, marginBottom: '18px' }} />
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: heading }}>Email ID or 10-Digit Mobile</label>
              <input type="text" value={userContact} onChange={(e) => setUserContact(e.target.value)} placeholder="amit@example.com or 9876543210" required style={{ ...inputStyle, marginBottom: '22px' }} />
              <button type="submit" style={{ width: '100%', padding: '12px', background: `linear-gradient(90deg, ${purple}, ${purple2})`, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>🚀 Login / Get Started</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const navItem = (id, icon, label, active) => (
    <div key={id} onClick={() => { setActiveNav(id); setChatPrompt(''); setResponse(''); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: active ? '800' : '500', background: active ? purple : 'transparent', color: active ? '#fff' : '#C4B5FD' }}>
      <span>{icon}</span> {label}
    </div>
  );
  const studentTabBtn = (id, label) => (
    <button key={id} onClick={() => setStudentTab(id)} style={{ background: studentTab === id ? purple : cardBg, border: `1px solid ${cardBorder}`, color: '#fff', padding: '8px 16px', borderRadius: '999px', cursor: 'pointer', fontSize: '13px', fontWeight: studentTab === id ? '800' : '500' }}>{label}</button>
  );
  const libraryFilterBtn = (label) => (
    <button key={label} onClick={() => setLibraryFilter(label)} style={{ background: libraryFilter === label ? purple : cardBg, border: `1px solid ${cardBorder}`, color: '#fff', padding: '7px 14px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: libraryFilter === label ? '800' : '500' }}>{label}</button>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: `radial-gradient(800px 400px at 15% 0%, #2E1A5E 0%, transparent 60%), radial-gradient(700px 400px at 90% 20%, #3B1A6B 0%, transparent 60%), ${bg}`, color: textColor, fontFamily: 'Inter, sans-serif', padding: '14px', gap: '14px', boxSizing: 'border-box', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Left Sidebar */}
      <aside style={{ width: '260px', flexShrink: 0, background: 'linear-gradient(180deg, rgba(30,21,56,0.95), rgba(10,6,24,0.95))', borderRadius: '22px', border: `1px solid ${cardBorder}`, padding: '20px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 30 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 8px 16px 8px' }}>
            <img src="/logo.png" alt="Cramnix Logo" onError={(e) => { e.target.style.display = 'none'; }} style={{ width: '38px', height: '38px', borderRadius: '12px', objectFit: 'cover', background: 'white', padding: '2px' }} />
            <div><div style={{ fontSize: '19px', fontWeight: '900', color: heading, lineHeight: '1' }}>Cramnix AI</div><div style={{ fontSize: '10px', color: subText, letterSpacing: '1px', marginTop: '4px' }}>STUDENT ZONE 🎓</div></div>
          </div>
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
          <div style={{ margin: '14px 6px 0 6px', background: 'linear-gradient(135deg,#7C3AED,#4C1D95)', padding: '12px', borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}><span>🎁 Free Left</span><span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 7px', borderRadius: '999px' }}>{apiSaved ? 'UNLIMITED' : `${freeLeft} / 4`}</span></div>
            <div style={{ fontSize: '20px', fontWeight: '900', margin: '6px 0' }}>{apiSaved ? '∞ Unlimited' : `${freeLeft} / 4 Left`}</div>
            <div style={{ height: '5px', background: 'rgba(255,255,255,0.25)', borderRadius: '999px', overflow: 'hidden' }}><div style={{ width: apiSaved ? '100%' : `${(freeLeft / 4) * 100}%`, height: '100%', background: '#fff' }} /></div>
            <div style={{ fontSize: '10px', marginTop: '6px', opacity: 0.9 }}>🔥 {streak} Days Streak • 🍅 {pomodoroCount} • ⏱️ {totalFocusMins}m</div>
          </div>
          <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', color: '#FCA5A5', marginTop: '8px' }}><span>↩️</span> Logout</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.08)', padding: '10px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: purple, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '16px' }}>{userName ? userName[0].toUpperCase() : 'A'}</div>
          <div style={{ flex: 1, overflow: 'hidden' }}><div style={{ fontSize: '14px', fontWeight: '800', color: heading, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div></div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, minWidth: 0, background: 'rgba(10,6,24,0.55)', borderRadius: '22px', border: `1px solid ${cardBorder}`, padding: '20px', display: 'flex', flexDirection: 'column', backdropFilter: 'blur(10px)', transition: 'all 0.3s ease', marginRight: isRightPanelOpen ? '320px' : '0px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: heading }}>{activeNav === 'chatpdf' ? 'Chat with PDF' : activeNav === 'dashboard' ? 'Dashboard' : activeNav === 'student' ? 'Student Zone' : activeNav === 'professional' ? 'Professional Zone' : activeNav === 'focus' ? 'Focus Zone' : activeNav === 'library' ? 'Library' : activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}</h1>
            {activeNav === 'chatpdf' ? (<span style={{ fontSize: '11px', background: 'rgba(139,92,246,0.25)', border: `1px solid ${cardBorder}`, padding: '4px 9px', borderRadius: '999px', fontWeight: '800' }}>{sharedFile ? `📄 ${sharedFile.name.slice(0, 20)}` : '📄 No PDF'}</span>) : (<span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.08)', border: `1px solid ${cardBorder}`, padding: '4px 9px', borderRadius: '999px', fontWeight: '700', color: subText }}>📄 No PDF</span>)}
            <span style={{ fontSize: '11px', color: '#86EFAC' }}>🟢 Online</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={() => setAutoRead(!autoRead)} style={{ background: autoRead ? green : cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '7px 12px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}>🔊 Auto Read {autoRead ? 'ON' : 'OFF'}</button>
            <button onClick={handleShare} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '7px 12px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}>↗ Share</button>
            <button onClick={handleExport} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '7px 12px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}>⬇ Export</button>
            <button onClick={handleNewChatClick} style={{ background: green, border: 'none', color: '#fff', padding: '7px 12px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer', fontWeight: '800' }}>+ New Chat</button>
          </div>
        </div>
        {shareMsg && <div style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid #22C55E', color: '#86EFAC', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', marginBottom: '10px' }}>✅ {shareMsg}</div>}

        {activeNav === 'student' && (<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>{studentTabBtn('plan', '📝 Study Plan')}{studentTabBtn('notes', '📄 Notes')}{studentTabBtn('quiz', '🧠 Quiz')}{studentTabBtn('flashcards', '📄 Flashcards')}</div>)}
        {activeNav === 'student' && (<div style={{ background: 'rgba(139,92,246,0.12)', border: `1px solid ${cardBorder}`, padding: '12px 14px', borderRadius: '14px', marginBottom: '12px', fontSize: '13px' }}>{studentTab === 'plan' && <><b>📝 Study Plan Mode</b> <span style={{ color: subText }}>— Enter topic, time and level. Get your full day-wise plan.</span></>}{studentTab === 'notes' && <><b>📄 Notes Mode</b> <span style={{ color: subText }}>— Enter topic or upload PDF. Get clean notes in English.</span></>}{studentTab === 'quiz' && <><b>🧠 Quiz Mode</b> <span style={{ color: subText }}>— Enter topic. Get 5 MCQs in English.</span></>}{studentTab === 'flashcards' && <><b>📄 Flashcards Mode</b> <span style={{ color: subText }}>— Enter topic. Get flashcards in English.</span></>}</div>)}
        {sharedFile && activeNav === 'chatpdf' && <div style={{ ...glass, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', marginBottom: '12px' }}><div style={{ fontSize: '13px' }}>📄 <b>{sharedFile.name}</b> <span style={{ color: '#86EFAC', marginLeft: '8px' }}>✔ Processed</span></div><button onClick={() => setSharedFile(null)} style={{ background: red, color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>❌ Remove</button></div>}

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
          {activeNav === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
                <div style={{ background: 'linear-gradient(135deg,#7C3AED,#4C1D95)', padding: '16px', borderRadius: '16px' }}><div style={{ fontSize: '11px', opacity: 0.9 }}>📅 TODAY STUDY</div><div style={{ fontSize: '22px', fontWeight: '900', marginTop: '8px' }}>{totalFocusMins}m</div><div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.85 }}>Goal: 180m • {goalPercent}% done</div></div>
                <div style={{ ...glass }}><div style={{ fontSize: '11px', color: subText }}>🍅 POMODORO</div><div style={{ fontSize: '22px', fontWeight: '900', marginTop: '8px' }}>{pomodoroCount} Sessions</div><div style={{ fontSize: '11px', color: subText, marginTop: '4px' }}>🔥 {streak} Days Streak</div></div>
                <div style={{ ...glass }}><div style={{ fontSize: '11px', color: subText }}>🧠 QUIZ AVG</div><div style={{ fontSize: '22px', fontWeight: '900', marginTop: '8px' }}>{quizAvg}%</div><div style={{ fontSize: '11px', color: subText, marginTop: '4px' }}>{quizScores.length} Quiz Done</div></div>
                <div style={{ ...glass }}><div style={{ fontSize: '11px', color: subText }}>🎯 GOALS</div><div style={{ fontSize: '22px', fontWeight: '900', marginTop: '8px' }}>{goals.filter(g => g.done).length}/{goals.length} Done</div><div style={{ fontSize: '11px', color: subText, marginTop: '4px' }}>Add a goal to start</div></div>
              </div>
              {dashboardMessages.length === 0 && !loading && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '42px' }}>✨</div>
                  <h2 style={{ fontSize: '28px', fontWeight: '900', color: heading, margin: '12px 0 6px 0' }}>Hello, {userName || 'amit'} 👋</h2>
                  <p style={{ color: subText, fontSize: '15px', margin: 0 }}>What do you want to learn today?</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px' }}>
                    <button onClick={() => setChatPrompt('Explain Photosynthesis in simple words')} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '8px 14px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px' }}>🌱 Photosynthesis</button>
                    <button onClick={() => setChatPrompt('Make 5 MCQs for Cellular Respiration')} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '8px 14px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px' }}>🧠 Make Quiz</button>
                    <button onClick={() => setChatPrompt('Make flashcards for Human Body')} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '8px 14px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px' }}>📄 Flashcards</button>
                    <button onClick={() => setChatPrompt('Give me a study plan for today')} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '8px 14px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px' }}>🎯 Study Plan</button>
                  </div>
                </div>
              )}
              {dashboardMessages.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px 0' }}>
                  {dashboardMessages.map((m, i) => (
                    <div key={i}>{m.type === 'user' ? <div style={{ background: purple, color: '#fff', padding: '12px 16px', borderRadius: '18px 18px 4px 18px', maxWidth: '80%', marginLeft: 'auto', fontSize: '14px', lineHeight: '1.5' }}>{m.text}</div> : <div style={{ background: 'rgba(139,92,246,0.12)', border: `1px solid ${cardBorder}`, padding: '16px', borderRadius: '16px', fontSize: '14px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}><div style={{ fontWeight: '800', color: heading, marginBottom: '8px' }}>✨ Cramnix AI</div>{m.text}<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}><button onClick={() => speakAnswer(m.text)} style={{ background: purple, color: '#fff', border: 'none', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>🔊 Read Aloud</button><button onClick={stopSpeaking} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: `1px solid ${cardBorder}`, padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>⏹ Stop</button><button onClick={() => handleDownloadAnswer(m.text)} style={{ background: green, color: '#fff', border: 'none', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>📥 Download</button><button onClick={handleShare} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: `1px solid ${cardBorder}`, padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>↗ Share</button></div></div>}</div>
                  ))}
                  {loading && <div style={{ fontSize: '13px', color: subText }}>✨ Cramnix AI is thinking...</div>}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>
          )}

          {activeNav === 'student' && studentTab === 'plan' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ ...glass }}>
                <h3 style={{ margin: '0 0 6px 0', color: heading }}>📝 Create Your Study Plan</h3>
                <p style={{ fontSize: '13px', color: subText, margin: '0 0 14px 0' }}>Tell me your topic, time and level. I will make your full day-wise + year-wise plan in English.</p>
                <label style={{ fontSize: '12px', fontWeight: '700', color: heading }}>1. What is your topic / subject?</label>
                <input value={studyTopic} onChange={(e) => setStudyTopic(e.target.value)} placeholder="e.g. Photosynthesis, Human Body, Maths - Algebra, Full Class 10 Science" style={{ ...inputStyle, margin: '6px 0 14px 0' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div><label style={{ fontSize: '12px', fontWeight: '700', color: heading }}>2. How many days?</label><select value={studyDays} onChange={(e) => setStudyDays(e.target.value)} style={{ ...inputStyle, marginTop: '6px', padding: '10px' }}><option>1 Day</option><option>7 Days</option><option>30 Days</option><option>3 Months</option><option>1 Year</option></select></div>
                  <div><label style={{ fontSize: '12px', fontWeight: '700', color: heading }}>3. How hard is it?</label><select value={studyLevel} onChange={(e) => setStudyLevel(e.target.value)} style={{ ...inputStyle, marginTop: '6px', padding: '10px' }}><option>Easy - I know basics</option><option>Medium - Little bit hard</option><option>Hard - Very difficult</option></select></div>
                  <div><label style={{ fontSize: '12px', fontWeight: '700', color: heading }}>4. Daily study time?</label><select value={studyHours} onChange={(e) => setStudyHours(e.target.value)} style={{ ...inputStyle, marginTop: '6px', padding: '10px' }}><option>1 Hour / Day</option><option>2 Hours / Day</option><option>3 Hours / Day</option><option>5 Hours / Day</option></select></div>
                </div>
                <button onClick={handleGenerateStudyPlan} style={{ ...primaryBtn, width: '100%', marginTop: '14px', padding: '12px' }}>{loading ? 'Creating Your Plan...' : '🚀 Generate My Study Plan'}</button>
              </div>
              {studentMessages.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {studentMessages.map((m, i) => (
                    <div key={i}>{m.type === 'user' ? <div style={{ background: purple, color: '#fff', padding: '12px 16px', borderRadius: '18px 18px 4px 18px', maxWidth: '80%', marginLeft: 'auto', fontSize: '14px' }}>{m.text}</div> : <div style={{ background: 'rgba(139,92,246,0.12)', border: `1px solid ${cardBorder}`, padding: '16px', borderRadius: '16px', fontSize: '14px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{m.text}</div>}</div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeNav === 'student' && studentTab !== 'plan' && studentMessages.length === 0 && !loading && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '42px' }}>📄</div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', color: heading }}>{studentTab === 'notes' ? 'Notes Generator' : studentTab === 'quiz' ? 'Quiz Generator' : 'Flashcards Generator'}</h2>
              <p style={{ color: subText, fontSize: '14px' }}>Enter a topic below, I will create it in English.</p>
            </div>
          )}
          {activeNav === 'student' && studentTab !== 'plan' && studentMessages.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px 0' }}>
              {studentMessages.map((m, i) => (
                <div key={i}>{m.type === 'user' ? <div style={{ background: purple, color: '#fff', padding: '12px 16px', borderRadius: '18px 18px 4px 18px', maxWidth: '80%', marginLeft: 'auto', fontSize: '14px' }}>{m.text}</div> : <div style={{ background: 'rgba(139,92,246,0.12)', border: `1px solid ${cardBorder}`, padding: '16px', borderRadius: '16px', fontSize: '14px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{m.text}</div>}</div>
              ))}
            </div>
          )}

          {activeNav === 'library' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.35)', border: `1px solid ${cardBorder}`, borderRadius: '999px', padding: '8px 14px' }}><span>🔍</span><input value={librarySearch} onChange={(e) => setLibrarySearch(e.target.value)} placeholder="Search your files..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: heading, fontSize: '13px' }} /></div>
                <div style={{ display: 'flex', gap: '6px' }}>{libraryFilterBtn('All')}{libraryFilterBtn('PDF')}{libraryFilterBtn('Image')}</div>
                <span style={{ fontSize: '12px', color: subText, fontWeight: '700' }}>Total: {libraryFiles.length} Files</span>
              </div>
              {filteredLibrary.length === 0 && libraryFiles.length === 0 && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: '56px' }}>📚</div><h2 style={{ color: heading, margin: '14px 0 6px 0', fontSize: '22px' }}>Your Library is Empty</h2><p style={{ color: subText, fontSize: '14px' }}>Upload your first PDF below.</p><button onClick={() => fileInputRef.current.click()} style={{ ...primaryBtn, marginTop: '18px' }}>📂 Upload First File</button>
                </div>
              )}
              {filteredLibrary.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                  {filteredLibrary.map((file) => (
                    <div key={file.id} style={{ ...glass, padding: '14px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}><div style={{ width: '42px', height: '42px', background: file.type === 'PDF' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{file.type === 'PDF' ? '📄' : '🖼️'}</div><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: '13px', fontWeight: '800', color: heading, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div><div style={{ fontSize: '11px', color: subText }}>{file.type} • {file.date} • {file.size}</div></div><button onClick={() => deleteLibraryFile(file.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button></div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}><button onClick={() => askLibraryFile(file)} style={{ flex: 1, background: purple, color: '#fff', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>💬 Ask AI</button><button onClick={() => notesLibraryFile(file)} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: `1px solid ${cardBorder}`, color: '#fff', padding: '8px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>📄 Notes</button></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeNav === 'chatpdf' && pdfMessages.length === 0 && !loading && (<div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}><div style={{ fontSize: '42px' }}>💬</div><h2 style={{ color: heading }}>Chat with PDF</h2><p style={{ color: subText, fontSize: '14px' }}>Upload a PDF below and ask questions about it.</p></div>)}
          {activeNav === 'chatpdf' && pdfMessages.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px 0' }}>
              {pdfMessages.map((m, i) => (
                <div key={i}>{m.type === 'user' ? <div style={{ background: purple, color: '#fff', padding: '12px 16px', borderRadius: '18px 18px 4px 18px', maxWidth: '80%', marginLeft: 'auto', fontSize: '14px' }}>{m.text}</div> : <div style={{ background: 'rgba(139,92,246,0.12)', border: `1px solid ${cardBorder}`, padding: '16px', borderRadius: '16px', fontSize: '14px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}><b>✨ Cramnix AI • PDF Chat</b><br /><br />{m.text}</div>}</div>
              ))}
            </div>
          )}

          {activeNav === 'quizzes' && (<div style={{ ...glass }}><h3 style={{ margin: '0 0 10px 0', color: heading }}>🧠 Quizzes - {quizTopic || 'No Topic'}</h3><input value={quizTopic} onChange={(e) => setQuizTopic(e.target.value)} placeholder="Enter topic... e.g. Photosynthesis" style={inputStyle} /><button onClick={() => generateRealQuiz(quizTopic)} style={{ ...primaryBtn, marginTop: '10px' }}>{quizLoading ? 'Generating...' : '⚡ Generate 5 MCQs'}</button>{quizQuestions.length === 0 ? <p style={{ fontSize: '13px', color: subText, marginTop: '12px' }}>No quiz yet.</p> : <div style={{ marginTop: '14px', fontSize: '13px', whiteSpace: 'pre-wrap' }}>{quizQuestions[0].q}</div>}</div>)}
          {activeNav === 'flashcards' && (<div style={{ ...glass }}><h3 style={{ margin: '0 0 10px 0', color: heading }}>📄 Flashcards - {flashTopic || 'No Topic'}</h3><input value={flashTopic} onChange={(e) => setFlashTopic(e.target.value)} placeholder="Enter topic... e.g. Photosynthesis" style={inputStyle} /><button onClick={() => generateRealFlashcards(flashTopic)} style={{ ...primaryBtn, marginTop: '10px' }}>{flashLoading ? 'Generating...' : '⚡ Generate Flashcards'}</button><p style={{ fontSize: '13px', color: subText, marginTop: '12px' }}>{flashcards.length === 0 ? 'No flashcards yet.' : flashcards[0].q}</p></div>)}
          {activeNav === 'goals' && (<div style={{ ...glass }}><h3 style={{ margin: '0 0 10px 0', color: heading }}>🎯 Goals</h3><div style={{ display: 'flex', gap: '8px' }}><input value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="Add a new goal..." style={{ ...inputStyle, flex: 1 }} /><button onClick={() => { if (newGoal.trim()) { setGoals([...goals, { text: newGoal, done: false }]); setNewGoal(''); } }} style={primaryBtn}>Add</button></div>{goals.map((g, i) => <div key={i} onClick={() => setGoals(goals.map((x, xi) => xi === i ? { ...x, done: !x.done } : x))} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '10px', fontSize: '13px', cursor: 'pointer', textDecoration: g.done ? 'line-through' : 'none' }}><span>{g.done ? '✅' : '⬜'}</span> {g.text}</div>)}</div>)}
          
          {/* Professional Zone Section with Meeting Notes & Email Generator */}
          {activeNav === 'professional' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                <button onClick={() => setProfessionalTab('meeting')} style={{ background: professionalTab === 'meeting' ? purple : cardBg, border: `1px solid ${cardBorder}`, color: '#fff', padding: '8px 16px', borderRadius: '999px', cursor: 'pointer', fontSize: '13px', fontWeight: professionalTab === 'meeting' ? '800' : '500' }}>📝 Meeting Notes</button>
                <button onClick={() => setProfessionalTab('email')} style={{ background: professionalTab === 'email' ? purple : cardBg, border: `1px solid ${cardBorder}`, color: '#fff', padding: '8px 16px', borderRadius: '999px', cursor: 'pointer', fontSize: '13px', fontWeight: professionalTab === 'email' ? '800' : '500' }}>✉️ Email Generator</button>
              </div>

              {professionalTab === 'meeting' && (
                <div style={{ ...glass }}>
                  <h3 style={{ margin: '0 0 6px 0', color: heading }}>📝 Meeting Notes & Action Item Extractor</h3>
                  <p style={{ fontSize: '13px', color: subText, margin: '0 0 12px 0' }}>Paste raw meeting transcript or notes below. I will extract summary, key points, and action items in English.</p>
                  <textarea rows="5" value={meetingPrompt} onChange={(e) => setMeetingPrompt(e.target.value)} placeholder="Paste raw meeting transcript / notes..." style={inputStyle} />
                  <button onClick={(e) => handleGenerate(e, `Extract professional meeting summary and action items from these notes: ${meetingPrompt}`, null, false)} style={{ ...primaryBtn, width: '100%', marginTop: '12px' }}>{loading ? 'Extracting...' : '⚡ Extract Summary'}</button>
                </div>
              )}

              {professionalTab === 'email' && (
                <div style={{ ...glass }}>
                  <h3 style={{ margin: '0 0 6px 0', color: heading }}>✉️ Professional Email Generator</h3>
                  <p style={{ fontSize: '13px', color: subText, margin: '0 0 12px 0' }}>What is this email about? I will draft a clean, professional email for you.</p>
                  <input value={emailPrompt} onChange={(e) => setEmailPrompt(e.target.value)} placeholder="e.g. Leave application, client follow-up, project update..." style={inputStyle} />
                  <button onClick={(e) => handleGenerate(e, `Draft a professional email for: ${emailPrompt}`, null, false)} style={{ ...primaryBtn, width: '100%', marginTop: '12px' }}>{loading ? 'Drafting...' : '✨ Draft Email'}</button>
                </div>
              )}

              {professionalMessages.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px 0' }}>
                  {professionalMessages.map((m, i) => (
                    <div key={i}>{m.type === 'user' ? <div style={{ background: purple, color: '#fff', padding: '12px 16px', borderRadius: '18px 18px 4px 18px', maxWidth: '80%', marginLeft: 'auto', fontSize: '14px' }}>{m.text}</div> : <div style={{ background: 'rgba(139,92,246,0.12)', border: `1px solid ${cardBorder}`, padding: '16px', borderRadius: '16px', fontSize: '14px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}><div style={{ fontWeight: '800', color: heading, marginBottom: '8px' }}>✨ Cramnix AI • Professional Assistant</div>{m.text}</div>}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeNav === 'focus' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><h2 style={{ margin: '4px 0', color: heading }}>⚡ Focus Zone</h2><p style={{ color: subText, margin: 0, fontSize: '13px' }}>Your focus, your progress - everything is shown here.</p></div>
              <div style={{ ...glass }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><b style={{ color: heading }}>📈 Last 7 Days Progress</b><span style={{ background: green, color: '#fff', padding: '5px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '800' }}>+{todayMins}m This Week</span></div>
                <p style={{ color: subText, fontSize: '12px', margin: '6px 0 0 0' }}>How much you studied and how much you focused - everything is shown here.</p>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', height: '150px', marginTop: '18px' }}>
                  {weekData.map((w) => (<div key={w.day} style={{ flex: 1, textAlign: 'center' }}><div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>{w.val}%</div><div style={{ height: `${Math.max(6, w.val * 3.2)}px`, background: 'linear-gradient(180deg,#8B5CF6,#4C1D95)', borderRadius: '8px' }}></div><div style={{ fontSize: '11px', color: subText, marginTop: '6px' }}>{w.mins}</div><div style={{ fontSize: '12px', color: subText }}>{w.day}</div></div>))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ ...glass }}><b style={{ color: heading }}>📱 App Usage Today</b><div style={{ fontSize: '30px', fontWeight: '900', marginTop: '10px', color: heading }}>{todayMins}m</div><div style={{ fontSize: '12px', color: subText }}>{dashboardMessages.length + studentMessages.length} AI Questions • {pomodoroCount} Focus Sessions</div><div style={{ background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '999px', marginTop: '16px', overflow: 'hidden' }}><div style={{ width: `${goalPercent}%`, background: purple, height: '6px' }}></div></div><div style={{ fontSize: '12px', marginTop: '8px', color: subText }}>Daily Goal: 120m • {goalPercent}% done</div></div>
                <div style={{ ...glass }}><b style={{ color: heading }}>🎯 Quiz Performance</b>{quizScores.length === 0 ? (<div><p style={{ color: subText, fontSize: '13px', lineHeight: '1.6', marginTop: '10px' }}>You have not taken a quiz yet.<br />Take a quiz and your score will show here in the graph.</p><button onClick={() => setActiveNav('quizzes')} style={{ ...primaryBtn, marginTop: '8px', fontSize: '12px', padding: '8px 14px' }}>🧠 Go to Quiz →</button></div>) : (<div style={{ marginTop: '10px' }}><div style={{ fontSize: '24px', fontWeight: '900' }}>{quizAvg}% Avg</div><div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '70px', marginTop: '10px' }}>{quizScores.map((s, i) => (<div key={i} style={{ flex: 1, textAlign: 'center' }}><div style={{ fontSize: '11px' }}>{Math.round((s.got / s.total) * 100)}%</div><div style={{ height: `${(s.got / s.total) * 45}px`, background: green, borderRadius: '6px', marginTop: '4px' }}></div><div style={{ fontSize: '11px', color: subText }}>Q{i + 1}</div></div>))}</div></div>)}</div>
              </div>
              <div style={{ ...glass, textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: heading }}>🍅 Pomodoro Timer</div>
                <div style={{ fontSize: '48px', fontWeight: '900', color: heading, margin: '8px 0' }}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
                <div style={{ fontSize: '12px', color: subText }}>25 min focus • 5 min break</div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
                  <select value={timerMins} onChange={(e) => { setTimerMins(e.target.value); setTimeLeft(e.target.value * 60); }} style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', color: heading, border: `1px solid ${cardBorder}`, borderRadius: '10px' }}><option value={25}>25 Min</option><option value={45}>45 Min</option><option value={15}>15 Min</option></select>
                  <button onClick={() => setTimerActive(!timerActive)} style={primaryBtn}>{timerActive ? '⏸️ Pause' : '▶ Start Focus'}</button>
                  <button onClick={() => { setTimerActive(false); setTimeLeft(timerMins * 60); }} style={{ background: 'rgba(255,255,255,0.1)', border: `1px solid ${cardBorder}`, color: '#fff', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700' }}>↺ Reset</button>
                </div>
                <div style={{ marginTop: '12px', fontSize: '13px', color: subText }}>🍅 {pomodoroCount} Pomodoro • ⏱️ {totalFocusMins}m Focus • 🔥 {streak} Days Streak</div>
              </div>
              <div style={{ background: 'linear-gradient(135deg,#7C3AED,#4C1D95)', padding: '16px', borderRadius: '16px' }}><b>🔥 Focus Tip</b><p style={{ fontSize: '13px', margin: '6px 0 0 0', lineHeight: '1.5' }}>Keep your phone on silent, focus on one topic for 25 minutes, then take a 5 minute break. 4 Pomodoro = 1 Deep Session!</p></div>
            </div>
          )}

          {activeNav === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ ...glass }}><label style={{ fontSize: '13px', fontWeight: 'bold', color: heading }}>🔑 Gemini API Key</label><input type="password" value={apiKey} onChange={(e) => { setApiKey(e.target.value); setApiSaved(false); }} placeholder="Enter API Key..." style={{ ...inputStyle, margin: '10px 0' }} /><button onClick={handleSaveApiKey} style={primaryBtn}>Save API Key</button>{apiSaved && <div style={{ color: '#86EFAC', fontSize: '12px', marginTop: '8px' }}>🟢 API Key Active - Unlimited!</div>}{apiKeyError && <div style={{ color: '#FCA5A5', fontSize: '12px', marginTop: '8px' }}>{apiKeyError}</div>}<button onClick={() => setShowGuide(!showGuide)} style={{ background: 'none', border: 'none', color: '#A78BFA', fontSize: '12px', cursor: 'pointer', marginTop: '8px' }}>📖 How to create Gemini API Key?</button>{showGuide && <div style={{ fontSize: '12px', color: subText, marginTop: '6px' }}>1. Visit Google AI Studio 2. Get API Key 3. Paste above</div>}</div>
              <div style={{ ...glass }}><label style={{ fontSize: '13px', fontWeight: 'bold', color: heading }}>🌍 Language</label><select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} style={{ ...inputStyle, marginTop: '10px' }}><option>English</option><option>Hindi (हिन्दी)</option><option>Hinglish</option><option>Marathi (मराठी)</option><option>Gujarati (ગુજરાતી)</option><option>Urdu (اردو)</option><option>Spanish (Español)</option><option>French (Français)</option></select></div>
              <div style={{ ...glass }}><h4 style={{ margin: '0 0 8px 0', color: heading }}>💬 Chat History</h4>{sortedChats.map((c) => <div key={c.id} onClick={() => setCurrentChatId(c.id)} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderRadius: '10px', background: c.id === currentChatId ? 'rgba(139,92,246,0.3)' : 'transparent', cursor: 'pointer', fontSize: '12px', marginBottom: '4px' }}><span>{c.pinned ? '📌 ' : '💬 '}{c.title}</span><span><button onClick={(e) => togglePinChat(c.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>📌</button><button onClick={(e) => deleteChat(c.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button></span></div>)}</div>
            </div>
          )}
        </div>

        {/* BOTTOM INPUT BAR */}
        {showBottomBar && (
          <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => fileInputRef.current.click()} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '8px 14px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}>📂 Upload File</button>
              <input ref={fileInputRef} type="file" accept=".pdf,.txt,.png,.jpg,.jpeg" hidden onChange={handleFileUpload} />
              <button onClick={() => cameraInputRef.current.click()} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '8px 14px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}>📸 Camera</button>
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden onChange={handleCameraCapture} />
              <button onClick={() => handleVoiceInput(setChatPrompt)} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '8px 14px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}>🎤 Voice</button>
              <div style={{ display: 'flex', gap: '8px' }}><label style={{ fontSize: '12px' }}><input type="radio" checked={inputMethod === 'file'} onChange={() => setInputMethod('file')} /> File</label><label style={{ fontSize: '12px' }}><input type="radio" checked={inputMethod === 'camera'} onChange={() => setInputMethod('camera')} /> Camera</label></div>
              {activeNav === 'chatpdf' && sharedFile && <span style={{ fontSize: '12px', color: '#86EFAC' }}>✅ {sharedFile.name} <button onClick={() => setSharedFile(null)} style={{ background: 'none', border: 'none', color: '#FCA5A5', cursor: 'pointer' }}>❌</button></span>}
              {isSpeaking && <span style={{ fontSize: '12px', color: '#86EFAC' }}>🔊 Speaking... <button onClick={stopSpeaking} style={{ background: 'none', border: 'none', color: '#FCA5A5', cursor: 'pointer' }}>Stop</button></span>}
            </div>
            <form onSubmit={(e) => handleGenerate(e, chatPrompt, null, activeNav === 'student')} style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.35)', border: `1px solid ${cardBorder}`, borderRadius: '999px', padding: '6px 6px 6px 16px', alignItems: 'center' }}>
              <input value={chatPrompt} onChange={(e) => setChatPrompt(e.target.value)} placeholder={activeNav === 'library' ? 'Search in Library or Ask about a file...' : activeNav === 'chatpdf' ? 'Ask about your PDF...' : activeNav === 'student' ? (studentTab === 'plan' ? 'Enter topic for Study Plan... e.g. Photosynthesis' : studentTab === 'notes' ? 'Enter topic for Notes... e.g. Photosynthesis' : studentTab === 'quiz' ? 'Enter topic for Quiz... e.g. Photosynthesis' : 'Enter topic for Flashcards... e.g. Photosynthesis') : activeNav === 'professional' ? (professionalTab === 'meeting' ? 'Type or paste meeting notes...' : 'Type email topic...') : 'Ask anything...'} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: heading, fontSize: '14px' }} />
              {chatPrompt && <button type="button" onClick={() => setChatPrompt('')} style={{ background: 'none', border: 'none', color: '#FCA5A5', cursor: 'pointer', fontSize: '16px' }}>❌</button>}
              <button type="button" onClick={() => handleVoiceInput(setChatPrompt)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>🎤</button>
              <button type="submit" disabled={loading} style={{ background: purple, border: 'none', color: '#fff', width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px' }}>{loading ? '...' : '➤'}</button>
            </form>
          </div>
        )}
      </main>

      {/* FLOATING TOGGLE ARROW FOR RIGHT PANEL */}
      <button 
        onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
        style={{
          position: 'fixed',
          right: isRightPanelOpen ? '320px' : '0px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 50,
          background: '#1E1538',
          color: '#C4B5FD',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRight: isRightPanelOpen ? 'none' : '1px solid rgba(255,255,255,0.15)',
          borderTopLeftRadius: '12px',
          borderBottomLeftRadius: '12px',
          borderTopRightRadius: isRightPanelOpen ? '0px' : '12px',
          borderBottomRightRadius: isRightPanelOpen ? '0px' : '12px',
          padding: '12px 8px',
          cursor: 'pointer',
          boxShadow: '-4px 0px 15px rgba(0,0,0,0.5)',
          transition: 'right 0.3s ease',
          fontWeight: 'bold',
          fontSize: '16px'
        }}
        title={isRightPanelOpen ? "Hide Right Panel" : "Show Quiz & Flashcards"}
      >
        {isRightPanelOpen ? '❯' : '❮'}
      </button>

      {/* COMPLETELY COLLAPSIBLE RIGHT PANEL (Quiz Engine, Flashcards, & Goal Planning) */}
      <aside 
        style={{
          width: '300px',
          flexShrink: 0,
          background: 'rgba(20,12,40,0.95)',
          borderRadius: '22px',
          border: `1px solid ${cardBorder}`,
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          position: 'fixed',
          right: isRightPanelOpen ? '14px' : '-320px',
          top: '14px',
          bottom: '14px',
          zIndex: 40,
          transition: 'right 0.3s ease',
          overflowY: 'auto'
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><b style={{ color: heading }}>✨ Quiz Engine</b><span style={{ fontSize: '11px', background: cardBg, padding: '3px 8px', borderRadius: '999px', color: subText }}>{quizQuestions.length > 0 ? 'Quiz Ready' : 'No Quiz'}</span></div>
          <input value={quizTopic} onChange={(e) => setQuizTopic(e.target.value)} placeholder="Enter topic... e.g. Photosynthesis" style={{ ...inputStyle, marginTop: '10px' }} />
          <button onClick={() => generateRealQuiz(quizTopic)} style={{ ...primaryBtn, width: '100%', marginTop: '10px', fontSize: '13px' }}>{quizLoading ? 'Generating...' : '⚡ Generate Quiz for this Topic'}</button>
          <div style={{ background: cardBg, padding: '12px', borderRadius: '12px', marginTop: '10px', textAlign: 'center', fontSize: '13px', color: subText }}>{quizQuestions.length > 0 ? `Quiz ready: ${quizTopic} - Check Quizzes tab` : 'No quiz yet\nEnter a topic above and generate.'}</div>
          <button onClick={() => generateRealQuiz(quizTopic)} style={{ background: 'rgba(255,255,255,0.1)', border: `1px solid ${cardBorder}`, color: '#fff', padding: '10px', borderRadius: '12px', width: '100%', marginTop: '10px', cursor: 'pointer', fontSize: '13px' }}>Regenerate Quiz</button>
          <div style={{ marginTop: '14px', fontSize: '13px', fontWeight: '700', color: heading }}>🎯 Log Quiz Score</div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <input placeholder="Got - 8" id="gotScore" style={{ ...inputStyle, marginTop: 0 }} />
            <input placeholder="Total - 10" id="totalScore" style={{ ...inputStyle, marginTop: 0 }} />
          </div>
          <button onClick={() => { const got = document.getElementById('gotScore').value; const total = document.getElementById('totalScore').value; saveQuizScore(got, total); }} style={{ background: green, border: 'none', color: '#fff', padding: '10px', borderRadius: '12px', width: '100%', marginTop: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>📊 Save Score</button>
          {quizScores.length > 0 && <div style={{ fontSize: '12px', color: subText, marginTop: '8px' }}>Saved: {quizScores.map((s, i) => `${s.got}/${s.total}`).join(', ')} • Avg: {quizAvg}%</div>}
        </div>
        <div>
          <b style={{ color: heading }}>📄 Flashcards</b>
          <p style={{ fontSize: '12px', color: subText, margin: '4px 0 0 0' }}>Topic: {flashTopic || 'No Topic'} • Tap to flip</p>
          <input value={flashTopic} onChange={(e) => setFlashTopic(e.target.value)} placeholder="Enter topic... e.g. Photosynthesis" style={{ ...inputStyle, marginTop: '10px' }} />
          <div style={{ background: cardBg, padding: '14px', borderRadius: '12px', textAlign: 'center', fontSize: '13px', color: subText, marginTop: '10px' }}>{flashcards.length > 0 ? `Flashcards ready: ${flashcards.length} cards - Check Flashcards tab` : 'No flashcards yet.\nEnter a topic and generate.'}</div>
          <button onClick={() => generateRealFlashcards(flashTopic)} style={{ ...primaryBtn, width: '100%', marginTop: '10px', fontSize: '13px' }}>{flashLoading ? 'Generating...' : '✨ Generate Flashcards'}</button>
        </div>
        <div>
          <b style={{ color: heading }}>🎯 Goal Planning</b>
          <p style={{ fontSize: '12px', color: subText, margin: '4px 0 0 0' }}>Today • {goals.filter(g => g.done).length}/{goals.length} Done</p>
          <div style={{ background: cardBg, padding: '12px', borderRadius: '12px', fontSize: '13px', color: subText, marginTop: '10px' }}>{goals.length === 0 ? 'No goals yet. Add below 👇' : goals.slice(0, 2).map((g, i) => <div key={i}>{g.done ? '✅' : '⬜'} {g.text}</div>)}</div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <input value={newGoal} onChange={(e) => setNewGoal(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && newGoal.trim()) { setGoals([...goals, { text: newGoal, done: false }]); setNewGoal(''); } }} placeholder="Add a goal..." style={{ ...inputStyle, marginTop: 0 }} />
            <button onClick={() => { if (newGoal.trim()) { setGoals([...goals, { text: newGoal, done: false }]); setNewGoal(''); } }} style={{ background: purple, color: '#fff', border: 'none', padding: '0 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700' }}>Add</button>
          </div>
        </div>
      </aside>

    </div>
  );
}