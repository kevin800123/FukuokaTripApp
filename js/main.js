// public/js/main.js
document.addEventListener('DOMContentLoaded', () => {
    // Service Worker Registration for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => console.log('SW registration failed:', err));
    }

    // Network Status Event Listeners
    window.addEventListener('online', () => {
        ItineraryTimeline.showToast('網路已恢復，正在更新資料...', false);
        if (ItineraryTimeline.fetchWeather) {
            ItineraryTimeline.fetchWeather(true).then(() => {
                ItineraryTimeline.renderCurrentDayTimeline();
            });
        }
    });

    window.addEventListener('offline', () => {
        ItineraryTimeline.showToast('目前為離線模式，已切換至快取資料', true);
    });
    console.log("福岡旅遊行程規劃器已載入！");
    const itineraryStore = createStore('fukuoka-trip-v2');
    itineraryStore.seedInitialData();
    ItineraryTimeline.init(itineraryStore, '#day-tabs-container', '#main-content');

    // Layout Toggle Logic
    const toggleBtn = document.getElementById('layout-toggle-btn');
    const updateLayoutText = () => {
        if (document.body.classList.contains('layout-desktop')) {
            toggleBtn.textContent = '切換為手機版';
        } else {
            toggleBtn.textContent = '切換為電腦版';
        }
    };
    
    // Auto-detect on load
    if (window.innerWidth >= 768) {
        document.body.classList.add('layout-desktop');
    }
    updateLayoutText();

    toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('layout-desktop');
        updateLayoutText();
    });

    const fab = document.getElementById('fab-add-itinerary');
    const bottomSheetContainer = document.getElementById('bottom-sheet-container');
    const closeBottomSheetBtn = document.getElementById('close-bottom-sheet');
    const cancelBtn = document.getElementById('cancel-add');
    const form = document.getElementById('add-itinerary-form');

    const openBottomSheet = () => bottomSheetContainer.classList.add('visible');
    const closeBottomSheet = () => bottomSheetContainer.classList.remove('visible');

    fab.addEventListener('click', openBottomSheet);
    closeBottomSheetBtn.addEventListener('click', closeBottomSheet);
    cancelBtn.addEventListener('click', closeBottomSheet);
    bottomSheetContainer.querySelector('.bottom-sheet-overlay').addEventListener('click', closeBottomSheet);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const timeInput = form.querySelector('#item-time');
        const nameInput = form.querySelector('#item-name');
        
        let isValid = true;
        [timeInput, nameInput].forEach(input => {
            input.classList.remove('input-error', 'shake');
            if (!input.value) {
                isValid = false;
                input.classList.add('input-error', 'shake');
                setTimeout(() => input.classList.remove('shake'), 500);
            }
        });

        if (!isValid) return;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        const newItem = ItineraryTimeline.addItem(data);
        if (newItem) {
            form.reset();
            closeBottomSheet();
            showToast('🎉 成功加入行程！');
        } else {
            showToast('😥 加入失敗，請稍後再試。', 'error');
        }
    });

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    const mainContent = document.getElementById('main-content');
    const detailsModalContainer = document.getElementById('details-modal-container');
    const closeDetailsModalBtn = document.getElementById('close-details-modal');

    const openDetailsModal = () => detailsModalContainer.classList.add('visible');
    const closeDetailsModal = () => detailsModalContainer.classList.remove('visible');

    mainContent.addEventListener('click', (e) => {
        const itemElement = e.target.closest('.timeline-item');
        if (!itemElement) return;

        const itemId = itemElement.dataset.itemId;
        const currentDay = ItineraryTimeline.data.find(day => day.id === ItineraryTimeline.currentDayId);
        const itemData = currentDay?.items.find(item => item.id === itemId);
        if (!itemData) return;

        populateDetailsModal(itemData);
        openDetailsModal();
    });

    closeDetailsModalBtn.addEventListener('click', closeDetailsModal);
    detailsModalContainer.querySelector('.details-modal-overlay').addEventListener('click', closeDetailsModal);

    function populateDetailsModal(item) {
        const titleEl = document.getElementById('details-title');
        const contentEl = document.getElementById('details-modal-content');
        titleEl.textContent = item.name;
        
        const mapSearchQuery = item.location || item.name;
        const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapSearchQuery)}`;
        const categoryIcons = { '飲食': '🍜', '景點': '⛩️', '購物': '🛍️', '交通': '🚃', '其他': '📌' };

        contentEl.innerHTML = `
            <div class="detail-item"><span class="detail-icon">⏰</span><div class="detail-text"><strong>時間</strong><p>${item.time}</p></div></div>
            <div class="detail-item"><span class="detail-icon">${categoryIcons[item.category] || '📌'}</span><div class="detail-text"><strong>類別</strong><p>${item.category}</p></div></div>
            
            <div class="detail-item">
                <span class="detail-icon">📍</span>
                <div class="detail-text" style="flex: 1;">
                    <strong>地圖搜尋關鍵字</strong>
                    <div style="display: flex; gap: 8px; margin-top: 6px;">
                        <input type="text" id="edit-location-input" value="${ItineraryTimeline.escapeHtml(item.location || '')}" placeholder="預設使用行程名稱" style="flex: 1; padding: 8px; border: 1px solid var(--border-color); border-radius: 8px; width: 100%; box-sizing: border-box;">
                        <button id="save-location-btn" class="btn-primary" style="padding: 8px 16px; font-size: 14px;">儲存</button>
                    </div>
                </div>
            </div>

            ${item.notes ? `<div class="detail-item"><span class="detail-icon">📝</span><div class="detail-text"><strong>備註</strong><p>${ItineraryTimeline.escapeHtml(item.notes)}</p></div></div>` : ''}
            <a href="${mapsLink}" target="_blank" id="map-nav-link" class="btn-nav">📍 開啟 Google Maps 導航</a>
        `;

        const saveBtn = document.getElementById('save-location-btn');
        const locInput = document.getElementById('edit-location-input');
        
        saveBtn.addEventListener('click', () => {
            const newLoc = locInput.value.trim();
            const updatedItem = ItineraryTimeline.updateItem(item.id, { location: newLoc });
            if (updatedItem) {
                showToast('✅ 地圖搜尋關鍵字已更新！');
                const newQuery = newLoc || updatedItem.name;
                document.getElementById('map-nav-link').href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(newQuery)}`;
            }
        });
    }
});
