document.addEventListener('DOMContentLoaded', () => {
    // initTypewriter(); // Replaced by Interactive Terminal
    initInteractiveTerminal();
    initTheme();
    initI18n();
    initModal();
    initParticles();
    initScrollAnimations();
    initSkillAnimation();
    updateYear();
});

// --- Interactive Terminal (Advanced) ---
function initInteractiveTerminal() {
    const input = document.getElementById('term-input');
    const output = document.getElementById('term-output');
    const container = document.getElementById('terminal-body');
    if (!input || !output) return;

    // --- State ---
    const fileSystem = {
        name: 'root',
        type: 'dir',
        children: {
            'home': {
                type: 'dir',
                children: {
                    'guest': {
                        type: 'dir',
                        children: {
                            'projects': {
                                type: 'dir',
                                children: {
                                    'portfolio': { type: 'file', content: 'This website source code.' },
                                    'homelab': { type: 'file', content: 'Docker compose files for my lab.' }
                                }
                            },
                            'scripts': {
                                type: 'dir',
                                children: {
                                    'monitor.sh': { type: 'file', content: '#!/bin/bash\n# Server Health Monitor...' },
                                    'audit.ps1': { type: 'file', content: '# PowerShell User Audit...' }
                                }
                            },
                            'about.txt': { type: 'file', content: 'I am a SysAdmin student passionate about automation and security.' },
                            'todo.md': { type: 'file', content: '- Finish degree\n- Learn Kubernetes\n- Sleep' }
                        }
                    }
                }
            }
        }
    };

    let currentPath = ['home', 'guest'];
    let commandHistory = [];
    let historyIndex = -1;

    // --- Helper: Get Current Dir Object ---
    function getCurrentDir() {
        let current = fileSystem.children;
        for (const segment of currentPath) {
            current = current[segment].children;
        }
        return current;
    }

    // --- Helper: Resolve Path ---
    function resolvePath(pathStr) {
        if (pathStr === '/') return [];
        if (pathStr === '~') return ['home', 'guest'];

        let parts = pathStr.split('/').filter(p => p);
        let tempPath = pathStr.startsWith('/') ? [] : [...currentPath];

        for (const part of parts) {
            if (part === '.') continue;
            if (part === '..') {
                if (tempPath.length > 0) tempPath.pop();
            } else {
                // Verify existence
                let check = fileSystem.children;
                // Root check
                if (tempPath.length === 0) {
                    if (!check[part]) return null;
                } else {
                    for (const seg of tempPath) {
                        check = check[seg].children;
                    }
                    if (!check[part] || check[part].type !== 'dir') return null;
                }
                tempPath.push(part);
            }
        }
        return tempPath;
    }

    function updatePrompt() {
        const promptSpan = document.querySelector('.prompt');
        let pathString = '~';
        if (currentPath.join('/') !== 'home/guest') {
            pathString = '/' + currentPath.join('/');
        }
        promptSpan.textContent = `guest@portfolio:${pathString}$`;
    }

    // --- Event Listeners ---
    container.addEventListener('click', () => input.focus());

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmdLine = input.value.trim();
            if (!cmdLine) return; // ignore empty

            input.value = '';

            // History
            commandHistory.push(cmdLine);
            historyIndex = commandHistory.length;

            // Echo
            let pathString = '~';
            if (currentPath.join('/') !== 'home/guest') pathString = '/' + currentPath.join('/');

            // Construct colored prompt HTML
            const promptHtml = `<span class="prompt">guest@portfolio:${pathString}$</span> <span class="text-muted">${cmdLine}</span>`;
            printLine(promptHtml);

            // Parse
            const args = cmdLine.split(/\s+/);
            const cmd = args[0].toLowerCase();
            const param = args[1]; // simplified support for 1 arg usually

            // Execute
            executeCommand(cmd, args.slice(1));

            // Scroll
            container.scrollTop = container.scrollHeight;
        }
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                input.value = commandHistory[historyIndex];
            }
        }
        else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                input.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                input.value = '';
            }
        }
        else if (e.key === 'Tab') {
            e.preventDefault();
            const currentVal = input.value;
            const args = currentVal.split(' ');
            const lastArg = args[args.length - 1]; // what we are typing

            // Get current files
            const files = Object.keys(getCurrentDir());

            // Filter matches
            const matches = files.filter(f => f.startsWith(lastArg));

            if (matches.length === 1) {
                // Complete it
                args[args.length - 1] = matches[0];
                // if it's a dir, maybe add / ? logic for another day, just simple complete
                if (getCurrentDir()[matches[0]].type === 'dir') args[args.length - 1] += '/';
                input.value = args.join(' ');
            } else if (matches.length > 1) {
                // Show options? (optional but cool)
                // For simplicity, do nothing or cycle? 
                // Let's just do nothing if ambiguous for now to keep it simple, or best common prefix
            }
        }
    });

    function executeCommand(cmd, args) {
        const dir = getCurrentDir();

        switch (cmd) {
            case 'help':
                printLine('Available: ls, cd, cat, touch, mkdir, rm, neofetch, sudo, history, whoami, clear, matrix, pwd');
                break;
            case 'ls':
                // List content
                const items = Object.keys(dir).map(key => {
                    const isDir = dir[key].type === 'dir';
                    return `<span class="${isDir ? 'cmd' : ''}">${key}${isDir ? '/' : ''}</span>`;
                });
                printLine(items.join('  ') || '(empty directory)');
                break;
            case 'pwd':
                printLine('/' + currentPath.join('/'));
                break;
            case 'cd':
                let target = args[0];
                if (!target || target === '~') {
                    currentPath = ['home', 'guest'];
                } else if (target === '..') {
                    if (currentPath.length > 0) currentPath.pop();
                } else {
                    if (target.endsWith('/') && target.length > 1) target = target.slice(0, -1);
                    if (dir[target]) {
                        if (dir[target].type === 'dir') {
                            currentPath.push(target);
                        } else {
                            printLine(`cd: ${target}: Not a directory`, 'red');
                        }
                    } else {
                        printLine(`cd: ${target}: No such file or directory`, 'red');
                    }
                }
                updatePrompt();
                break;
            case 'cat':
                const file = args[0];
                if (!file) { printLine('Usage: cat [filename]'); break; }
                if (dir[file]) {
                    if (dir[file].type === 'file') printLine(dir[file].content, 'text-muted');
                    else printLine(`cat: ${file}: Is a directory`, 'red');
                } else {
                    printLine(`cat: ${file}: No such file`, 'red');
                }
                break;
            case 'touch':
                const newFile = args[0];
                if (!newFile) break;
                if (dir[newFile]) printLine(`touch: ${newFile}: already exists`);
                else {
                    dir[newFile] = { type: 'file', content: '' };
                }
                break;
            case 'mkdir':
                const newDir = args[0];
                if (!newDir) break;
                if (dir[newDir]) printLine(`mkdir: ${newDir}: already exists`, 'red');
                else {
                    dir[newDir] = { type: 'dir', children: {} };
                }
                break;
            case 'rm':
                const targetRm = args[0];
                if (!targetRm) { printLine('Usage: rm [file]'); break; }
                if (dir[targetRm]) {
                    delete dir[targetRm];
                    printLine(`Removed ${targetRm}`, 'text-muted');
                } else {
                    printLine(`rm: cannot remove '${targetRm}': No such file`, 'red');
                }
                break;
            case 'sudo':
                if (args.length === 0) {
                    printLine('usage: sudo [command]');
                } else {
                    printLine('guest is not in the sudoers file. This incident will be reported.', 'red');
                }
                break;
            case 'history':
                commandHistory.forEach((cmd, i) => {
                    printLine(` ${i + 1}  ${cmd}`, 'text-muted');
                });
                break;
            case 'neofetch':
                const asciiArt = `
<span class="cmd">       _      </span>   guest@portfolio
<span class="cmd">      / \\     </span>   ---------------
<span class="cmd">     /   \\    </span>   <span class="text-muted">OS</span>: Portfolio OS (Web)
<span class="cmd">    /  |  \\   </span>   <span class="text-muted">Kernel</span>: 5.15.0-js-generic
<span class="cmd">   /   |   \\  </span>   <span class="text-muted">Uptime</span>: Forever
<span class="cmd">  /    |    \\ </span>   <span class="text-muted">Shell</span>: ZSH (Simulated)
<span class="cmd"> /_____|_____\\</span>   <span class="text-muted">Theme</span>: Cyber/Dark
<span class="cmd">      | |     </span>   <span class="text-muted">CPU</span>: Brain 1.0 (Student Edition)
<span class="cmd">      |_|     </span>   <span class="text-muted">Memory</span>: 99% Used (Learning)
`;
                // Use <pre> to allow formatting
                printLine(`<div style="white-space: pre; line-height: 1.2;">${asciiArt}</div>`);
                break;
            case 'ip':
                const isColor = args.includes('-c') || args.includes('-color');
                // Filter out flags to check the subcommand
                const subCmds = args.filter(a => !a.startsWith('-'));
                const subCmd = subCmds[0] || 'addr'; // default to addr if no subcmd

                if (['a', 'addr', 'address'].includes(subCmd)) {
                    // Colors (simulating ip -c)
                    const c = (text, cls) => `<span class="${cls}">${text}</span>`;
                    const iface = (name) => c(name, 'cmd'); // command color (green/cyan)
                    const ip = (addr) => c(addr, 'accent'); // pink/magenta or distinct
                    const state = (s) => c(s, 'green');
                    const muted = (t) => c(t, 'text-muted');

                    // 1: lo
                    printLine(`1: ${iface('lo')}: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000`);
                    printLine(`    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00`);
                    printLine(`    inet ${ip('127.0.0.1/8')} scope host lo`);
                    printLine(`       valid_lft forever preferred_lft forever`);

                    // 2: eth0
                    printLine(`2: ${iface('eth0')}: <BROADCAST,MULTICAST,${state('UP')},${state('LOWER_UP')}> mtu 1500 qdisc fq_codel state ${state('UP')} group default qlen 1000`);
                    printLine(`    link/ether 00:15:5d:01:ca:02 brd ff:ff:ff:ff:ff:ff`);
                    printLine(`    inet ${ip('192.168.1.33/24')} brd 192.168.1.255 scope global dynamic eth0`);
                    printLine(`       valid_lft 86326sec preferred_lft 86326sec`);
                    printLine(`    inet6 ${ip('fe80::215:5dff:fe01:ca02/64')} scope link`);
                    printLine(`       valid_lft forever preferred_lft forever`);

                } else if (['r', 'route'].includes(subCmd)) {
                    printLine(`default via 192.168.1.1 dev eth0 proto dhcpsrc 192.168.1.33 metric 100`);
                    printLine(`192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.33`);
                } else {
                    printLine(`ip: object "${subCmd}" is unknown`, 'red');
                }
                break;
            case 'whoami':
                printLine('guest (uid=1000)', 'green');
                break;
            case 'clear':
                output.innerHTML = '';
                break;
            case 'matrix':
                printLine('Wake up, Neo...', 'green');
                initMatrixRain();
                break;

            default:
                printLine(`Command not found: ${cmd}`, 'red');
        }
    }

    function printLine(html, className = '') {
        const div = document.createElement('div');
        if (className) div.className = className;
        div.innerHTML = html; // InnerHTML to support spans in ls
        output.appendChild(div);
    }

    // Initial update
    updatePrompt();
}

// Deprecated: old processCommand is integrated into initInteractiveTerminal
function processCommand() { }
function printLine() { } // scoped inside now


// --- Matrix Rain Easter Egg ---
function initMatrixRain() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    // Enable Matrix Mode
    canvas.classList.add('matrix-mode');
    const ctx = canvas.getContext('2d');

    // config
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const cols = Math.floor(width / 20);
    const ypos = Array(cols).fill(0);

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    function matrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#0f0';
        ctx.font = '15pt monospace';

        ypos.forEach((y, ind) => {
            const text = String.fromCharCode(Math.random() * 128);
            const x = ind * 20;
            ctx.fillText(text, x, y);

            if (y > height && Math.random() > 0.975) ypos[ind] = 0;
            else ypos[ind] = y + 20;
        });

        if (canvas.classList.contains('matrix-mode')) {
            requestAnimationFrame(matrix);
        }
    }

    // Stop previous particle animation loop logic implicitly by overwriting drawing...
    // In a robust app we'd have a cancelAnimationFrame ID, but here the 'matrix' class 
    // can act as a flag or we just let it take over the context.
    // For simplicity, we just start the loop.
    matrix();
}

// --- Background Particles (Standard Node Network) ---
let particleAnimId; // to cancel if needed
function initParticles() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || canvas.classList.contains('matrix-mode')) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const particleCount = 60;
    const connectionDist = 140;

    function resize() {
        if (!canvas.parentElement) return;
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.size = Math.random() * 2 + 1;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--primary').trim() || '#6ee7b7';
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        if (canvas.classList.contains('matrix-mode')) return; // Stop if matrix is active

        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < connectionDist) {
                    ctx.beginPath();
                    const alpha = 1 - (dist / connectionDist);
                    ctx.strokeStyle = `rgba(148, 163, 184, ${alpha * 0.2})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        particleAnimId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => { resize(); init(); });
    resize();
    init();
    animate();
}

// --- Scroll Reveal Animation ---
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal, .reveal-delayed, .glass-card, .section-title, .net-node').forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });
}

// --- Skills Animation ---
function initSkillAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target.querySelector('.progress-bar');
                if (bar) {
                    const target = bar.style.width;
                    bar.style.width = '0';
                    setTimeout(() => bar.style.width = target, 100);
                }
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.skill-item').forEach(el => observer.observe(el));
}

// --- Theme Toggle ---
function initTheme() {
    const btn = document.getElementById('themeToggle');
    const html = document.documentElement;
    const saved = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', saved);

    btn.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        btn.textContent = next === 'dark' ? '☀' : '☾';
    });
}

// --- Modal Logic ---
function initModal() {
    const modal = document.getElementById('codeModal');
    const closeBtn = document.getElementById('closeModal');
    const codeContainer = document.getElementById('modalCode');
    const title = document.getElementById('modalTitle');

    if (!modal) return;
    document.querySelectorAll('.view-code').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const file = btn.getAttribute('data-file');
            const lang = btn.getAttribute('data-lang') || 'plaintext';
            title.textContent = file.split('/').pop();
            codeContainer.textContent = 'Fetching payload...';
            codeContainer.className = `language-${lang}`;
            modal.classList.add('open');
            try {
                const res = await fetch(file);
                if (!res.ok) throw new Error('Access Denied');
                const text = await res.text();
                codeContainer.textContent = text;
                hljs.highlightElement(codeContainer);
            } catch (err) {
                codeContainer.textContent = `Error: ${err.message}`;
            }
        });
    });
    const close = () => modal.classList.remove('open');
    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

// --- I18n ---
function initI18n() {
    if (!window.TRANSLATIONS) return;
    const validLangs = ['es', 'en'];
    let currentLang = 'es';
    const btns = document.querySelectorAll('.lang-switch button');
    const setLang = (lang) => {
        if (!validLangs.includes(lang)) return;
        currentLang = lang;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (window.TRANSLATIONS[lang][key]) el.textContent = window.TRANSLATIONS[lang][key];
        });
        btns.forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-lang') === lang);
        });
    };
    btns.forEach(btn => btn.addEventListener('click', () => setLang(btn.getAttribute('data-lang'))));
}

function updateYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
}