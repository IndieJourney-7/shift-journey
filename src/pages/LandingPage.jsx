import { Link } from 'react-router-dom';
import { Lock, Target, Shield, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../components/ui';
import { Navbar } from '../components/layout';
import { JourneyPath } from '../components/journey';

// Demo milestones for hero section
const heroMilestones = [
  { id: 1, number: 1, title: 'Research market', status: 'completed' },
  { id: 2, number: 2, title: 'Build MVP', status: 'completed' },
  { id: 3, number: 3, title: 'Launch beta', status: 'locked', promise: { deadline: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString() } },
  { id: 4, number: 4, title: 'Get 100 users', status: 'pending' },
  { id: 5, number: 5, title: 'Iterate & grow', status: 'pending' },
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
              {/* Tagline */}
              <div className="inline-block mb-4 sm:mb-6">
                <span className="text-gold-500 text-xs sm:text-sm font-medium tracking-widest uppercase">
                  Accountability System
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
                <span className="text-obsidian-100">Your Word Is</span>
                <br />
                <span className="text-gold-500">Your Identity</span>
              </h1>

              <p className="text-obsidian-300 text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Lock in promises. Keep them or explain why you didn't.
                Every promise kept builds your integrity score.
                Every broken one reminds you who you chose to be.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link to="/login">
                  <Button variant="gold" size="lg" className="min-w-[180px] sm:min-w-[200px]">
                    Start Building Integrity
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="secondary" size="lg" className="min-w-[180px] sm:min-w-[200px]">
                    See How It Works
                  </Button>
                </a>
              </div>
            </div>

            {/* Right: Journey Visualization */}
            <div className="relative mt-8 lg:mt-0">
              {/* Description */}
              <div className="text-center lg:text-right mb-6">
                <p className="text-obsidian-200 text-sm leading-relaxed">
                  Set a goal. Break it into milestones.
                  <br />
                  <span className="text-gold-500 font-medium">Lock each promise</span> with a deadline.
                  <br />
                  No escape. Only progress.
                </p>
              </div>

              {/* Journey Path */}
              <div className="flex justify-center overflow-x-auto pb-4">
                <JourneyPath milestones={heroMilestones} showGoal={true} />
              </div>

              {/* Integrity Score Card */}
              <div className="flex justify-center mt-6 sm:mt-8">
                <div className="w-full max-w-[300px]">
                  <div className="bg-obsidian-800/90 border border-obsidian-600 rounded-lg p-4 backdrop-blur-sm shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-obsidian-400 text-xs uppercase tracking-wide">Integrity Score</div>
                      <div className="text-gold-500 font-bold text-2xl">87</div>
                    </div>
                    <div className="w-full bg-obsidian-700 rounded-full h-2 mb-3">
                      <div className="bg-gradient-to-r from-gold-600 to-gold-400 h-2 rounded-full" style={{ width: '87%' }} />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-500 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> 12 kept
                      </span>
                      <span className="text-red-400 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> 2 broken
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Divider */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-obsidian-700" />
          <h2 className="text-obsidian-300 text-sm sm:text-base lg:text-lg font-medium text-center whitespace-nowrap px-2">
            Integrity isn't claimed. It's proven.
          </h2>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-obsidian-700" />
        </div>
      </div>

      {/* Core Values Section */}
      <section id="features" className="py-10 sm:py-12 lg:py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-full bg-obsidian-800 border border-obsidian-600 flex items-center justify-center">
                <Target className="w-6 h-6 text-gold-500" />
              </div>
              <h3 className="text-obsidian-100 font-semibold text-base sm:text-lg mb-2">
                Goals Become Promises
              </h3>
              <p className="text-obsidian-400 text-sm">
                Not another task list. Each milestone is a promise to yourself.
                Lock it with a deadline. Make it real.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-full bg-obsidian-800 border border-obsidian-600 flex items-center justify-center">
                <Lock className="w-6 h-6 text-gold-500" />
              </div>
              <h3 className="text-obsidian-100 font-semibold text-base sm:text-lg mb-2">
                No Escape Route
              </h3>
              <p className="text-obsidian-400 text-sm">
                Once locked, you can't edit, skip, or delete.
                Keep the promise or face yourself and explain why you didn't.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-4 sm:p-6 sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-full bg-obsidian-800 border border-obsidian-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-gold-500" />
              </div>
              <h3 className="text-obsidian-100 font-semibold text-base sm:text-lg mb-2">
                Build Your Integrity Score
              </h3>
              <p className="text-obsidian-400 text-sm">
                Every kept promise adds to your score. Every broken one costs more.
                Your score is proof of who you really are.
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
              How Shift Ascent Works
            </h2>
            <p className="text-obsidian-400 text-sm sm:text-base max-w-2xl mx-auto px-4">
              A simple system that forces you to take your word seriously.
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
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="p-4 sm:p-6">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center">
                <span className="text-gold-500 font-bold">1</span>
              </div>
              <h3 className="text-obsidian-100 font-semibold text-base mb-2">Set Your Goal</h3>
              <p className="text-obsidian-400 text-sm">
                Define what you want to achieve.
              </p>
            </div>

            <div className="p-4 sm:p-6">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center">
                <span className="text-gold-500 font-bold">2</span>
              </div>
              <h3 className="text-obsidian-100 font-semibold text-base mb-2">Add Milestones</h3>
              <p className="text-obsidian-400 text-sm">
                Break it into small, concrete steps.
              </p>
            </div>

            <div className="p-4 sm:p-6">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center">
                <span className="text-gold-500 font-bold">3</span>
              </div>
              <h3 className="text-obsidian-100 font-semibold text-base mb-2">Lock Your Promise</h3>
              <p className="text-obsidian-400 text-sm">
                Set a deadline. Write a consequence. Lock it in.
              </p>
            </div>

            <div className="p-4 sm:p-6">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center">
                <span className="text-gold-500 font-bold">4</span>
              </div>
              <h3 className="text-obsidian-100 font-semibold text-base mb-2">Keep or Confess</h3>
              <p className="text-obsidian-400 text-sm">
                Complete it before deadline, or explain your failure.
              </p>
            </div>
          </div>

          <div className="text-center mt-10 sm:mt-12">
            <div className="bg-obsidian-800/50 border border-obsidian-700 rounded-xl p-6 sm:p-8 max-w-2xl mx-auto mb-8">
              <p className="text-obsidian-300 text-base sm:text-lg leading-relaxed">
                "This isn't about punishment. It's about <span className="text-gold-500 font-medium">facing yourself</span>.
                Every broken promise is recorded forever. Every kept promise builds the identity of
                someone who <span className="text-obsidian-100 font-medium">does what they say</span>."
              </p>
            </div>
            <Link to="/login">
              <Button variant="primary" size="lg">
                Start Your Journey
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Integrity Score Explanation */}
      <section className="py-12 sm:py-16 lg:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-obsidian-100 mb-3 sm:mb-4">
              Your Integrity Score
            </h2>
            <p className="text-obsidian-400 text-sm sm:text-base max-w-xl mx-auto">
              A number that reflects who you are, not what you wish you were.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            {/* Keep */}
            <div className="bg-obsidian-900/50 border border-obsidian-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-900/30 border border-green-700/50 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h3 className="text-obsidian-100 font-semibold">Promise Kept</h3>
                  <span className="text-green-500 text-sm font-medium">+2 points</span>
                </div>
              </div>
              <p className="text-obsidian-400 text-sm">
                Complete before the deadline. Your word meant something.
                Streak resets. You're building trust with yourself.
              </p>
            </div>

            {/* Break */}
            <div className="bg-obsidian-900/50 border border-obsidian-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-900/30 border border-red-700/50 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-obsidian-100 font-semibold">Promise Broken</h3>
                  <span className="text-red-500 text-sm font-medium">-10 to -20 points</span>
                </div>
              </div>
              <p className="text-obsidian-400 text-sm">
                Miss the deadline or admit failure. Consecutive breaks cost more.
                You must explain why. No hiding from yourself.
              </p>
            </div>
          </div>

          <div className="text-center mt-8 sm:mt-10">
            <div className="inline-flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                <span className="text-obsidian-500">0-30: Unreliable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-obsidian-400">31-70: Inconsistent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gold-500" />
                <span className="text-gold-500">71-100: Reliable</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-obsidian-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-obsidian-100 mb-3 sm:mb-4">
            Start Proving Who You Are
          </h2>
          <p className="text-obsidian-400 text-sm sm:text-base mb-6 sm:mb-8 max-w-lg mx-auto">
            Free to start. No credit card required.
            Just you and your word.
          </p>
          <Link to="/login">
            <Button variant="gold" size="lg" icon={ChevronRight} iconPosition="right">
              Begin Your Journey
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
          <div className="flex items-center gap-4 text-obsidian-600 text-xs sm:text-sm">
            <Link to="/pricing" className="hover:text-obsidian-400 transition-colors">Pricing</Link>
            <span>|</span>
            <span>© 2024 Shift Ascent</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
