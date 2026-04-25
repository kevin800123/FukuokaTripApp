// public/js/components/ItineraryTimeline.js
const ItineraryTimeline = {
    store: null,
    data: [],
    currentDayId: 1,
    dayTabsContainer: null,
    mainContentContainer: null,

    weatherData: null,

    async init(store, dayTabsSelector, mainContentSelector) {
        this.store = store;
        this.dayTabsContainer = document.querySelector(dayTabsSelector);
        this.mainContentContainer = document.querySelector(mainContentSelector);
        this.loadData();
        this.renderDayTabs();
        this.mainContentContainer.innerHTML = '<div class="loading" style="text-align: center; padding: 40px; color: var(--text-light);">✈️ 載入天氣與行程中...</div>';
        await this.fetchWeather();
        this.renderCurrentDayTimeline();
        this.addEventListeners();
    },

    async fetchWeather(force = false) {
        if (!force && this.weatherData) return;
        try {
            const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=33.5902&longitude=130.4017&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FTokyo');
            if (!res.ok) throw new Error('Network error');
            const data = await res.json();
            
            const weatherMap = {};
            data.daily.time.forEach((dateStr, index) => {
                const [year, month, day] = dateStr.split('-');
                const localDateKey = `${parseInt(month)}/${parseInt(day)}`;
                weatherMap[localDateKey] = {
                    code: data.daily.weather_code[index],
                    maxT: data.daily.temperature_2m_max[index],
                    minT: data.daily.temperature_2m_min[index],
                    pop: data.daily.precipitation_probability_max[index]
                };
            });
            this.weatherData = weatherMap;
            localStorage.setItem('weather-cache-v1', JSON.stringify(weatherMap));
        } catch (e) {
            console.error('Failed to fetch weather', e);
            const cachedWeather = localStorage.getItem('weather-cache-v1');
            if (cachedWeather) {
                this.weatherData = JSON.parse(cachedWeather);
                this.weatherData._isOffline = true;
            } else {
                this.weatherData = null;
            }
        }
    },

    loadData() {
        this.data = this.store.getAll();
        if (this.data.length > 0) this.currentDayId = this.data[0].id;
    },

    render() {
        this.renderDayTabs();
        this.renderCurrentDayTimeline();
    },

    renderDayTabs() {
        const tabsHtml = this.data.map((day, index) => {
            const isActive = day.id === this.currentDayId;
            const [month, date] = day.date.split('/');
            return `
                <button class="day-tab ${isActive ? 'active' : ''}" data-day-id="${day.id}">
                    <div class="cal-box">
                        <div class="cal-month">${month}月</div>
                        <div class="cal-date">${date}</div>
                    </div>
                    <div class="day-info">
                        <div class="day-number">Day ${index + 1}</div>
                        <div class="day-title">${this.escapeHtml(day.title)}</div>
                    </div>
                </button>
            `;
        }).join('');
        this.dayTabsContainer.innerHTML = `<div class="day-tabs-scroll">${tabsHtml}</div>`;
    },

    renderCurrentDayTimeline() {
        const currentDayData = this.data.find(day => day.id === this.currentDayId);

        if (!currentDayData || currentDayData.items.length === 0) {
            this.renderEmptyState();
            return;
        }

        setTimeout(() => {
            const weather = this.weatherData ? this.weatherData[currentDayData.date] : null;
            const wmoCodes = {
                0: '☀️ 晴朗', 1: '🌤️ 晴時多雲', 2: '⛅ 多雲', 3: '☁️ 陰天',
                45: '🌫️ 霧', 48: '🌫️ 霧', 51: '🌧️ 微雨', 53: '🌧️ 微雨', 55: '🌧️ 微雨',
                61: '☔ 陣雨', 63: '☔ 降雨', 65: '☔ 大雨', 71: '❄️ 小雪', 73: '❄️ 中雪', 75: '❄️ 大雪',
                80: '☔ 陣雨', 81: '☔ 陣雨', 82: '☔ 暴雨', 95: '⛈️ 雷雨'
            };

            let weatherHtml = '';
            if (weather) {
                const weatherDesc = wmoCodes[weather.code] || '☁️ 陰天';
                const icon = weatherDesc.split(' ')[0];
                const text = weatherDesc.split(' ')[1];
                const offlineBadge = this.weatherData && this.weatherData._isOffline ? `<span style="background: #B3424A; color: white; padding: 2px 6px; border-radius: 2px; font-size: 10px; margin-left: 8px; vertical-align: middle;">⚠️ 離線快取資料</span>` : '';
                weatherHtml = `
                    <div class="weather-banner" style="background: transparent; padding: 10px 0; border-bottom: 2px solid var(--text-color); margin-bottom: 25px; display: flex; flex-wrap: wrap; gap: 15px; align-items: center; justify-content: space-between;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 24px;">${icon}</span>
                            <div>
                                <div style="font-weight: 600; color: var(--text-color); font-size: 15px; font-family: 'Noto Serif JP', serif;">${text}${offlineBadge}</div>
                                <div style="font-size: 11px; color: var(--text-light); letter-spacing: 1px;">📍 日本福岡縣福岡市中央區</div>
                            </div>
                        </div>
                        <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
                            <div style="font-weight: 600; color: var(--text-color); font-size: 14px; font-family: 'Noto Serif JP', serif;">氣溫 ${Math.round(weather.minT)}° ~ ${Math.round(weather.maxT)}°C</div>
                            <div style="font-size: 12px; font-weight: bold; color: ${weather.pop > 40 ? '#B3424A' : 'var(--primary-color)'};">☔ 降雨機率 ${weather.pop}%</div>
                        </div>
                        <div style="width: 100%; border-top: 1px dotted var(--border-color); padding-top: 8px; margin-top: 5px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--text-light);">
                            <div>資料來源: <a href="https://open-meteo.com/" target="_blank" style="color: var(--primary-color); text-decoration: none;">Open-Meteo API</a></div>
                            <button class="refresh-weather-btn" style="background: none; border: 1px solid var(--border-color); border-radius: 2px; padding: 3px 8px; cursor: pointer; color: var(--text-color); font-size: 11px; display: flex; align-items: center; gap: 4px; transition: background 0.2s;">🔄 即時更新</button>
                        </div>
                    </div>
                `;
            } else {
                weatherHtml = `
                    <div class="weather-banner" style="background: transparent; padding: 10px 0; border-bottom: 2px solid var(--text-color); margin-bottom: 25px; text-align: center; color: var(--text-light); font-size: 13px;">
                        尚無 ${currentDayData.date} 的天氣預報資訊
                        <div style="margin-top: 10px;">
                            <button class="refresh-weather-btn" style="background: none; border: 1px solid var(--border-color); border-radius: 2px; padding: 3px 8px; cursor: pointer; color: var(--text-color); font-size: 11px;">🔄 重新取得</button>
                        </div>
                    </div>
                `;
            }

            const timelineHtml = `
                ${weatherHtml}
                <div class="timeline">
                    ${currentDayData.items.map(item => this.renderItem(item)).join('')}
                </div>
            `;
            this.mainContentContainer.innerHTML = timelineHtml;
            
            const refreshBtn = this.mainContentContainer.querySelector('.refresh-weather-btn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', async () => {
                    refreshBtn.innerHTML = '⏳ 更新中...';
                    refreshBtn.disabled = true;
                    await this.fetchWeather(true);
                    this.renderCurrentDayTimeline();
                });
            }
        }, 100);
    },

    renderItem(item) {
        const categoryIcons = { '飲食': '🍜', '景點': '⛩️', '購物': '🛍️', '交通': '🚃', '其他': '📌' };
        
        const desc = item.details || item.notes || '';
        const searchQuery = encodeURIComponent((item.location || item.name) + ' 福岡');

        return `
            <div class="timeline-item" data-item-id="${item.id}">
                <div class="timeline-time">${this.escapeHtml(item.time)}</div>
                <div class="timeline-content">
                    <div class="card">
                        <div class="card-main">
                            <div class="card-header">
                                <span class="card-icon">${categoryIcons[item.category] || '📌'}</span>
                                <h3 class="card-title">${this.escapeHtml(item.name)}</h3>
                            </div>
                            ${item.tags && item.tags.length > 0 ? `
                            <div class="card-tags">
                                ${item.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
                            </div>` : ''}
                        </div>
                        ${desc ? `
                        <div class="card-extra">
                            <p class="card-desc">${this.escapeHtml(desc)}</p>
                            <a href="https://www.google.com/search?q=${searchQuery}" target="_blank" class="card-source-link" onclick="event.stopPropagation()">🔗 資料來源</a>
                        </div>
                        ` : `
                        <div class="card-extra">
                            <a href="https://www.google.com/search?q=${searchQuery}" target="_blank" class="card-source-link" onclick="event.stopPropagation()">🔗 資料來源</a>
                        </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    },
    
    renderEmptyState() {
        this.mainContentContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-illustration">🍜</div>
                <p>這天還沒有行程喔！</p>
                <button class="btn-primary" id="add-from-empty">➕ 加入福岡必去景點</button>
            </div>
        `;
    },

    switchDay(dayId) {
        this.currentDayId = dayId;
        this.mainContentContainer.style.opacity = 0;
        setTimeout(() => {
            this.render();
            this.mainContentContainer.style.opacity = 1;
        }, 200);
    },

    addEventListeners() {
        this.dayTabsContainer.addEventListener('click', (e) => {
            const tab = e.target.closest('.day-tab');
            if (tab) {
                const dayId = parseInt(tab.dataset.dayId);
                this.switchDay(dayId);
            }
        });
    },

    addItem(itemData) {
        const newItem = this.store.addItemToDay(this.currentDayId, itemData);
        if (newItem) {
            this.loadData();
            this.render();
            return newItem;
        }
        return null;
    },

    deleteItem(itemId) {
        this.store.deleteItemFromDay(this.currentDayId, itemId);
        this.loadData();
        this.render();
    },

    updateItem(itemId, updates) {
        const updatedItem = this.store.updateItemInDay(this.currentDayId, itemId, updates);
        if (updatedItem) {
            this.loadData();
            this.render();
            return updatedItem;
        }
        return null;
    },

    escapeHtml(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
};
