// Requests permission on first call, then shows notifications for incoming messages

export function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

export function showMessageNotification(senderName: string, message: string, chatId: string) {
    // Don't notify if tab is visible/active
    if (document.visibilityState === 'visible') return;

    // Don't notify if permission not granted
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const body = message.startsWith('📷')
        ? '📷 Sent an image'
        : message.startsWith('📎')
            ? '📎 Sent a file'
            : message;

    const notification = new Notification(`New message from ${senderName}`, {
        body,
        icon: '/favicon.ico',
        tag: chatId,
    });

    // Clicking the notification focuses the tab
    notification.onclick = () => {
        window.focus();
        notification.close();
    };
}

// Updates the browser tab title with unread count
export function updateTabTitle(totalUnread: number) {
    if (totalUnread > 0) {
        document.title = `(${totalUnread}) Radius`;
    } else {
        document.title = 'Radius';
    }
}