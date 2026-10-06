import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Send, Bot, User, RefreshCw } from 'lucide-react';
import { links } from '../data';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

/** Calculates experience dynamically starting strictly from Nov 2024 to today */
function getExperienceStats() {
  const currentDate = new Date();
  const start = new Date(2024, 10, 1); // Nov 1, 2024 (Accenture joining date)

  let months = (currentDate.getFullYear() - start.getFullYear()) * 12 + (currentDate.getMonth() - start.getMonth());
  if (currentDate.getDate() < start.getDate()) {
    months--;
  }
  months = Math.max(0, months);

  const years = Math.floor(months / 12);
  const remMonths = months % 12;

  let formatted = '';
  if (years > 0 && remMonths > 0) {
    formatted = `${years} yr ${remMonths} mos`;
  } else if (years > 0) {
    formatted = `${years} year${years > 1 ? 's' : ''}`;
  } else {
    formatted = `${months} month${months > 1 ? 's' : ''}`;
  }

  const decimalYears = (months / 12).toFixed(1);

  return {
    months,
    years,
    remMonths,
    formatted,
    decimalYears,
  };
}

const SUGGESTED_QUESTIONS = [
  { label: "⏳ Notice Period & CTC", query: "What is Shilpa's notice period and expected CTC?" },
  { label: "📍 Current & Preferred Location", query: "What is Shilpa's current and preferred location?" },
  { label: "💼 Total Experience", query: "What is Shilpa's total experience?" },
  { label: "🚀 Work at Accenture", query: "Can you summarize Shilpa's work at Accenture?" },
  { label: "💻 Technical Skills", query: "What are Shilpa's core technical skills and stack?" },
  { label: "🛠️ Key Projects", query: "Tell me about StudyMate.AI & Pizzeria projects." },
  { label: "🏆 Accenture Awards", query: "What awards and recognitions has Shilpa won?" },
  { label: "📬 Contact Details", query: "How can I contact Shilpa?" },
];

function generateResponse(userQuery: string): string {
  const query = userQuery.toLowerCase().trim();
  const stats = getExperienceStats();

  // Word boundary regex matching to avoid accidental substring matches (e.g. "shilpa" containing "lpa")
  const isNotice = /\bnotice\b|\bnotice period\b/i.test(query);
  const isCtc = /\bctc\b|\bsalary\b|\bpackage\b|\blpa\b|\bcompensation\b/i.test(query);
  
  const isCurrLocation = /\bcurrent location\b|\bliving\b|\bpresent location\b/i.test(query);
  const isPrefLocation = /\bpreferred location\b|\btarget location\b|\brelocation\b|\brelocate\b/i.test(query);
  const isGeneralLocation = !isCurrLocation && !isPrefLocation && /\blocation\b|\bcity\b|\bbangalore\b|\bbengaluru\b/i.test(query);

  const isExperience = /\bexperience\b|\byears of experience\b|\btotal experience\b|\bhow long\b/i.test(query);
  const isAccenture = /\baccenture\b|\bpada\b|\bmyisp\b/i.test(query);
  const isFindInbox = /\bfindinbox\b|\bintern\b|\binternship\b/i.test(query);

  const isAwards = /\baward\b|\bawards\b|\brecognition\b|\brecognitions\b|\bstar of the month\b|\bwall of fame\b|\bhonors?\b|\bwon\b|\bwin\b/i.test(query);
  const isContact = /\bcontact\b|\bemail\b|\bphone\b|\breach\b|\binterview\b|\blinkedin\b|\bgithub\b|\bleetcode\b|\bhire\b/i.test(query);
  const isSkills = /\bskills?\b|\bstack\b|\btechnolog(y|ies)\b|\bangular\b|\bjava\b|\bspring\b|\brxjs\b|\bngrx\b|\bnode\b|\bmongo\b|\bmysql\b/i.test(query);
  const isEdu = /\beducation\b|\bdegree\b|\bcollege\b|\bcgpa\b|\bjss\b|\buniversity\b|\bschool\b|\b10th\b|\b12th\b/i.test(query);

  // 1. Awards & Recognitions specifically
  if (isAwards) {
    return `### 🏆 Accenture Awards & Certifications\n\n` +
      `• ⭐ **Star of the Month Award** (Accenture, Feb 2026) – Recognized for Angular Micro Frontend (MFE) development in MyISP.\n` +
      `• 🏆 **TechWeek Stars Wall of Fame** (Accenture, Dec 2025) – Asset Engineering Hub recognition.\n` +
      `• 🎖️ **Tech Expressway Program Stream Training Excellence** (Accenture, Dec 2025)\n` +
      `• 📜 **Microsoft GitHub Copilot Certification** (2024)\n` +
      `• 📜 **HackerRank Data Structures Certification**`;
  }

  // 2. Contact Details specifically
  if (isContact) {
    return `• 📧 **Email**: [shilpakalwar25@gmail.com](mailto:shilpakalwar25@gmail.com)\n` +
      `• 📞 **Phone**: [+91 7338683445](tel:+917338683445)\n` +
      `• 💼 **LinkedIn**: [linkedin.com/in/shilpagupta](${links.linkedin})\n` +
      `• 🐙 **GitHub**: [github.com/Shilpa2504](${links.github})\n` +
      `• ⚡ **LeetCode**: [leetcode.com/Shilpa_gupta](${links.leetcode})`;
  }

  // 3. Notice Period & CTC specifically
  if (isNotice && isCtc) {
    return `• **Notice Period**: **60 Days**\n• **Expected CTC**: **10 LPA**`;
  }
  if (isNotice) {
    return `• **Notice Period**: **60 Days**`;
  }
  if (isCtc) {
    return `• **Expected CTC**: **10 LPA**`;
  }

  // 4. Location specifically
  if (isCurrLocation && isPrefLocation) {
    return `• **Current Location**: **Bangalore, India**\n• **Preferred Location**: **Bangalore, India**`;
  }
  if (isCurrLocation) {
    return `• **Current Location**: **Bangalore, India**`;
  }
  if (isPrefLocation) {
    return `• **Preferred Location**: **Bangalore, India** (Open to Hybrid, On-site in Bangalore, or Remote)`;
  }
  if (isGeneralLocation) {
    return `• **Current Location**: **Bangalore, India**\n• **Preferred Location**: **Bangalore, India**`;
  }

  // 5. Work Mode Preference
  if (/\bwork mode\b|\bhybrid\b|\bremote\b|\bwfh\b|\bonsite\b/i.test(query)) {
    return `• **Work Mode Preference**: Open to **Hybrid**, **On-site in Bangalore**, or **Remote** roles.`;
  }

  // 6. Total Experience & Work at Accenture
  if (isAccenture) {
    return `### 💼 Accenture Experience (${stats.formatted})\n\n` +
      `**Packaged App Development Associate (PADA)** *(Nov 2024 – Present)*\n` +
      `• Maintained **Angular Micro Frontend (MFE)** applications on the enterprise **MyISP** platform.\n` +
      `• Applied **Angular Signals**, RxJS, and NgRx to cut duplicate component dev time by **10%**.\n` +
      `• Integrated RESTful microservices with **Java & Spring Boot**, reducing latency by **20%**.\n` +
      `• Increased Jasmine & Karma unit test coverage from **0% to 99%**.\n` +
      `• Adopted **GitHub Copilot** workflows to reduce feature delivery time by **30%**.`;
  }
  if (isExperience) {
    return `• **Total Experience**: **${stats.formatted}** (calculated from Nov 2024 at Accenture to present).`;
  }
  if (isFindInbox) {
    return `### 💼 Web Developer Intern at FindInbox Limited *(Nov 2023 – Jan 2024)*\n` +
      `• Developed Angular web application modules for student assessment workflows serving **100+ instructors**.\n` +
      `• Integrated REST APIs & state management, reducing assessment data load time by **15%**.`;
  }

  // 7. Technical Skills
  if (isSkills) {
    return `### 🛠️ Core Technical Skills\n\n` +
      `• **Frontend**: Angular 21, TypeScript, RxJS, NgRx, JavaScript, HTML5, CSS3, Bootstrap\n` +
      `• **Backend**: Java, Spring Boot, REST APIs, Node.js, Express.js\n` +
      `• **Databases**: MySQL, MongoDB, JPA / Hibernate\n` +
      `• **Architecture**: Micro Frontend (MFE), Microservices, State Management, Lazy Loading, Dependency Injection\n` +
      `• **Testing & Tools**: Jasmine, Karma, Git, GitHub, npm, VS Code, Linux/Unix, GitHub Copilot`;
  }

  // 8. Specific Projects
  if (/\bstudymate\b/i.test(query)) {
    return `### 🚀 StudyMate.AI\n` +
      `• **Stack**: Angular, Spring Boot, Gemini AI, MySQL, JWT\n` +
      `• **Overview**: AI document understanding & quiz generator with SHA-256 duplicate detection.\n` +
      `• **Live Demo**: [study-mate-ai-six.vercel.app](https://study-mate-ai-six.vercel.app/)\n` +
      `• **GitHub**: [github.com/Shilpa2504/StudyMate.AI](https://github.com/Shilpa2504/StudyMate.AI)`;
  }
  if (/\bpizza\b|\bpizzeria\b/i.test(query)) {
    return `### 🍕 AI-Powered Pizzeria\n` +
      `• **Stack**: MEAN Stack (Angular, Node.js, Express, MongoDB)\n` +
      `• **Overview**: Conversational AI ordering assistant with intent matching and dynamic real-time Smart Meal Builder.\n` +
      `• **Live Demo**: [pizzeria-ashen-alpha.vercel.app](https://pizzeria-ashen-alpha.vercel.app/)\n` +
      `• **GitHub**: [github.com/Shilpa2504/Pizzeria](https://github.com/Shilpa2504/Pizzeria)`;
  }
  if (/\bnews\b|\bnewsapp\b/i.test(query)) {
    return `### 📰 NewsApp\n` +
      `• **Stack**: MEAN Stack (Angular, Node.js, Express, MongoDB, REST APIs)\n` +
      `• **Overview**: Category news aggregator with real-time search and MongoDB bookmarks.`;
  }
  if (/\bprojects?\b/i.test(query)) {
    return `### 🚀 Projects Overview\n\n` +
      `1. **StudyMate.AI**: AI document processing & quiz generator (Angular, Spring Boot, Gemini AI, MySQL).\n` +
      `2. **AI-Powered Pizzeria**: Conversational ordering & custom meal builder (MEAN Stack).\n` +
      `3. **NewsApp**: Category-based news aggregator (MEAN Stack).`;
  }

  // 9. Education
  if (isEdu) {
    return `• **Degree**: B.E. in Computer Science from JSS Academy of Technical Education, Bangalore (2020 – 2024)\n` +
      `• **CGPA**: **8.6 / 10**\n` +
      `• **Schooling**: Class 12 (2018) & Class 10 (2016) under Assam Board.`;
  }

  // 10. General Shilpa Intro / Bio
  if (/\bwho is\b|\bwho\'?s\b|\bshilpa\b|\bsummary\b|\babout\b|\bhello\b|\bhi\b|\bhey\b/i.test(query)) {
    return `**Shilpa Gupta** is a Software Engineer based in Bangalore, India, specializing in **Angular 21**, **TypeScript**, **Micro Frontend (MFE)**, and **Java Spring Boot**. She currently works at **Accenture** as a Packaged App Development Associate.`;
  }

  // 11. Strict Out-of-Knowledge Fallback
  return `That is outside my knowledge base. I can only answer questions related to Shilpa Gupta's professional profile, experience, skills, projects, and HR details.`;
}

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: "👋 Hi! I'm Shilpa's AI Assistant. Ask me anything about her experience, skills, HR details, or projects!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isTyping) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const responseText = generateResponse(textToSend);
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 350);
  };

  const handleReset = () => {
    setMessages([
      {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: "Conversation reset! What would you like to know about Shilpa?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* Floating Animated Trigger Button in Bottom Corner */}
      <div className="ai-floating-trigger-wrap">
        <button
          className={`ai-trigger-btn ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open AI Assistant"
          title="Ask Shilpa's AI Assistant"
        >
          <span className="ai-trigger-icon-box">
            <Sparkles size={20} className="ai-sparkle-icon" />
            <span className="ai-badge-dot" />
          </span>
          <span className="ai-trigger-text">Ask AI</span>
        </button>
      </div>

      {/* Floating AI Chatbot Dialog Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="ai-chat-window"
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.94 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="ai-chat-header">
              <div className="ai-header-info">
                <div className="ai-avatar">
                  <Bot size={22} />
                  <span className="online-indicator" />
                </div>
                <div>
                  <h3 className="ai-chat-title">
                    Shilpa's AI Assistant <Sparkles size={14} className="title-sparkle" />
                  </h3>
                  <p className="ai-chat-subtitle">Verified Profile • Accenture • Bangalore</p>
                </div>
              </div>
              <div className="ai-header-actions">
                <button
                  className="ai-icon-btn"
                  onClick={handleReset}
                  title="Reset conversation"
                  aria-label="Reset chat"
                >
                  <RefreshCw size={16} />
                </button>
                <button
                  className="ai-icon-btn"
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  aria-label="Close chat window"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="ai-chat-body">
              {messages.map((msg) => (
                <div key={msg.id} className={`ai-msg-row ${msg.sender === 'user' ? 'user-row' : 'ai-row'}`}>
                  {msg.sender === 'ai' && (
                    <div className="msg-avatar ai-avatar-sm">
                      <Bot size={15} />
                    </div>
                  )}
                  <div className={`msg-bubble ${msg.sender === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                    <div className="msg-content">
                      {msg.text.split('\n').map((line, idx) => {
                        if (line.startsWith('### ')) {
                          return <h4 key={idx} className="msg-h4">{line.replace('### ', '')}</h4>;
                        }
                        if (line.startsWith('**') && line.includes('**')) {
                          return <p key={idx} className="msg-bold-line">{parseFormattedText(line)}</p>;
                        }
                        return <p key={idx} className="msg-p">{parseFormattedText(line)}</p>;
                      })}
                    </div>
                    <span className="msg-time">{msg.timestamp}</span>
                  </div>
                  {msg.sender === 'user' && (
                    <div className="msg-avatar user-avatar-sm">
                      <User size={15} />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="ai-msg-row ai-row">
                  <div className="msg-avatar ai-avatar-sm">
                    <Bot size={15} />
                  </div>
                  <div className="msg-bubble ai-bubble typing-bubble">
                    <div className="typing-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Question Chips */}
            <div className="ai-suggested-chips">
              <span className="chips-label">Suggested:</span>
              <div className="chips-scroll">
                {SUGGESTED_QUESTIONS.map((chip, i) => (
                  <button
                    key={i}
                    className="chip-btn"
                    onClick={() => handleSend(chip.query)}
                    disabled={isTyping}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <form
              className="ai-chat-input-bar"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <input
                type="text"
                placeholder="Ask experience, notice period, CTC, stack..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isTyping}
                className="ai-input-field"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="ai-send-btn"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** Utility to render bold text & links in inline AI responses */
function parseFormattedText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a key={i} href={linkMatch[2]} target="_blank" rel="noreferrer" className="msg-link">
          {linkMatch[1]}
        </a>
      );
    }
    return part;
  });
}
