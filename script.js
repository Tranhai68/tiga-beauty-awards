/* ============================================
   TOP BEAUTY & WELLNESS AWARDS 2026
   Landing Page JavaScript — UX/UI Pro Max
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initNavbar();
    initStickyCta();
    initCountdown();
    initCarousels();
    initScrollReveal();
    initStatCounter();
    initForm();
    initBackToTop();
    initSmoothScroll();
    initExitIntent();
    initParallax();
    // Load data from data.json (GitHub Pages)
    fetch('data.json?' + Date.now())
        .then(r => r.json())
        .then(data => {
            window._siteData = data || {};
            loadDynamicContent();
        })
        .catch(() => { loadDynamicContent(); });
});

/* ========================================
   PARTICLE BACKGROUND (Gold + White)
   ======================================== */
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.3;
            this.speedY = -(Math.random() * 0.4 + 0.08);
            this.speedX = (Math.random() - 0.5) * 0.2;
            this.opacity = Math.random() * 0.4 + 0.05;
            this.golden = Math.random() > 0.4;
        }
        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.opacity += Math.sin(Date.now() * 0.001 + this.x) * 0.003;
            if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
                this.reset(); this.y = canvas.height + 10;
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            const a = Math.max(0, Math.min(0.5, this.opacity));
            ctx.fillStyle = this.golden
                ? `rgba(255, 215, 0, ${a})`
                : `rgba(255, 255, 255, ${a * 0.5})`;
            ctx.fill();
        }
    }

    const count = window.innerWidth < 768 ? 25 : 55;
    for (let i = 0; i < count; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    animate();
}

/* ========================================
   NAVBAR
   ======================================== */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 80);
    });

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
}

/* ========================================
   STICKY CTA BAR
   ======================================== */
function initStickyCta() {
    const sticky = document.getElementById('stickyCta');
    if (!sticky) return;
    
    const heroSection = document.getElementById('hero');
    
    window.addEventListener('scroll', () => {
        if (!heroSection) return;
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        sticky.classList.toggle('visible', window.scrollY > heroBottom - 100);
    });
}

/* ========================================
   COUNTDOWN — 19.05.2026
   ======================================== */
function initCountdown() {
    const eventDate = new Date('2026-05-19T08:00:00+07:00').getTime();
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    if (!daysEl) return;

    function update() {
        const now = Date.now();
        const d = eventDate - now;
        if (d < 0) {
            daysEl.textContent = '00'; hoursEl.textContent = '00';
            minutesEl.textContent = '00'; secondsEl.textContent = '00';
            return;
        }
        daysEl.textContent = String(Math.floor(d / 864e5)).padStart(2, '0');
        hoursEl.textContent = String(Math.floor((d % 864e5) / 36e5)).padStart(2, '0');
        minutesEl.textContent = String(Math.floor((d % 36e5) / 6e4)).padStart(2, '0');
        secondsEl.textContent = String(Math.floor((d % 6e4) / 1e3)).padStart(2, '0');
    }
    update();
    setInterval(update, 1000);
}

/* ========================================
   HORIZONTAL CAROUSELS
   ======================================== */
function initCarousels() {
    document.querySelectorAll('.carousel-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const carouselId = btn.dataset.carousel;
            const track = document.getElementById(carouselId);
            if (!track) return;

            const scrollAmount = 300;
            if (btn.classList.contains('carousel-btn-left')) {
                track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        });
    });

    // Touch/drag support for desktop
    document.querySelectorAll('.carousel-track').forEach(track => {
        let isDown = false, startX, scrollLeft;

        track.addEventListener('mousedown', e => {
            isDown = true;
            track.style.cursor = 'grabbing';
            startX = e.pageX - track.offsetLeft;
            scrollLeft = track.scrollLeft;
        });
        track.addEventListener('mouseleave', () => { isDown = false; track.style.cursor = 'grab'; });
        track.addEventListener('mouseup', () => { isDown = false; track.style.cursor = 'grab'; });
        track.addEventListener('mousemove', e => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX) * 1.5;
            track.scrollLeft = scrollLeft - walk;
        });

        track.style.cursor = 'grab';
    });
}

/* ========================================
   SCROLL REVEAL
   ======================================== */
function initScrollReveal() {
    const elements = document.querySelectorAll(
        '.section-header, .speaker-card, .sponsor-card, .person-card, ' +
        '.contestant-card, .about-feature, .stat-item, .offer-card, ' +
        '.experience-card, .register-wrapper'
    );
    elements.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const parent = entry.target.parentElement;
                if (parent) {
                    const siblings = parent.querySelectorAll('.reveal');
                    siblings.forEach((sib, i) => {
                        setTimeout(() => sib.classList.add('visible'), i * 100);
                    });
                }
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
}

/* ========================================
   STAT COUNTER
   ======================================== */
function initStatCounter() {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    let counted = false;

    function animateCount(el) {
        const target = parseInt(el.dataset.target);
        const duration = 2000;
        const inc = target / (duration / 16);
        let current = 0;
        const timer = setInterval(() => {
            current += inc;
            if (current >= target) {
                el.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !counted) {
                counted = true;
                statNumbers.forEach(el => animateCount(el));
            }
        });
    }, { threshold: 0.4 });

    if (statNumbers.length > 0) {
        const banner = statNumbers[0].closest('.stats-banner');
        if (banner) observer.observe(banner);
    }
}

/* ========================================
   FORM HANDLING
   ======================================== */
function initForm() {
    const form = document.getElementById('registerForm');
    const modal = document.getElementById('successModal');
    if (!form) return;

    form.addEventListener('submit', e => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());

        if (!data.fullname || !data.phone || !data.industry || !data.role) {
            form.style.animation = 'none';
            form.offsetHeight;
            form.style.animation = 'shake 0.4s ease';
            setTimeout(() => form.style.animation = '', 400);
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
        btn.disabled = true;

        setTimeout(() => {
            btn.innerHTML = orig; btn.disabled = false;
            form.reset();
            if (modal) modal.classList.add('active');
        }, 1500);
    });

    if (modal) {
        modal.addEventListener('click', e => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }
}

/* ========================================
   BACK TO TOP
   ======================================== */
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 500);
    });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ========================================
   SMOOTH SCROLL
   ======================================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
}

/* ========================================
   EXIT INTENT POPUP
   ======================================== */
function initExitIntent() {
    const popup = document.getElementById('exitPopup');
    if (!popup) return;

    let shown = false;

    document.addEventListener('mouseleave', e => {
        if (e.clientY <= 0 && !shown) {
            shown = true;
            popup.classList.add('active');
            sessionStorage.setItem('exitShown', '1');
        }
    });

    if (sessionStorage.getItem('exitShown')) {
        shown = true;
    }

    popup.addEventListener('click', e => {
        if (e.target === popup) popup.classList.remove('active');
    });
}

/* ========================================
   PARALLAX (subtle)
   ======================================== */
function initParallax() {
    const heroBg = document.querySelector('.hero-bg-image');
    if (!heroBg) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        if (scrolled < window.innerHeight) {
            heroBg.style.transform = `translateY(${scrolled * 0.3}px) scale(1.1)`;
        }
    });
}

/* ========================================
   LOAD DYNAMIC CONTENT FROM localStorage
   ======================================== */
function loadDynamicContent() {
    loadHeroContent();
    loadStatsContent();
    loadAboutContent();
    loadNavContent();
    loadExperienceContent();
    loadRegistrationContent();
    loadFooterContent();
    loadStickyCtaContent();
    loadExitPopupContent();
    loadSeoContent();
    loadCustomSections();
    loadBanners();
    loadSpeakers();
    loadSponsors();
    loadAdvisors();
    loadJudges();
    loadContestants();
}

function _ls(key) {
    // Read from data.json (fetched on page load)
    if (window._siteData) {
        // data.json uses short keys (hero, stats...) while code uses beautyAwards_hero, etc.
        var shortKey = key.replace('beautyAwards_', '');
        if (window._siteData[shortKey] !== undefined) return window._siteData[shortKey];
        if (window._siteData[key] !== undefined) return window._siteData[key];
    }
    return null;
}

function loadHeroContent() {
    const d = _ls('beautyAwards_hero'); if (!d) return;
    if (d.badge) { const el = document.getElementById('heroBadgeText'); if (el) el.textContent = d.badge; }
    if (d.subtitle) { const el = document.getElementById('heroSubtitle'); if (el) el.textContent = d.subtitle; }
    if (d.slogan) { const el = document.getElementById('heroSlogan'); if (el) el.textContent = d.slogan; }
    if (d.location) { const el = document.getElementById('heroLocation'); if (el) el.textContent = d.location; }
    if (d.date) { const el = document.getElementById('heroDate'); if (el) el.textContent = d.date; }
    if (d.ctaText) { const el = document.getElementById('heroCtaBtn'); if (el) el.innerHTML = '<i class="fas fa-ticket-alt"></i> ' + d.ctaText; }
    if (d.trust) { const el = document.getElementById('heroTrust'); if (el) el.innerHTML = '<i class="fas fa-check-circle"></i> ' + d.trust; }
}

function loadStatsContent() {
    const d = _ls('beautyAwards_stats'); if (!d || !d.items) return;
    const grid = document.getElementById('statsGrid'); if (!grid) return;
    grid.innerHTML = d.items.map(it => `
        <div class="stat-item">
            <div class="stat-icon"><i class="${it.icon}"></i></div>
            <div class="stat-number" data-target="${it.number}">0</div>
            <div class="stat-label">${it.label}</div>
        </div>
    `).join('');
    initStatCounter();
}

function loadAboutContent() {
    const d = _ls('beautyAwards_about'); if (!d) return;
    if (d.lead) { const el = document.getElementById('aboutLead'); if (el) el.innerHTML = d.lead; }
    if (d.features && d.features.length) {
        const el = document.getElementById('aboutFeatures'); if (!el) return;
        el.innerHTML = d.features.map(f => `
            <div class="about-feature">
                <div class="about-feature-icon"><i class="${f.icon}"></i></div>
                <div><h4>${f.title}</h4><p>${f.desc}</p></div>
            </div>
        `).join('');
    }
}

function loadNavContent() {
    const d = _ls('beautyAwards_navigation'); if (!d) return;
    if (d.links) {
        const nav = document.getElementById('navLinks'); if (!nav) return;
        const ctaText = d.ctaText || 'Đăng Ký Ngay';
        nav.innerHTML = d.links.map(l => `<li><a href="${l.href}">${l.text}</a></li>`).join('') +
            `<li><a href="#register" class="nav-cta">${ctaText}</a></li>`;
    } else if (d.ctaText) {
        const btn = document.getElementById('navCtaBtn'); if (btn) btn.textContent = d.ctaText;
    }
}

function loadExperienceContent() {
    const d = _ls('beautyAwards_experience'); if (!d || !d.cards) return;
    const grid = document.getElementById('experienceGrid'); if (!grid) return;
    grid.innerHTML = d.cards.map(cd => `
        <div class="experience-card">
            <div class="experience-img">
                <img src="${cd.image}" alt="${cd.title}" loading="lazy">
                <div class="experience-overlay"><i class="${cd.icon}"></i></div>
            </div>
            <h3>${cd.title}</h3>
            <p>${cd.desc}</p>
        </div>
    `).join('');
}

function loadRegistrationContent() {
    const d = _ls('beautyAwards_registration'); if (!d) return;
    if (d.urgency) { const el = document.getElementById('regUrgency'); if (el) el.textContent = d.urgency; }
    if (d.title) { const el = document.getElementById('regTitle'); if (el) el.innerHTML = d.title; }
    if (d.hook) { const el = document.getElementById('regHook'); if (el) el.textContent = d.hook; }
    if (d.venue) { const el = document.getElementById('regVenueText'); if (el) el.innerHTML = d.venue; }
    if (d.highlights) {
        const el = document.getElementById('regHighlights'); if (!el) return;
        el.innerHTML = d.highlights.split('\n').filter(h=>h.trim()).map(h =>
            `<div class="highlight-item"><i class="fas fa-check-circle"></i><span>${h.trim()}</span></div>`
        ).join('');
    }
}

function loadFooterContent() {
    const d = _ls('beautyAwards_footer'); if (!d) return;
    if (d.desc) { const el = document.getElementById('footerDesc'); if (el) el.innerHTML = d.desc; }
    if (d.phone) { const el = document.getElementById('footerPhone'); if (el) el.innerHTML = 'Hotline: <strong>' + d.phone + '</strong>'; }
    if (d.copyright) { const el = document.getElementById('footerCopyright'); if (el) el.textContent = d.copyright; }
}

function loadStickyCtaContent() {
    const d = _ls('beautyAwards_stickyCta'); if (!d) return;
    if (d.badge) { const el = document.getElementById('stickyBadge'); if (el) el.textContent = d.badge; }
    if (d.text) { const el = document.getElementById('stickyText'); if (el) el.textContent = d.text; }
    if (d.btnText) { const el = document.getElementById('stickyCtaBtn'); if (el) el.innerHTML = d.btnText + ' <i class="fas fa-arrow-right"></i>'; }
    if (d.btnLink) { const el = document.getElementById('stickyCtaBtn'); if (el) el.href = d.btnLink; }
}

function loadExitPopupContent() {
    const d = _ls('beautyAwards_exitPopup'); if (!d) return;
    if (d.title) { const el = document.getElementById('exitTitle'); if (el) el.textContent = d.title; }
    if (d.text) { const el = document.getElementById('exitText'); if (el) el.innerHTML = d.text; }
    if (d.urgency) { const el = document.getElementById('exitUrgency'); if (el) el.innerHTML = d.urgency; }
    if (d.ctaText) { const el = document.getElementById('exitCtaText'); if (el) el.textContent = d.ctaText; }
}

function loadSeoContent() {
    const d = _ls('beautyAwards_seo'); if (!d) return;
    if (d.title) document.title = d.title;
    if (d.description) { const el = document.querySelector('meta[name="description"]'); if (el) el.content = d.description; }
    if (d.ogTitle) { const el = document.querySelector('meta[property="og:title"]'); if (el) el.content = d.ogTitle; }
    if (d.ogDesc) { const el = document.querySelector('meta[property="og:description"]'); if (el) el.content = d.ogDesc; }
    if (d.ogImage) {
        let el = document.querySelector('meta[property="og:image"]');
        if (!el) { el = document.createElement('meta'); el.setAttribute('property','og:image'); document.head.appendChild(el); }
        el.content = d.ogImage;
    }
}

function loadCustomSections() {
    const sections = _ls('beautyAwards_customSections'); if (!sections || !sections.length) return;
    const container = document.getElementById('customSectionsContainer'); if (!container) return;
    container.innerHTML = sections.map(s => `
        <section class="custom-section" style="background:${s.bgColor||'#1a1a2e'};color:${s.textColor||'#fff'};padding:60px 0;">
            <div class="container">${s.content || ''}</div>
        </section>
    `).join('');
}

function loadBanners() {
    var banners = _ls('beautyAwards_banners') || {};
    if (banners.hero) {
        const heroBg = document.getElementById('heroBanner');
        if (heroBg) heroBg.style.backgroundImage = `url('${banners.hero}')`;  
    }
}

function loadSpeakers() {
    const speakers = _ls('beautyAwards_speakers') || [];
    if (speakers.length === 0) return;

    const track = document.getElementById('speakersCarousel');
    if (!track) return;

    track.innerHTML = speakers.map(s => `
        <div class="speaker-card">
            <div class="speaker-image">
                ${s.image ? `<img src="${s.image}" alt="${s.name}" loading="lazy">` : '<div class="person-placeholder"><i class="fas fa-user-tie"></i></div>'}
                <div class="speaker-badge-role">${s.role || 'Diễn giả'}</div>
            </div>
            <div class="speaker-info">
                <h3 class="speaker-name">${s.name}</h3>
                <p class="speaker-title">${s.title || ''}</p>
                <p class="speaker-desc">${s.desc || ''}</p>
            </div>
        </div>
    `).join('');
}

function loadSponsors() {
    const sponsors = _ls('beautyAwards_sponsors') || [];
    if (sponsors.length === 0) return;

    const track = document.getElementById('sponsorsCarousel');
    if (!track) return;

    track.innerHTML = sponsors.map(s => `
        <div class="sponsor-card">
            ${s.image ? `<img src="${s.image}" alt="${s.name}">` : '<div class="sponsor-logo"><i class="fas fa-building"></i></div>'}
            <h3>${s.name}</h3>
            <p>${s.tier || ''}</p>
        </div>
    `).join('');
}

function loadAdvisors() {
    const advisors = _ls('beautyAwards_advisors') || [];
    if (advisors.length === 0) return;

    const track = document.getElementById('advisorsCarousel');
    if (!track) return;

    track.innerHTML = advisors.map(a => `
        <div class="person-card">
            <div class="person-image">
                ${a.image ? `<img src="${a.image}" alt="${a.name}">` : '<div class="person-placeholder"><i class="fas fa-user-tie"></i></div>'}
                <div class="person-badge">Cố vấn</div>
            </div>
            <div class="person-info">
                <h3>${a.name}</h3>
                <p class="person-title">${a.title || ''}</p>
                <p class="person-org">${a.org || ''}</p>
            </div>
        </div>
    `).join('');
}

function loadJudges() {
    const judges = _ls('beautyAwards_judges') || [];
    if (judges.length === 0) return;

    const track = document.getElementById('judgesCarousel');
    if (!track) return;

    track.innerHTML = judges.map(j => `
        <div class="person-card person-card-judge">
            <div class="person-image">
                ${j.image ? `<img src="${j.image}" alt="${j.name}">` : '<div class="person-placeholder"><i class="fas fa-user-tie"></i></div>'}
                <div class="person-badge">Giám khảo</div>
            </div>
            <div class="person-info">
                <h3>${j.name}</h3>
                <p class="person-title">${j.title || ''}</p>
                <p class="person-org">${j.org || ''}</p>
            </div>
        </div>
    `).join('');
}

function loadContestants() {
    const contestants = _ls('beautyAwards_contestants') || [];
    if (contestants.length === 0) return;

    const track = document.getElementById('contestantsCarousel');
    if (!track) return;

    track.innerHTML = contestants.map(c => `
        <div class="contestant-card">
            <div class="contestant-image">
                ${c.image ? `<img src="${c.image}" alt="${c.name}">` : '<div class="person-placeholder"><i class="fas fa-user"></i></div>'}
                <div class="contestant-industry">${c.industry || ''}</div>
            </div>
            <div class="contestant-info">
                <h3>${c.name}</h3>
                <p class="contestant-specialty">${c.specialty || ''}</p>
                <a href="contestant.html?id=${c.id}" class="contestant-link"><i class="fas fa-arrow-right"></i> Xem chi tiết</a>
            </div>
        </div>
    `).join('');
}

/* Shake animation fallback */
const styleSheet = document.createElement('style');
styleSheet.textContent = `@keyframes shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-8px); } 40% { transform: translateX(8px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }`;
document.head.appendChild(styleSheet);
