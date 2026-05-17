/* ============================================
   ADMIN CMS — GitHub Pages Edition
   Saves data directly to GitHub via API
   ============================================ */

// === CONFIG ===
const GITHUB_CONFIG_KEY = 'beautyAwards_githubConfig';
const DATA_FILE = 'data.json';

// Storage keys
const KEYS = {
    hero: 'hero', seo: 'seo', nav: 'navigation', banners: 'banners',
    stats: 'stats', about: 'about', speakers: 'speakers', sponsors: 'sponsors',
    advisors: 'advisors', judges: 'judges', contestants: 'contestants',
    experience: 'experience', registration: 'registration', stickyCta: 'stickyCta',
    exitPopup: 'exitPopup', footer: 'footer', customSections: 'customSections'
};

// In-memory data cache
let siteData = {};
let githubConfig = null;
let fileSha = null;

// Save queue to prevent SHA race conditions
let _saveQueue = Promise.resolve();
let _saveDebounceTimer = null;
const SAVE_DEBOUNCE_MS = 800;

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
    // Load GitHub config from localStorage (only on admin's machine)
    githubConfig = JSON.parse(localStorage.getItem(GITHUB_CONFIG_KEY) || 'null');

    // Setup sidebar navigation
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            loadSection(item.dataset.section);
        });
    });

    // Mobile menu
    const toggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const close = document.getElementById('sidebarClose');
    if (toggle) toggle.addEventListener('click', () => sidebar.classList.add('active'));
    if (close) close.addEventListener('click', () => sidebar.classList.remove('active'));

    // Image upload modal
    setupImageModal();

    // Check config and load data
    if (!githubConfig) {
        showGitHubSetup();
    } else {
        loadDataFromGitHub();
    }
});

// === GITHUB SETUP ===
function showGitHubSetup() {
    const c = document.getElementById('contentArea');
    c.innerHTML = `
    <div class="admin-card">
        <div class="admin-card-header">
            <div class="admin-card-title"><i class="fab fa-github"></i> Kết nối GitHub</div>
        </div>
        <p style="color:var(--admin-text-muted);margin-bottom:20px;">
            Để Admin CMS có thể lưu dữ liệu, bạn cần kết nối với GitHub repo.
        </p>
        <div class="form-group">
            <label class="form-label">GitHub Username</label>
            <input class="admin-input" id="gh_owner" placeholder="Tranhai68" value="${githubConfig?.owner || ''}">
        </div>
        <div class="form-group">
            <label class="form-label">Repository Name</label>
            <input class="admin-input" id="gh_repo" placeholder="tiga-beauty-awards" value="${githubConfig?.repo || ''}">
        </div>
        <div class="form-group">
            <label class="form-label">Personal Access Token (PAT)</label>
            <input class="admin-input" id="gh_token" type="password" placeholder="ghp_xxxxxxxxxxxx" value="${githubConfig?.token || ''}">
            <p style="font-size:0.75rem;color:var(--admin-text-muted);margin-top:6px;">
                Tạo token tại: <a href="https://github.com/settings/tokens/new" target="_blank" style="color:var(--admin-primary);">github.com/settings/tokens</a>
                — Chọn scope: <strong>repo</strong> (Full control)
            </p>
        </div>
        <div class="form-group">
            <label class="form-label">Branch (mặc định: main)</label>
            <input class="admin-input" id="gh_branch" placeholder="main" value="${githubConfig?.branch || 'main'}">
        </div>
        <button class="btn-admin btn-primary" onclick="saveGitHubConfig()">
            <i class="fab fa-github"></i> Kết nối & Tải dữ liệu
        </button>
    </div>`;
    updateStatus('Chưa kết nối', 'warning');
}

function saveGitHubConfig() {
    const owner = document.getElementById('gh_owner').value.trim();
    const repo = document.getElementById('gh_repo').value.trim();
    const token = document.getElementById('gh_token').value.trim();
    const branch = document.getElementById('gh_branch').value.trim() || 'main';

    if (!owner || !repo || !token) {
        showToast('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }

    githubConfig = { owner, repo, token, branch };
    localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(githubConfig));
    showToast('Đã lưu cấu hình GitHub!', 'success');
    loadDataFromGitHub();
}

// === GITHUB API ===
async function githubAPI(method, path, body) {
    const url = `https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/${path}`;
    const opts = {
        method, headers: {
            'Authorization': `Bearer ${githubConfig.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        }
    };
    if (body) opts.body = JSON.stringify(body);
    if (method === 'GET') {
        const ref = githubConfig.branch ? `?ref=${githubConfig.branch}` : '';
        return fetch(url + ref, opts);
    }
    return fetch(url, opts);
}

async function loadDataFromGitHub() {
    updateStatus('Đang tải...', 'loading');
    try {
        const res = await githubAPI('GET', DATA_FILE);
        if (res.ok) {
            const json = await res.json();
            fileSha = json.sha;
            const content = atob(json.content.replace(/\n/g, ''));
            // Decode UTF-8 properly
            const bytes = new Uint8Array([...content].map(c => c.charCodeAt(0)));
            const decoded = new TextDecoder('utf-8').decode(bytes);
            siteData = JSON.parse(decoded);
            updateStatus('GitHub ✓', 'connected');
            showToast('Đã tải dữ liệu từ GitHub!', 'success');
            loadSection('hero');
        } else if (res.status === 404) {
            // data.json doesn't exist yet, create it
            siteData = {};
            await saveDataToGitHub('Khởi tạo data.json');
            updateStatus('GitHub ✓', 'connected');
            loadSection('hero');
        } else {
            throw new Error(`HTTP ${res.status}`);
        }
    } catch (err) {
        updateStatus('Lỗi kết nối', 'error');
        showToast('Lỗi kết nối GitHub: ' + err.message, 'error');
        showGitHubSetup();
    }
}

// Safe base64 encoding that handles large Uint8Arrays without stack overflow
function uint8ToBase64(bytes) {
    const CHUNK = 8192;
    let binary = '';
    for (let i = 0; i < bytes.length; i += CHUNK) {
        const slice = bytes.subarray(i, Math.min(i + CHUNK, bytes.length));
        binary += String.fromCharCode.apply(null, slice);
    }
    return btoa(binary);
}

async function _doSaveToGitHub(message) {
    updateStatus('Đang lưu...', 'saving');
    try {
        const jsonStr = JSON.stringify(siteData, null, 2);
        // Encode UTF-8 properly using chunked approach (no stack overflow)
        const encoder = new TextEncoder();
        const bytes = encoder.encode(jsonStr);
        const base64 = uint8ToBase64(bytes);

        const body = {
            message: message || 'Cập nhật từ Admin CMS',
            content: base64,
            branch: githubConfig.branch
        };
        if (fileSha) body.sha = fileSha;

        const res = await githubAPI('PUT', DATA_FILE, body);
        if (res.ok) {
            const result = await res.json();
            fileSha = result.content.sha;
            updateStatus('Đã lưu ✓', 'saved');
            setTimeout(() => updateStatus('GitHub ✓', 'connected'), 2000);
            return true;
        } else if (res.status === 409) {
            // SHA conflict — reload SHA and retry once
            console.warn('[Admin CMS] SHA conflict, reloading...');
            const reload = await githubAPI('GET', DATA_FILE);
            if (reload.ok) {
                const reloadJson = await reload.json();
                fileSha = reloadJson.sha;
                // Retry save with new SHA
                body.sha = fileSha;
                const retry = await githubAPI('PUT', DATA_FILE, body);
                if (retry.ok) {
                    const retryResult = await retry.json();
                    fileSha = retryResult.content.sha;
                    updateStatus('Đã lưu ✓', 'saved');
                    setTimeout(() => updateStatus('GitHub ✓', 'connected'), 2000);
                    return true;
                }
            }
            throw new Error('SHA conflict — vui lòng thử lại');
        } else {
            const err = await res.json();
            throw new Error(err.message || `HTTP ${res.status}`);
        }
    } catch (err) {
        updateStatus('Lỗi lưu!', 'error');
        showToast('Lỗi lưu GitHub: ' + err.message, 'error');
        console.error('[Admin CMS] Save error:', err);
        return false;
    }
}

// Queued save — prevents concurrent saves and SHA race conditions
function saveDataToGitHub(message) {
    _saveQueue = _saveQueue.then(() => _doSaveToGitHub(message)).catch(err => {
        console.error('[Admin CMS] Queue error:', err);
    });
    return _saveQueue;
}

// === IMAGE UPLOAD TO GITHUB ===
async function uploadImageToGitHub(base64Data, fileName) {
    updateStatus('Đang upload ảnh...', 'saving');
    try {
        const path = `images/${fileName}`;
        // Check if file exists to get sha
        let sha = null;
        try {
            const check = await githubAPI('GET', path);
            if (check.ok) {
                const existing = await check.json();
                sha = existing.sha;
            }
        } catch(e) {}

        // Clean base64
        let clean = base64Data;
        if (base64Data.includes(',')) clean = base64Data.split(',')[1];

        const body = {
            message: `Upload image: ${fileName}`,
            content: clean,
            branch: githubConfig.branch
        };
        if (sha) body.sha = sha;

        const res = await githubAPI('PUT', path, body);
        if (res.ok) {
            // Return the raw GitHub URL for the image
            const url = `https://raw.githubusercontent.com/${githubConfig.owner}/${githubConfig.repo}/${githubConfig.branch}/${path}`;
            updateStatus('Đã upload ✓', 'saved');
            setTimeout(() => updateStatus('GitHub ✓', 'connected'), 2000);
            return url;
        } else {
            throw new Error('Upload failed');
        }
    } catch (err) {
        showToast('Lỗi upload ảnh: ' + err.message, 'error');
        updateStatus('GitHub ✓', 'connected');
        return null;
    }
}

// === DATA ACCESS (used by admin-editors.js) ===
function getData(key) {
    return siteData[key] || null;
}

function setData(key, value) {
    siteData[key] = value;
    // Debounced save — batches rapid edits (add/remove) into one GitHub commit
    if (_saveDebounceTimer) clearTimeout(_saveDebounceTimer);
    _saveDebounceTimer = setTimeout(() => {
        saveDataToGitHub(`Cập nhật ${key}`);
    }, SAVE_DEBOUNCE_MS);
}

// === UI HELPERS ===
function updateStatus(text, type) {
    const el = document.getElementById('dataStatus');
    if (!el) return;
    const icons = {
        connected: '<i class="fab fa-github" style="color:var(--admin-success)"></i>',
        loading: '<i class="fas fa-spinner fa-spin"></i>',
        saving: '<i class="fas fa-cloud-upload-alt" style="color:var(--admin-primary)"></i>',
        saved: '<i class="fas fa-check-circle" style="color:var(--admin-success)"></i>',
        error: '<i class="fas fa-exclamation-circle" style="color:var(--admin-danger)"></i>',
        warning: '<i class="fas fa-exclamation-triangle" style="color:#f59e0b"></i>'
    };
    el.innerHTML = `${icons[type] || ''} ${text}`;
}

function showToast(msg, type) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function loadSection(name) {
    const c = document.getElementById('contentArea');
    const titles = {
        hero: 'Hero Section', seo: 'SEO / Meta', navigation: 'Navigation',
        banners: 'Ảnh nền Sections', stats: 'Stats Banner', about: 'Giới thiệu',
        speakers: 'Diễn giả', sponsors: 'Nhà tài trợ', advisors: 'Ban cố vấn',
        judges: 'Ban giám khảo', contestants: 'Tuyển thủ', experience: 'Trải nghiệm',
        registration: 'Đăng ký', stickyCta: 'Sticky CTA', exitPopup: 'Exit Popup',
        footer: 'Footer', customSections: 'Custom Sections', github: 'Cài đặt GitHub'
    };
    document.getElementById('pageTitle').textContent = 'Chỉnh sửa ' + (titles[name] || name);

    // Close mobile sidebar
    document.getElementById('sidebar')?.classList.remove('active');

    const renderers = {
        hero: renderHeroEditor, seo: renderSeoEditor, navigation: renderNavEditor,
        banners: renderBannerEditor, stats: renderStatsEditor, about: renderAboutEditor,
        speakers: renderPeopleEditor('speakers','Diễn giả','fas fa-microphone-alt','speaker-badge-role'),
        sponsors: renderPeopleEditor('sponsors','Nhà tài trợ','fas fa-handshake','tier'),
        advisors: renderPeopleEditor('advisors','Ban cố vấn','fas fa-user-shield','person-badge'),
        judges: renderPeopleEditor('judges','Ban giám khảo','fas fa-gavel','person-badge'),
        contestants: renderPeopleEditor('contestants','Tuyển thủ','fas fa-users'),
        experience: renderExperienceEditor, registration: renderRegistrationEditor,
        stickyCta: renderStickyCtaEditor, exitPopup: renderExitPopupEditor,
        footer: renderFooterEditor, customSections: renderCustomSections,
        github: showGitHubSetup
    };

    if (renderers[name]) {
        renderers[name](c);
    } else {
        c.innerHTML = `<div class="empty-state"><i class="fas fa-cog"></i><p>Section "${name}" chưa có editor.</p></div>`;
    }
}

// === IMAGE MODAL ===
let _imageCallback = null;

function openImageModal(callback, title) {
    _imageCallback = callback;
    const modal = document.getElementById('imageModal');
    const titleEl = document.getElementById('imageModalTitle');
    if (titleEl) titleEl.textContent = title || 'Chọn ảnh';
    clearPreview();
    document.getElementById('imageUrlInput').value = '';
    modal.classList.add('active');
}

function closeModal(id) {
    document.getElementById(id)?.classList.remove('active');
}

function clearPreview() {
    const preview = document.getElementById('imagePreview');
    if (preview) { preview.style.display = 'none'; }
}

function confirmImageUrl() {
    const url = document.getElementById('imageUrlInput').value.trim();
    if (url && _imageCallback) {
        _imageCallback(url);
        closeModal('imageModal');
    }
}

function setupImageModal() {
    const zone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    if (!zone || !fileInput) return;

    zone.addEventListener('click', () => fileInput.click());
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', e => {
        e.preventDefault(); zone.classList.remove('dragover');
        if (e.dataTransfer.files.length) processFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) processFile(fileInput.files[0]);
    });
}

async function processFile(file) {
    if (!file.type.startsWith('image/')) {
        showToast('Chỉ chấp nhận file ảnh!', 'error');
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        showToast('Ảnh tối đa 5MB!', 'error');
        return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = async (e) => {
        const preview = document.getElementById('imagePreview');
        const img = document.getElementById('previewImg');
        if (preview && img) {
            img.src = e.target.result;
            preview.style.display = 'block';
        }

        // Upload to GitHub
        const fileName = Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9._-]/g, '');
        const url = await uploadImageToGitHub(e.target.result, fileName);

        if (url && _imageCallback) {
            _imageCallback(url);
            showToast('Ảnh đã upload lên GitHub!', 'success');
            closeModal('imageModal');
        }
    };
    reader.readAsDataURL(file);
}

// === RICH TEXT EDITOR ===
function execCmd(cmd, val) {
    document.execCommand(cmd, false, val || null);
}
function insertLink() {
    const url = prompt('Nhập URL:');
    if (url) document.execCommand('createLink', false, url);
}
