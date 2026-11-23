function generateCaptcha() {
    // Hanya 2 tipe: code (huruf) & emoji — tidak ada matematika
    const type = Math.random() < 0.5 ? 'code' : 'emoji';

    if (type === 'code') {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const genCode = (len) => {
            let s = '';
            for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
            return s;
        };
        const len = Math.random() < 0.5 ? 5 : 6;
        const correct = genCode(len);
        const wrong = new Set();
        while (wrong.size < 4) {
            const w = genCode(len);
            if (w !== correct) wrong.add(w);
        }
        const options = [correct, ...wrong].sort(() => Math.random() - 0.5);
        return { type: 'code', question: correct, answer: correct, options };
    }

    // Emoji pattern
    const patterns = [
        { seq: ['🔴', '🟡', '🔴', '🟡', '🔴'], next: '🟡', distractors: ['🔴', '🟢', '🔵', '⚪'] },
        { seq: ['🐶', '🐱', '🐶', '🐱', '🐶'], next: '🐱', distractors: ['🐶', '🐭', '🐰', '🦊'] },
        { seq: ['⭐', '🌙', '⭐', '🌙', '⭐'], next: '🌙', distractors: ['⭐', '☀️', '🌟', '💫'] },
        { seq: ['🍎', '🍌', '🍎', '🍌', '🍎'], next: '🍌', distractors: ['🍎', '🍊', '🍇', '🍓'] },
        { seq: ['🔺', '🔷', '🔺', '🔷', '🔺'], next: '🔷', distractors: ['🔺', '🟥', '🔶', '🔹'] },
        { seq: ['🎵', '🎶', '🎵', '🎶', '🎵'], next: '🎶', distractors: ['🎵', '🎸', '🎹', '🎺'] },
        { seq: ['🌸', '🌺', '🌸', '🌺', '🌸'], next: '🌺', distractors: ['🌸', '🌼', '🌻', '🌹'] },
        { seq: ['🚀', '🛸', '🚀', '🛸', '🚀'], next: '🛸', distractors: ['🚀', '✈️', '🛩️', '🚁'] },
        { seq: ['💎', '👑', '💎', '👑', '💎'], next: '👑', distractors: ['💎', '💍', '🏆', '🥇'] },
        { seq: ['🦁', '🐯', '🦁', '🐯', '🦁'], next: '🐯', distractors: ['🦁', '🐻', '🦊', '🐺'] },
        { seq: ['🍕', '🍔', '🍕', '🍔', '🍕'], next: '🍔', distractors: ['🍕', '🌮', '🍜', '🍣'] },
        { seq: ['🎃', '🎄', '🎃', '🎄', '🎃'], next: '🎄', distractors: ['🎃', '🎁', '🎆', '🎇'] },
        { seq: ['🌍', '🌕', '🌍', '🌕', '🌍'], next: '🌕', distractors: ['🌍', '☀️', '🌟', '🪐'] },
        { seq: ['🏆', '🥇', '🏆', '🥇', '🏆'], next: '🥇', distractors: ['🏆', '🥈', '🥉', '🎖️'] },
        { seq: ['🐬', '🦋', '🐬', '🦋', '🐬'], next: '🦋', distractors: ['🐬', '🐝', '🦜', '🐠'] },
    ];
    const p = patterns[Math.floor(Math.random() * patterns.length)];
    const allOpts = new Set([p.next]);
    p.distractors.forEach(d => { if (d !== p.next) allOpts.add(d); });
    while (allOpts.size < 5) allOpts.add(['❓', '🔥', '💥', '⚡', '🌈'][allOpts.size % 5]);
    const options = [...allOpts].sort(() => Math.random() - 0.5).slice(0, 5);
    if (!options.includes(p.next)) options[Math.floor(Math.random() * 5)] = p.next;
    const seqDisplay = p.seq.join(' ') + ' ❓';
    return { type: 'emoji', question: seqDisplay, answer: p.next, options };
}

module.exports = { generateCaptcha };
