'use client';

import { useEffect, useState, memo } from 'react';
import { X, Bell, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

function NotificationPopup({ notification, onClose, onMarkAsRead }) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
    }
  }, [notification]);

  if (!notification) return null;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to finish
  };

  const handleClick = async () => {
    await onMarkAsRead(notification.id);
    if (notification.link) {
      router.push(notification.link);
    }
    handleClose();
  };

  return (
    <div
      className={`fixed top-20 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 w-96 max-w-[calc(100vw-2rem)]">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Bell size={20} className="text-blue-600" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="text-sm font-semibold text-gray-900">
                {notification.title}
              </h4>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {notification.message}
            </p>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleClick}
                className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition"
              >
                Lihat Detail
              </button>
              <button
                onClick={async () => {
                  await onMarkAsRead(notification.id);
                  handleClose();
                }}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition flex items-center gap-1"
              >
                <CheckCircle size={14} />
                Tandai Dibaca
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(NotificationPopup);
