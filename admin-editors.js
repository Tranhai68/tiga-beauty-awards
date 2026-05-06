/* ============================================
   ADMIN CMS — Editor Renderers
   All render*Editor functions for CMS sections
   ============================================ */

function _field(label, id, val, type, ph) {
    if (type === 'textarea') return `<div class="form-group"><label class="form-label">${label}</label><textarea class="admin-textarea" id="${id}" placeholder="${ph||''}">${val||''}</textarea></div>`;
    return `<div class="form-group"><label class="form-label">${label}</label><input class="admin-input" id="${id}" value="${escH(val||'')}" placeholder="${ph||''}" type="${type||'text'}"></div>`;
}
function _row(...cols) { return `<div class="form-row">${cols.join('')}</div>`; }
function escH(s) { return String(s).replace(/"/g,'&quot;').replace(/</g,'&lt;'); }

function _saveBtn(onclick) {
    return `<div style="margin-top:20px;display:flex;gap:10px;justify-content:flex-end;">
        <button class="btn-admin btn-primary" onclick="${onclick}"><i class="fas fa-save"></i> Lưu thay đổi</button>
    </div>`;
}

function _card(title, icon, body) {
    return `<div class="admin-card"><div class="admin-card-header"><div class="admin-card-title"><i class="${icon}"></i> ${title}</div></div>${body}</div>`;
}

/* ========== HERO EDITOR ========== */
function renderHeroEditor(c) {
    const d = getData(KEYS.hero) || {};
    c.innerHTML = _card('Hero Section', 'fas fa-home', `
        ${_row(_field('Badge Text','h_badge',d.badge,'text','HỘI NGHỊ QUỐC TẾ 2026'), _field('Subtitle','h_sub',d.subtitle,'text','NGÀNH LÀM ĐẸP...'))}
        ${_field('Slogan','h_slogan',d.slogan,'text','KẾT NỐI TINH HOA — NÂNG TẦM VỊ THẾ')}
        ${_row(_field('Địa điểm','h_loc',d.location,'text','Thành phố Hạ Long'), _field('Ngày','h_date',d.date,'text','19.05.2026'))}
        ${_field('CTA Button Text','h_cta',d.ctaText,'text','ĐĂNG KÝ THAM GIA NGAY')}
        ${_field('Trust Text','h_trust',d.trust,'text','Hơn 200+ tuyển thủ & chuyên gia...')}
        ${_saveBtn('saveHero()')}
    `);
}
function saveHero() {
    setData(KEYS.hero, {
        badge: document.getElementById('h_badge').value.trim(),
        subtitle: document.getElementById('h_sub').value.trim(),
        slogan: document.getElementById('h_slogan').value.trim(),
        location: document.getElementById('h_loc').value.trim(),
        date: document.getElementById('h_date').value.trim(),
        ctaText: document.getElementById('h_cta').value.trim(),
        trust: document.getElementById('h_trust').value.trim()
    });
    showToast('Đã lưu Hero Section!','success');
}

/* ========== STATS EDITOR ========== */
function renderStatsEditor(c) {
    const d = getData(KEYS.stats) || { items: [
        {icon:'fas fa-user-tie',number:'200',label:'Tuyển thủ'},
        {icon:'fas fa-building',number:'30',label:'Nhãn hàng uy tín'},
        {icon:'fas fa-trophy',number:'20',label:'Danh mục giải thưởng'},
        {icon:'fas fa-handshake',number:'5',label:'Đơn vị tài trợ'}
    ]};
    const items = d.items || [];
    c.innerHTML = _card('Stats Banner', 'fas fa-chart-bar', `
        <p style="color:var(--admin-text-muted);font-size:0.85rem;margin-bottom:16px;">Quản lý các con số thống kê hiển thị trên trang chính.</p>
        <div id="statsItems">${items.map((it,i) => `
            <div class="admin-card" style="margin-bottom:12px;border-color:rgba(212,160,23,0.15);padding:16px;">
                <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
                    <span style="color:var(--admin-primary);font-weight:600;">Stat #${i+1}</span>
                    <button class="btn-admin btn-danger btn-sm btn-icon" onclick="removeStat(${i})" title="Xóa"><i class="fas fa-trash"></i></button>
                </div>
                ${_row(_field('Icon Class','st_icon_'+i,it.icon,'text','fas fa-...'), _field('Số','st_num_'+i,it.number,'text','200'))}
                ${_field('Label','st_label_'+i,it.label,'text','Tuyển thủ')}
            </div>
        `).join('')}</div>
        <button class="btn-admin btn-secondary" onclick="addStat()" style="margin-top:8px;"><i class="fas fa-plus"></i> Thêm Stat</button>
        ${_saveBtn('saveStats()')}
    `);
}
function addStat() {
    const d = getData(KEYS.stats) || {items:[]};
    d.items = d.items || [];
    d.items.push({icon:'fas fa-star',number:'0',label:'Mới'});
    setData(KEYS.stats, d);
    renderStatsEditor(document.getElementById('contentArea'));
}
function removeStat(i) {
    const d = getData(KEYS.stats) || {items:[]};
    d.items.splice(i,1);
    setData(KEYS.stats, d);
    renderStatsEditor(document.getElementById('contentArea'));
}
function saveStats() {
    const d = getData(KEYS.stats) || {items:[]};
    const items = d.items || [];
    const saved = [];
    for (let i=0; i<items.length; i++) {
        const ic = document.getElementById('st_icon_'+i);
        if (!ic) continue;
        saved.push({
            icon: ic.value.trim(),
            number: document.getElementById('st_num_'+i).value.trim(),
            label: document.getElementById('st_label_'+i).value.trim()
        });
    }
    setData(KEYS.stats, {items:saved});
    showToast('Đã lưu Stats!','success');
}

/* ========== ABOUT EDITOR ========== */
function renderAboutEditor(c) {
    const d = getData(KEYS.about) || {};
    const features = d.features || [
        {icon:'fas fa-gem',title:'Tiêu chuẩn quốc tế',desc:'Quy trình đánh giá & giám khảo theo chuẩn quốc tế'},
        {icon:'fas fa-globe-asia',title:'Kết nối toàn cầu',desc:'Cầu nối giữa doanh nghiệp Việt Nam với thị trường quốc tế'},
        {icon:'fas fa-star',title:'Nâng tầm thương hiệu',desc:'Vinh danh và PR đa kênh cho người đạt giải'}
    ];
    c.innerHTML = _card('Giới thiệu Cuộc Thi', 'fas fa-info-circle', `
        ${_field('Đoạn mở đầu (Lead)','ab_lead',d.lead,'textarea','Top Beauty & Wellness Awards 2026 là...')}
        <h4 style="color:var(--admin-primary);margin:16px 0 8px;">Các đặc điểm nổi bật</h4>
        <div id="aboutFeatures">${features.map((f,i) => `
            <div class="admin-card" style="margin-bottom:10px;border-color:rgba(212,160,23,0.15);padding:14px;">
                ${_row(_field('Icon','ab_fi_'+i,f.icon,'text','fas fa-gem'), _field('Tiêu đề','ab_ft_'+i,f.title,'text',''))}
                ${_field('Mô tả','ab_fd_'+i,f.desc,'text','')}
            </div>
        `).join('')}</div>
        ${_saveBtn('saveAbout()')}
    `);
}
function saveAbout() {
    const features = [];
    for (let i=0; i<10; i++) {
        const ic = document.getElementById('ab_fi_'+i);
        if (!ic) break;
        features.push({
            icon: ic.value.trim(),
            title: document.getElementById('ab_ft_'+i).value.trim(),
            desc: document.getElementById('ab_fd_'+i).value.trim()
        });
    }
    setData(KEYS.about, {
        lead: document.getElementById('ab_lead').value.trim(),
        features
    });
    showToast('Đã lưu Giới thiệu!','success');
}

/* ========== NAVIGATION EDITOR ========== */
function renderNavEditor(c) {
    const d = getData(KEYS.navigation) || {};
    const links = d.links || [
        {text:'Giới thiệu cuộc thi',href:'#about'},{text:'Diễn giả',href:'#speakers'},
        {text:'Nhà tài trợ',href:'#sponsors'},{text:'Ban cố vấn',href:'#advisors'},
        {text:'Ban giám khảo',href:'#judges'},{text:'Tuyển thủ',href:'#contestants'}
    ];
    c.innerHTML = _card('Navigation Menu', 'fas fa-compass', `
        <p style="color:var(--admin-text-muted);font-size:0.85rem;margin-bottom:16px;">Quản lý các link trên thanh điều hướng.</p>
        ${_field('CTA Button Text','nav_cta',d.ctaText,'text','Đăng Ký Ngay')}
        <h4 style="color:var(--admin-primary);margin:16px 0 8px;">Menu Links</h4>
        <div id="navLinks">${links.map((l,i) => `
            <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
                <input class="admin-input" id="nl_t_${i}" value="${escH(l.text)}" placeholder="Text" style="flex:1;">
                <input class="admin-input" id="nl_h_${i}" value="${escH(l.href)}" placeholder="#section" style="flex:1;">
                <button class="btn-admin btn-danger btn-sm btn-icon" onclick="removeNavLink(${i})"><i class="fas fa-trash"></i></button>
            </div>
        `).join('')}</div>
        <button class="btn-admin btn-secondary" onclick="addNavLink()" style="margin-top:4px;"><i class="fas fa-plus"></i> Thêm link</button>
        ${_saveBtn('saveNav()')}
    `);
}
function addNavLink() {
    const d = getData(KEYS.navigation) || {};
    d.links = d.links || [];
    d.links.push({text:'Mới',href:'#'});
    setData(KEYS.navigation, d);
    renderNavEditor(document.getElementById('contentArea'));
}
function removeNavLink(i) {
    const d = getData(KEYS.navigation) || {};
    d.links.splice(i,1);
    setData(KEYS.navigation, d);
    renderNavEditor(document.getElementById('contentArea'));
}
function saveNav() {
    const d = getData(KEYS.navigation) || {};
    const links = d.links || [];
    const saved = [];
    for (let i=0; i<links.length; i++) {
        const t = document.getElementById('nl_t_'+i);
        if (!t) break;
        saved.push({text:t.value.trim(), href:document.getElementById('nl_h_'+i).value.trim()});
    }
    setData(KEYS.navigation, {links:saved, ctaText:document.getElementById('nav_cta').value.trim()});
    showToast('Đã lưu Navigation!','success');
}

/* ========== EXPERIENCE EDITOR ========== */
function renderExperienceEditor(c) {
    const d = getData(KEYS.experience) || {};
    const cards = d.cards || [
        {icon:'fas fa-star',title:'Gala Sang Trọng',desc:'Đêm tiệc đẳng cấp tại Thành phố Hạ Long',image:'images/gala.png'},
        {icon:'fas fa-handshake',title:'Networking Cấp Cao',desc:'Kết nối trực tiếp với các chuyên gia hàng đầu',image:'images/networking.png'},
        {icon:'fas fa-trophy',title:'Lễ Vinh Danh',desc:'Tôn vinh những cá nhân & tổ chức xuất sắc nhất ngành',image:'images/event-stage.png'},
        {icon:'fas fa-microchip',title:'Trải Nghiệm Công Nghệ',desc:'Tiếp cận thiết bị & công nghệ làm đẹp mới nhất',image:'images/spa-luxury.png'}
    ];
    c.innerHTML = _card('Trải nghiệm', 'fas fa-gem', `
        <div id="expCards">${cards.map((cd,i) => `
            <div class="admin-card" style="margin-bottom:12px;border-color:rgba(212,160,23,0.15);padding:14px;">
                <span style="color:var(--admin-primary);font-weight:600;">Card #${i+1}</span>
                ${_row(_field('Icon','ex_i_'+i,cd.icon,'text','fas fa-star'), _field('Tiêu đề','ex_t_'+i,cd.title,'text',''))}
                ${_row(_field('Mô tả','ex_d_'+i,cd.desc,'text',''), _field('Image URL','ex_img_'+i,cd.image,'text','images/...'))}
            </div>
        `).join('')}</div>
        ${_saveBtn('saveExperience()')}
    `);
}
function saveExperience() {
    const cards = [];
    for (let i=0; i<20; i++) {
        const t = document.getElementById('ex_t_'+i);
        if (!t) break;
        cards.push({
            icon: document.getElementById('ex_i_'+i).value.trim(),
            title: t.value.trim(),
            desc: document.getElementById('ex_d_'+i).value.trim(),
            image: document.getElementById('ex_img_'+i).value.trim()
        });
    }
    setData(KEYS.experience, {cards});
    showToast('Đã lưu Trải nghiệm!','success');
}

/* ========== REGISTRATION EDITOR ========== */
function renderRegistrationEditor(c) {
    const d = getData(KEYS.registration) || {};
    c.innerHTML = _card('Đăng ký', 'fas fa-clipboard-list', `
        ${_field('Urgency Badge','rg_urg',d.urgency,'text','🔥 SỐ LƯỢNG GIỚI HẠN')}
        ${_field('Tiêu đề','rg_title',d.title,'text','Đăng Ký Ngay Hôm Nay')}
        ${_field('Hook text','rg_hook',d.hook,'text','Đừng bỏ lỡ cơ hội nâng tầm...')}
        ${_field('Venue text','rg_venue',d.venue,'text','📍 Thành phố Hạ Long | 🗓 19.05.2026')}
        <h4 style="color:var(--admin-primary);margin:16px 0 8px;">Highlights</h4>
        ${_field('Highlights (mỗi dòng 1 item)','rg_hl',d.highlights,'textarea','Chứng nhận từ Ban Tổ Chức\nTài liệu chuyên môn...')}
        ${_saveBtn('saveRegistration()')}
    `);
}
function saveRegistration() {
    setData(KEYS.registration, {
        urgency: document.getElementById('rg_urg').value.trim(),
        title: document.getElementById('rg_title').value.trim(),
        hook: document.getElementById('rg_hook').value.trim(),
        venue: document.getElementById('rg_venue').value.trim(),
        highlights: document.getElementById('rg_hl').value.trim()
    });
    showToast('Đã lưu Đăng ký!','success');
}

/* ========== FOOTER EDITOR ========== */
function renderFooterEditor(c) {
    const d = getData(KEYS.footer) || {};
    c.innerHTML = _card('Footer', 'fas fa-shoe-prints', `
        ${_field('Mô tả Footer','ft_desc',d.desc,'textarea','Hội Nghị Quốc Tế Ngành Làm Đẹp...')}
        ${_row(_field('Hotline','ft_phone',d.phone,'text','0988.227.886'), _field('Copyright','ft_copy',d.copyright,'text','© 2026 Top Beauty & Wellness Awards.'))}
        <h4 style="color:var(--admin-primary);margin:16px 0 8px;">Social Links</h4>
        ${_row(_field('Facebook','ft_fb',d.facebook,'text','https://...'), _field('Instagram','ft_ig',d.instagram,'text','https://...'))}
        ${_row(_field('YouTube','ft_yt',d.youtube,'text','https://...'), _field('TikTok','ft_tt',d.tiktok,'text','https://...'))}
        ${_field('Zalo','ft_zalo',d.zalo,'text','https://...')}
        ${_saveBtn('saveFooter()')}
    `);
}
function saveFooter() {
    setData(KEYS.footer, {
        desc: document.getElementById('ft_desc').value.trim(),
        phone: document.getElementById('ft_phone').value.trim(),
        copyright: document.getElementById('ft_copy').value.trim(),
        facebook: document.getElementById('ft_fb').value.trim(),
        instagram: document.getElementById('ft_ig').value.trim(),
        youtube: document.getElementById('ft_yt').value.trim(),
        tiktok: document.getElementById('ft_tt').value.trim(),
        zalo: document.getElementById('ft_zalo').value.trim()
    });
    showToast('Đã lưu Footer!','success');
}

/* ========== STICKY CTA EDITOR ========== */
function renderStickyCtaEditor(c) {
    const d = getData(KEYS.stickyCta) || {};
    c.innerHTML = _card('Sticky CTA Bar', 'fas fa-bullhorn', `
        ${_field('Badge text','sc_badge',d.badge,'text','🔥 Chỉ còn 50 suất')}
        ${_field('Info text','sc_text',d.text,'text','Top Beauty & Wellness Awards 2026 — 19.05.2026')}
        ${_field('Button text','sc_btn',d.btnText,'text','ĐĂNG KÝ NGAY')}
        ${_field('Button link','sc_link',d.btnLink,'text','#register')}
        ${_saveBtn('saveStickyCta()')}
    `);
}
function saveStickyCta() {
    setData(KEYS.stickyCta, {
        badge: document.getElementById('sc_badge').value.trim(),
        text: document.getElementById('sc_text').value.trim(),
        btnText: document.getElementById('sc_btn').value.trim(),
        btnLink: document.getElementById('sc_link').value.trim()
    });
    showToast('Đã lưu Sticky CTA!','success');
}

/* ========== EXIT POPUP EDITOR ========== */
function renderExitPopupEditor(c) {
    const d = getData(KEYS.exitPopup) || {};
    c.innerHTML = _card('Exit Intent Popup', 'fas fa-door-open', `
        ${_field('Tiêu đề','ep_title',d.title,'text','Khoan Đã!')}
        ${_field('Nội dung','ep_text',d.text,'textarea','Bạn sắp bỏ lỡ cơ hội nâng tầm sự nghiệp...')}
        ${_field('Urgency text','ep_urg',d.urgency,'text','Chỉ còn 50 suất đăng ký sớm')}
        ${_field('CTA text','ep_cta',d.ctaText,'text','ĐĂNG KÝ NGAY — NHẬN ƯU ĐÃI')}
        ${_saveBtn('saveExitPopup()')}
    `);
}
function saveExitPopup() {
    setData(KEYS.exitPopup, {
        title: document.getElementById('ep_title').value.trim(),
        text: document.getElementById('ep_text').value.trim(),
        urgency: document.getElementById('ep_urg').value.trim(),
        ctaText: document.getElementById('ep_cta').value.trim()
    });
    showToast('Đã lưu Exit Popup!','success');
}

/* ========== SEO EDITOR ========== */
function renderSeoEditor(c) {
    const d = getData(KEYS.seo) || {};
    c.innerHTML = _card('SEO & Meta Tags', 'fas fa-search', `
        ${_field('Page Title','seo_title',d.title,'text','Top Beauty & Wellness Awards 2026...')}
        ${_field('Meta Description','seo_desc',d.description,'textarea','Hội Nghị Quốc Tế Ngành Làm Đẹp...')}
        ${_field('OG Title','seo_og',d.ogTitle,'text','Top Beauty & Wellness Awards 2026')}
        ${_field('OG Description','seo_ogd',d.ogDesc,'textarea','Kết Nối Tinh Hoa — Nâng Tầm Vị Thế...')}
        ${_field('OG Image URL','seo_ogi',d.ogImage,'text','https://...')}
        ${_field('Keywords','seo_kw',d.keywords,'text','beauty awards, wellness, làm đẹp...')}
        ${_saveBtn('saveSeo()')}
    `);
}
function saveSeo() {
    setData(KEYS.seo, {
        title: document.getElementById('seo_title').value.trim(),
        description: document.getElementById('seo_desc').value.trim(),
        ogTitle: document.getElementById('seo_og').value.trim(),
        ogDesc: document.getElementById('seo_ogd').value.trim(),
        ogImage: document.getElementById('seo_ogi').value.trim(),
        keywords: document.getElementById('seo_kw').value.trim()
    });
    showToast('Đã lưu SEO!','success');
}

/* ========== CUSTOM SECTIONS EDITOR ========== */
function renderCustomSections(c) {
    const sections = getData(KEYS.customSections) || [];
    c.innerHTML = _card('Custom Sections', 'fas fa-puzzle-piece', `
        <p style="color:var(--admin-text-muted);font-size:0.85rem;margin-bottom:16px;">Tạo thêm section tùy chỉnh hiển thị trên trang chính.</p>
        ${sections.length === 0 ? `
            <div class="empty-state"><i class="fas fa-puzzle-piece"></i><p>Chưa có custom section</p></div>
        ` : sections.map((s,i) => `
            <div class="admin-card" style="margin-bottom:12px;border-color:rgba(212,160,23,0.15);padding:14px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <span style="color:var(--admin-primary);font-weight:600;">${s.title || 'Section #'+(i+1)}</span>
                    <div style="display:flex;gap:6px;">
                        <button class="btn-admin btn-secondary btn-sm btn-icon" onclick="editCustomSection(${i})" title="Sửa"><i class="fas fa-pen"></i></button>
                        <button class="btn-admin btn-danger btn-sm btn-icon" onclick="deleteCustomSection(${i})" title="Xóa"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <p style="color:var(--admin-text-muted);font-size:0.8rem;">${(s.content||'').substring(0,100)}...</p>
            </div>
        `).join('')}
        <button class="btn-admin btn-primary" onclick="addCustomSection()" style="margin-top:8px;"><i class="fas fa-plus"></i> Thêm Section</button>
        <div id="customEditArea"></div>
    `);
}
function addCustomSection() {
    const sections = getData(KEYS.customSections) || [];
    sections.push({id:genId(),title:'Section mới',content:'',bgColor:'#1a1a2e',textColor:'#ffffff'});
    setData(KEYS.customSections, sections);
    renderCustomSections(document.getElementById('contentArea'));
    editCustomSection(sections.length-1);
}
function deleteCustomSection(i) {
    if (!confirm('Xóa section này?')) return;
    const sections = getData(KEYS.customSections) || [];
    sections.splice(i,1);
    setData(KEYS.customSections, sections);
    showToast('Đã xóa!','success');
    renderCustomSections(document.getElementById('contentArea'));
}
function editCustomSection(i) {
    const sections = getData(KEYS.customSections) || [];
    const s = sections[i];
    if (!s) return;
    const area = document.getElementById('customEditArea');
    area.innerHTML = `
        <div class="admin-card" style="border-color:rgba(212,160,23,0.3);margin-top:16px;">
            <div class="admin-card-header">
                <div class="admin-card-title"><i class="fas fa-pen"></i> Chỉnh sửa Section</div>
            </div>
            ${_field('Tiêu đề','cs_title',s.title,'text','Tên section')}
            ${_field('Nội dung HTML','cs_content',s.content,'textarea','<h2>...</h2><p>...</p>')}
            ${_row(_field('Màu nền','cs_bg',s.bgColor,'text','#1a1a2e'), _field('Màu chữ','cs_tc',s.textColor,'text','#ffffff'))}
            ${_saveBtn("saveCustomSection("+i+")")}
        </div>
    `;
    area.scrollIntoView({behavior:'smooth'});
}
function saveCustomSection(i) {
    const sections = getData(KEYS.customSections) || [];
    sections[i] = {
        ...sections[i],
        title: document.getElementById('cs_title').value.trim(),
        content: document.getElementById('cs_content').value.trim(),
        bgColor: document.getElementById('cs_bg').value.trim(),
        textColor: document.getElementById('cs_tc').value.trim()
    };
    setData(KEYS.customSections, sections);
    showToast('Đã lưu Custom Section!','success');
    renderCustomSections(document.getElementById('contentArea'));
}

function genId() { return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2,6); }

/* ========== BANNER EDITOR ========== */
function renderBannerEditor(c) {
    const d = getData(KEYS.banners) || {};
    c.innerHTML = _card('Ảnh nền Sections', 'fas fa-image', `
        <p style="color:var(--admin-text-muted);font-size:0.85rem;margin-bottom:16px;">Thay đổi ảnh nền cho các section.</p>
        ${_field('Hero Background URL','bn_hero',d.hero,'text','images/hero-bg.png')}
        <div id="heroPreview" style="margin-bottom:16px;">${d.hero ? `<img src="${d.hero}" style="max-width:300px;border-radius:8px;">` : ''}</div>
        <button class="btn-admin btn-secondary" onclick="openImageModal(url=>{document.getElementById('bn_hero').value=url;document.getElementById('heroPreview').innerHTML='<img src=\\''+url+'\\' style=\\'max-width:300px;border-radius:8px;\\'>';},'Chọn ảnh Hero')">
            <i class="fas fa-upload"></i> Upload ảnh Hero
        </button>
        ${_saveBtn('saveBanners()')}
    `);
}
function saveBanners() {
    setData(KEYS.banners, { hero: document.getElementById('bn_hero').value.trim() });
    showToast('Đã lưu Banner!','success');
}

/* ========== GENERIC PEOPLE EDITOR ========== */
function renderPeopleEditor(key, title, icon) {
    return function(c) {
        const people = getData(key) || [];
        const fields = key === 'sponsors'
            ? ['name','tier','image']
            : key === 'speakers'
            ? ['name','role','title','desc','image']
            : key === 'contestants'
            ? ['name','specialty','bio','image','facebook','instagram','phone','article']
            : ['name','title','org','image'];

        const fieldLabels = {
            name:'Họ tên', role:'Vai trò', title:'Chức danh', desc:'Mô tả',
            org:'Tổ chức', tier:'Hạng tài trợ', specialty:'Chuyên môn',
            image:'Ảnh (URL)', bio:'Tiểu sử ngắn', article:'Bài viết chi tiết (HTML)',
            facebook:'Facebook URL', instagram:'Instagram URL', phone:'Số điện thoại'
        };

        c.innerHTML = _card(title, icon, `
            <p style="color:var(--admin-text-muted);font-size:0.85rem;margin-bottom:16px;">Quản lý danh sách ${title.toLowerCase()}.</p>
            <div id="peopleList">${people.length === 0 ? '<div class="empty-state"><i class="fas fa-users"></i><p>Chưa có dữ liệu</p></div>' :
                people.map((p,i) => `
                <div class="admin-card" style="margin-bottom:12px;border-color:rgba(212,160,23,0.15);padding:14px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                        <span style="color:var(--admin-primary);font-weight:600;">#${i+1} ${p.name||''}</span>
                        <div style="display:flex;gap:6px;">
                            ${key === 'contestants' && p.id ? `<a href="contestant.html?id=${p.id}" target="_blank" class="btn-admin btn-secondary btn-sm btn-icon" title="Xem trang"><i class="fas fa-external-link-alt"></i></a>` : ''}
                            <button class="btn-admin btn-danger btn-sm btn-icon" onclick="removePerson('${key}',${i})"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                    ${p.image ? `<img src="${p.image}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;margin-bottom:8px;">` : ''}
                    ${fields.map(f => f === 'image'
                        ? `<div class="form-group"><label class="form-label">${fieldLabels[f]}</label><div style="display:flex;gap:8px;"><input class="admin-input" id="pp_${f}_${i}" value="${escH(p[f]||'')}" style="flex:1;"><button class="btn-admin btn-secondary btn-sm" onclick="openImageModal(url=>{document.getElementById('pp_${f}_${i}').value=url;},'Chọn ảnh')"><i class="fas fa-upload"></i></button></div></div>`
                        : f === 'article'
                        ? `<div class="form-group"><label class="form-label">${fieldLabels[f]} <small style="color:var(--admin-text-muted);">(Hỗ trợ HTML: &lt;h2&gt;, &lt;p&gt;, &lt;img&gt;, &lt;ul&gt;...)</small></label><textarea class="admin-textarea" id="pp_${f}_${i}" style="min-height:200px;" placeholder="Viết bài giới thiệu tuyển thủ...">${p[f]||''}</textarea></div>`
                        : f === 'bio'
                        ? `<div class="form-group"><label class="form-label">${fieldLabels[f]}</label><textarea class="admin-textarea" id="pp_${f}_${i}" placeholder="Giới thiệu ngắn về tuyển thủ...">${p[f]||''}</textarea></div>`
                        : _field(fieldLabels[f]||f, 'pp_'+f+'_'+i, p[f])
                    ).join('')}
                </div>`).join('')}
            </div>
            <button class="btn-admin btn-secondary" onclick="addPerson('${key}')" style="margin-top:8px;"><i class="fas fa-plus"></i> Thêm ${title}</button>
            ${_saveBtn("savePeople('"+key+"',["+fields.map(f=>"'"+f+"'").join(',')+"])")}
        `);
    };
}

function addPerson(key) {
    const people = getData(key) || [];
    people.push({id:genId(), name:'Mới'});
    setData(key, people);
    loadSection(key);
}

function removePerson(key, i) {
    if (!confirm('Xóa người này?')) return;
    const people = getData(key) || [];
    people.splice(i,1);
    setData(key, people);
    loadSection(key);
}

function savePeople(key, fields) {
    const people = getData(key) || [];
    const saved = [];
    for (let i=0; i<people.length; i++) {
        const el = document.getElementById('pp_name_'+i);
        if (!el) break;
        const obj = {id: people[i].id || genId()};
        fields.forEach(f => {
            const e = document.getElementById('pp_'+f+'_'+i);
            if(e) obj[f] = e.value.trim();
        });
        // Preserve coverImage and gallery if they exist
        if (people[i].coverImage) obj.coverImage = people[i].coverImage;
        if (people[i].gallery) obj.gallery = people[i].gallery;
        saved.push(obj);
    }
    setData(key, saved);
    showToast('Đã lưu!','success');
}
