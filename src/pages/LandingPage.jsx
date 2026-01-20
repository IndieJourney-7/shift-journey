import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Target, Brain, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui';
import { Navbar } from '../components/layout';
import { JourneyPath } from '../components/journey';

// Mock milestones for hero section
const heroMilestones = [
  { id: 1, number: 1, title: 'Define MVP', status: 'completed' },
  { id: 2, number: 2, title: 'Design System', status: 'completed' },
  { id: 3, number: 3, title: 'Write login logic', status: 'locked', promise: { deadline: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString() } },
  { id: 4, number: 4, title: 'Build API', status: 'pending' },
  { id: 5, number: 5, title: 'Launch', status: 'pending' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-obsidian-950 noise-bg">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-radial opacity-50" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
                <span className="text-obsidian-100">LOCK IN </span>
                <span className="text-obsidian-400">YOUR</span>
                <br />
                <span className="text-obsidian-100">JOURNEY</span>
              </h1>

              <p className="text-obsidian-400 text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0">
                Set goals and lock promises you can't back out of.
              </p>

              <Link to="/login">
                <Button variant="primary" size="lg" className="min-w-[180px] sm:min-w-[200px]">
                  Start Your Journey
                </Button>
              </Link>
            </div>

            {/* Right: Journey Visualization */}
            <div className="relative mt-8 lg:mt-0">
              {/* Top Text - Above the journey path */}
              <div className="hidden lg:block text-right mb-6">
                <p className="text-obsidian-100 text-sm leading-relaxed">
                  Break big goals into milestones.
                  <br />
                  Make short promises. Lock each one
                  <br />
                  in with a <span className="text-white font-medium">consequence</span> if you fail.
                </p>
              </div>

              {/* Mobile description text */}
              <div className="lg:hidden text-center mb-6">
                <p className="text-obsidian-100 text-sm leading-relaxed">
                  Break big goals into milestones. Lock each one with a <span className="text-white font-medium">consequence</span>.
                </p>
              </div>

              {/* Journey Path */}
              <div className="flex justify-center overflow-x-auto pb-4">
                <JourneyPath milestones={heroMilestones} showGoal={true} />
              </div>

              {/* Current Promise Card - Below the journey path */}
              <div className="flex justify-center mt-6 sm:mt-8">
                <div className="w-full max-w-[280px] sm:w-72">
                  <div className="bg-obsidian-800/90 border border-obsidian-600 rounded-lg p-3 sm:p-4 backdrop-blur-sm shadow-xl">
                    <div className="text-obsidian-400 text-xs mb-1">Current Promise</div>
                    <h3 className="text-obsidian-100 font-semibold text-sm sm:text-base mb-2">Milestone Promise</h3>
                    <p className="text-obsidian-300 text-xs sm:text-sm mb-2">Write login logic</p>
                    <p className="text-obsidian-400 text-xs sm:text-sm mb-2 sm:mb-3">Due: Today, 9:00 PM</p>
                    <div className="text-obsidian-500 text-xs sm:text-sm font-medium tracking-wide">
                      LOCKED
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-obsidian-700" />
          <h2 className="text-obsidian-300 text-sm sm:text-base lg:text-lg font-medium text-center whitespace-nowrap">No Escape, Only Progress</h2>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-obsidian-700" />
        </div>
      </div>

      {/* Features Section */}
      <section className="py-10 sm:py-12 lg:py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="text-center p-4 sm:p-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 rounded-full bg-obsidian-800 border border-obsidian-600 flex items-center justify-center">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-obsidian-400" />
              </div>
              <h3 className="text-obsidian-200 font-semibold text-sm sm:text-base mb-2">
                Break Free <span className="text-obsidian-500 font-normal">from Excuses</span>
              </h3>
              <p className="text-obsidian-500 text-xs sm:text-sm">
                Hold yourself bringing in consistency.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-4 sm:p-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 rounded-full bg-obsidian-800 border border-obsidian-600 flex items-center justify-center">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-obsidian-400" />
              </div>
              <h3 className="text-obsidian-200 font-semibold text-sm sm:text-base mb-2">
                Track Promises, <span className="text-obsidian-500 font-normal">Not Tasks</span>
              </h3>
              <p className="text-obsidian-500 text-xs sm:text-sm">
                Hold, break, important, account for things.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-4 sm:p-6 sm:col-span-2 md:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 rounded-full bg-obsidian-800 border border-obsidian-600 flex items-center justify-center">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-obsidian-400" />
              </div>
              <h3 className="text-obsidian-200 font-semibold text-sm sm:text-base mb-2">
                Remember, <span className="text-obsidian-500 font-normal">Never Delete</span>
              </h3>
              <p className="text-obsidian-500 text-xs sm:text-sm">
                From Maintaining shift to diverse positions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 px-4 bg-obsidian-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-obsidian-100 mb-3 sm:mb-4">
              No Escape, Only Progress
            </h2>
            <p className="text-obsidian-400 text-sm sm:text-base max-w-2xl mx-auto px-4">
              Shift Ascent locks your goals into a journey with promises you have to keep. Here's how it works.
            </p>
          </div>

          {/* Journey illustration */}
          <div className="flex justify-center mb-8 sm:mb-12 overflow-x-auto pb-4">
            <JourneyPath
              milestones={[
                { id: 1, status: 'completed' },
                { id: 2, status: 'completed' },
                { id: 3, status: 'locked' },
                { id: 4, status: 'pending' },
                { id: 5, status: 'pending' },
              ]}
              showGoal={true}
            />
          </div>

          {/* Steps */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 text-center">
            <div className="p-4 sm:p-6">
              <div className="text-gold-500 text-xl sm:text-2xl font-bold mb-2 sm:mb-3">1</div>
              <h3 className="text-obsidian-100 font-semibold text-base sm:text-lg mb-2 sm:mb-3">Break It Down</h3>
              <p className="text-obsidian-400 text-xs sm:text-sm">
                Take your big goal and break it down into small, clear milestones.
              </p>
            </div>

            <div className="p-4 sm:p-6">
              <div className="text-gold-500 text-xl sm:text-2xl font-bold mb-2 sm:mb-3">2</div>
              <h3 className="text-obsidian-100 font-semibold text-base sm:text-lg mb-2 sm:mb-3">Lock Each Promise</h3>
              <p className="text-obsidian-400 text-xs sm:text-sm">
                Make short, specific promises for each milestone and lock each one in with a consequence you choose.
              </p>
            </div>

            <div className="p-4 sm:p-6 sm:col-span-2 md:col-span-1">
              <div className="text-gold-500 text-xl sm:text-2xl font-bold mb-2 sm:mb-3">3</div>
              <h3 className="text-obsidian-100 font-semibold text-base sm:text-lg mb-2 sm:mb-3">Commit Without Escape</h3>
              <p className="text-obsidian-400 text-xs sm:text-sm">
                Once you lock a promise, there's no editing, skipping or deleting. Break it, and write down why you failed.
              </p>
            </div>
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <p className="text-obsidian-300 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 px-4">
              Shift Ascent isn't just another task manager. It's a commitment system that won't let you off the hook.
            </p>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Start Your Journey
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            {/* Decorative line */}
            <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-obsidian-100 mt-8 sm:mt-12 mb-3 sm:mb-4">
            Track Now - Start Free
          </h2>
          <p className="text-obsidian-400 text-sm sm:text-base mb-6 sm:mb-8">
            Begin your journey of accountability today.
          </p>
          <Link to="/login">
            <Button variant="gold" size="lg" icon={ChevronRight} iconPosition="right">
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 border-t border-obsidian-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6">
              <svg viewBox="0 0 32 32" className="w-full h-full">
                <circle cx="16" cy="16" r="14" fill="#1a1a1a" stroke="#c9a962" strokeWidth="1" />
                <path d="M10 18 Q16 10 22 18" stroke="#c9a962" strokeWidth="1.5" fill="none" />
              </svg>
            </div>
            <span className="text-obsidian-500 text-xs sm:text-sm">Shift Ascent</span>
          </div>
          <div className="text-obsidian-600 text-xs sm:text-sm">
            © 2024 Shift Ascent. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
