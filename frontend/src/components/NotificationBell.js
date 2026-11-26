import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { BellIcon } from '@heroicons/react/24/outline';

function loadReadIds(key) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || '[]');
    return new Set(Array.isArray(value) ? value : []);
  } catch {
    return new Set();
  }
}

export default function NotificationBell({ role, userId, onNavigate }) {
  const storageKey = `epmp.notifications.read.${role}.${userId}`;
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => loadReadIds(storageKey));
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setReadIds(loadReadIds(storageKey));
    let active = true;
    const refresh = () => axios.get('/notifications')
      .then(({ data }) => {
        if (active) {
          setNotifications(Array.isArray(data) ? data : []);
          setError('');
        }
      })
      .catch(() => { if (active) setError('Notifications could not be loaded.'); });

    refresh();
    const timer = window.setInterval(refresh, 60000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [storageKey]);

  const unreadCount = useMemo(() => notifications.filter(item => !readIds.has(item.id)).length, [notifications, readIds]);
  const saveReadIds = next => {
    setReadIds(next);
    window.localStorage.setItem(storageKey, JSON.stringify([...next]));
  };
  const markAllRead = () => saveReadIds(new Set(notifications.map(item => item.id)));
  const openNotification = item => {
    if (!readIds.has(item.id)) {
      const next = new Set(readIds);
      next.add(item.id);
      saveReadIds(next);
    }
    setOpen(false);
    onNavigate(item.destination);
  };

  return (
    <div className="notification-wrap">
      <button className="notification-bell" aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'} aria-expanded={open} aria-controls="notification-panel" onClick={() => setOpen(value => !value)}>
        <BellIcon aria-hidden="true" />
        {unreadCount > 0 && <span className="notification-count">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>
      {open && (
        <section className="notification-panel" id="notification-panel" aria-label="Notifications">
          <header className="notification-panel-heading">
            <div><strong>Notifications</strong><small>{unreadCount ? `${unreadCount} unread` : 'All caught up'}</small></div>
            {unreadCount > 0 && <button onClick={markAllRead}>Mark all read</button>}
          </header>
          {error ? <p className="notification-empty" role="status">{error}</p> : notifications.length === 0 ? (
            <p className="notification-empty">You’re all caught up. New updates will appear here.</p>
          ) : (
            <div className="notification-list">
              {notifications.map(item => (
                <button className={`notification-item${readIds.has(item.id) ? '' : ' unread'}`} key={item.id} onClick={() => openNotification(item)}>
                  <span className="notification-indicator" aria-hidden="true" />
                  <span className="notification-copy">
                    <strong>{item.title}</strong><span>{item.message}</span>
                    {item.createdAt && <small>{new Date(item.createdAt).toLocaleString()}</small>}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
