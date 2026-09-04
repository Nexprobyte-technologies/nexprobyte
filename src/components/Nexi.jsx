import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const WHATSAPP_NUMBER = "919500042426";
const WHATSAPP_DISPLAY = "+91 95000 42426";
const SPEECH_SUPPORTED =
  typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

function buildWaAction(profile) {
  const lines = [
    "Hi Nexprobyte! I just chatted with Nexi.",
    profile.name ? `Name: ${profile.name}` : "",
    profile.need ? `I need: ${profile.need}` : "",
    "Please get back to me.",
  ].filter(Boolean);
  return {
    label: `Send to WhatsApp ${WHATSAPP_DISPLAY}`,
    href: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`,
  };
}

function respond(text, f) {
  const t = text.toLowerCase();
  const s = f.step;
  let profile = {};

  if (/^(hi|hai|hii|hey|hello|yo|good morning|good afternoon|good evening|how are you|hru)\b/.test(t)) {
    if (!f.profile.name) {
      return {
        reply: {
          text: "Hi there! I'm Nexi, your Nexprobyte assistant. Great to meet you. What's your name?",
        },
        next: 1,
        profile,
      };
    }
  }

  if (s === 1) {
    let name = t;
    const m = t.match(/my name is\s+([a-z]+)/);
    if (m) name = m[1];
    else name = t.split(/\s+/)[0];
    if (name === "am" || name === "i'm" || name === "im" || name === "my") name = "friend";
    name = name.charAt(0).toUpperCase() + name.slice(1);
    return {
      reply: {
        text: `Nice to meet you, ${name}! What can we help you with — our Products or our Services?`,
      },
      next: 2,
      profile: { name },
    };
  }

  if (s === 2) {
    if (/product/.test(t)) {
      return {
        reply: {
          text: "Our flagship product is GO Drive — simple, fast and made for everyday use. Want me to send the download links and your details to our team on WhatsApp?",
        },
        next: 3,
        profile: { need: "Product - GO Drive" },
      };
    }
    if (/service|marketing|seo|develop|design|website|app|automation|ai/.test(t)) {
      return {
        reply: {
          text: "We offer SEO, Digital Marketing, Web & App Development, UI/UX Design, n8n Automation and AI-powered solutions. Want me to send your details to our team on WhatsApp so we can help?",
        },
        next: 3,
        profile: { need: "Services" },
      };
    }
    return {
      reply: {
        text: "We have both Products and Services. Would you like to know more about our Products (like GO Drive) or our Services?",
      },
      next: 2,
      profile,
    };
  }

  if (s === 3) {
    if (/yes|sure|ok|okay|send|fine/.test(t)) {
      return {
        reply: {
          text: `Perfect${f.profile.name ? `, ${f.profile.name}` : ""}! Tap the button below and press send — your details come straight to our WhatsApp ${WHATSAPP_DISPLAY}.`,
          action: buildWaAction(f.profile),
        },
        next: 4,
        profile,
      };
    }
    if (/no|nope|not now|later/.test(t)) {
      return {
        reply: {
          text: "No problem! Is there anything else I can help you with? Just ask me about products, services or anything else.",
        },
        next: 2,
        profile,
      };
    }
    return {
      reply: {
        text: `Got it! Just say "yes" and I'll send your details to our team on WhatsApp. Or ask me anything else.`,
      },
      next: 3,
      profile,
    };
  }

  if (/go drive|download/.test(t)) {
    return {
      reply: {
        text: "GO Drive is our flagship product with Android, iOS and web versions. Reply YES and I'll send you the download links on WhatsApp.",
        action: buildWaAction({ ...f.profile, need: "Product - GO Drive" }),
      },
      next: 4,
      profile,
    };
  }
  if (/price|cost|rate|quote|pricing/.test(t)) {
    return {
      reply: {
        text: `Pricing depends on what you need. Say YES and our team will send the details to your WhatsApp ${WHATSAPP_DISPLAY}.`,
        action: buildWaAction(f.profile),
      },
      next: 4,
      profile,
    };
  }
  if (/thank/.test(t)) {
    return {
      reply: {
        text: "You're most welcome! Feel free to reach out anytime. Have a great day!",
      },
      next: 4,
      profile,
    };
  }
  if (/contact|phone|call|number|whatsapp/.test(t)) {
    return {
      reply: {
        text: `You can call or WhatsApp us on ${WHATSAPP_DISPLAY}, or write to info@nexprobyte.com.`,
      },
      next: 4,
      profile,
    };
  }
  if (/address|where|location|office/.test(t)) {
    return {
      reply: {
        text: "We're at 1st Floor, Nanjiammal Complex, Above City Bakery, Maniyakarampalayam, Coimbatore, Tamil Nadu 641006.",
      },
      next: 4,
      profile,
    };
  }

  return {
    reply: {
      text: `Thanks, ${f.profile.name || "friend"}! Our team will get back to you shortly. Want me to send your details to WhatsApp so we can start?`,
      action: buildWaAction(f.profile),
    },
    next: 3,
    profile,
  };
}

export function Nexi() {
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [listening, setListening] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [flow, setFlow] = useState({ step: 0, profile: {} });

  const msgsRef = useRef(null);
  const recognitionRef = useRef(null);

  const speak = (text) => {
    if (muted) return;
    try {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/\+/g, " plus ").replace(/\.com/g, " dot com"));
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find(
          (v) => v.lang && v.lang.toLowerCase().startsWith("en") && /google|natural/i.test(v.name)
        ) || voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("en"));
      if (preferred) u.voice = preferred;
      u.rate = 1.02;
      window.speechSynthesis.speak(u);
    } catch (e) {
      /* ignore */
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (open && messages.length === 0) {
      const t1 = "Hi, I'm Nexi, your Nexprobyte AI assistant.";
      setMessages([{ id: 1, from: "bot", text: t1 }]);
      speak(t1);
      setTimeout(() => {
        if (cancelled) return;
        const t2 = "How are you? I can help you with our Products and Services.";
        setMessages((m) => [...m, { id: 2, from: "bot", text: t2 }]);
        speak(t2);
      }, 1100);
    }
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    const el = msgsRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  const handleUserInput = (raw) => {
    const text = (raw || "").trim();
    if (!text) return;
    setMessages((m) => [...m, { id: Date.now(), from: "user", text }]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const { reply, next, profile } = respond(text, flow);
      setFlow((f) => ({ step: next, profile: { ...f.profile, ...profile } }));
      setMessages((m) => [...m, { id: Date.now(), from: "bot", text: reply.text, action: reply.action }]);
      setTyping(false);
      speak(reply.text);
    }, 700 + Math.random() * 500);
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || listening) return;
    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleUserInput(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      /* ignore */
    }
    setListening(false);
  };

  return (
    <>
      <motion.button
        className={`nexi-launcher ${open ? "is-open" : ""}`}
        type="button"
        aria-label={open ? "Close Nexi chat" : "Open Nexi chat"}
        onClick={() => setOpen((v) => !v)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}
        <span className="nexi-launcher-label">Nexi</span>
        <span className="nexi-pulse" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="nexi-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="nexi-header">
              <div className="nexi-avatar">N</div>
              <div className="nexi-head-title">
                <b>Nexi</b>
                <span>
                  <i className="nexi-status" /> Online — replies instantly
                </span>
              </div>
              <button
                className={`nexi-mute ${muted ? "is-muted" : ""}`}
                type="button"
                title={muted ? "Unmute Nexi" : "Mute Nexi"}
                onClick={() => setMuted((v) => !v)}
              >
                {muted ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5L6 9H2v6h4l5 4z" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 010 7.07" />
                    <path d="M19.07 4.93a10 10 0 010 14.14" />
                  </svg>
                )}
              </button>
            </header>

            <div className="nexi-msgs" ref={msgsRef}>
              {messages.map((m) => (
                <div key={m.id} className={`nexi-msg ${m.from === "user" ? "is-user" : "is-bot"}`}>
                  {m.from === "bot" && <span className="nexi-msg-avatar">N</span>}
                  <div className="nexi-msg-body">
                    <p>{m.text}</p>
                    {m.action && (
                      <a className="nexi-action" href={m.action.href} target="_blank" rel="noreferrer">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        {m.action.label}
                        <span className="arr">→</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="nexi-msg is-bot">
                  <span className="nexi-msg-avatar">N</span>
                  <div className="nexi-msg-body nexi-typing">
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              )}
            </div>

            <form
              className="nexi-input-row"
              onSubmit={(e) => {
                e.preventDefault();
                handleUserInput(input);
              }}
            >
              <button
                className={`nexi-mic ${listening ? "is-live" : ""}`}
                type="button"
                title={listening ? "Stop listening" : "Speak instead of typing"}
                disabled={!SPEECH_SUPPORTED}
                onClick={listening ? stopListening : startListening}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                  <path d="M19 10v2a7 7 0 01-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                </svg>
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={listening ? "Listening..." : "Type or tap the mic to speak..."}
                aria-label="Message Nexi"
              />
              <button className="nexi-send" type="submit" aria-label="Send message" disabled={!input.trim()}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}