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
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true); // Default open on desktop so user sees layout clearly
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
  const glass = { background: cardBg, padding: '12px 16px', borderRadius: '16px', border: `1px solid ${cardBorder}`, backdropFilter: 'blur(12px)' };
  const inputStyle = { width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.35)', border: `1px solid ${cardBorder}`, borderRadius: '12px', color: heading, boxSizing: 'border-box', fontSize: '13px' };
  const primaryBtn = { background: `linear-gradient(90deg, ${purple}, ${purple2})`, color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' };
  const filteredLibrary = libraryFiles.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(librarySearch.toLowerCase());
    const matchFilter = libraryFilter === 'All' || f.type === libraryFilter;
    return matchSearch && matchFilter;
  });

  if (!isLoggedIn) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', background: bg, color: textColor, fontFamily: 'Inter, sans-serif', justifyContent: 'center', alignItems: 'center', padding: '16px', boxSizing: 'border-box', overflow: 'hidden' }}>
        <div style={{ width: '100%', maxWidth: '420px', background: 'linear-gradient(135deg, rgba(30,21,56,0.95), rgba(15,10,30,0.95))', padding: '28px', borderRadius: '22px', border: `1px solid ${cardBorder}`, boxShadow: '0 10px 30px rgba(0,0,0,0.6)', boxSizing: 'border-box' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: heading, fontSize: '22px', margin: '0 0 6px 0' }}>💠 Cramnix AI</h2>
            <p style={{ color: subText, fontSize: '13px', margin: 0 }}>Secure Cloud Login & Workspace</p>
          </div>
          {loginError && <div style={{ background: 'rgba(239,68,68,0.15)', color: '#FCA5A5', padding: '10px', borderRadius: '10px', marginBottom: '14px', fontSize: '12px' }}>{loginError}</div>}
          <form onSubmit={handleLogin}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '13px', color: heading }}>Full Name</label>
            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="e.g. Amitkumar Gautam" required style={{ ...inputStyle, marginBottom: '14px' }} />
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '13px', color: heading }}>Email ID or 10-Digit Mobile</label>
            <input type="text" value={userContact} onChange={(e) => setUserContact(e.target.value)} placeholder="amit@example.com or 9876543210" required style={{ ...inputStyle, marginBottom: '18px' }} />
            <button type="submit" style={{ width: '100%', padding: '12px', background: `linear-gradient(90deg, ${purple}, ${purple2})`, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>🚀 Login / Get Started</button>
          </form>
          <div style={{ textAlign: 'center', fontSize: '11px', color: subText, marginTop: '20px' }}>Made with ❤️ by <strong style={{ color: heading }}>Amitkumar Gautam</strong></div>
        </div>
      </div>
    );
  }

  const navItem = (id, icon, label, active) => (
    <div key={id} onClick={() => { setActiveNav(id); setChatPrompt(''); setResponse(''); setIsMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: active ? '800' : '500', background: active ? purple : 'transparent', color: active ? '#fff' : '#C4B5FD', transition: 'all 0.2s ease' }}>
      <span>{icon}</span> {label}
    </div>
  );
  const studentTabBtn = (id, label) => (
    <button key={id} onClick={() => setStudentTab(id)} style={{ background: studentTab === id ? purple : cardBg, border: `1px solid ${cardBorder}`, color: '#fff', padding: '6px 14px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: studentTab === id ? '800' : '500' }}>{label}</button>
  );
  const libraryFilterBtn = (label) => (
    <button key={label} onClick={() => setLibraryFilter(label)} style={{ background: libraryFilter === label ? purple : cardBg, border: `1px solid ${cardBorder}`, color: '#fff', padding: '6px 14px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: libraryFilter === label ? '800' : '500' }}>{label}</button>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: `radial-gradient(800px 400px at 15% 0%, #2E1A5E 0%, transparent 60%), radial-gradient(700px 400px at 90% 20%, #3B1A6B 0%, transparent 60%), ${bg}`, color: textColor, fontFamily: 'Inter, sans-serif', padding: '12px', gap: '12px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>
      
      {/* Responsive Media Query & Exact Gap CSS Helper */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 900px) {
          .desktop-sidebar {
            position: fixed !important;
            left: ${isMobileMenuOpen ? '0px' : '-100%'} !important;
            top: 0 !important;
            bottom: 0 !important;
            width: 260px !important;
            height: 100vh !important;
            z-index: 1000 !important;
            transition: left 0.3s ease !important;
            box-shadow: 5px 0 25px rgba(0,0,0,0.8);
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          .main-content-area {
            margin-left: 0px !important;
            margin-right: 0px !important;
            width: 100% !important;
            padding: 12px !important;
            margin-top: 52px !important;
            height: calc(100vh - 72px) !important;
          }
          .right-panel-aside {
            right: ${isRightPanelOpen ? '0px' : '-100%'} !important;
            width: 290px !important;
            z-index: 1000 !important;
            height: 100vh !important;
            top: 0 !important;
            bottom: 0 !important;
            border-radius: 0 !important;
          }
        }
        @media (min-width: 901px) {
          .mobile-menu-btn {
            display: none !important;
          }
          .desktop-sidebar {
            left: auto !important;
            position: relative !important;
          }
          .main-content-area {
            margin-right: ${isRightPanelOpen ? '302px' : '0px'} !important;
            height: calc(100vh - 24px) !important;
            transition: margin-right 0.3s ease !important;
          }
          .right-panel-aside {
            right: ${isRightPanelOpen ? '12px' : '-315px'} !important;
            height: calc(100vh - 24px) !important;
            transition: right 0.3s ease !important;
          }
        }
      `}} />

      {/* Mobile Header Bar */}
      <div className="mobile-menu-btn" style={{ position: 'fixed', top: '8px', left: '8px', right: '8px', background: 'rgba(30,21,56,0.95)', padding: '10px 14px', borderRadius: '14px', border: `1px solid ${cardBorder}`, display: 'none', justifyContent: 'space-between', alignItems: 'center', zIndex: 900, backdropFilter: 'blur(10px)', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ background: purple, color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>☰ Menu</button>
          <span style={{ fontWeight: '900', color: heading, fontSize: '14px' }}>Cramnix AI</span>
        </div>
        <button onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} style={{ background: cardBg, color: heading, border: `1px solid ${cardBorder}`, padding: '6px 12px', borderRadius: '8px', fontSize: '11px' }}>✨ Quiz/Tools</button>
      </div>

      {/* Left Sidebar */}
      <aside className="desktop-sidebar" style={{ width: '245px', flexShrink: 0, background: 'linear-gradient(180deg, rgba(30,21,56,0.98), rgba(10,6,24,0.98))', borderRadius: '18px', border: `1px solid ${cardBorder}`, padding: '14px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 30, boxSizing: 'border-box', height: '100%', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 4px 10px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/logo.png" alt="Cramnix Logo" onError={(e) => { e.target.style.display = 'none'; }} style={{ width: '32px', height: '32px', borderRadius: '10px', objectFit: 'cover', background: 'white', padding: '2px' }} />
              <div><div style={{ fontSize: '16px', fontWeight: '900', color: heading, lineHeight: '1' }}>Cramnix AI</div><div style={{ fontSize: '9px', color: subText, letterSpacing: '1px', marginTop: '3px' }}>STUDENT ZONE 🎓</div></div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: red, color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', display: 'none' }} className="mobile-menu-btn">✕</button>
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
          <div style={{ margin: '10px 4px 0 4px', background: 'linear-gradient(135deg,#7C3AED,#4C1D95)', padding: '10px 12px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}><span>🎁 Free Left</span><span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '999px' }}>{apiSaved ? 'UNLIMITED' : `${freeLeft} / 4`}</span></div>
            <div style={{ fontSize: '16px', fontWeight: '900', margin: '4px 0' }}>{apiSaved ? '∞ Unlimited' : `${freeLeft} / 4 Left`}</div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.25)', borderRadius: '999px', overflow: 'hidden' }}><div style={{ width: apiSaved ? '100%' : `${(freeLeft / 4) * 100}%`, height: '100%', background: '#fff' }} /></div>
            <div style={{ fontSize: '9px', marginTop: '4px', opacity: 0.9 }}>🔥 {streak}d • 🍅 {pomodoroCount} • ⏱️ {totalFocusMins}m</div>
          </div>
          <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', color: '#FCA5A5', marginTop: '6px' }}><span>↩️</span> Logout</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.08)', padding: '8px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', flexShrink: 0 }}>
          <div style={{ width: '30px', height: '30px', background: purple, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '14px' }}>{userName ? userName[0].toUpperCase() : 'A'}</div>
          <div style={{ flex: 1, overflow: 'hidden' }}><div style={{ fontSize: '13px', fontWeight: '800', color: heading, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div></div>
        </div>
      </aside>

      {/* Main Content Area (With clean separation gap from right panel) */}
      <main className="main-content-area" style={{ flex: 1, minWidth: 0, background: 'rgba(10,6,24,0.55)', borderRadius: '18px', border: `1px solid ${cardBorder}`, padding: '16px 20px', display: 'flex', flexDirection: 'column', backdropFilter: 'blur(10px)', boxSizing: 'border-box', height: '100%', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '19px', fontWeight: '900', color: heading }}>{activeNav === 'chatpdf' ? 'Chat with PDF' : activeNav === 'dashboard' ? 'Dashboard' : activeNav === 'student' ? 'Student Zone' : activeNav === 'professional' ? 'Professional Zone' : activeNav === 'focus' ? 'Focus Zone' : activeNav === 'library' ? 'Library' : activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}</h1>
            {activeNav === 'chatpdf' ? (<span style={{ fontSize: '11px', background: 'rgba(139,92,246,0.25)', border: `1px solid ${cardBorder}`, padding: '3px 8px', borderRadius: '999px', fontWeight: '800' }}>{sharedFile ? `📄 ${sharedFile.name.slice(0, 15)}` : '📄 No PDF'}</span>) : (<span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.08)', border: `1px solid ${cardBorder}`, padding: '3px 8px', borderRadius: '999px', fontWeight: '700', color: subText }}>📄 No PDF</span>)}
            <span style={{ fontSize: '11px', color: '#86EFAC' }}>🟢 Online</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setAutoRead(!autoRead)} style={{ background: autoRead ? green : cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '5px 12px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}>🔊 {autoRead ? 'ON' : 'OFF'}</button>
            <button onClick={handleShare} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '5px 12px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}>↗ Share</button>
            <button onClick={handleExport} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '5px 12px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}>⬇ Export</button>
            <button onClick={handleNewChatClick} style={{ background: green, border: 'none', color: '#fff', padding: '5px 12px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer', fontWeight: '800' }}>+ New</button>
          </div>
        </div>
        {shareMsg && <div style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid #22C55E', color: '#86EFAC', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', marginBottom: '8px', flexShrink: 0 }}>✅ {shareMsg}</div>}

        {activeNav === 'student' && (<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px', flexShrink: 0 }}>{studentTabBtn('plan', '📝 Study Plan')}{studentTabBtn('notes', '📄 Notes')}{studentTabBtn('quiz', '🧠 Quiz')}{studentTabBtn('flashcards', '📄 Flashcards')}</div>)}
        {activeNav === 'student' && (<div style={{ background: 'rgba(139,92,246,0.12)', border: `1px solid ${cardBorder}`, padding: '8px 12px', borderRadius: '12px', marginBottom: '8px', fontSize: '12px', flexShrink: 0 }}>{studentTab === 'plan' && <><b>📝 Study Plan Mode</b> <span style={{ color: subText }}>— Enter topic, time and level.</span></>}{studentTab === 'notes' && <><b>📄 Notes Mode</b> <span style={{ color: subText }}>— Enter topic or upload PDF.</span></>}{studentTab === 'quiz' && <><b>🧠 Quiz Mode</b> <span style={{ color: subText }}>— Enter topic for 5 MCQs.</span></>}{studentTab === 'flashcards' && <><b>📄 Flashcards Mode</b> <span style={{ color: subText }}>— Enter topic for flashcards.</span></>}</div>)}
        {sharedFile && activeNav === 'chatpdf' && <div style={{ ...glass, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', marginBottom: '8px', flexShrink: 0 }}><div style={{ fontSize: '12px' }}>📄 <b>{sharedFile.name}</b> <span style={{ color: '#86EFAC', marginLeft: '6px' }}>✔ Processed</span></div><button onClick={() => setSharedFile(null)} style={{ background: red, color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>❌ Remove</button></div>}

        {/* Scrollable Container inside Main Area */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', minHeight: 0, paddingBottom: '6px' }}>
          {activeNav === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                <div style={{ background: 'linear-gradient(135deg,#7C3AED,#4C1D95)', padding: '14px 16px', borderRadius: '16px' }}><div style={{ fontSize: '11px', opacity: 0.9 }}>📅 TODAY STUDY</div><div style={{ fontSize: '20px', fontWeight: '900', marginTop: '4px' }}>{totalFocusMins}m</div><div style={{ fontSize: '11px', marginTop: '3px', opacity: 0.85 }}>Goal: 180m • {goalPercent}%</div></div>
                <div style={{ ...glass, padding: '14px 16px' }}><div style={{ fontSize: '11px', color: subText }}>🍅 POMODORO</div><div style={{ fontSize: '20px', fontWeight: '900', marginTop: '4px' }}>{pomodoroCount} Sess</div><div style={{ fontSize: '11px', color: subText, marginTop: '3px' }}>🔥 {streak}d Streak</div></div>
                <div style={{ ...glass, padding: '14px 16px' }}><div style={{ fontSize: '11px', color: subText }}>🧠 QUIZ AVG</div><div style={{ fontSize: '20px', fontWeight: '900', marginTop: '4px' }}>{quizAvg}%</div><div style={{ fontSize: '11px', color: subText, marginTop: '3px' }}>{quizScores.length} Done</div></div>
                <div style={{ ...glass, padding: '14px 16px' }}><div style={{ fontSize: '11px', color: subText }}>🎯 GOALS</div><div style={{ fontSize: '20px', fontWeight: '900', marginTop: '4px' }}>{goals.filter(g => g.done).length}/{goals.length}</div><div style={{ fontSize: '11px', color: subText, marginTop: '3px' }}>Progress</div></div>
              </div>
              {dashboardMessages.length === 0 && !loading && (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: '36px' }}>✨</div>
                  <h2 style={{ fontSize: '22px', fontWeight: '900', color: heading, margin: '8px 0 4px 0' }}>Hello, {userName || 'Amit'} 👋</h2>
                  <p style={{ color: subText, fontSize: '13px', margin: 0 }}>What do you want to learn today?</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '12px' }}>
                    <button onClick={() => setChatPrompt('Explain Photosynthesis in simple words')} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '6px 14px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px' }}>🌱 Photosynthesis</button>
                    <button onClick={() => setChatPrompt('Make 5 MCQs for Cellular Respiration')} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '6px 14px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px' }}>🧠 Make Quiz</button>
                    <button onClick={() => setChatPrompt('Make flashcards for Human Body')} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '6px 14px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px' }}>📄 Flashcards</button>
                    <button onClick={() => setChatPrompt('Give me a study plan for today')} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '6px 14px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px' }}>🎯 Study Plan</button>
                  </div>
                </div>
              )}
              {dashboardMessages.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '6px 0' }}>
                  {dashboardMessages.map((m, i) => (
                    <div key={i}>{m.type === 'user' ? <div style={{ background: purple, color: '#fff', padding: '10px 16px', borderRadius: '16px 16px 4px 16px', maxWidth: '80%', marginLeft: 'auto', fontSize: '13px', lineHeight: '1.4' }}>{m.text}</div> : <div style={{ background: 'rgba(139,92,246,0.12)', border: `1px solid ${cardBorder}`, padding: '16px', borderRadius: '16px', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}><div style={{ fontWeight: '800', color: heading, marginBottom: '6px' }}>✨ Cramnix AI</div>{m.text}<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}><button onClick={() => speakAnswer(m.text)} style={{ background: purple, color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px' }}>🔊 Read Aloud</button><button onClick={stopSpeaking} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: `1px solid ${cardBorder}`, padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px' }}>⏹ Stop</button><button onClick={() => handleDownloadAnswer(m.text)} style={{ background: green, color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px' }}>📥 Download</button><button onClick={handleShare} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: `1px solid ${cardBorder}`, padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px' }}>↗ Share</button></div></div>}</div>
                  ))}
                  {loading && <div style={{ fontSize: '12px', color: subText }}>✨ Cramnix AI is thinking...</div>}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>
          )}

          {activeNav === 'student' && studentTab === 'plan' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ ...glass }}>
                <h3 style={{ margin: '0 0 4px 0', color: heading, fontSize: '15px' }}>📝 Create Your Study Plan</h3>
                <p style={{ fontSize: '12px', color: subText, margin: '0 0 10px 0' }}>Tell me your topic, time and level.</p>
                <label style={{ fontSize: '12px', fontWeight: '700', color: heading }}>1. What is your topic / subject?</label>
                <input value={studyTopic} onChange={(e) => setStudyTopic(e.target.value)} placeholder="e.g. Photosynthesis, Maths" style={{ ...inputStyle, margin: '4px 0 10px 0' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                  <div><label style={{ fontSize: '11px', fontWeight: '700', color: heading }}>2. Days?</label><select value={studyDays} onChange={(e) => setStudyDays(e.target.value)} style={{ ...inputStyle, marginTop: '3px', padding: '8px' }}><option>1 Day</option><option>7 Days</option><option>30 Days</option><option>3 Months</option><option>1 Year</option></select></div>
                  <div><label style={{ fontSize: '11px', fontWeight: '700', color: heading }}>3. Level?</label><select value={studyLevel} onChange={(e) => setStudyLevel(e.target.value)} style={{ ...inputStyle, marginTop: '3px', padding: '8px' }}><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
                  <div><label style={{ fontSize: '11px', fontWeight: '700', color: heading }}>4. Daily Time?</label><select value={studyHours} onChange={(e) => setStudyHours(e.target.value)} style={{ ...inputStyle, marginTop: '3px', padding: '8px' }}><option>1 Hour</option><option>2 Hours</option><option>3 Hours</option><option>5 Hours</option></select></div>
                </div>
                <button onClick={handleGenerateStudyPlan} style={{ ...primaryBtn, width: '100%', marginTop: '12px', padding: '10px' }}>{loading ? 'Creating...' : '🚀 Generate Study Plan'}</button>
              </div>
              {studentMessages.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {studentMessages.map((m, i) => (
                    <div key={i}>{m.type === 'user' ? <div style={{ background: purple, color: '#fff', padding: '10px 16px', borderRadius: '16px 16px 4px 16px', maxWidth: '80%', marginLeft: 'auto', fontSize: '13px' }}>{m.text}</div> : <div style={{ background: 'rgba(139,92,246,0.12)', border: `1px solid ${cardBorder}`, padding: '16px', borderRadius: '16px', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{m.text}</div>}</div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeNav === 'student' && studentTab !== 'plan' && studentMessages.length === 0 && !loading && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '16px' }}>
              <div style={{ fontSize: '38px' }}>📄</div>
              <h2 style={{ fontSize: '20px', fontWeight: '900', color: heading, margin: '6px 0 3px 0' }}>{studentTab === 'notes' ? 'Notes Generator' : studentTab === 'quiz' ? 'Quiz Generator' : 'Flashcards Generator'}</h2>
              <p style={{ color: subText, fontSize: '12px', margin: 0 }}>Enter a topic below, I will create it in English.</p>
            </div>
          )}
          {activeNav === 'student' && studentTab !== 'plan' && studentMessages.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '6px 0' }}>
              {studentMessages.map((m, i) => (
                <div key={i}>{m.type === 'user' ? <div style={{ background: purple, color: '#fff', padding: '10px 16px', borderRadius: '16px 16px 4px 16px', maxWidth: '80%', marginLeft: 'auto', fontSize: '13px' }}>{m.text}</div> : <div style={{ background: 'rgba(139,92,246,0.12)', border: `1px solid ${cardBorder}`, padding: '16px', borderRadius: '16px', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{m.text}</div>}</div>
              ))}
            </div>
          )}

          {activeNav === 'library' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.35)', border: `1px solid ${cardBorder}`, borderRadius: '999px', padding: '6px 14px' }}><span>🔍</span><input value={librarySearch} onChange={(e) => setLibrarySearch(e.target.value)} placeholder="Search files..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: heading, fontSize: '12px' }} /></div>
                <div style={{ display: 'flex', gap: '6px' }}>{libraryFilterBtn('All')}{libraryFilterBtn('PDF')}{libraryFilterBtn('Image')}</div>
              </div>
              {filteredLibrary.length === 0 && libraryFiles.length === 0 && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '30px' }}>
                  <div style={{ fontSize: '42px' }}>📚</div><h2 style={{ color: heading, margin: '10px 0 4px 0', fontSize: '18px' }}>Library is Empty</h2><p style={{ color: subText, fontSize: '12px', margin: 0 }}>Upload your first PDF below.</p><button onClick={() => fileInputRef.current.click()} style={{ ...primaryBtn, marginTop: '12px', fontSize: '12px' }}>📂 Upload First File</button>
                </div>
              )}
              {filteredLibrary.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                  {filteredLibrary.map((file) => (
                    <div key={file.id} style={{ ...glass, padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><div style={{ width: '34px', height: '34px', background: file.type === 'PDF' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>{file.type === 'PDF' ? '📄' : '🖼️'}</div><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: '12px', fontWeight: '800', color: heading, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div><div style={{ fontSize: '10px', color: subText }}>{file.type} • {file.size}</div></div><button onClick={() => deleteLibraryFile(file.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button></div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}><button onClick={() => askLibraryFile(file)} style={{ flex: 1, background: purple, color: '#fff', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>💬 Ask AI</button><button onClick={() => notesLibraryFile(file)} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: `1px solid ${cardBorder}`, color: '#fff', padding: '6px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>📄 Notes</button></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeNav === 'chatpdf' && pdfMessages.length === 0 && !loading && (<div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}><div style={{ fontSize: '38px' }}>💬</div><h2 style={{ color: heading, fontSize: '18px' }}>Chat with PDF</h2><p style={{ color: subText, fontSize: '12px' }}>Upload a PDF below and ask questions about it.</p></div>)}
          {activeNav === 'chatpdf' && pdfMessages.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '6px 0' }}>
              {pdfMessages.map((m, i) => (
                <div key={i}>{m.type === 'user' ? <div style={{ background: purple, color: '#fff', padding: '10px 16px', borderRadius: '16px 16px 4px 16px', maxWidth: '80%', marginLeft: 'auto', fontSize: '13px' }}>{m.text}</div> : <div style={{ background: 'rgba(139,92,246,0.12)', border: `1px solid ${cardBorder}`, padding: '16px', borderRadius: '16px', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}><b>✨ Cramnix AI • PDF Chat</b><br /><br />{m.text}</div>}</div>
              ))}
            </div>
          )}

          {activeNav === 'quizzes' && (<div style={{ ...glass }}><h3 style={{ margin: '0 0 8px 0', color: heading, fontSize: '15px' }}>🧠 Quizzes - {quizTopic || 'No Topic'}</h3><input value={quizTopic} onChange={(e) => setQuizTopic(e.target.value)} placeholder="Enter topic..." style={inputStyle} /><button onClick={() => generateRealQuiz(quizTopic)} style={{ ...primaryBtn, marginTop: '8px', width: '100%' }}>{quizLoading ? 'Generating...' : '⚡ Generate 5 MCQs'}</button>{quizQuestions.length === 0 ? <p style={{ fontSize: '12px', color: subText, marginTop: '10px' }}>No quiz yet.</p> : <div style={{ marginTop: '10px', fontSize: '12px', whiteSpace: 'pre-wrap' }}>{quizQuestions[0].q}</div>}</div>)}
          {activeNav === 'flashcards' && (<div style={{ ...glass }}><h3 style={{ margin: '0 0 8px 0', color: heading, fontSize: '15px' }}>📄 Flashcards - {flashTopic || 'No Topic'}</h3><input value={flashTopic} onChange={(e) => setFlashTopic(e.target.value)} placeholder="Enter topic..." style={inputStyle} /><button onClick={() => generateRealFlashcards(flashTopic)} style={{ ...primaryBtn, marginTop: '8px', width: '100%' }}>{flashLoading ? 'Generating...' : '⚡ Generate Flashcards'}</button><p style={{ fontSize: '12px', color: subText, marginTop: '10px' }}>{flashcards.length === 0 ? 'No flashcards yet.' : flashcards[0].q}</p></div>)}
          {activeNav === 'goals' && (<div style={{ ...glass }}><h3 style={{ margin: '0 0 8px 0', color: heading, fontSize: '15px' }}>🎯 Goals</h3><div style={{ display: 'flex', gap: '8px' }}><input value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="Add a new goal..." style={{ ...inputStyle, flex: 1, marginTop: 0 }} /><button onClick={() => { if (newGoal.trim()) { setGoals([...goals, { text: newGoal, done: false }]); setNewGoal(''); } }} style={primaryBtn}>Add</button></div>{goals.map((g, i) => <div key={i} onClick={() => setGoals(goals.map((x, xi) => xi === i ? { ...x, done: !x.done } : x))} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px', fontSize: '12px', cursor: 'pointer', textDecoration: g.done ? 'line-through' : 'none' }}><span>{g.done ? '✅' : '⬜'}</span> {g.text}</div>)}</div>)}
          
          {activeNav === 'professional' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                <button onClick={() => setProfessionalTab('meeting')} style={{ background: professionalTab === 'meeting' ? purple : cardBg, border: `1px solid ${cardBorder}`, color: '#fff', padding: '6px 14px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: professionalTab === 'meeting' ? '800' : '500' }}>📝 Meeting Notes</button>
                <button onClick={() => setProfessionalTab('email')} style={{ background: professionalTab === 'email' ? purple : cardBg, border: `1px solid ${cardBorder}`, color: '#fff', padding: '6px 14px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: professionalTab === 'email' ? '800' : '500' }}>✉️ Email Generator</button>
              </div>

              {professionalTab === 'meeting' && (
                <div style={{ ...glass }}>
                  <h3 style={{ margin: '0 0 4px 0', color: heading, fontSize: '14px' }}>📝 Meeting Notes Extractor</h3>
                  <p style={{ fontSize: '11px', color: subText, margin: '0 0 8px 0' }}>Paste transcript below.</p>
                  <textarea rows="4" value={meetingPrompt} onChange={(e) => setMeetingPrompt(e.target.value)} placeholder="Paste notes..." style={inputStyle} />
                  <button onClick={(e) => handleGenerate(e, `Extract professional meeting summary and action items from these notes: ${meetingPrompt}`, null, false)} style={{ ...primaryBtn, width: '100%', marginTop: '10px' }}>{loading ? 'Extracting...' : '⚡ Extract Summary'}</button>
                </div>
              )}

              {professionalTab === 'email' && (
                <div style={{ ...glass }}>
                  <h3 style={{ margin: '0 0 4px 0', color: heading, fontSize: '14px' }}>✉️ Email Generator</h3>
                  <p style={{ fontSize: '11px', color: subText, margin: '0 0 8px 0' }}>What is this email about?</p>
                  <input value={emailPrompt} onChange={(e) => setEmailPrompt(e.target.value)} placeholder="e.g. Leave application..." style={inputStyle} />
                  <button onClick={(e) => handleGenerate(e, `Draft a professional email for: ${emailPrompt}`, null, false)} style={{ ...primaryBtn, width: '100%', marginTop: '10px' }}>{loading ? 'Drafting...' : '✨ Draft Email'}</button>
                </div>
              )}

              {professionalMessages.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '6px 0' }}>
                  {professionalMessages.map((m, i) => (
                    <div key={i}>{m.type === 'user' ? <div style={{ background: purple, color: '#fff', padding: '10px 16px', borderRadius: '16px 16px 4px 16px', maxWidth: '80%', marginLeft: 'auto', fontSize: '13px' }}>{m.text}</div> : <div style={{ background: 'rgba(139,92,246,0.12)', border: `1px solid ${cardBorder}`, padding: '16px', borderRadius: '16px', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}><div style={{ fontWeight: '800', color: heading, marginBottom: '6px' }}>✨ Cramnix AI • Professional Assistant</div>{m.text}</div>}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeNav === 'focus' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div><h2 style={{ margin: '2px 0', color: heading, fontSize: '18px' }}>⚡ Focus Zone</h2><p style={{ color: subText, margin: 0, fontSize: '12px' }}>Your focus and progress.</p></div>
              <div style={{ ...glass }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><b style={{ color: heading, fontSize: '13px' }}>📈 Last 7 Days Progress</b><span style={{ background: green, color: '#fff', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '800' }}>+{todayMins}m</span></div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '105px', marginTop: '10px' }}>
                  {weekData.map((w) => (<div key={w.day} style={{ flex: 1, textAlign: 'center' }}><div style={{ fontSize: '10px', fontWeight: '700', marginBottom: '3px' }}>{w.val}%</div><div style={{ height: `${Math.max(4, w.val * 2.1)}px`, background: 'linear-gradient(180deg,#8B5CF6,#4C1D95)', borderRadius: '6px' }}></div><div style={{ fontSize: '9px', color: subText, marginTop: '4px' }}>{w.mins}</div><div style={{ fontSize: '10px', color: subText }}>{w.day}</div></div>))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                <div style={{ ...glass }}><b style={{ color: heading, fontSize: '13px' }}>📱 App Usage Today</b><div style={{ fontSize: '22px', fontWeight: '900', marginTop: '5px', color: heading }}>{todayMins}m</div><div style={{ fontSize: '11px', color: subText }}>{dashboardMessages.length + studentMessages.length} AI Qs • {pomodoroCount} Sess</div><div style={{ background: 'rgba(255,255,255,0.1)', height: '5px', borderRadius: '999px', marginTop: '10px', overflow: 'hidden' }}><div style={{ width: `${goalPercent}%`, background: purple, height: '5px' }}></div></div><div style={{ fontSize: '11px', marginTop: '5px', color: subText }}>Goal: 120m • {goalPercent}% done</div></div>
                <div style={{ ...glass }}><b style={{ color: heading, fontSize: '13px' }}>🎯 Quiz Performance</b>{quizScores.length === 0 ? (<div><p style={{ color: subText, fontSize: '11px', lineHeight: '1.4', marginTop: '5px' }}>No quiz taken yet.</p><button onClick={() => setActiveNav('quizzes')} style={{ ...primaryBtn, marginTop: '5px', fontSize: '11px', padding: '6px 10px' }}>🧠 Go to Quiz →</button></div>) : (<div style={{ marginTop: '5px' }}><div style={{ fontSize: '20px', fontWeight: '900' }}>{quizAvg}% Avg</div><div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', height: '45px', marginTop: '8px' }}>{quizScores.map((s, i) => (<div key={i} style={{ flex: 1, textAlign: 'center' }}><div style={{ fontSize: '9px' }}>{Math.round((s.got / s.total) * 100)}%</div><div style={{ height: `${(s.got / s.total) * 32}px`, background: green, borderRadius: '4px', marginTop: '2px' }}></div><div style={{ fontSize: '9px', color: subText }}>Q{i + 1}</div></div>))}</div></div>)}</div>
              </div>
              <div style={{ ...glass, textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: heading }}>🍅 Pomodoro Timer</div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: heading, margin: '3px 0' }}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
                  <select value={timerMins} onChange={(e) => { setTimerMins(e.target.value); setTimeLeft(e.target.value * 60); }} style={{ padding: '6px 10px', background: 'rgba(0,0,0,0.3)', color: heading, border: `1px solid ${cardBorder}`, borderRadius: '8px', fontSize: '12px' }}><option value={25}>25 Min</option><option value={45}>45 Min</option><option value={15}>15 Min</option></select>
                  <button onClick={() => setTimerActive(!timerActive)} style={{ ...primaryBtn, padding: '6px 12px', fontSize: '12px' }}>{timerActive ? '⏸️ Pause' : '▶ Start'}</button>
                  <button onClick={() => { setTimerActive(false); setTimeLeft(timerMins * 60); }} style={{ background: 'rgba(255,255,255,0.1)', border: `1px solid ${cardBorder}`, color: '#fff', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>↺ Reset</button>
                </div>
              </div>
            </div>
          )}

          {activeNav === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ ...glass }}><label style={{ fontSize: '12px', fontWeight: 'bold', color: heading }}>🔑 Gemini API Key</label><input type="password" value={apiKey} onChange={(e) => { setApiKey(e.target.value); setApiSaved(false); }} placeholder="Enter API Key..." style={{ ...inputStyle, margin: '6px 0' }} /><button onClick={handleSaveApiKey} style={primaryBtn}>Save API Key</button>{apiSaved && <div style={{ color: '#86EFAC', fontSize: '11px', marginTop: '6px' }}>🟢 API Key Active - Unlimited!</div>}{apiKeyError && <div style={{ color: '#FCA5A5', fontSize: '11px', marginTop: '6px' }}>{apiKeyError}</div>}<button onClick={() => setShowGuide(!showGuide)} style={{ background: 'none', border: 'none', color: '#A78BFA', fontSize: '11px', cursor: 'pointer', marginTop: '6px' }}>📖 How to create Gemini API Key?</button>{showGuide && <div style={{ fontSize: '11px', color: subText, marginTop: '4px' }}>1. Visit Google AI Studio 2. Get API Key 3. Paste above</div>}</div>
              <div style={{ ...glass }}><label style={{ fontSize: '12px', fontWeight: 'bold', color: heading }}>🌍 Language</label><select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} style={{ ...inputStyle, marginTop: '6px' }}><option>English</option><option>Hindi (हिन्दी)</option><option>Hinglish</option><option>Marathi (मराठी)</option><option>Gujarati (ગુજરાતી)</option><option>Urdu (اردو)</option><option>Spanish (Español)</option><option>French (Français)</option></select></div>
              <div style={{ ...glass }}><h4 style={{ margin: '0 0 6px 0', color: heading, fontSize: '13px' }}>💬 Chat History</h4>{sortedChats.map((c) => <div key={c.id} onClick={() => setCurrentChatId(c.id)} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderRadius: '8px', background: c.id === currentChatId ? 'rgba(139,92,246,0.3)' : 'transparent', cursor: 'pointer', fontSize: '12px', marginBottom: '4px' }}><span>{c.pinned ? '📌 ' : '💬 '}{c.title}</span><span><button onClick={(e) => togglePinChat(c.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>📌</button><button onClick={(e) => deleteChat(c.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button></span></div>)}</div>
            </div>
          )}
        </div>

        {/* BOTTOM INPUT BAR */}
        {showBottomBar && (
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => fileInputRef.current.click()} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '6px 12px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}>📂 Upload</button>
              <input ref={fileInputRef} type="file" accept=".pdf,.txt,.png,.jpg,.jpeg" hidden onChange={handleFileUpload} />
              <button onClick={() => cameraInputRef.current.click()} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '6px 12px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}>📸 Camera</button>
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden onChange={handleCameraCapture} />
              {activeNav === 'chatpdf' && sharedFile && <span style={{ fontSize: '12px', color: '#86EFAC' }}>✅ {sharedFile.name} <button onClick={() => setSharedFile(null)} style={{ background: 'none', border: 'none', color: '#FCA5A5', cursor: 'pointer' }}>❌</button></span>}
              {isSpeaking && <span style={{ fontSize: '12px', color: '#86EFAC' }}>🔊 Speaking... <button onClick={stopSpeaking} style={{ background: 'none', border: 'none', color: '#FCA5A5', cursor: 'pointer' }}>Stop</button></span>}
            </div>
            <form onSubmit={(e) => handleGenerate(e, chatPrompt, null, activeNav === 'student')} style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.35)', border: `1px solid ${cardBorder}`, borderRadius: '999px', padding: '4px 4px 4px 14px', alignItems: 'center' }}>
              <input value={chatPrompt} onChange={(e) => setChatPrompt(e.target.value)} placeholder={activeNav === 'library' ? 'Search in Library...' : activeNav === 'chatpdf' ? 'Ask about PDF...' : activeNav === 'student' ? 'Enter topic...' : 'Ask anything...'} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: heading, fontSize: '13px' }} />
              {chatPrompt && <button type="button" onClick={() => setChatPrompt('')} style={{ background: 'none', border: 'none', color: '#FCA5A5', cursor: 'pointer', fontSize: '14px' }}>❌</button>}
              <button type="button" onClick={() => handleVoiceInput(setChatPrompt)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }} title="Voice Input">🎤</button>
              <button type="submit" disabled={loading} style={{ background: purple, border: 'none', color: '#fff', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', fontSize: '14px' }}>{loading ? '...' : '➤'}</button>
            </form>
          </div>
        )}
      </main>

      {/* FLOATING TOGGLE ARROW FOR RIGHT PANEL */}
      <button 
        onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
        style={{
          position: 'fixed',
          right: isRightPanelOpen ? '290px' : '0px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 950,
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
          fontSize: '15px'
        }}
        title={isRightPanelOpen ? "Hide Right Panel" : "Show Quiz & Flashcards"}
      >
        {isRightPanelOpen ? '❯' : '❮'}
      </button>

      {/* COMPLETELY COLLAPSIBLE RIGHT PANEL */}
      <aside className="right-panel-aside"
        style={{
          width: '290px',
          flexShrink: 0,
          background: 'rgba(20,12,40,0.98)',
          borderRadius: '18px',
          border: `1px solid ${cardBorder}`,
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          position: 'fixed',
          top: '12px',
          bottom: '12px',
          transition: 'right 0.3s ease',
          overflowY: 'auto',
          boxSizing: 'border-box',
          zIndex: 900
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><b style={{ color: heading, fontSize: '13px' }}>✨ Quiz Engine</b><span style={{ fontSize: '10px', background: cardBg, padding: '2px 6px', borderRadius: '999px', color: subText }}>{quizQuestions.length > 0 ? 'Ready' : 'None'}</span></div>
          <input value={quizTopic} onChange={(e) => setQuizTopic(e.target.value)} placeholder="Enter topic..." style={{ ...inputStyle, marginTop: '8px' }} />
          <button onClick={() => generateRealQuiz(quizTopic)} style={{ ...primaryBtn, width: '100%', marginTop: '8px', fontSize: '12px' }}>{quizLoading ? 'Generating...' : '⚡ Generate Quiz'}</button>
          <div style={{ marginTop: '10px', fontSize: '11px', fontWeight: '700', color: heading }}>🎯 Log Quiz Score</div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            <input placeholder="Got - 8" id="gotScore" style={{ ...inputStyle, marginTop: 0 }} />
            <input placeholder="Total - 10" id="totalScore" style={{ ...inputStyle, marginTop: 0 }} />
          </div>
          <button onClick={() => { const got = document.getElementById('gotScore').value; const total = document.getElementById('totalScore').value; saveQuizScore(got, total); }} style={{ background: green, border: 'none', color: '#fff', padding: '8px', borderRadius: '10px', width: '100%', marginTop: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>📊 Save Score</button>
        </div>
        <div>
          <b style={{ color: heading, fontSize: '13px' }}>📄 Flashcards</b>
          <input value={flashTopic} onChange={(e) => setFlashTopic(e.target.value)} placeholder="Enter topic..." style={{ ...inputStyle, marginTop: '8px' }} />
          <button onClick={() => generateRealFlashcards(flashTopic)} style={{ ...primaryBtn, width: '100%', marginTop: '8px', fontSize: '12px' }}>{flashLoading ? 'Generating...' : '✨ Generate Flashcards'}</button>
        </div>
        <div>
          <b style={{ color: heading, fontSize: '13px' }}>🎯 Goal Planning</b>
          <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
            <input value={newGoal} onChange={(e) => setNewGoal(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && newGoal.trim()) { setGoals([...goals, { text: newGoal, done: false }]); setNewGoal(''); } }} placeholder="Add goal..." style={{ ...inputStyle, marginTop: 0 }} />
            <button onClick={() => { if (newGoal.trim()) { setGoals([...goals, { text: newGoal, done: false }]); setNewGoal(''); } }} style={{ background: purple, color: '#fff', border: 'none', padding: '0 12px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>Add</button>
          </div>
        </div>
      </aside>

    </div>
  );
}