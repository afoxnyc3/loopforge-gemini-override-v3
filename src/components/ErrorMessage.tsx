import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorMessage({ message, onRetry, onDismiss }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="card p-6 border-red-500/40 bg-red-500/10 flex flex-col items-center gap-4 text-center animate-fade-in"
    >
      <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
        <svg
          className="w-6 h-6 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <div>
        <h3 className="text-red-300 font-semibold mb-1">Something went wrong</h3>
        <p className="text-white/70 text-sm">{message}</p>
      </div>
      <div className="flex gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-primary bg-red-500 hover:bg-red-400 focus:ring-red-400 text-sm px-4 py-2"
          >
            Try Again
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-white/60 hover:text-white text-sm px-4 py-2 rounded-xl
                       border border-white/20 hover:border-white/40 transition-colors"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
