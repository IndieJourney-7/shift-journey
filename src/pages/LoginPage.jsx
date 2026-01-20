import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, ChevronRight } from 'lucide-react';
import { Button, Card, Input } from '../components/ui';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, signUp, currentGoal } = useApp();

  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isSignUp) {
      // Sign up: create new user and redirect to goal creation
      signUp({
        name: formData.name,
        email: formData.email,
      });
      navigate('/goal/create');
    } else {
      // Login: use existing data (demo) and go to dashboard
      login();
      // If user has a goal, go to dashboard; otherwise go to goal creation
      if (currentGoal) {
        navigate('/dashboard');
      } else {
        navigate('/goal/create');
      }
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 noise-bg flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-radial opacity-30" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10">
            <svg viewBox="0 0 32 32" className="w-full h-full">
              <defs>
                <linearGradient id="loginLogoGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c9a962" />
                  <stop offset="100%" stopColor="#d4b978" />
                </linearGradient>
              </defs>
              <circle cx="16" cy="16" r="14" fill="#1a1a1a" stroke="url(#loginLogoGold)" strokeWidth="1.5" />
              <path d="M10 18 Q16 10 22 18" stroke="url(#loginLogoGold)" strokeWidth="2" fill="none" />
              <circle cx="16" cy="12" r="2" fill="url(#loginLogoGold)" />
            </svg>
          </div>
          <span className="text-obsidian-100 font-semibold text-xl">Shift Ascent</span>
        </Link>

        {/* Card */}
        <Card variant="elevated" padding="lg">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-obsidian-100 mb-2">
              {isSignUp ? 'Start Your Journey' : 'Welcome Back'}
            </h1>
            <p className="text-obsidian-400">
              {isSignUp
                ? 'Create an account to begin your commitment journey'
                : 'Sign in to continue your journey'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-obsidian-500" />
                <Input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-obsidian-500" />
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-obsidian-500" />
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="pl-10"
              />
            </div>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full"
              icon={ChevronRight}
              iconPosition="right"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-obsidian-500 text-sm">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-gold-500 hover:text-gold-400 font-medium"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </Card>

        {/* Info note */}
        <p className="text-center text-obsidian-600 text-sm mt-6">
          {isSignUp
            ? 'Create an account to start your journey with a fresh slate.'
            : 'Sign in to continue with demo data, or sign up to start fresh.'
          }
        </p>
      </div>
    </div>
  );
}
