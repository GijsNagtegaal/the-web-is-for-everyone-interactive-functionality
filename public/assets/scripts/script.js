/**
 * 1. BACK BUTTON NAVIGATION
 */
const back = document.querySelector('.back');

if (back) {
    back.addEventListener('click', (event) => {
        event.preventDefault();
        if (window.history.length > 1) {
            window.history.back();
        }
    });
}

/**
 * 2. POPOVER & HISTORY LOGIC
 */
const popovers = document.querySelectorAll('.opdracht-popover');
if (popovers.length > 0) {
    popovers.forEach(popover => {
        popover.addEventListener('toggle', (event) => {
            if (event.newState === 'closed') {
                // Remove the hash/anchor from URL when closing popover
                history.replaceState(null, document.title, window.location.pathname + window.location.search);
                
                const list = popover.querySelector('ul');
                if (list) {
                    list.scrollTo({ left: 0 });
                }
            }
        });
    });
}

/**
 * 3. NOTIFICATION LOGIC
 */
const notifyBtn = document.getElementById('notify-btn');

// Show notification specifically when the button is clicked
if (notifyBtn) {
    notifyBtn.addEventListener('click', async () => {
        // Check browser support
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
            return;
        }

        // Request permission if needed
        if (Notification.permission !== "granted") {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                alert("You denied notification permissions!");
                return;
            }
        }

        // Fire immediately on click
        showLocalNotification("Button Clicked!", "You triggered this manually.");
    });
}

/**
 * 4. BACKGROUND / VISIBILITY TRIGGER
 * This makes it fire 2 seconds after the user leaves the site/tab.
 */
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        // User left the tab, wait 2 seconds
        setTimeout(() => {
            // Check permission before trying to fire in background
            if (Notification.permission === "granted") {
                showLocalNotification("We miss you!", "Come back to the PWA!");
            }
        }, 2000);
    }
});

/**
 * 5. THE NOTIFICATION CORE FUNCTION
 */
function showLocalNotification(title, message) {
    // Ensure the Service Worker is registered and ready
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title || 'Hello from your PWA!', {
                body: message || 'This is a local test notification.',
                icon: '/icons/icon-192x192.png', // Ensure this path exists in your public folder!
                vibrate: [200, 100, 200],
                tag: 'pwa-status-alert',        // Replaces old notifications instead of stacking
                renotify: true                  // Vibrates/alerts even if the tag is the same
            });
        }).catch(err => {
            console.error("Service Worker not ready:", err);
        });
    }
}

/**
 * 6. SERVICE WORKER REGISTRATION (Run once on load)
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW registered!', reg))
            .catch(err => console.error('SW registration failed!', err));
    });
}