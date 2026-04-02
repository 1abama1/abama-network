import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Send, MessageCircle, Check } from 'lucide-react';
import './ShareMenu.css';

interface ShareMenuProps {
  url: string;
  title: string;
  children: React.ReactNode; // The trigger button
}

const ShareMenu = ({ url, title, children }: ShareMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const fullUrl = `${window.location.origin}${url}`;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setIsOpen(false);
    }, 1200);
  };

  const handleShareTwitter = (e: React.MouseEvent) => {
    e.stopPropagation();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    setIsOpen(false);
  };

  const handleShareTelegram = (e: React.MouseEvent) => {
    e.stopPropagation();
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`;
    window.open(tgUrl, '_blank', 'width=550,height=420');
    setIsOpen(false);
  };

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const waUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + fullUrl)}`;
    window.open(waUrl, '_blank', 'width=550,height=420');
    setIsOpen(false);
  };

  return (
    <div className="share-menu-wrapper" ref={menuRef}>
      <div onClick={handleToggle}>
        {children}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="share-menu-dropdown glass"
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 5 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="share-option" onClick={handleCopyLink}>
              {copied ? <Check size={16} className="text-success" /> : <Link2 size={16} />}
              <span>{copied ? 'Copied!' : 'Copy link'}</span>
            </button>
            <button className="share-option" onClick={handleShareTwitter}>
              <Send size={16} />
              <span>Twitter / X</span>
            </button>

            <button className="share-option" onClick={handleShareTelegram}>
              <MessageCircle size={16} />
              <span>Telegram</span>
            </button>
            <button className="share-option" onClick={handleShareWhatsApp}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <span>WhatsApp</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShareMenu;
