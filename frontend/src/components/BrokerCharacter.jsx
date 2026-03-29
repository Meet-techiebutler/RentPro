import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGES = [
  "Hi! Welcome to RentPro! 👋",
  "Explore 1000s of homes! 🏡",
  "Verified listings only! ✅",
  "Best deals in Rajkot! 🌟",
  "Find your dream rental! 💫",
  "Contact brokers instantly! 📞",
];

export default function BrokerCharacter({ className = '' }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [eyesOpen, setEyesOpen] = useState(true);

  useEffect(() => {
    const msgT = setInterval(() => setMsgIdx(i => (i + 1) % MESSAGES.length), 3000);
    const blinkT = setInterval(() => {
      setEyesOpen(false);
      setTimeout(() => setEyesOpen(true), 130);
    }, 4200);
    return () => { clearInterval(msgT); clearInterval(blinkT); };
  }, []);

  return (
    <div className={`relative select-none flex flex-col items-center ${className}`}>

      {/* ── Speech Bubble ── */}
      <div className="relative mb-5 flex justify-center h-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={msgIdx}
            initial={{ opacity: 0, scale: 0.8, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -8 }}
            transition={{ duration: 0.28, type: 'spring', stiffness: 260, damping: 22 }}
            className="bg-white rounded-2xl px-5 py-2.5 shadow-xl border border-primary-100 text-sm font-semibold text-gray-700 whitespace-nowrap absolute"
          >
            {MESSAGES[msgIdx]}
          </motion.div>
        </AnimatePresence>
        {/* Bubble tail */}
        <div
          className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-0 h-0"
          style={{ borderLeft: '9px solid transparent', borderRight: '9px solid transparent', borderTop: '12px solid white' }}
        />
      </div>

      {/* ── Character SVG ── */}
      <motion.div
        animate={{ y: [0, -13, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        <svg viewBox="0 0 260 345" xmlns="http://www.w3.org/2000/svg" className="w-56 h-auto drop-shadow-2xl">

          {/* ── Ground shadow ── */}
          <ellipse cx="130" cy="340" rx="62" ry="7" fill="rgba(0,0,0,0.11)" />

          {/* ── Shoes ── */}
          <ellipse cx="108" cy="321" rx="25" ry="10" fill="#1a1a2e" />
          <ellipse cx="152" cy="321" rx="25" ry="10" fill="#1a1a2e" />
          {/* Shoe highlight */}
          <ellipse cx="105" cy="317" rx="13" ry="4" fill="rgba(255,255,255,0.12)" />
          <ellipse cx="149" cy="317" rx="13" ry="4" fill="rgba(255,255,255,0.12)" />

          {/* ── Trousers / Legs ── */}
          <rect x="94" y="238" width="30" height="82" rx="15" fill="#1e3a5f" />
          <rect x="136" y="238" width="30" height="82" rx="15" fill="#1e3a5f" />
          {/* Crease highlight */}
          <line x1="109" y1="240" x2="109" y2="318" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
          <line x1="151" y1="240" x2="151" y2="318" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />

          {/* ── Jacket body ── */}
          <path d="M82,130 Q82,122 130,122 Q178,122 178,130 L183,246 Q183,257 170,257 L90,257 Q77,257 77,246 Z" fill="#1e40af" />
          {/* Jacket shading */}
          <path d="M82,130 Q82,122 105,122 L110,257 L90,257 Q77,257 77,246 Z" fill="rgba(0,0,0,0.07)" />

          {/* ── White shirt strip ── */}
          <rect x="119" y="124" width="22" height="100" rx="5" fill="white" />

          {/* ── Tie ── */}
          <polygon points="127,133 133,133 136,190 130,197 124,190" fill="#dc2626" />
          <polygon points="127,133 130,127 133,133" fill="#b91c1c" />
          {/* Tie pattern lines */}
          <line x1="126" y1="150" x2="134" y2="150" stroke="#b91c1c" strokeWidth="1.5" opacity="0.5" />
          <line x1="125" y1="163" x2="135" y2="163" stroke="#b91c1c" strokeWidth="1.5" opacity="0.5" />
          <line x1="124" y1="176" x2="136" y2="176" stroke="#b91c1c" strokeWidth="1.5" opacity="0.5" />

          {/* ── Lapels ── */}
          <path d="M119,128 L82,162 L96,128 Z" fill="#2563eb" />
          <path d="M141,128 L178,162 L164,128 Z" fill="#2563eb" />

          {/* ── Pocket square ── */}
          <path d="M154,148 L167,146 L165,137 L158,141 Z" fill="#fcd34d" />

          {/* ── ID badge ── */}
          <rect x="86" y="165" width="46" height="26" rx="7" fill="white" opacity="0.93" />
          <rect x="86" y="165" width="46" height="8" rx="7" fill="#1e40af" opacity="0.9" />
          <text x="109" y="173" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="white">BROKER</text>
          <text x="109" y="184" textAnchor="middle" fontSize="6" fill="#1e40af">RentPro™</text>

          {/* ── Jacket buttons ── */}
          <circle cx="130" cy="206" r="3.5" fill="#1d4ed8" />
          <circle cx="130" cy="219" r="3.5" fill="#1d4ed8" />

          {/* ══════════════════════════════════════════ */}
          {/* ── LEFT ARM + SIGN  (pivot at shoulder 82,143) ── */}
          <g transform="translate(82,143)">
            <motion.g
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <g transform="translate(-82,-143)">
                {/* Upper arm */}
                <path d="M82,142 Q50,168 40,212" stroke="#1e40af" strokeWidth="26" strokeLinecap="round" fill="none" />
                {/* Sleeve cuff */}
                <path d="M43,203 Q38,215 40,222" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.5" />
                {/* Left hand */}
                <circle cx="40" cy="218" r="15" fill="#fddcb5" />
                {/* Knuckle detail */}
                <circle cx="35" cy="213" r="3" fill="#f0c896" />
                <circle cx="42" cy="210" r="3" fill="#f0c896" />
                <circle cx="49" cy="213" r="3" fill="#f0c896" />
                {/* Sign pole */}
                <line x1="40" y1="208" x2="40" y2="76" stroke="#7c3d12" strokeWidth="5.5" strokeLinecap="round" />
                {/* Sign board */}
                <rect x="4" y="28" width="96" height="64" rx="11" fill="#fffbeb" stroke="#f59e0b" strokeWidth="3.5" />
                {/* Sign inner shadow */}
                <rect x="8" y="32" width="88" height="56" rx="8" fill="none" stroke="#fcd34d" strokeWidth="1" opacity="0.6" />
                {/* Sign text */}
                <text x="52" y="54" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#92400e" fontFamily="sans-serif">FOR RENT</text>
                <text x="52" y="71" textAnchor="middle" fontSize="9.5" fill="#b45309" fontFamily="sans-serif">✨ RentPro.in ✨</text>
                {/* Sign corner stars */}
                <circle cx="16" cy="40" r="3.5" fill="#f59e0b" opacity="0.7" />
                <circle cx="88" cy="40" r="3.5" fill="#f59e0b" opacity="0.7" />
                <circle cx="16" cy="82" r="3.5" fill="#f59e0b" opacity="0.7" />
                <circle cx="88" cy="82" r="3.5" fill="#f59e0b" opacity="0.7" />
              </g>
            </motion.g>
          </g>
          {/* ══════════════════════════════════════════ */}

          {/* ══════════════════════════════════════════ */}
          {/* ── RIGHT ARM WAVING (pivot at shoulder 178,143) ── */}
          <g transform="translate(178,143)">
            <motion.g
              animate={{ rotate: [0, 28, 5, 28, 0] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            >
              <g transform="translate(-178,-143)">
                {/* Upper arm */}
                <path d="M178,142 Q210,163 222,198" stroke="#1e40af" strokeWidth="26" strokeLinecap="round" fill="none" />
                {/* Sleeve cuff */}
                <path d="M217,189 Q223,200 222,208" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.5" />
                {/* Right hand */}
                <circle cx="222" cy="204" r="15" fill="#fddcb5" />
                {/* Waving fingers */}
                <ellipse cx="230" cy="196" rx="5" ry="8" fill="#fddcb5" transform="rotate(-30 230 196)" />
                <ellipse cx="237" cy="200" rx="4.5" ry="8" fill="#fddcb5" transform="rotate(-20 237 200)" />
                <ellipse cx="236" cy="208" rx="4" ry="7.5" fill="#fddcb5" transform="rotate(5 236 208)" />
                {/* Thumb */}
                <ellipse cx="215" cy="196" rx="5" ry="8" fill="#fddcb5" transform="rotate(30 215 196)" />
              </g>
            </motion.g>
          </g>
          {/* ══════════════════════════════════════════ */}

          {/* ── Neck ── */}
          <rect x="119" y="108" width="22" height="22" rx="9" fill="#fddcb5" />

          {/* ── Head ── */}
          <circle cx="130" cy="76" r="42" fill="#fddcb5" />
          {/* Head shadow (chin) */}
          <path d="M102,105 Q130,118 158,105" stroke="#e8a87c" strokeWidth="2" fill="none" opacity="0.5" />

          {/* ── Hair ── */}
          <path d="M88,60 Q90,25 130,22 Q170,25 172,60 Q163,36 130,34 Q97,36 88,60 Z" fill="#5d4037" />
          {/* Hair side pieces */}
          <rect x="87" y="53" width="9" height="28" rx="4.5" fill="#5d4037" />
          <rect x="164" y="53" width="9" height="28" rx="4.5" fill="#5d4037" />
          {/* Hair highlights */}
          <path d="M115,26 Q130,23 145,26" stroke="#795548" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />

          {/* ── Ears ── */}
          <ellipse cx="88" cy="80" rx="9" ry="11" fill="#f0c896" />
          <ellipse cx="172" cy="80" rx="9" ry="11" fill="#f0c896" />
          {/* Inner ear */}
          <ellipse cx="88" cy="80" rx="5" ry="7" fill="#e8a87c" />
          <ellipse cx="172" cy="80" rx="5" ry="7" fill="#e8a87c" />

          {/* ── Eyes ── */}
          {eyesOpen ? (
            <>
              <ellipse cx="116" cy="76" rx="9" ry="10" fill="white" />
              <ellipse cx="144" cy="76" rx="9" ry="10" fill="white" />
              <circle cx="117" cy="77" r="6" fill="#3b1f0a" />
              <circle cx="145" cy="77" r="6" fill="#3b1f0a" />
              <circle cx="118" cy="77" r="3.2" fill="#1a0800" />
              <circle cx="146" cy="77" r="3.2" fill="#1a0800" />
              {/* Eye shine */}
              <circle cx="120" cy="74" r="2.2" fill="white" />
              <circle cx="148" cy="74" r="2.2" fill="white" />
              {/* Lower eyelid */}
              <path d="M107,82 Q116,85 125,82" stroke="#e8a87c" strokeWidth="1.5" fill="none" opacity="0.5" />
              <path d="M135,82 Q144,85 153,82" stroke="#e8a87c" strokeWidth="1.5" fill="none" opacity="0.5" />
            </>
          ) : (
            <>
              {/* Closed eyes — happy squint */}
              <path d="M107,76 Q116,84 125,76" stroke="#5d4037" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M135,76 Q144,84 153,76" stroke="#5d4037" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            </>
          )}

          {/* ── Eyebrows ── */}
          <path d="M107,66 Q116,61 125,65" stroke="#5d4037" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M135,65 Q144,61 153,66" stroke="#5d4037" strokeWidth="3.5" fill="none" strokeLinecap="round" />

          {/* ── Nose ── */}
          <ellipse cx="130" cy="89" rx="5" ry="3.5" fill="#e8a87c" />
          <circle cx="127" cy="90" r="2" fill="#c8845c" opacity="0.45" />
          <circle cx="133" cy="90" r="2" fill="#c8845c" opacity="0.45" />

          {/* ── Smile ── */}
          <path d="M115,98 Q130,111 145,98" stroke="#c07048" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Teeth */}
          <path d="M117,99 Q130,109 143,99 Q130,106 117,99 Z" fill="white" opacity="0.7" />

          {/* ── Blush / Cheeks ── */}
          <ellipse cx="105" cy="93" rx="12" ry="8" fill="#f9a8a8" opacity="0.38" />
          <ellipse cx="155" cy="93" rx="12" ry="8" fill="#f9a8a8" opacity="0.38" />

        </svg>
      </motion.div>
    </div>
  );
}
