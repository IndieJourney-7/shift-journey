import { Link, Navigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Lock, Target, Shield, ChevronRight, ChevronDown, CheckCircle, XCircle, Sparkles, Heart, TrendingUp, MessageCircle, BookOpen, Mail } from 'lucide-react';
import { Button } from '../components/ui';
import { Navbar } from '../components/layout';
import { JourneyPath } from '../components/journey';
import { useApp } from '../context/AppContext';

// Demo milestones for hero section
const heroMilestones = [
  { id: 1, number: 1, title: 'Research market', status: 'completed' },
  { id: 2, number: 2, title: 'Build MVP', status: 'completed' },
  { id: 3, number: 3, title: 'Launch beta', status: 'locked', promise: { deadline: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString() } },
  { id: 4, number: 4, title: 'Get 100 users', status: 'pending' },
  { id: 5, number: 5, title: 'Iterate & grow', status: 'pending' },
];

// Testimonials data
const testimonials = [
  {
    name: 'Alex',
    initials: 'A',
    score: 92,
    quote: "I went from inconsistent gym habits to a 92 integrity score—now I trust myself like never before.",
    highlight: 'gym habits'
  },
  {
    name: 'Jordan',
    initials: 'J',
    score: 78,
    quote: "Breaking promises used to crush me; now confessions turn them into lessons. This app reignited my self-belief.",
    highlight: 'self-belief'
  },
  {
    name: 'Maya',
    initials: 'M',
    score: 85,
    quote: "Finally, a system that holds me accountable without judgment. My career goals are actually happening now.",
    highlight: 'career goals'
  }
];

// FAQ data
const faqItems = [
  {
    question: "How does facing my confessions build unshakable confidence?",
    answer: "When you admit a broken promise, you're choosing honesty over hiding. This simple act of self-accountability rewires your brain to trust your own words again. Each confession is a stepping stone, not a stumbling block—proof that you're committed to growth, even when it's hard."
  },
  {
    question: "What if I keep breaking promises? Will my score ever recover?",
    answer: "Absolutely. Your integrity score reflects your journey, not your past mistakes. Every kept promise adds +2 points, and consistency rebuilds momentum. Many users have climbed from 'Unreliable' to 'Reliable' in weeks. The key is starting small and staying honest."
  },
  {
    question: "Is this app about punishment or motivation?",
    answer: "Neither—it's about truth. We don't punish you; we help you see yourself clearly. The point deductions for broken promises aren't penalties; they're honest reflections. And the pride you feel when your score rises? That's your authentic self-trust growing."
  },
  {
    question: "Can I use Shift Ascent for any type of goal?",
    answer: "Yes! Whether it's fitness, career milestones, learning a new skill, building relationships, or breaking bad habits—if you can promise it, you can track it. The system adapts to your life, not the other way around."
  }
];

// Scroll animation hook
function useScrollAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
}

// FAQ Accordion Item Component
function FAQItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="border border-obsidian-700 rounded-lg overflow-hidden transition-all duration-300 hover:border-amber-500/30">
      <button
        onClick={onClick}
        className="w-full px-5 py-4 flex items-center justify-between text-left bg-obsidian-800/50 hover:bg-obsidian-800 transition-colors"
      >
        <span className="text-obsidian-100 font-medium pr-4">{question}</span>
        <ChevronDown 
          className={`w-5 h-5 text-amber-500 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
        <p className="px-5 py-4 text-obsidian-400 text-sm leading-relaxed bg-obsidian-900/30">
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { user, isLoading, currentGoal, needsGoalSetup, goalHistory, isSignedIn } = useApp();
  const [openFAQ, setOpenFAQ] = useState(null);
  const [heroRef, heroVisible] = useScrollAnimation();
  const [whyRef, whyVisible] = useScrollAnimation();
  const [testimonialsRef, testimonialsVisible] = useScrollAnimation();
  const [faqRef, faqVisible] = useScrollAnimation();

  // If OAuth hash is detected in URL, redirect to auth callback immediately
  // This handles edge cases where OAuth redirects to root with hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && (hash.includes('access_token') || hash.includes('error'))) {
      console.log('OAuth hash detected on landing page, redirecting to auth callback...');
      window.location.replace(`${window.location.origin}/auth/callback${hash}`);
    }
  }, []);

  // Redirect authenticated (Google signed-in) users to the appropriate page
  // Only redirect if user is signed in with Google (not anonymous)
  if (!isLoading && isSignedIn && user) {
    // If user has completed a goal but has no current goal, redirect to history
    const hasCompletedGoal = goalHistory && goalHistory.length > 0;
    if (hasCompletedGoal && !currentGoal) {
      return <Navigate to="/history" replace />;
    }
    // If no goal exists and no history, redirect to goal creation
    if (needsGoalSetup) {
      return <Navigate to="/goal/create" replace />;
    }
    // If goal exists, go to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading while checking auth state to prevent flash of landing page
  if (isLoading) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-obsidian-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian-950 noise-bg">
      <Navbar />

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="pt-20 sm:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 relative overflow-hidden"
      >
        {/* Background gradient with warm accent */}
        <div className="absolute inset-0 gradient-radial opacity-50" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

        <div className={`max-w-7xl mx-auto relative z-10 transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left">
              {/* Tagline */}
              <div className="inline-block mb-4 sm:mb-6">
                <span className="text-amber-400 text-xs sm:text-sm font-medium tracking-widest uppercase flex items-center gap-2 justify-center lg:justify-start">
                  <Sparkles className="w-4 h-4" />
                  Transform Your Self-Trust
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
                <span className="text-obsidian-100">Reclaim Your</span>
                <br />
                <span className="bg-gradient-to-r from-gold-500 to-amber-400 bg-clip-text text-transparent">Self-Trust</span>
              </h1>

              <p className="text-obsidian-200 text-lg sm:text-xl md:text-2xl mb-4 font-medium">
                Turn Promises into Proof of Who You Truly Are
              </p>

              <p className="text-obsidian-400 text-base sm:text-lg mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Imagine waking up <span className="text-obsidian-200">knowing you can rely on yourself</span>—no more excuses, no more regrets. 
                Shift Ascent isn't just a tool; it's your path to becoming the person who <span className="text-amber-400">shows up, every time</span>. 
                Feel the weight lift as your integrity score climbs.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link to="/login">
                  <Button variant="gold" size="lg" className="min-w-[180px] sm:min-w-[200px] group relative overflow-hidden">
                    <span className="relative z-10 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Ignite Your Integrity
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-gold-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="secondary" size="lg" className="min-w-[180px] sm:min-w-[200px]">
                    See How It Works
                  </Button>
                </a>
              </div>

              {/* Trust indicators */}
              <div className="mt-6 flex items-center gap-4 text-xs text-obsidian-500 justify-center lg:justify-start">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" /> Free to start
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" /> No credit card
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" /> Just you & your word
                </span>
              </div>
            </div>

            {/* Right: Journey Visualization */}
            <div className="relative mt-8 lg:mt-0">
              {/* Description */}
              <div className="text-center lg:text-right mb-6">
                <p className="text-obsidian-200 text-sm leading-relaxed">
                  Set a goal. Break it into milestones.
                  <br />
                  <span className="text-amber-400 font-medium">Lock each promise</span> with a deadline.
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
                  <div className="bg-obsidian-800/90 border border-obsidian-600 rounded-lg p-4 backdrop-blur-sm shadow-xl hover:border-amber-500/30 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-obsidian-400 text-xs uppercase tracking-wide">Integrity Score</div>
                      <div className="text-gold-500 font-bold text-2xl">87</div>
                    </div>
                    <div className="w-full bg-obsidian-700 rounded-full h-2.5 mb-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-gold-600 via-amber-500 to-gold-400 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: heroVisible ? '87%' : '0%' }} 
                      />
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
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-obsidian-700" />
          <h2 className="text-obsidian-300 text-sm sm:text-base lg:text-lg font-medium text-center whitespace-nowrap px-2">
            Integrity isn't claimed. <span className="text-amber-400">It's proven.</span>
          </h2>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-amber-500/20 to-obsidian-700" />
        </div>
      </div>

      {/* Core Values Section */}
      <section id="features" className="py-10 sm:py-12 lg:py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="text-center p-4 sm:p-6 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-full bg-obsidian-800 border border-obsidian-600 flex items-center justify-center group-hover:border-amber-500/50 transition-colors duration-300">
                <Target className="w-6 h-6 text-gold-500 group-hover:text-amber-400 transition-colors" />
              </div>
              <h3 className="text-obsidian-100 font-semibold text-base sm:text-lg mb-2">
                Dreams Become Commitments
              </h3>
              <p className="text-obsidian-400 text-sm">
                Not another forgotten task list. Each milestone is a <span className="text-amber-400">promise to yourself</span>—locked with a deadline, fueled by purpose.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-4 sm:p-6 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-full bg-obsidian-800 border border-obsidian-600 flex items-center justify-center group-hover:border-amber-500/50 transition-colors duration-300">
                <Lock className="w-6 h-6 text-gold-500 group-hover:text-amber-400 transition-colors" />
              </div>
              <h3 className="text-obsidian-100 font-semibold text-base sm:text-lg mb-2">
                No Escape, Only Growth
              </h3>
              <p className="text-obsidian-400 text-sm">
                Once locked, there's no editing or deleting. <span className="text-amber-400">Honor your word</span> or face yourself honestly. That's where transformation happens.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-4 sm:p-6 sm:col-span-2 md:col-span-1 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-full bg-obsidian-800 border border-obsidian-600 flex items-center justify-center group-hover:border-amber-500/50 transition-colors duration-300">
                <Shield className="w-6 h-6 text-gold-500 group-hover:text-amber-400 transition-colors" />
              </div>
              <h3 className="text-obsidian-100 font-semibold text-base sm:text-lg mb-2">
                Watch Your Identity Rise
              </h3>
              <p className="text-obsidian-400 text-sm">
                Your integrity score isn't just a number—it's <span className="text-amber-400">proof of who you're becoming</span>. Every kept promise builds unshakable self-trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Shift Ascent - Sarah's Story */}
      <section 
        ref={whyRef}
        className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-b from-obsidian-900/30 via-obsidian-900/50 to-obsidian-900/30"
      >
        <div className={`max-w-4xl mx-auto transition-all duration-1000 ${whyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-amber-400 text-xs sm:text-sm font-medium tracking-widest uppercase flex items-center gap-2 justify-center mb-4">
              <Heart className="w-4 h-4" />
              Why Shift Ascent?
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-obsidian-100 mb-4">
              Real Transformation, <span className="text-amber-400">Real Lives</span>
            </h2>
          </div>

          {/* Sarah's Story Card */}
          <div className="bg-obsidian-800/60 border border-obsidian-700 rounded-2xl p-6 sm:p-8 lg:p-10 backdrop-blur-sm hover:border-amber-500/30 transition-all duration-300">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-center">
              {/* Avatar/Icon */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-500/20 to-gold-500/20 border-2 border-amber-500/30 flex items-center justify-center">
                  <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400" />
                </div>
              </div>

              {/* Story Content */}
              <div className="text-center lg:text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-obsidian-100 mb-3">
                  Meet Sarah: From Flaking to <span className="text-amber-400">Finishing</span>
                </h3>
                <p className="text-obsidian-300 text-base sm:text-lg leading-relaxed mb-4">
                  Sarah used to set fitness goals every January—and abandon them by February. Sound familiar? 
                  Then she discovered Shift Ascent. By locking in <span className="text-obsidian-100">small weekly promises</span> and 
                  watching her integrity score climb from 23 to 89, something shifted. 
                </p>
                <p className="text-obsidian-400 text-sm sm:text-base leading-relaxed mb-6">
                  Six months later, she crossed her first marathon finish line. Not because the app forced her—but because 
                  <span className="text-amber-400"> she finally trusted herself to show up</span>.
                </p>

                {/* Score Progress */}
                <div className="bg-obsidian-900/50 rounded-lg p-4 inline-block">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-obsidian-500">
                      <span className="text-red-400 font-bold">23</span> → 
                    </div>
                    <div className="w-24 sm:w-32 bg-obsidian-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-red-500 via-amber-500 to-green-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: whyVisible ? '89%' : '23%' }}
                      />
                    </div>
                    <div className="text-green-500 font-bold">89</div>
                  </div>
                  <p className="text-obsidian-500 text-xs mt-2">Sarah's 6-month integrity journey</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-obsidian-100 mb-3 sm:mb-4">
              How Shift Ascent <span className="text-amber-400">Ignites</span> Your Journey
            </h2>
            <p className="text-obsidian-300 text-sm sm:text-base max-w-2xl mx-auto px-4 leading-relaxed">
              We've all been there: setting goals with excitement, only to watch them fade. 
              Shift Ascent changes that by <span className="text-amber-400">sparking the fire within</span>—locking in your commitments so you rise above the doubt.
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
            <div className="p-4 sm:p-6 group">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                <span className="text-amber-400 font-bold">1</span>
              </div>
              <h3 className="text-obsidian-100 font-semibold text-base mb-2">Dream It</h3>
              <p className="text-obsidian-400 text-sm">
                Define the future you want to create.
              </p>
            </div>

            <div className="p-4 sm:p-6 group">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                <span className="text-amber-400 font-bold">2</span>
              </div>
              <h3 className="text-obsidian-100 font-semibold text-base mb-2">Break It Down</h3>
              <p className="text-obsidian-400 text-sm">
                Turn big dreams into achievable milestones.
              </p>
            </div>

            <div className="p-4 sm:p-6 group">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                <span className="text-amber-400 font-bold">3</span>
              </div>
              <h3 className="text-obsidian-100 font-semibold text-base mb-2">Lock Your Word</h3>
              <p className="text-obsidian-400 text-sm">
                Set a deadline. Make it unbreakable.
              </p>
            </div>

            <div className="p-4 sm:p-6 group">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                <span className="text-amber-400 font-bold">4</span>
              </div>
              <h3 className="text-obsidian-100 font-semibold text-base mb-2">Rise or Reflect</h3>
              <p className="text-obsidian-400 text-sm">
                Keep it and soar, or confess and learn.
              </p>
            </div>
          </div>

          <div className="text-center mt-10 sm:mt-12">
            <div className="bg-obsidian-800/50 border border-amber-500/20 rounded-xl p-6 sm:p-8 max-w-2xl mx-auto mb-8">
              <p className="text-obsidian-300 text-base sm:text-lg leading-relaxed">
                "This isn't about punishment. It's about <span className="text-amber-400 font-medium">becoming who you want to be</span>.
                Every kept promise is a brick in the foundation of your self-trust. Every honest confession is 
                <span className="text-obsidian-100 font-medium"> a lesson that makes you stronger</span>."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section 
        ref={testimonialsRef}
        id="testimonials" 
        className="py-12 sm:py-16 lg:py-20 px-4 bg-obsidian-900/30"
      >
        <div className={`max-w-5xl mx-auto transition-all duration-1000 ${testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-amber-400 text-xs sm:text-sm font-medium tracking-widest uppercase flex items-center gap-2 justify-center mb-4">
              <MessageCircle className="w-4 h-4" />
              Real Journeys, Real Sparks
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-obsidian-100 mb-4">
              Voices of <span className="text-amber-400">Transformation</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.name}
                className="bg-obsidian-800/60 border border-obsidian-700 rounded-xl p-5 sm:p-6 hover:border-amber-500/30 transition-all duration-300"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-gold-500 flex items-center justify-center">
                    <span className="text-obsidian-900 font-bold text-sm">{testimonial.initials}</span>
                  </div>
                  <div>
                    <h4 className="text-obsidian-100 font-semibold">{testimonial.name}</h4>
                    <div className="flex items-center gap-1 text-xs">
                      <Shield className="w-3 h-3 text-amber-400" />
                      <span className="text-amber-400">Score: {testimonial.score}</span>
                    </div>
                  </div>
                </div>
                <p className="text-obsidian-300 text-sm leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrity Score Explanation */}
      <section className="py-12 sm:py-16 lg:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-obsidian-100 mb-3 sm:mb-4">
              Your Integrity Score: <span className="text-amber-400">Your Story of Triumph</span>
            </h2>
            <p className="text-obsidian-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              More than a number—it's living proof of your transformation. Start at zero, and with each kept promise, 
              build the momentum that <span className="text-amber-400">radiates into every part of your life</span>.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            {/* Keep */}
            <div className="bg-obsidian-900/50 border border-obsidian-700 rounded-xl p-6 hover:border-green-500/30 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-900/30 border border-green-700/50 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h3 className="text-obsidian-100 font-semibold">Promise Kept</h3>
                  <span className="text-green-500 text-sm font-medium">+2 points of self-trust</span>
                </div>
              </div>
              <p className="text-obsidian-400 text-sm leading-relaxed">
                Cross that finish line before your deadline. Feel the surge of <span className="text-green-400">pride</span> as 
                your word becomes your bond. This is you, proving who you truly are.
              </p>
            </div>

            {/* Break */}
            <div className="bg-obsidian-900/50 border border-obsidian-700 rounded-xl p-6 hover:border-amber-500/30 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-900/30 border border-amber-700/50 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-obsidian-100 font-semibold">Promise Broken → Lesson Learned</h3>
                  <span className="text-amber-500 text-sm font-medium">-10 to -20 points (stepping stones)</span>
                </div>
              </div>
              <p className="text-obsidian-400 text-sm leading-relaxed">
                Missed it? Face it honestly with a confession. <span className="text-amber-400">Turn setbacks into stepping stones</span>. 
                Consecutive breaks cost more—but every confession is a chance to understand yourself deeper.
              </p>
            </div>
          </div>

          <div className="text-center mt-8 sm:mt-10">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-obsidian-800/50 px-3 py-2 rounded-full">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gray-500" />
                <span className="text-obsidian-400">0-30: Finding Your Way</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-obsidian-800/50 px-3 py-2 rounded-full">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500" />
                <span className="text-obsidian-300">31-70: Building Momentum</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-obsidian-800/50 px-3 py-2 rounded-full border border-amber-500/30">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-gold-500 to-amber-400" />
                <span className="text-amber-400 font-medium">71-100: Self-Mastery</span>
              </div>
            </div>
            <p className="text-obsidian-500 text-xs mt-4">
              Reach "Self-Mastery" and feel the pride that radiates into career, relationships, and beyond.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section 
        ref={faqRef}
        id="faq" 
        className="py-12 sm:py-16 lg:py-20 px-4 bg-obsidian-900/30"
      >
        <div className={`max-w-3xl mx-auto transition-all duration-1000 ${faqVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-amber-400 text-xs sm:text-sm font-medium tracking-widest uppercase flex items-center gap-2 justify-center mb-4">
              <Sparkles className="w-4 h-4" />
              Questions & Answers
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-obsidian-100 mb-4">
              Curious? <span className="text-amber-400">We've Got Answers</span>
            </h2>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <FAQItem
                key={index}
                question={item.question}
                answer={item.answer}
                isOpen={openFAQ === index}
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              />
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/help" className="text-amber-400 text-sm hover:text-amber-300 transition-colors inline-flex items-center gap-1">
              View all FAQs <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Teaser Section */}
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-obsidian-800/80 to-obsidian-900/80 border border-obsidian-700 rounded-2xl p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-amber-400" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <span className="text-amber-400 text-xs font-medium tracking-widest uppercase">Coming Soon</span>
                <h3 className="text-xl sm:text-2xl font-bold text-obsidian-100 mt-2 mb-3">
                  The Ascent Blog
                </h3>
                <p className="text-obsidian-400 text-sm mb-4">
                  Stories of transformation, science of habit-building, and wisdom from the journey.
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="text-xs bg-obsidian-700/50 text-obsidian-300 px-3 py-1 rounded-full">
                    "Unlocking Self-Trust: Stories from the Ascent"
                  </span>
                  <span className="text-xs bg-obsidian-700/50 text-obsidian-300 px-3 py-1 rounded-full">
                    "The Psychology of Keeping Promises"
                  </span>
                </div>
              </div>

              {/* Subscribe */}
              <div className="flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Mail className="w-4 h-4 text-obsidian-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="Your email"
                      className="bg-obsidian-900 border border-obsidian-600 rounded-lg pl-9 pr-3 py-2 text-sm text-obsidian-200 placeholder-obsidian-500 focus:outline-none focus:border-amber-500/50 w-40"
                      disabled
                    />
                  </div>
                  <Button variant="secondary" size="sm" disabled className="opacity-50">
                    Notify Me
                  </Button>
                </div>
                <p className="text-obsidian-600 text-xs mt-2 text-center">Coming Q2 2026</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-b from-obsidian-900/30 to-obsidian-950 relative overflow-hidden">
        {/* Warm glow effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-block mb-4">
            <Sparkles className="w-8 h-8 text-amber-400 mx-auto" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-obsidian-100 mb-3 sm:mb-4">
            Tired of Breaking Promises to Yourself?
          </h2>
          <p className="text-obsidian-300 text-base sm:text-lg mb-6 sm:mb-8 max-w-lg mx-auto leading-relaxed">
            Today is the day you start building the self-trust you deserve. 
            Free to start. No credit card required. <span className="text-amber-400">Just you and your word.</span>
          </p>
          <Link to="/login">
            <Button 
              variant="gold" 
              size="lg" 
              icon={Sparkles} 
              iconPosition="left"
              className="group relative overflow-hidden shadow-glow hover:shadow-glow-lg transition-shadow duration-300"
            >
              <span className="relative z-10">Ignite Your Integrity – Begin Free Now</span>
            </Button>
          </Link>
          <p className="text-obsidian-600 text-xs mt-4">
            Join thousands reclaiming their self-trust
          </p>
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
            <Link to="/pricing" className="hover:text-amber-400 transition-colors">Pricing</Link>
            <span>|</span>
            <Link to="/help" className="hover:text-amber-400 transition-colors">Help</Link>
            <span>|</span>
            <span>© 2026 Shift Ascent</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
