import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { notifications } from '../services/api';

export default function Notifications() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);

  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notifications.getNotifications(user?.id);
      setNotifs(res.data?.data || res.data?.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notifications.markAsRead(id);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notifications.markAllAsRead();
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  // Group notifications by date roughly
  const grouped = notifs.reduce((acc, notif) => {
    const date = new Date(notif.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let group = 'Earlier';
    if (date.toDateString() === today.toDateString()) {
      group = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      group = 'Yesterday';
    }

    if (!acc[group]) acc[group] = [];
    acc[group].push(notif);
    return acc;
  }, {});

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);

    if (diffMins < 1) return t('common.just_now', 'Just now');
    if (diffMins < 60) return `${diffMins} ${t('common.mins_ago', 'min ago')}`;
    if (diffHrs < 24) return `${diffHrs} ${t('common.hours_ago', 'hr ago')}`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-10">
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-xl font-bold text-dark">{t('notifications.title', 'Notifications')}</h1>
        {notifs.some(n => !n.is_read) && (
          <button 
            onClick={handleMarkAllRead}
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            {t('notifications.mark_all_read', 'Mark all as read')}
          </button>
        )}
      </div>

      <div className="max-w-3xl mx-auto p-4">
        {loading ? (
          <div className="space-y-4 mt-4">
            {[1,2,3,4].map(n => (
              <div key={n} className="h-20 bg-white rounded-xl border border-gray-100 animate-pulse"></div>
            ))}
          </div>
        ) : notifs.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow-sm text-center border border-gray-100 mt-8">
            <div className="text-4xl mb-3 text-gray-300">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">{t('notifications.empty', 'No notifications yet')}</h3>
            <p className="text-gray-500 mt-1">{t('notifications.empty_desc', "We'll let you know when there's an update.")}</p>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {['Today', 'Yesterday', 'Earlier'].map(group => {
              if (!grouped[group] || grouped[group].length === 0) return null;
              return (
                <div key={group}>
                  <h2 className="text-sm font-bold text-gray-500 mb-3 px-2">
                    {group === 'Today' ? t('common.today', 'Today') : 
                     group === 'Yesterday' ? t('common.yesterday', 'Yesterday') : 
                     t('common.earlier', 'Earlier')}
                  </h2>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {grouped[group].map((notif, index) => (
                      <div 
                        key={notif.id}
                        onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                        className={`p-4 flex gap-4 cursor-pointer transition ${
                          !notif.is_read ? 'bg-primary-50 border-l-4 border-l-primary-500' : 'bg-white'
                        } ${index !== grouped[group].length - 1 ? 'border-b border-gray-100' : ''}`}
                      >
                        <div className="flex-1">
                          <p className={`text-sm md:text-base ${!notif.is_read ? 'font-bold text-dark' : 'text-gray-700'}`}>
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{formatTime(notif.created_at)}</p>
                        </div>
                        {!notif.is_read && (
                          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary-600 mt-2"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
