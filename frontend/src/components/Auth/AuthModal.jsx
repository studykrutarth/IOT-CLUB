import React, { useState } from 'react';
import Login from './Login.jsx';
import Signup from './Signup.jsx';

function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all"
        >
          ✕
        </button>

        {mode === 'login' ? (
          <Login onClose={onClose} onSwitchToSignup={() => setMode('signup')} />
        ) : (
          <Signup onClose={onClose} onSwitchToLogin={() => setMode('login')} />
        )}
      </div>
    </div>
  );
}

export default AuthModal;
