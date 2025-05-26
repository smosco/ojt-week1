import useToastStore from '../../stores/useToastStore';

export default function ToastManager() {
  const { toasts } = useToastStore();

  return (
    <div className='fixed top-10 right-8 z-10 flex flex-col gap-2'>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          // TODO: 토스트 애니메이션 추가
          className={`
            px-6 py-4 rounded-xl shadow-md text-white text-xl transition transform
            ${
              toast.type === 'success'
                ? 'bg-green-400'
                : toast.type === 'error'
                  ? 'bg-red-400'
                  : 'bg-blue-400'
            }
          `}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
