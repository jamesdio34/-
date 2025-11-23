import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyle = "font-display font-bold rounded-2xl transition-all active:scale-95 shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1";
  
  const variants = {
    primary: "bg-blue-500 hover:bg-blue-400 text-white border-b-4 border-blue-700",
    secondary: "bg-yellow-400 hover:bg-yellow-300 text-yellow-900 border-b-4 border-yellow-600",
    danger: "bg-red-500 hover:bg-red-400 text-white border-b-4 border-red-700",
    success: "bg-green-500 hover:bg-green-400 text-white border-b-4 border-green-700",
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-6 py-3 text-lg",
    lg: "px-8 py-4 text-2xl",
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-3xl p-6 shadow-xl border-2 border-slate-100 ${className}`}>
      {children}
    </div>
  );
};

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg animate-pop">
         <Card className="border-4 border-blue-400">
            {children}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✖
            </button>
         </Card>
      </div>
    </div>
  );
};

export const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4">
    <div className="w-16 h-16 border-8 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
    <p className="text-xl font-bold text-blue-600 animate-pulse">魔法生成中...</p>
  </div>
);
