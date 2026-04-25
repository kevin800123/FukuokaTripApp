// public/js/storage.js

/**
 * @typedef {Object} ItineraryItem
 * @property {string} id - 唯一 ID
 * @property {string} time - 行程時間 (e.g., "09:30")
 * @property {'飲食' | '景點' | '購物' | '交通' | '其他'} category - 分類
 * @property {string} name - 景點或活動名稱
 * @property {string} [notes] - 備註
 * @property {string[]} [tags] - 標籤 (e.g., ["需預約", "已買票"])
 * @property {number} [budget] - 預估花費 (日幣)
 * @property {string} [personInCharge] - 負責人
 * @property {string} [link] - 參考連結
 * @property {string} createdAt - 建立時間 (ISO 8601)
 * @property {string} [updatedAt] - 更新時間 (ISO 8601)
 */

/**
 * @typedef {Object} DayPlan
 * @property {number} id - 天數 ID (e.g., 1, 2, 3)
 * @property {string} title - 當天標題 (e.g., "福岡市區")
 * @property {string} date - 當天日期 (e.g., "4/27")
 * @property {ItineraryItem[]} items - 當天的行程項目列表，按時間排序
 */

const Storage = {
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Storage.get error:', e);
            return null;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage.set error:', e);
            return false;
        }
    },
    
    remove(key) {
        localStorage.removeItem(key);
    },
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
};

/**
 * 建立一個 localStorage 的資料存取器
 * @param {string} storageKey - localStorage 中的鍵名
 * @returns {object} 一個包含 CRUD 方法的物件
 */
function createStore(storageKey) {
    return {
        getAll() {
            return Storage.get(storageKey) || [];
        },
        
        save(data) {
            Storage.set(storageKey, data);
        },

        getDay(dayId) {
            const allDays = this.getAll();
            return allDays.find(day => day.id === dayId);
        },

        addItemToDay(dayId, itemData) {
            const allDays = this.getAll();
            const dayIndex = allDays.findIndex(day => day.id === dayId);
            
            if (dayIndex === -1) return null;

            const newItem = {
                id: Storage.generateId(),
                ...itemData,
                createdAt: new Date().toISOString()
            };

            allDays[dayIndex].items.push(newItem);
            allDays[dayIndex].items.sort((a, b) => a.time.localeCompare(b.time));
            
            this.save(allDays);
            return newItem;
        },

        updateItemInDay(dayId, itemId, updates) {
            const allDays = this.getAll();
            const day = allDays.find(d => d.id === dayId);
            if (!day) return null;

            const itemIndex = day.items.findIndex(item => item.id === itemId);
            if (itemIndex === -1) return null;

            day.items[itemIndex] = { ...day.items[itemIndex], ...updates, updatedAt: new Date().toISOString() };
            day.items.sort((a, b) => a.time.localeCompare(b.time));

            this.save(allDays);
            return day.items[itemIndex];
        },

        deleteItemFromDay(dayId, itemId) {
            const allDays = this.getAll();
            const day = allDays.find(d => d.id === dayId);

            if (day) {
                day.items = day.items.filter(item => item.id !== itemId);
                this.save(allDays);
            }
        },

        seedInitialData() {
            const currentData = this.getAll();
            // If empty, or if it looks like the old default data (day 1 has 4 items), then seed the new full data.
            if (currentData.length > 0 && !(currentData[0] && currentData[0].items && currentData[0].items.length === 4)) return;

            const initialData = [
                {
                    id: 1, title: "抵達福岡與螃蟹大餐", date: "4/27",
                    items: [
                        { id: Storage.generateId(), time: "10:45", category: "交通", name: "抵達桃園機場 (T1)", notes: "於第一航廈辦理台灣虎航登機手續與托運行李。\n交通方式：自行前往機場\n備註：建議提早兩小時抵達。", createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "12:45", category: "交通", name: "飛往福岡 (IT720)", notes: "搭乘航班 IT720 飛往福岡，開啟放鬆之旅。\n交通方式：飛機 (航程約 2 小時 25 分)\n備註：去程為 tigerlight 方案。", tags: ["航班確認"], createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "16:10", category: "交通", name: "抵達福岡機場", notes: "辦理入境手續、領取行李。\n交通方式：步行", createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "17:00", category: "交通", name: "前往市區飯店", notes: "搭乘福岡市營地下鐵空港線至博多站。\n交通方式：地鐵 (乘車約 10 分鐘)", createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "17:30", category: "其他", name: "入住【FFFFFF Hotel】", notes: "辦理入住手續。放下行李，準備出門吃晚餐。\n交通方式：步行\n備註：連續入住四晚，節奏穩定。", tags: ["已付款"], createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "18:30", category: "飲食", name: "晚餐：極致螃蟹料理", notes: "推薦「札幌螃蟹本家」，享受頂級鱈場蟹與松葉蟹，慶祝旅程開始。\n交通方式：巴士或計程車 (約 15 分鐘)", tags: ["必吃清單"], createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "21:00", category: "其他", name: "飯店休息", notes: "在房間內享受悠閒時光，早點休息準備明日早起。\n交通方式：步行", createdAt: new Date().toISOString() }
                    ]
                },
                {
                    id: 2, title: "別府童心與絕景", date: "4/28",
                    items: [
                        { id: Storage.generateId(), time: "05:45", category: "交通", name: "早餐與前往車站", notes: "飯店周邊超商快速購買早餐，抵達博多車站月台。\n交通方式：步行\n備註：建議前一晚先買好早餐帶上車吃。", createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "06:21", category: "交通", name: "前往別府站 (已劃位)", notes: "搭乘 JR 特急音速 1 號 (Sonic 1) 直達別府。\n交通方式：JR (乘車 132 分鐘)\n備註：使用手機 QR Code 刷入閘門。", tags: ["已劃位"], createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "08:45", category: "交通", name: "轉乘前往動物園", notes: "於別府站西口搭乘「龜之井巴士 (41號)」，直達自然動物園。\n交通方式：路線巴士 (約 45 分鐘)\n備註：💡 先在別府站觀光案內所購買「巴士+門票+叢林巴士」套票。", tags: ["買套票"], createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "09:30", category: "景點", name: "九州自然動物園", notes: "搭乘特色叢林巴士近距離餵食獅子、大象等野生動物，重拾童心。\n交通方式：步行 / 叢林巴士", createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "12:10", category: "交通", name: "返回別府站", notes: "搭乘龜之井巴士 (41號) 從動物園返回別府車站。\n交通方式：路線巴士 (約 50 分鐘)", createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "13:00", category: "飲食", name: "午餐：別府必吃天婦羅", notes: "推薦車站前人氣名店「とよ常 (Toyotsune)」，品嚐特上天丼與炸雞肉。\n交通方式：步行 (約 5 分鐘)", createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "14:10", category: "交通", name: "前往別府空中纜車", notes: "從別府站西口搭乘龜之井巴士 (36號往湯布院方向)，於纜車站下車。\n交通方式：路線巴士 (約 20 分鐘)\n備註：刷 IC 卡或投幣皆可。", createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "14:30", category: "景點", name: "別府空中纜車", notes: "搭乘纜車直達鶴見岳山頂，將別府灣海景與壯闊山脈盡收眼底。\n交通方式：纜車 (約 10 分鐘)\n備註：山頂氣溫較低，建議多帶一件薄外套。", tags: ["帶薄外套"], createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "16:10", category: "交通", name: "返回別府站", notes: "搭乘龜之井巴士返回別府車站，準備搭乘回程列車。\n交通方式：路線巴士 (約 25 分鐘)", createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "16:52", category: "交通", name: "返回博多市區 (已劃位)", notes: "搭乘 JR 特急音速 46 號 (Sonic 46) 輕鬆返回博多。\n交通方式：JR (乘車 120 分鐘)\n備註：車上可充分閉目養神。使用手機 QR Code 進站。", tags: ["已劃位"], createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "19:15", category: "飲食", name: "晚餐：頂級和牛燒肉", notes: "回到博多後，推薦「燒肉 Champion」或「泰元」，以高品質和牛作為極致犒賞。\n交通方式：步行 / 地鐵 (約 10 分鐘)", tags: ["必吃清單"], createdAt: new Date().toISOString() }
                    ]
                },
                {
                    id: 3, title: "紫藤花海與北九州", date: "4/29",
                    items: [
                        { id: Storage.generateId(), time: "07:45", category: "交通", name: "早餐", notes: "飯店周邊簡單享用早餐。\n交通方式：步行", createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "08:15", category: "交通", name: "前往集合地點", notes: "步行至博多車站筑紫口旁的「羅森 福岡東方飯店」。\n交通方式：步行 / 地鐵\n備註：務必於 08:30 前抵達集合。", tags: ["Klook"], createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "09:00", category: "交通", name: "觀光巴士出發", notes: "搭乘 Klook 一日遊專車前往第一站。\n交通方式：觀光巴士\n備註：沿途欣賞九州風光。", createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "10:20", category: "景點", name: "赤間神宮", notes: "參拜擁有鮮豔朱紅色水天門的赤間神宮，感受源平合戰歷史氛圍。\n交通方式：步行", createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "12:00", category: "景點", name: "北九州門司港站 (自由活動)", notes: "欣賞大正浪漫風情的紅磚洋館與海港景色。\n交通方式：步行", createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "12:15", category: "飲食", name: "午餐：門司港燒咖哩", notes: "把握 1 小時自由活動時間，就近品嚐門司港名物「燒咖哩」。\n交通方式：步行", createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "13:10", category: "景點", name: "小倉城 (自由活動)", notes: "漫步於擁有四百多年歷史的小倉城周邊，欣賞天守閣之美。\n交通方式：步行", createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "15:00", category: "景點", name: "河內藤園 (自由活動)", notes: "漫步於夢幻的紫藤瀑布隧道，親身感受宛如避鬼結界的震撼美景。\n交通方式：步行\n備註：把握 1 小時盡情拍照留念。", tags: ["絕景"], createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "16:15", category: "交通", name: "啟程回福岡", notes: "結束豐富的行程，搭乘專車返回博多市區。\n交通方式：觀光巴士", createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "18:30", category: "飲食", name: "晚餐：香料湯咖哩", notes: "推薦「Soup Curry Samurai.」，享受充滿野菜營養且暖胃的辛香美味。\n交通方式：步行 / 地鐵 (約 10 分鐘)", tags: ["必吃清單"], createdAt: new Date().toISOString() }
                    ]
                },
                {
                    id: 4, title: "質感選物與牛腸鍋", date: "4/30",
                    items: [
                        { id: Storage.generateId(), time: "08:30", category: "交通", name: "前往 Lalaport 福岡", notes: "從博多搭乘 JR 鹿兒島本線至「竹下站」，出站步行抵達。\n交通方式：JR (乘車 3 分鐘，步行 9 分鐘)\n備註：早點抵達人少好逛，可好好欣賞鋼彈。", createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "09:00", category: "景點", name: "Lalaport 鋼彈巡禮", notes: "觀看 1:1 實物大鋼彈，並進行伴手禮與服飾採買。\n交通方式：步行", createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "11:30", category: "交通", name: "前往柳橋連合市場", notes: "竹下站搭 JR 回博多，轉乘西鐵巴士 (如 9, 11 路線) 至「柳橋」站。\n交通方式：JR + 巴士 (約 25 分鐘)", createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "12:00", category: "購物", name: "柳橋連合市場", notes: "走訪「博多廚房」，選購高品質昆布、高湯包與優質乾麵條。\n交通方式：步行\n備註：帶些好食材回家，日後親自下廚煮麵時能完美重現日本風味。", tags: ["博多廚房"], createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "13:00", category: "交通", name: "前往天神商圈", notes: "從市場步行至「渡邊通站」，搭乘地下鐵七隈線至「天神南站」。\n交通方式：地鐵 (乘車 2 分鐘，步行 5 分鐘)", createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "13:15", category: "飲食", name: "午餐：精緻握壽司", notes: "推薦天神排隊名店「ひょうたん寿司 (瓢箪壽司)」。\n交通方式：步行", tags: ["必吃清單"], createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "14:30", category: "購物", name: "天神商圈家具選物", notes: "逛逛 BiVi 福岡、D&Department 等大型生活美學商場與地下街。\n交通方式：步行\n備註：趁空檔為家裡的次臥與書房收納空間找尋實用的層架佈置靈感。", createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "17:15", category: "交通", name: "準備前往晚餐地點", notes: "餐廳位於天神核心區，從商圈直接步行前往即可，不需轉乘。\n交通方式：步行 (約 5-10 分鐘)\n備註：動線極度順暢。", createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "17:30", category: "飲食", name: "晚餐：元祖もつ鍋楽天地 (已訂位)", notes: "享用福岡最具代表性的牛腸鍋，滿滿韭菜與牛腸絕配。\n交通方式：步行\n備註：📍 餐廳地址：福岡市中央區天神1-10-14", tags: ["已訂位", "必吃清單"], createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "19:30", category: "景點", name: "天神/中洲夜間散策", notes: "飯後散步消化，沿著那珂川感受迷人的屋台氛圍。\n交通方式：步行", createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "21:00", category: "飲食", name: "宵夜：博多豚骨拉麵", notes: "推薦鄰近的「Shin-Shin 天神本店」，以道地豚骨湯頭為旅程畫下完美句點！\n交通方式：步行 (約 5 分鐘)", tags: ["必吃清單"], createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "22:00", category: "交通", name: "返回飯店", notes: "搭乘地下鐵空港線從「天神站」直達博多站。\n交通方式：地鐵 (乘車 6 分鐘)", createdAt: new Date().toISOString() }
                    ]
                },
                {
                    id: 5, title: "滿載而歸", date: "5/1",
                    items: [
                        { id: Storage.generateId(), time: "07:30", category: "飲食", name: "早餐", notes: "飯店內享用或便利商店簡單購買。\n交通方式：步行", createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "08:15", category: "交通", name: "前往福岡機場", notes: "辦理退房，搭乘地下鐵空港線直達機場。\n交通方式：地鐵 (乘車約 10 分鐘)", createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "08:45", category: "景點", name: "機場免稅店 & 登機", notes: "辦理 IT241 報到手續，在免稅店做最後衝刺，帶著飽滿的能量準備登機。\n交通方式：步行\n備註：回程為 tigersmart 方案。", tags: ["航班確認"], createdAt: new Date().toISOString() },
                        { id: Storage.generateId(), time: "10:55", category: "交通", name: "飛往桃園 (IT241)", notes: "搭乘航班 IT241 返回台灣，抵達桃園機場 T1。\n交通方式：飛機 (航程約 2 小時 30 分)\n備註：帶著滿滿的回憶平安返家！", tags: ["航班確認"], createdAt: new Date().toISOString() }
                    ]
                }
            ];
            this.save(initialData);
            console.log("Seeded personalized Fukuoka trip data.");
        }
    };
}
