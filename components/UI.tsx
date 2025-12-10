import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-xl shadow-md p-4 border border-carmel-beige ${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''} ${className}`}>
    {children}
  </div>
);

interface SectionTitleProps {
  children?: React.ReactNode;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ children }) => (
  <h2 className="text-xl font-serif font-bold text-carmel-brown mb-4 flex items-center gap-2">
    <span className="w-1 h-6 bg-carmel-gold rounded-full"></span>
    {children}
  </h2>
);

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  disabled?: boolean;
}

export const ButtonPrimary: React.FC<ButtonProps> = ({ children, onClick, className = '', disabled = false }) => (
  <button 
    disabled={disabled}
    onClick={onClick} 
    className={`bg-carmel-brown text-white font-sans font-bold py-3 px-6 rounded-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

export const ButtonSecondary: React.FC<ButtonProps> = ({ children, onClick, className = '' }) => (
  <button 
    onClick={onClick} 
    className={`bg-carmel-beige text-carmel-brown border border-carmel-brown font-sans font-bold py-2 px-4 rounded-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${className}`}
  >
    {children}
  </button>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input 
    {...props}
    className="w-full bg-white border border-carmel-gold/50 rounded-lg px-4 py-2 text-carmel-brown placeholder-carmel-brown/50 focus:outline-none focus:ring-2 focus:ring-carmel-gold"
  />
);

interface BadgeProps {
  children?: React.ReactNode;
  color?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'bg-carmel-blue' }) => (
  <span className={`${color} text-carmel-brown text-xs font-bold px-2 py-1 rounded-full`}>
    {children}
  </span>
);

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-2 w-full transition-colors ${active ? 'text-carmel-brown' : 'text-carmel-brown/50'}`}
  >
    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[10px] font-bold mt-1">{label}</span>
  </button>
);