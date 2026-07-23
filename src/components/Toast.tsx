interface ToastProps {
  mensagem: string;
}

export function Toast({ mensagem }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="toast fixed left-1/2 bottom-24 z-50 -translate-x-1/2 px-4 py-2 rounded-full bg-slate-100 text-slate-900 text-sm font-medium shadow-lg"
    >
      {mensagem}
    </div>
  );
}
