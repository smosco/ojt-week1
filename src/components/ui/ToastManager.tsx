import { useEffect, useState } from 'react';
import useToastStore from '../../stores/useToastStore';

export default function ToastManager() {
  const { toasts, removeToast } = useToastStore();
  const [visibleToasts, setVisibleToasts] = useState(toasts);

  useEffect(() => {
    setVisibleToasts(toasts);

    // 자동 제거 (2.5초 후)
    toasts.forEach((toast) => {
      setTimeout(() => {
        removeToast(toast.id);
      }, 2500);
    });
  }, [toasts, removeToast]);

  return (
    <div className='fixed top-10 right-6 z-50 flex flex-col gap-4'>
      {visibleToasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-2 px-5 py-4 w-72
            rounded-2xl shadow-lg text-lg font-semibold transition-all duration-300 ease-out
            animate-slide-in
            ${
              toast.type === 'success'
                ? 'bg-green-200 text-green-900'
                : toast.type === 'error'
                  ? 'bg-red-200 text-red-900'
                  : 'bg-blue-200 text-blue-900'
            }
          `}
        >
          <span className='text-2xl'>
            {toast.type === 'success'
              ? '🎉'
              : toast.type === 'error'
                ? '😢'
                : '💡'}
          </span>
          <span className='flex-1 break-words'>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
