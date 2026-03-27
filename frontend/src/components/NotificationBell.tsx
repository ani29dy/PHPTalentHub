import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Notification {
  _id: string;
  sender?: { name: string };
  type: string;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

const NotificationBell = () => {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchNotifs = async () => {
    try {
      const res = await axios.get('/api/notifications', authConfig);
      setNotifications(res.data);
    } catch (err) { }
  };

  useEffect(() => {
    if (user) {
      fetchNotifs();
      // Poll every 30 seconds for real-time feel
      const interval = setInterval(fetchNotifs, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Click outside to close
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await axios.put(`/api/notifications/${id}/read`, {}, authConfig);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read', {}, authConfig);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-slate-400 hover:text-white transition-colors focus:outline-none">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200 overflow-hidden z-50 min-h-[300px]">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0">
            <h3 className="font-bold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs font-semibold text-violet-600 hover:text-violet-700 bg-violet-50 px-2.5 py-1 rounded-md">Mark all read</button>
            )}
          </div>
          
          <div className="max-h-[25rem] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-slate-50 text-2xl flex items-center justify-center rounded-full mb-3">📭</div>
                <p className="text-slate-500 text-sm font-medium">You're all caught up!</p>
                <p className="text-slate-400 text-xs mt-1">Check back later for application updates.</p>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n._id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 items-start ${!n.read ? 'bg-violet-50/30' : ''}`}>
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.read ? 'bg-violet-600 shadow-[0_0_6px_rgba(124,58,237,0.5)]' : 'bg-transparent'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm text-slate-900 ${!n.read ? 'font-bold' : 'font-semibold'}`}>{n.title}</p>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {n.link && (
                        <Link to={n.link} onClick={() => { markAsRead(n._id); setIsOpen(false); }} className="text-xs font-bold text-violet-600 hover:text-violet-700">
                          View details &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
