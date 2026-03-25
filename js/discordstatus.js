/**
 * discordStatus.js — fetches Stillly's Discord presence
 * and updates the avatar, status dot, and activity text.
 * Drop this into your /js/ folder.
 */

const DISCORD_USER_ID = '1224512361793327117';
const API_BASE        = 'https://discorduserstatus-2-0.onrender.com/status';

const STATUS_IMAGES = {
    online:  '/img/online.png',
    idle:    '/img/idle.png',
    dnd:     '/img/dnd.png',
    offline: '/img/offline.png',
};

/** Map a raw status string to a human-readable label shown below the username */
function statusLabel(status) {
    switch (status) {
        case 'online':  return 'Online';
        case 'idle':    return 'Away';
        case 'dnd':     return 'Do Not Disturb';
        default:        return 'Offline';
    }
}

function updatePresence() {
    fetch(`${API_BASE}/${DISCORD_USER_ID}`)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            // --- avatar ---
            const avatarImg = document.querySelector('.avatarImage');
            if (avatarImg && data.avatarUrl) {
                // Bust the browser cache so the avatar always reflects the latest hash
                const bust = data.avatarUrl.includes('?')
                    ? `${data.avatarUrl}&_t=${Date.now()}`
                    : `${data.avatarUrl}?_t=${Date.now()}`;
                avatarImg.src = bust;
            }

            // --- status dot ---
            const statusImg = document.querySelector('.discordStatus');
            if (statusImg) {
                statusImg.src = STATUS_IMAGES[data.status] ?? STATUS_IMAGES.offline;
            }

            // --- activity text ---
            const activityEl = document.getElementById('discordActivityText');
            if (activityEl) {
                // Prefer a rich activity name (e.g. "Playing Roblox"), fall back to status label
                if (data.activities && data.activities.length > 0) {
                    const act = data.activities[0];
                    const verb = act.type === 2 ? 'Listening to' :
                                 act.type === 1 ? 'Streaming'    :
                                 act.type === 3 ? 'Watching'     : 'Playing';
                    activityEl.textContent = `${verb} ${act.name}`;
                } else {
                    activityEl.textContent = statusLabel(data.status);
                }
            }
        })
        .catch(err => {
            console.warn('[discordStatus] fetch failed:', err.message);
            // Show offline state gracefully — don't break the UI
            const statusImg = document.querySelector('.discordStatus');
            if (statusImg) statusImg.src = STATUS_IMAGES.offline;

            const activityEl = document.getElementById('discordActivityText');
            if (activityEl) activityEl.textContent = 'Offline';
        });
}

// Run immediately once the DOM is ready, then poll every 10 s
document.addEventListener('DOMContentLoaded', () => {
    updatePresence();
    setInterval(updatePresence, 10_000);
});
