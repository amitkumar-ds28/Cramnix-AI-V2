"use client";
import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userContact, setUserContact] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeNav, setActiveNav] = useState('dashboard');
  const [studentTab, setStudentTab] = useState('plan');
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
  const [quizLoading, setQuizLoading] = useState(false);
  const [flashTopic, setFlashTopic] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [flashLoading, setFlashLoading] = useState(false);
  const [studyTopic, setStudyTopic] = useState('');
  const [studyDays, setStudyDays] = useState('7 Days');
  const [studyLevel, setStudyLevel] = useState('Medium');
  const [studyHours, setStudyHours] = useState('3 Hours');
  const [libraryFiles, setLibraryFiles] = useState([]);
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryFilter, setLibraryFilter] = useState('All');
  const [chats, setChats] = useState([{ id: '1', title: 'New Chat', messages: [], pinned: false }]);
  const [currentChatId, setCurrentChatId] = useState('1');
  const [sharedFile, setSharedFile] = useState(null);
  const [chatPrompt, setChatPrompt] = useState('');
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
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
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

  const quizAvg = quizScores.length > 0
    ? Math.round(quizScores.reduce((a, s) => a + (s.got / s.total) * 100, 0) / quizScores.length)
    : 0;
  const todayMins = totalFocusMins;
  const goalPercent = Math.min(100, Math.round((todayMins / 120) * 100));

  useEffect(() => {
    const savedName = localStorage.getItem('cramnix_name');
    const savedContact = localStorage.getItem('cramnix_contact');
    if (savedName && savedContact) {
      setUserName(savedName);
      setUserContact(savedContact);
      setIsLoggedIn(true);
    }
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('cramnix_date');
    const savedCount = parseInt(localStorage.getItem('cramnix_count') || '0', 10);
    if (savedDate !== today) {
      localStorage.setItem('cramnix_date', today);
      localStorage.setItem('cramnix_count', '0');
      setRequestCount(0);
    } else {
      setRequestCount(savedCount);
    }
    try {
      const savedLib = JSON.parse(localStorage.getItem('cramnix_library') || '[]');
      setLibraryFiles(savedLib);
    } catch {}
    try {
      const savedWeek = JSON.parse(localStorage.getItem('cramnix_week') || 'null');
      if (savedWeek) setWeekData(savedWeek);
    } catch {}
    try {
      const savedScores = JSON.parse(localStorage.getItem('cramnix_scores') || '[]');
      setQuizScores(savedScores);
    } catch {}
    try {
      const savedFocus = parseInt(localStorage.getItem('cramnix_focus') || '0', 10);
      setTotalFocusMins(savedFocus);
    } catch {}
  }, []);

  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      setPomodoroCount((prev) => prev + 1);
      const newTotal = totalFocusMins + parseInt(timerMins, 10);
      setTotalFocusMins(newTotal);
      localStorage.setItem('cramnix_focus', newTotal.toString());
      const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
      const updated = [...weekData];
      updated[todayIndex] = {
        ...updated[todayIndex],
        val: Math.min(100, Math.round((newTotal / 120) * 100)),
        mins: `${newTotal}m`,
      };
      setWeekData(updated);
      localStorage.setItem('cramnix_week', JSON.stringify(updated));
      alert(`Session Complete! +${timerMins} Mins added.`);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, timerMins, totalFocusMins, weekData]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [dashboardMessages, studentMessages, pdfMessages, professionalMessages, loading]);

  const callBackendGenerate = async (promptText) => {
    const res = await fetch('https://cramnix-ai-v2.onrender.com/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: promptText,
        api_key: apiSaved && apiKey.trim() ? apiKey.trim() : null,
      }),
    });
    const rawText = await res.text();
    let data = {};
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { detail: rawText };
    }
    if (!res.ok) {
      const detail = data.detail || data.error || rawText || `HTTP ${res.status}`;
      throw new Error(`(${res.status}) ${detail}`);
    }
    const output = data.response || data.answer || data.text || '';
    if (!output) {
      throw new Error('Backend returned an empty response.');
    }
    return output;
  };

  const handleShare = async () => {
    const textToShare = response || chatPrompt || 'Check out Cramnix AI - My Study App';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Cramnix AI Answer', text: textToShare, url: window.location.href });
        setShareMsg('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(textToShare);
        setShareMsg('Copied to clipboard!');
      }
    } catch {
      try {
        await navigator.clipboard.writeText(textToShare);
        setShareMsg('Copied to clipboard!');
      } catch {
        setShareMsg('Copy failed.');
      }
    }
    setTimeout(() => setShareMsg(''), 3000);
  };

  const handleExport = () => {
    const content = response || chatPrompt || '';
    if (!content) {
      alert('Nothing to export yet. Ask a question first.');
      return;
    }
    const fullText = `Cramnix AI - Export\nDate: ${new Date().toLocaleString()}\n\nQuestion:\n${chatPrompt || 'N/A'}\n\nAnswer:\n${content}`;
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cramnix_Answer_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShareMsg('Exported! File downloaded.');
    setTimeout(() => setShareMsg(''), 3000);
  };

  const handleDownloadAnswer = (txt) => {
    const t = txt || response;
    if (!t) {
      alert('No answer to download yet.');
      return;
    }
    const blob = new Blob([`Cramnix AI Answer\n\n${t}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Cramnix_Answer.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNewChatClick = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setChatPrompt('');
    setResponse('');
    if (activeNav === 'dashboard') setDashboardMessages([]);
    if (activeNav === 'student') setStudentMessages([]);
    if (activeNav === 'chatpdf') {
      setPdfMessages([]);
      setSharedFile(null);
    }
    if (activeNav === 'professional') setProfessionalMessages([]);
    setQuizQuestions([]);
    setFlashcards([]);
    setQuizTopic('');
    setFlashTopic('');
    const newId = Date.now().toString();
    setChats([{ id: newId, title: 'New Chat', messages: [], pinned: false }, ...chats]);
    setCurrentChatId(newId);
    setShareMsg('New chat started!');
    setTimeout(() => setShareMsg(''), 2000);
  };

  const speakAnswer = (text) => {
    if (!text) {
      alert('No answer to read yet.');
      return;
    }
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Read aloud not supported.');
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 1;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  useEffect(() => {
    if (autoRead && response) speakAnswer(response);
  }, [response]);

  const generateRealQuiz = async (topicInput) => {
    const topic = (topicInput || quizTopic || chatPrompt || '').trim();
    if (!topic) {
      alert('Please enter a topic first.');
      return;
    }
    setQuizLoading(true);
    setQuizQuestions([]);
    try {
      const answer = await callBackendGenerate(
        `Create 5 multiple choice questions for topic: ${topic}. Include options and answers clearly.`
      );
      setQuizQuestions([{ q: answer, opts: [], ans: -1 }]);
      setQuizTopic(topic);
    } catch (e) {
      alert(`Quiz Error: ${e?.message || String(e)}`);
    }
    setQuizLoading(false);
  };

  const generateRealFlashcards = async (topicInput) => {
    const topic = (topicInput || flashTopic || chatPrompt || '').trim();
    if (!topic) {
      alert('Please enter a topic first.');
      return;
    }
    setFlashLoading(true);
    setFlashcards([]);
    try {
      const answer = await callBackendGenerate(
        `Create 6 flashcards for topic: ${topic}. Each flashcard should have Question and Answer.`
      );
      setFlashcards([{ q: answer, a: 'AI Generated Flashcards' }]);
      setFlashTopic(topic);
    } catch (e) {
      alert(`Flashcards Error: ${e?.message || String(e)}`);
    }
    setFlashLoading(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    const nameValid = userName.trim().length >= 3;
    const contactVal = userContact.trim();
    const isEmail = contactVal.includes('@') && contactVal.includes('.');
    const isPhone = contactVal.length === 10 && Number.isInteger(Number(contactVal));
    if (nameValid && (isEmail || isPhone)) {
      localStorage.setItem('cramnix_name', userName.trim());
      localStorage.setItem('cramnix_contact', contactVal);
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
    if (apiKey.trim().length >= 20) setApiSaved(true);
    else {
      setApiSaved(false);
      setApiKeyError('Please enter a valid API Key from Google AI Studio.');
    }
  };

  const togglePinChat = (id, e) => {
    e.stopPropagation();
    setChats(chats.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)));
  };

  const deleteChat = (id, e) => {
    e.stopPropagation();
    const f = chats.filter((c) => c.id !== id);
    setChats(f);
    if (f.length > 0) setCurrentChatId(f[0].id);
    else handleNewChatClick();
  };

  const handleGenerate = async (e, textToRun, attachedFile = null, isStudent = false) => {
    if (e) e.preventDefault();
    const fileToUse = attachedFile || (activeNav === 'chatpdf' ? sharedFile : null);
    const qText = (textToRun || chatPrompt || '').trim();
    if (!qText && !fileToUse) return;

    let setMsgs = setDashboardMessages;
    if (activeNav === 'student' || isStudent) setMsgs = setStudentMessages;
    else if (activeNav === 'chatpdf') setMsgs = setPdfMessages;
    else if (activeNav === 'professional') setMsgs = setProfessionalMessages;

    if (!apiSaved && requestCount >= 4) {
      const msg = 'Free limit reached (0/4). You will get 4 more tomorrow at 12 AM. Or add your API Key for unlimited use.';
      setResponse(msg);
      setMsgs((prev) => [...prev, { type: 'user', text: qText }, { type: 'ai', text: msg }]);
      return;
    }

    setLoading(true);
    setResponse('');
    if (qText) setMsgs((prev) => [...prev, { type: 'user', text: qText }]);
    else if (fileToUse) setMsgs((prev) => [...prev, { type: 'user', text: `${fileToUse.name} - Please explain this file` }]);
    setChatPrompt('');

    const fileContext = fileToUse ? `[Attached File: ${fileToUse.name}]` : '';
    let tabPrefix = '';
    if (isStudent || activeNav === 'student') {
      if (studentTab === 'plan') tabPrefix = 'Create a detailed study plan for: ';
      if (studentTab === 'notes') tabPrefix = 'Create clean study notes for: ';
      if (studentTab === 'quiz') tabPrefix = 'Create 5 MCQs for: ';
      if (studentTab === 'flashcards') tabPrefix = 'Create flashcards for: ';
    }
    const finalPrompt = `[Language: ${selectedLanguage}] ${fileContext} ${tabPrefix}${qText || 'Analyze the uploaded file.'}`;

    try {
      const ans = await callBackendGenerate(finalPrompt);
      setResponse(ans);
      setMsgs((prev) => [...prev, { type: 'ai', text: ans }]);
      if (!apiSaved) {
        const nc = requestCount + 1;
        setRequestCount(nc);
        localStorage.setItem('cramnix_count', nc.toString());
        localStorage.setItem('cramnix_date', new Date().toDateString());
      }
      const chatTitle = qText ? `${qText.slice(0, 18)}...` : fileToUse ? fileToUse.name : 'New Chat';
      setChats(chats.map((c) => (c.id === currentChatId && c.title === 'New Chat' ? { ...c, title: chatTitle } : c)));
    } catch (err) {
      const friendly = `Error: ${err?.message || String(err)}`;
      setResponse(friendly);
      setMsgs((prev) => [...prev, { type: 'ai', text: friendly }]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStudyPlan = async (e) => {
    if (e) e.preventDefault();
    if (!studyTopic.trim()) {
      alert('Please enter your topic first.');
      return;
    }
    const fullPrompt = `Create a complete study plan for topic: ${studyTopic}. Duration: ${studyDays}. Level: ${studyLevel}. Daily Time: ${studyHours}. Include today's timetable, step-by-step breakdown, day-wise plan, revision, and motivation tip.`;
    setLoading(true);
    setStudentMessages((prev) => [
      ...prev,
      { type: 'user', text: `Study Plan: ${studyTopic} (${studyDays}, ${studyLevel}, ${studyHours})` },
    ]);
    try {
      const ans = await callBackendGenerate(fullPrompt);
      setResponse(ans);
      setStudentMessages((prev) => [...prev, { type: 'ai', text: ans }]);
      if (!apiSaved) {
        const nc = requestCount + 1;
        setRequestCount(nc);
        localStorage.setItem('cramnix_count', nc.toString());
        localStorage.setItem('cramnix_date', new Date().toDateString());
      }
    } catch (err) {
      const friendly = `Error: ${err?.message || String(err)}`;
      setResponse(friendly);
      setStudentMessages((prev) => [...prev, { type: 'ai', text: friendly }]);
    }
    setLoading(false);
  };

  const handleVoiceInput = (setterFunc) => {
    if (typeof window === 'undefined' || (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window))) {
      alert('Speech recognition not supported.');
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'en-US';
    rec.onresult = (ev) => setterFunc(ev.results[0][0].transcript);
    rec.start();
  };

  const handleCameraCapture = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFile = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type.includes('image') ? 'Image' : 'PDF',
        size: `${Math.round(file.size / 1024)} KB`,
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      };
      const updated = [newFile, ...libraryFiles];
      setLibraryFiles(updated);
      localStorage.setItem('cramnix_library', JSON.stringify(updated));
      if (activeNav === 'chatpdf') {
        setSharedFile(file);
        setPdfMessages((prev) => [...prev, { type: 'user', text: `Photo: ${file.name} - Please explain this image` }]);
        handleGenerate(null, `Please explain this image: ${file.name}`, file, false);
      } else {
        setShareMsg(`Photo added to Library: ${file.name}`);
        setTimeout(() => setShareMsg(''), 3000);
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const lowerName = file.name.toLowerCase();
      const isImg =
        file.type.includes('image') ||
        lowerName.endsWith('.jpg') ||
        lowerName.endsWith('.jpeg') ||
        lowerName.endsWith('.png');
      const newFile = {
        id: Date.now().toString(),
        name: file.name,
        type: isImg ? 'Image' : 'PDF',
        size: file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`,
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      };
      const updated = [newFile, ...libraryFiles];
      setLibraryFiles(updated);
      localStorage.setItem('cramnix_library', JSON.stringify(updated));
      if (activeNav === 'chatpdf') {
        setSharedFile(file);
        setShareMsg(`File added: ${file.name}. Now ask a question about this PDF.`);
      } else {
        setShareMsg(`File saved to Library: ${file.name}.`);
      }
      setTimeout(() => setShareMsg(''), 3000);
    }
  };

  const deleteLibraryFile = (id) => {
    const updated = libraryFiles.filter((f) => f.id !== id);
    setLibraryFiles(updated);
    localStorage.setItem('cramnix_library', JSON.stringify(updated));
  };

  const askLibraryFile = (file) => {
    setActiveNav('chatpdf');
    setSharedFile({ name: file.name });
    setChatPrompt(`Explain this file: ${file.name} in simple words`);
    setShareMsg(`Selected ${file.name}. Ask your question below.`);
    setTimeout(() => setShareMsg(''), 3000);
  };

  const notesLibraryFile = (file) => {
    setActiveNav('student');
    setStudentTab('notes');
    setChatPrompt(`Make clean notes for file: ${file.name}`);
    setShareMsg(`Making notes for ${file.name}...`);
    setTimeout(() => setShareMsg(''), 3000);
  };

  const saveQuizScore = (got, total) => {
    if (!got || !total) {
      alert('Please fill both boxes!');
      return;
    }
    const updated = [...quizScores, { got: parseInt(got, 10), total: parseInt(total, 10) }];
    setQuizScores(updated);
    localStorage.setItem('cramnix_scores', JSON.stringify(updated));
    alert('Score saved! It will show in Focus Zone.');
  };

  const freeLeft = Math.max(0, 4 - requestCount);
  const sortedChats = [...chats].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  const glass = { background: cardBg, padding: '10px 14px', borderRadius: '14px', border: `1px solid ${cardBorder}`, backdropFilter: 'blur(12px)' };
  const inputStyle = { width: '100%', padding: '9px 12px', background: 'rgba(0,0,0,0.35)', border: `1px solid ${cardBorder}`, borderRadius: '10px', color: heading, boxSizing: 'border-box', fontSize: '13px' };
  const primaryBtn = { background: `linear-gradient(90deg, ${purple}, ${purple2})`, color: '#fff', border: 'none', padding: '9px 14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' };
  const filteredLibrary = libraryFiles.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(librarySearch.toLowerCase());
    const matchFilter = libraryFilter === 'All' || f.type === libraryFilter;
    return matchSearch && matchFilter;
  });

  if (!isLoggedIn) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', background: bg, color: textColor, fontFamily: 'Inter, sans-serif', justifyContent: 'center', alignItems: 'center', padding: '16px', boxSizing: 'border-box', overflow: 'hidden' }}>
        <div style={{ width: '100%', maxWidth: '420px', background: 'linear-gradient(135deg, rgba(30,21,56,0.95), rgba(15,10,30,0.95))', padding: '28px', borderRadius: '22px', border: `1px solid ${cardBorder}`, boxShadow: '0 10px 30px rgba(0,0,0,0.6)', boxSizing: 'border-box' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: heading, fontSize: '22px', margin: '0 0 6px 0' }}>Cramnix AI</h2>
            <p style={{ color: subText, fontSize: '13px', margin: 0 }}>Secure Cloud Login & Workspace</p>
          </div>
          {loginError && <div style={{ background: 'rgba(239,68,68,0.15)', color: '#FCA5A5', padding: '10px', borderRadius: '10px', marginBottom: '14px', fontSize: '12px' }}>{loginError}</div>}
          <form onSubmit={handleLogin}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '13px', color: heading }}>Full Name</label>
            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="e.g. Amitkumar Gautam" required style={{ ...inputStyle, marginBottom: '14px' }} />
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '13px', color: heading }}>Email ID or 10-Digit Mobile</label>
            <input type="text" value={userContact} onChange={(e) => setUserContact(e.target.value)} placeholder="amit@example.com or 9876543210" required style={{ ...inputStyle, marginBottom: '18px' }} />
            <button type="submit" style={{ width: '100%', padding: '12px', background: `linear-gradient(90deg, ${purple}, ${purple2})`, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>Login / Get Started</button>
          </form>
          <div style={{ textAlign: 'center', fontSize: '11px', color: subText, marginTop: '20px' }}>Made with love by <strong style={{ color: heading }}>Amitkumar Gautam</strong></div>
        </div>
      </div>
    );
  }

  const navItem = (id, label, active) => (
    <div key={id} onClick={() => { setActiveNav(id); setChatPrompt(''); setResponse(''); setIsMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: active ? '800' : '500', background: active ? purple : 'transparent', color: active ? '#fff' : '#C4B5FD' }}>
      {label}
    </div>
  );

  const studentTabBtn = (id, label) => (
    <button key={id} onClick={() => setStudentTab(id)} style={{ background: studentTab === id ? purple : cardBg, border: `1px solid ${cardBorder}`, color: '#fff', padding: '5px 12px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: studentTab === id ? '800' : '500' }}>{label}</button>
  );

  const libraryFilterBtn = (label) => (
    <button key={label} onClick={() => setLibraryFilter(label)} style={{ background: libraryFilter === label ? purple : cardBg, border: `1px solid ${cardBorder}`, color: '#fff', padding: '5px 12px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: libraryFilter === label ? '800' : '500' }}>{label}</button>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: `radial-gradient(800px 400px at 15% 0%, #2E1A5E 0%, transparent 60%), radial-gradient(700px 400px at 90% 20%, #3B1A6B 0%, transparent 60%), ${bg}`, color: textColor, fontFamily: 'Inter, sans-serif', padding: '10px', gap: '10px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 900px) {
          .desktop-sidebar {
            position: fixed;
            left: ${isMobileMenuOpen ? '0px' : '-100%'};
            top: 0;
            bottom: 0;
            width: 260px;
            height: 100vh;
            z-index: 1000;
            transition: left 0.3s ease;
          }
          .mobile-menu-btn {
            display: flex;
          }
          .main-content-area {
            margin-left: 0px;
            margin-right: 0px;
            width: 100%;
            padding: 10px;
            margin-top: 48px;
            height: calc(100vh - 68px);
          }
          .right-panel-aside {
            right: ${isRightPanelOpen ? '0px' : '-100%'};
            width: 280px;
            z-index: 1000;
            height: 100vh;
            top: 0;
            bottom: 0;
            border-radius: 0;
          }
        }
        @media (min-width: 901px) {
          .mobile-menu-btn {
            display: none;
          }
          .desktop-sidebar {
            left: auto;
            position: relative;
          }
          .main-content-area {
            margin-right: ${isRightPanelOpen ? '290px' : '0px'};
            height: calc(100vh - 20px);
          }
          .right-panel-aside {
            right: ${isRightPanelOpen ? '10px' : '-310px'};
            height: calc(100vh - 20px);
          }
        }
      ` }} />

      <div className="mobile-menu-btn" style={{ position: 'fixed', top: '8px', left: '8px', right: '8px', background: 'rgba(30,21,56,0.95)', padding: '8px 12px', borderRadius: '12px', border: `1px solid ${cardBorder}`, justifyContent: 'space-between', alignItems: 'center', zIndex: 900, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ background: purple, color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Menu</button>
          <span style={{ fontWeight: '900', color: heading, fontSize: '14px' }}>Cramnix AI</span>
        </div>
        <button onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} style={{ background: cardBg, color: heading, border: `1px solid ${cardBorder}`, padding: '5px 10px', borderRadius: '6px', fontSize: '11px' }}>Quiz/Tools</button>
      </div>

      <aside className="desktop-sidebar" style={{ width: '230px', flexShrink: 0, background: 'linear-gradient(180deg, rgba(30,21,56,0.98), rgba(10,6,24,0.98))', borderRadius: '16px', border: `1px solid ${cardBorder}`, padding: '12px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 30, boxSizing: 'border-box', height: '100%', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 4px 8px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/logo.png" alt="Cramnix Logo" onError={(e) => { e.currentTarget.style.display = 'none'; }} style={{ width: '30px', height: '30px', borderRadius: '8px', objectFit: 'cover', background: 'white', padding: '2px' }} />
              <div>
                <div style={{ fontSize: '15px', fontWeight: '900', color: heading, lineHeight: '1' }}>Cramnix AI</div>
                <div style={{ fontSize: '8px', color: subText, letterSpacing: '1px', marginTop: '2px' }}>STUDENT ZONE</div>
              </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="mobile-menu-btn" style={{ background: red, color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px' }}>X</button>
          </div>
          {navItem('dashboard', 'Dashboard', activeNav === 'dashboard')}
          {navItem('student', 'Student Zone', activeNav === 'student')}
          {navItem('library', 'Library', activeNav === 'library')}
          {navItem('chatpdf', 'Chat with PDF', activeNav === 'chatpdf')}
          {navItem('quizzes', 'Quizzes', activeNav === 'quizzes')}
          {navItem('flashcards', 'Flashcards', activeNav === 'flashcards')}
          {navItem('goals', 'Goals', activeNav === 'goals')}
          {navItem('professional', 'Professional Zone', activeNav === 'professional')}
          {navItem('focus', 'Focus Zone', activeNav === 'focus')}
          {navItem('settings', 'Settings', activeNav === 'settings')}
          <div style={{ margin: '8px 4px 0 4px', background: 'linear-gradient(135deg,#7C3AED,#4C1D95)', padding: '8px 10px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
              <span>Free Left</span>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '1px 5px', borderRadius: '999px' }}>{apiSaved ? 'UNLIMITED' : `${freeLeft} / 4`}</span>
            </div>
            <div style={{ fontSize: '15px', fontWeight: '900', margin: '3px 0' }}>{apiSaved ? 'Unlimited' : `${freeLeft} / 4 Left`}</div>
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.25)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: apiSaved ? '100%' : `${(freeLeft / 4) * 100}%`, height: '100%', background: '#fff' }} />
            </div>
            <div style={{ fontSize: '8px', marginTop: '3px', opacity: 0.9 }}>{streak}d streak • {pomodoroCount} sess • {totalFocusMins}m</div>
          </div>
          <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', color: '#FCA5A5', marginTop: '4px' }}>Logout</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.08)', padding: '6px 10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexShrink: 0 }}>
          <div style={{ width: '26px', height: '26px', background: purple, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px' }}>{userName ? userName[0].toUpperCase() : 'A'}</div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: heading, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
          </div>
        </div>
      </aside>

      <main className="main-content-area" style={{ flex: 1, minWidth: 0, background: 'rgba(10,6,24,0.55)', borderRadius: '16px', border: `1px solid ${cardBorder}`, padding: '12px 14px', display: 'flex', flexDirection: 'column', transition: 'margin-right 0.3s ease', boxSizing: 'border-box', height: '100%', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '6px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: heading }}>
              {activeNav === 'chatpdf' ? 'Chat with PDF' : activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}
            </h1>
            <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.08)', border: `1px solid ${cardBorder}`, padding: '2px 7px', borderRadius: '999px', fontWeight: '700', color: subText }}>
              {sharedFile ? sharedFile.name.slice(0, 15) : 'No PDF'}
            </span>
            <span style={{ fontSize: '10px', color: '#86EFAC' }}>Online</span>
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setAutoRead(!autoRead)} style={{ background: autoRead ? green : cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '4px 10px', borderRadius: '999px', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}>Read: {autoRead ? 'ON' : 'OFF'}</button>
            <button onClick={handleShare} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '4px 10px', borderRadius: '999px', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}>Share</button>
            <button onClick={handleExport} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '4px 10px', borderRadius: '999px', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}>Export</button>
            <button onClick={handleNewChatClick} style={{ background: green, border: 'none', color: '#fff', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', cursor: 'pointer', fontWeight: '800' }}>+ New</button>
          </div>
        </div>

        {shareMsg && (
          <div style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid #22C55E', color: '#86EFAC', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', marginBottom: '6px', flexShrink: 0 }}>
            {shareMsg}
          </div>
        )}

        {activeNav === 'student' && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px', flexShrink: 0 }}>
            {studentTabBtn('plan', 'Study Plan')}
            {studentTabBtn('notes', 'Notes')}
            {studentTabBtn('quiz', 'Quiz')}
            {studentTabBtn('flashcards', 'Flashcards')}
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', minHeight: 0, paddingBottom: '4px' }}>
          {activeNav === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                <div style={{ background: 'linear-gradient(135deg,#7C3AED,#4C1D95)', padding: '10px 12px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '10px', opacity: 0.9 }}>TODAY STUDY</div>
                  <div style={{ fontSize: '17px', fontWeight: '900', marginTop: '3px' }}>{totalFocusMins}m</div>
                  <div style={{ fontSize: '10px', marginTop: '2px', opacity: 0.85 }}>Goal: 120m • {goalPercent}%</div>
                </div>
                <div style={{ ...glass, padding: '10px 12px' }}>
                  <div style={{ fontSize: '10px', color: subText }}>POMODORO</div>
                  <div style={{ fontSize: '17px', fontWeight: '900', marginTop: '3px' }}>{pomodoroCount} Sess</div>
                  <div style={{ fontSize: '10px', color: subText, marginTop: '2px' }}>{streak}d Streak</div>
                </div>
                <div style={{ ...glass, padding: '10px 12px' }}>
                  <div style={{ fontSize: '10px', color: subText }}>QUIZ AVG</div>
                  <div style={{ fontSize: '17px', fontWeight: '900', marginTop: '3px' }}>{quizAvg}%</div>
                  <div style={{ fontSize: '10px', color: subText, marginTop: '2px' }}>{quizScores.length} Done</div>
                </div>
                <div style={{ ...glass, padding: '10px 12px' }}>
                  <div style={{ fontSize: '10px', color: subText }}>GOALS</div>
                  <div style={{ fontSize: '17px', fontWeight: '900', marginTop: '3px' }}>{goals.filter((g) => g.done).length}/{goals.length}</div>
                  <div style={{ fontSize: '10px', color: subText, marginTop: '2px' }}>Progress</div>
                </div>
              </div>

              {dashboardMessages.length === 0 && !loading && (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '8px 0' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '900', color: heading, margin: '4px 0 2px 0' }}>Hello, {userName || 'Amit'}</h2>
                  <p style={{ color: subText, fontSize: '12px', margin: 0 }}>What do you want to learn today?</p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
                    <button onClick={() => setChatPrompt('Explain Photosynthesis in simple words')} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '5px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px' }}>Photosynthesis</button>
                    <button onClick={() => setChatPrompt('Make 5 MCQs for Cellular Respiration')} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '5px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px' }}>Make Quiz</button>
                    <button onClick={() => setChatPrompt('Make flashcards for Human Body')} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '5px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px' }}>Flashcards</button>
                    <button onClick={() => setChatPrompt('Give me a study plan for today')} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '5px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px' }}>Study Plan</button>
                  </div>
                </div>
              )}

              {dashboardMessages.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '4px 0' }}>
                  {dashboardMessages.map((m, i) => (
                    <div key={i}>
                      {m.type === 'user' ? (
                        <div style={{ background: purple, color: '#fff', padding: '8px 12px', borderRadius: '14px 14px 4px 14px', maxWidth: '80%', marginLeft: 'auto', fontSize: '12px', lineHeight: '1.4' }}>
                          {m.text}
                        </div>
                      ) : (
                        <div style={{ background: 'rgba(139,92,246,0.12)', border: `1px solid ${cardBorder}`, padding: '12px', borderRadius: '12px', fontSize: '12px', lineHeight: '1.5' }}>
                          <div style={{ fontWeight: '800', color: heading, marginBottom: '4px' }}>Cramnix AI</div>
                          <ReactMarkdown>{m.text}</ReactMarkdown>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                            <button onClick={() => speakAnswer(m.text)} style={{ background: purple, color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>Read Aloud</button>
                            <button onClick={stopSpeaking} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: `1px solid ${cardBorder}`, padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>Stop</button>
                            <button onClick={() => handleDownloadAnswer(m.text)} style={{ background: green, color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>Download</button>
                            <button onClick={handleShare} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: `1px solid ${cardBorder}`, padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>Share</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && <div style={{ fontSize: '11px', color: subText }}>Cramnix AI is thinking...</div>}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>
          )}

          {activeNav === 'student' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {studentTab === 'plan' && (
                <div style={{ ...glass }}>
                  <h3 style={{ margin: '0 0 3px 0', color: heading, fontSize: '14px' }}>Create Your Study Plan</h3>
                  <input value={studyTopic} onChange={(e) => setStudyTopic(e.target.value)} placeholder="e.g. Photosynthesis, Maths" style={{ ...inputStyle, margin: '6px 0 8px 0' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '6px' }}>
                    <select value={studyDays} onChange={(e) => setStudyDays(e.target.value)} style={{ ...inputStyle, padding: '6px' }}><option>1 Day</option><option>7 Days</option><option>30 Days</option></select>
                    <select value={studyLevel} onChange={(e) => setStudyLevel(e.target.value)} style={{ ...inputStyle, padding: '6px' }}><option>Easy</option><option>Medium</option><option>Hard</option></select>
                    <select value={studyHours} onChange={(e) => setStudyHours(e.target.value)} style={{ ...inputStyle, padding: '6px' }}><option>1 Hour</option><option>2 Hours</option><option>3 Hours</option></select>
                  </div>
                  <button onClick={handleGenerateStudyPlan} style={{ ...primaryBtn, width: '100%', marginTop: '8px', padding: '8px' }}>{loading ? 'Creating...' : 'Generate Study Plan'}</button>
                </div>
              )}
              {studentMessages.map((m, i) => (
                <div key={i} style={{ background: m.type === 'user' ? purple : 'rgba(139,92,246,0.12)', color: '#fff', padding: '10px 12px', borderRadius: '12px', fontSize: '12px' }}>
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                </div>
              ))}
            </div>
          )}

          {activeNav === 'library' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input value={librarySearch} onChange={(e) => setLibrarySearch(e.target.value)} placeholder="Search files..." style={{ ...inputStyle, flex: 1, minWidth: '160px' }} />
                {libraryFilterBtn('All')}
                {libraryFilterBtn('PDF')}
                {libraryFilterBtn('Image')}
              </div>
              {filteredLibrary.map((file) => (
                <div key={file.id} style={{ ...glass, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: heading }}>{file.name}</div>
                    <div style={{ fontSize: '10px', color: subText }}>{file.type} • {file.size}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => askLibraryFile(file)} style={{ ...primaryBtn, padding: '5px 8px', fontSize: '11px' }}>Ask AI</button>
                    <button onClick={() => notesLibraryFile(file)} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: '#fff', padding: '5px 8px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px' }}>Notes</button>
                    <button onClick={() => deleteLibraryFile(file.id)} style={{ background: red, border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px' }}>Del</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeNav === 'chatpdf' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pdfMessages.length === 0 && <div style={{ textAlign: 'center', color: subText, fontSize: '12px', padding: '16px' }}>Upload a PDF or image below and ask questions.</div>}
              {pdfMessages.map((m, i) => (
                <div key={i} style={{ background: m.type === 'user' ? purple : 'rgba(139,92,246,0.12)', color: '#fff', padding: '10px 12px', borderRadius: '12px', fontSize: '12px' }}>
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                </div>
              ))}
            </div>
          )}

          {activeNav === 'focus' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ ...glass }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b style={{ color: heading, fontSize: '12px' }}>Last 7 Days Progress</b>
                  <span style={{ background: green, color: '#fff', padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '800' }}>+{todayMins}m</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', height: '80px', marginTop: '8px' }}>
                  {weekData.map((w) => (
                    <div key={w.day} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ height: `${Math.max(4, w.val * 0.6)}px`, background: purple, borderRadius: '4px' }} />
                      <div style={{ fontSize: '9px', color: subText, marginTop: '3px' }}>{w.day}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ ...glass, textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: heading }}>Pomodoro Timer</div>
                <div style={{ fontSize: '28px', fontWeight: '900', color: heading, margin: '4px 0' }}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <select value={timerMins} onChange={(e) => { setTimerMins(e.target.value); setTimeLeft(e.target.value * 60); }} style={{ ...inputStyle, width: 'auto', padding: '5px 8px' }}>
                    <option value={25}>25 Min</option>
                    <option value={45}>45 Min</option>
                    <option value={15}>15 Min</option>
                  </select>
                  <button onClick={() => setTimerActive(!timerActive)} style={{ ...primaryBtn, padding: '5px 10px', fontSize: '11px' }}>{timerActive ? 'Pause' : 'Start'}</button>
                  <button onClick={() => { setTimerActive(false); setTimeLeft(timerMins * 60); }} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: '#fff', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px' }}>Reset</button>
                </div>
              </div>
            </div>
          )}

          {activeNav === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ ...glass }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: heading }}>Gemini API Key</label>
                <input type="password" value={apiKey} onChange={(e) => { setApiKey(e.target.value); setApiSaved(false); }} placeholder="Enter API Key..." style={{ ...inputStyle, margin: '4px 0' }} />
                <button onClick={handleSaveApiKey} style={primaryBtn}>Save API Key</button>
                {apiSaved && <div style={{ color: '#86EFAC', fontSize: '10px', marginTop: '4px' }}>API Key Active - Unlimited!</div>}
                {apiKeyError && <div style={{ color: '#FCA5A5', fontSize: '10px', marginTop: '4px' }}>{apiKeyError}</div>}
                <button onClick={() => setShowGuide(!showGuide)} style={{ background: 'none', border: 'none', color: '#A78BFA', fontSize: '10px', cursor: 'pointer', marginTop: '4px' }}>How to get API Key?</button>
                {showGuide && <div style={{ fontSize: '10px', color: subText, marginTop: '2px' }}>Get a key from Google AI Studio and paste above.</div>}
              </div>
              <div style={{ ...glass }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: heading }}>Language</label>
                <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} style={{ ...inputStyle, marginTop: '4px' }}>
                  <option>English</option>
                  <option>Hinglish</option>
                  <option>Hindi</option>
                  <option>Marathi</option>
                </select>
              </div>
              <div style={{ ...glass }}>
                <h4 style={{ margin: '0 0 4px 0', color: heading, fontSize: '12px' }}>Chat History</h4>
                {sortedChats.map((c) => (
                  <div key={c.id} onClick={() => setCurrentChatId(c.id)} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px', borderRadius: '6px', background: c.id === currentChatId ? 'rgba(139,92,246,0.3)' : 'transparent', cursor: 'pointer', fontSize: '11px', marginBottom: '2px' }}>
                    <span>{c.pinned ? '[Pinned] ' : ''}{c.title}</span>
                    <span>
                      <button onClick={(e) => togglePinChat(c.id, e)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>Pin</button>
                      <button onClick={(e) => deleteChat(c.id, e)} style={{ background: 'none', border: 'none', color: '#FCA5A5', cursor: 'pointer' }}>Del</button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {['quizzes', 'flashcards', 'goals', 'professional'].includes(activeNav) && (
            <div style={{ ...glass, fontSize: '12px', color: subText }}>
              Use the right panel (Quiz/Tools) or ask directly in the chat bar below.
            </div>
          )}
        </div>

        {showBottomBar && (
          <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => fileInputRef.current?.click()} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '5px 10px', borderRadius: '999px', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}>Upload</button>
              <input ref={fileInputRef} type="file" accept=".pdf,.txt,.png,.jpg,.jpeg" hidden onChange={handleFileUpload} />
              <button onClick={() => cameraInputRef.current?.click()} style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: heading, padding: '5px 10px', borderRadius: '999px', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}>Camera</button>
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden onChange={handleCameraCapture} />
              {isSpeaking && <button onClick={stopSpeaking} style={{ background: red, border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '999px', fontSize: '10px', cursor: 'pointer' }}>Stop Voice</button>}
            </div>
            <form onSubmit={(e) => handleGenerate(e, chatPrompt, null, activeNav === 'student')} style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.35)', border: `1px solid ${cardBorder}`, borderRadius: '999px', padding: '3px 3px 3px 12px', alignItems: 'center' }}>
              <input value={chatPrompt} onChange={(e) => setChatPrompt(e.target.value)} placeholder="Ask anything..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: heading, fontSize: '13px' }} />
              <button type="button" onClick={() => handleVoiceInput(setChatPrompt)} style={{ background: 'none', border: 'none', color: heading, fontSize: '12px', cursor: 'pointer' }}>Mic</button>
              <button type="submit" disabled={loading} style={{ background: purple, border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '13px' }}>{loading ? '...' : 'Go'}</button>
            </form>
          </div>
        )}
      </main>

      <button onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} style={{ position: 'fixed', right: isRightPanelOpen ? '280px' : '0px', top: '50%', transform: 'translateY(-50%)', zIndex: 950, background: '#1E1538', color: '#C4B5FD', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px 0 0 10px', padding: '10px 6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
        {isRightPanelOpen ? '>' : '<'}
      </button>

      <aside className="right-panel-aside" style={{ width: '280px', flexShrink: 0, background: 'rgba(20,12,40,0.98)', borderRadius: '16px', border: `1px solid ${cardBorder}`, padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'fixed', top: '10px', bottom: '10px', transition: 'right 0.3s ease', overflowY: 'auto', boxSizing: 'border-box', zIndex: 900 }}>
        <div>
          <b style={{ color: heading, fontSize: '12px' }}>Quiz Engine</b>
          <input value={quizTopic} onChange={(e) => setQuizTopic(e.target.value)} placeholder="Enter topic..." style={{ ...inputStyle, marginTop: '6px' }} />
          <button onClick={() => generateRealQuiz(quizTopic)} style={{ ...primaryBtn, width: '100%', marginTop: '6px', fontSize: '12px' }}>{quizLoading ? 'Generating...' : 'Generate Quiz'}</button>
          {quizQuestions[0] && (
            <div style={{ ...glass, marginTop: '8px', fontSize: '11px', maxHeight: '140px', overflowY: 'auto' }}>
              <ReactMarkdown>{quizQuestions[0].q}</ReactMarkdown>
            </div>
          )}
          <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
            <input placeholder="Got" id="gotScore" style={{ ...inputStyle }} />
            <input placeholder="Total" id="totalScore" style={{ ...inputStyle }} />
          </div>
          <button onClick={() => saveQuizScore(document.getElementById('gotScore')?.value, document.getElementById('totalScore')?.value)} style={{ background: green, border: 'none', color: '#fff', padding: '7px', borderRadius: '8px', width: '100%', marginTop: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '11px' }}>Save Score</button>
        </div>

        <div>
          <b style={{ color: heading, fontSize: '12px' }}>Flashcards</b>
          <input value={flashTopic} onChange={(e) => setFlashTopic(e.target.value)} placeholder="Enter topic..." style={{ ...inputStyle, marginTop: '6px' }} />
          <button onClick={() => generateRealFlashcards(flashTopic)} style={{ ...primaryBtn, width: '100%', marginTop: '6px', fontSize: '12px' }}>{flashLoading ? 'Generating...' : 'Generate Flashcards'}</button>
          {flashcards[0] && (
            <div style={{ ...glass, marginTop: '8px', fontSize: '11px', maxHeight: '140px', overflowY: 'auto' }}>
              <ReactMarkdown>{flashcards[0].q}</ReactMarkdown>
            </div>
          )}
        </div>

        <div>
          <b style={{ color: heading, fontSize: '12px' }}>Goal Planning</b>
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            <input value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="Add goal..." style={{ ...inputStyle }} />
            <button onClick={() => { if (newGoal.trim()) { setGoals([...goals, { text: newGoal.trim(), done: false }]); setNewGoal(''); } }} style={{ background: purple, color: '#fff', border: 'none', padding: '0 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '11px' }}>Add</button>
          </div>
          {goals.map((g, idx) => (
            <div key={idx} onClick={() => setGoals(goals.map((item, i) => (i === idx ? { ...item, done: !item.done } : item)))} style={{ fontSize: '11px', marginTop: '4px', cursor: 'pointer', textDecoration: g.done ? 'line-through' : 'none', color: g.done ? subText : heading }}>
              {g.done ? '[Done] ' : '[ ] '}{g.text}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}