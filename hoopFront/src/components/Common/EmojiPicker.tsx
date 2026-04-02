import React, { useState, useMemo, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import './EmojiPicker.css';

const EMOJI_DATA = [
    { category: 'Smileys', emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'] },
    { category: 'Hands', emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪'] },
    { category: 'Basketball & Sports', emojis: ['🏀', '🏐', '🏈', '⚾', '🥎', '🎾', '🏸', '🏒', '🏑', '🏓', '🏏', '🥊', '🥋', '🥅', '⛳', '⛸️', '🎣', '🤿', '🎿', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾', '🧗', '🚵', '🚴', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️'] },
    { category: 'Animals', emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🦗', '🕷️', '🦂', '🐢', '🐍', '🐊', '🐅', '🐆', '🦓', '🦍', '🐘', '🦏', '🐪', '🐫', '🦒', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🐐', '🦌', '🐕', '🐩', '🐈', '🐓', '🦃', '🕊️', '🐇', '🐁', '🐀', '🐿️', '🦔', '🐾', '🐉', '🐲', '🌵', '🎄', '🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🎍', '🎋', '🍃'] },
    { category: 'Food', emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌽', '🥕', '🥔', '🍠', '🥐', '🍞', '🥖', '🥨', '🥯', '🥞', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🥘', '🍲', '🥣', '🥗', '🍿', '🧂', '🍳', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥤'] },
    { category: 'Travel', emojis: ['🌍', '🌎', '🌏', '🗺️', '🏔️', '⛰️', '🌋', '🗻', '🏕️', '🏖️', '🏜️', '🏝️', '🏙️', '🏗️', '🏘️', '🏚️', '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '💒', '🗼', '🗽', '⛪', '🕌', '🕍', '⛩️', '🕋', '⛲', '⛺', '🌁', '🌃', '🌄', '🌅', '🌆', '🌇', '🌉', '♨️', '🎠', '🎡', '🎢', '💈', '🎪', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖', '🚗', '🚘', '🚙', '🚚', '🚛', '🚜', '🏎️', '🏍️', '🛵', '🚲', '🛴', '🛹', '🚏', '🛣️', '🛤️', '⛽', '🚨', '🚥', '🚦', '🛑', '🚧', '⚓', '⛵', '🚤', '🛳️', '⛴️', '🛥️', '🚢', '✈️', '🛩️', '🛫', '🛬', '💺', '🚁', '🚟', '🚠', '🚡', '🛰️', '🚀', '🛸'] },
    { category: 'Objects', emojis: ['⌚', '📱', '📲', '💻', '⌨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🧰', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🔩', '⚙️', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '⚱️', '⚗️', '🔭', '🔬', '🕳️', '💊', '💉', '🩸', '🩹', '🩺', '🌡️', '🧹', '🧺', '🧻', '🧼', '🧽', '🪒', '🧴', '🧵', '🧶'] }
];

interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState(EMOJI_DATA[0].category);
    const scrollRef = useRef<HTMLDivElement>(null);

    const filteredData = useMemo(() => {
        if (!search) return EMOJI_DATA;
        return EMOJI_DATA.map(cat => ({
            ...cat,
            emojis: cat.emojis.filter(e => e.includes(search) || cat.category.toLowerCase().includes(search.toLowerCase()))
        })).filter(cat => cat.emojis.length > 0);
    }, [search]);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const scrollPosition = scrollRef.current.scrollTop;

        let currentCat = activeCategory;
        for (const cat of EMOJI_DATA) {
            const element = document.getElementById(`category-${cat.category}`);
            if (element && element.offsetTop - 20 <= scrollPosition) {
                currentCat = cat.category;
            }
        }
        if (currentCat !== activeCategory) {
            setActiveCategory(currentCat);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="emoji-picker-dropdown glass-card"
        >
            <div className="emoji-picker-header">
                <div className="search-bar-mini">
                    <Search size={14} className="search-icon-dim" />
                    <input
                        type="text"
                        placeholder="Search emoji..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                    />
                    {search && <X size={14} className="clear-search" onClick={() => setSearch('')} />}
                </div>
                <button className="emoji-picker-close" onClick={onClose}>
                    <X size={18} />
                </button>
            </div>

            <div className="emoji-categories-nav">
                {EMOJI_DATA.map(cat => (
                    <button
                        key={cat.category}
                        className={`category-dot ${activeCategory === cat.category ? 'active' : ''}`}
                        title={cat.category}
                        onClick={() => {
                            setActiveCategory(cat.category);
                            const element = document.getElementById(`category-${cat.category}`);
                            if (element && scrollRef.current) {
                                scrollRef.current.scrollTo({
                                    top: element.offsetTop,
                                    behavior: 'smooth'
                                });
                            }
                        }}
                    />
                ))}
            </div>

            <div className="emoji-scroll-area" ref={scrollRef} onScroll={handleScroll}>
                {filteredData.map(cat => (
                    <div key={cat.category} id={`category-${cat.category}`} className="emoji-section">
                        <h4 className="emoji-section-title">{cat.category}</h4>
                        <div className="emoji-grid">
                            {cat.emojis.map((emoji, idx) => (
                                <button
                                    key={`${cat.category}-${idx}`}
                                    className="emoji-item"
                                    onClick={() => onSelect(emoji)}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
                {filteredData.length === 0 && (
                    <div className="no-results-emoji">No emojis found 🏀</div>
                )}
            </div>
        </motion.div>
    );
};

export default EmojiPicker;
