import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Lock, ShieldCheck, Gem, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui';
import { Navbar } from '../components/layout';
import { pricingService } from '../services/database';

/**
 * Pricing Page - Fully Dynamic from Database
 *
 * All pricing data is fetched from Supabase pricing_plans table.
 * Admin can control everything from /admin dashboard.
 */

// Icon mapping for plans
const PLAN_ICONS = {
  pledge: Lock,
  keeper: ShieldCheck,
  unbreakable: Gem,
  default: Lock,
};

// Feature display labels (maps feature keys to human-readable text)
const FEATURE_LABELS = {
  basicIntegrity: 'Basic integrity tracking',
  publicShareLinks: 'Public share links',
  communityWitnessing: 'Community witnessing',
  advancedAnalytics: 'Advanced analytics dashboard',
  customConsequences: 'Custom consequences library',
  priorityWitness: 'Priority witness notifications',
  exportJourney: 'Export your journey',
  apiAccess: 'API access',
  prioritySupport: 'Priority support',
  earlyAccess: 'Early access to features',
  customBadges: 'Custom integrity badges',
  teamAccountability: 'Team accountability',
  lifetimeArchive: 'Lifetime failure archive',
  calendarViews: 'Calendar & history views',
};

// Static fallback plans (used when database not configured)
const FALLBACK_PLANS = [
  {
    id: 'pledge',
    name: 'Pledge',
    tagline: 'Make your first promise',
    price_monthly: 0,
    price_yearly: 0,
    discount_percent: 0,
    max_active_goals: 1,
    max_milestones_per_goal: null,
    max_shares_per_month: 5,
    features: {
      basicIntegrity: true,
      publicShareLinks: true,
      communityWitnessing: true,
    },
    is_featured: false,
    badge_text: null,
    cta_text: 'Make Your Pledge',
  },
  {
    id: 'keeper',
    name: 'Keeper',
    tagline: 'Honor every promise',
    price_monthly: 900,
    price_yearly: 7900,
    discount_percent: 27,
    max_active_goals: null,
    max_milestones_per_goal: null,
    max_shares_per_month: null,
    features: {
      basicIntegrity: true,
      publicShareLinks: true,
      communityWitnessing: true,
      advancedAnalytics: true,
      customConsequences: true,
      priorityWitness: true,
      exportJourney: true,
      calendarViews: true,
    },
    is_featured: true,
    badge_text: 'Most Popular',
    cta_text: 'Become a Keeper',
  },
  {
    id: 'unbreakable',
    name: 'Unbreakable',
    tagline: 'Your word is absolute',
    price_monthly: 1900,
    price_yearly: 16600,
    discount_percent: 27,
    max_active_goals: null,
    max_milestones_per_goal: null,
    max_shares_per_month: null,
    features: {
      basicIntegrity: true,
      publicShareLinks: true,
      communityWitnessing: true,
      advancedAnalytics: true,
      customConsequences: true,
      priorityWitness: true,
      exportJourney: true,
      calendarViews: true,
      apiAccess: true,
      prioritySupport: true,
      earlyAccess: true,
      customBadges: true,
      lifetimeArchive: true,
    },
    is_featured: false,
    badge_text: 'Best Value',
    cta_text: 'Go Unbreakable',
  },
];

const faqs = [
  {
    question: 'Can I switch plans anytime?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate the difference.',
  },
  {
    question: 'What happens to my data if I downgrade?',
    answer: 'Your data is never deleted. If you downgrade, older goals become read-only but remain accessible. Your integrity score and history are preserved forever.',
  },
  {
    question: 'Is there a refund policy?',
    answer: 'We offer a 14-day money-back guarantee. If Shift Ascent isn\'t helping you stay accountable, we\'ll refund your payment—no questions asked.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, debit cards, and PayPal. All payments are processed securely through Stripe.',
  },
];

// Helper to build feature list for a plan
function buildFeatureList(plan, allPlans) {
  const features = [];
  const planFeatures = plan.features || {};

  // Add limit-based features first
  features.push({
    text: plan.max_active_goals === null ? 'Unlimited active goals' : `${plan.max_active_goals} active goal${plan.max_active_goals > 1 ? 's' : ''}`,
    included: true,
  });

  features.push({
    text: plan.max_milestones_per_goal === null ? 'Unlimited milestones' : `${plan.max_milestones_per_goal} milestones per goal`,
    included: true,
  });

  features.push({
    text: plan.max_shares_per_month === null ? 'Unlimited shares' : `${plan.max_shares_per_month} shares per month`,
    included: true,
  });

  // Add feature-based items
  Object.entries(FEATURE_LABELS).forEach(([key, label]) => {
    // Skip if this is a limit-related feature we already showed
    if (['basicIntegrity'].includes(key) && planFeatures[key]) {
      features.push({ text: label, included: true });
    } else if (!['basicIntegrity'].includes(key)) {
      // Check if any plan has this feature
      const anyPlanHasFeature = allPlans.some(p => p.features && p.features[key]);
      if (anyPlanHasFeature) {
        features.push({
          text: label,
          included: !!planFeatures[key],
        });
      }
    }
  });

  return features;
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pricingService.getActivePlans();

      if (data && data.length > 0) {
        setPlans(data);
      } else {
        // Use fallback plans if no data from database
        setPlans(FALLBACK_PLANS);
      }
    } catch (err) {
      console.error('Failed to load pricing plans:', err);
      setError('Failed to load pricing. Using default plans.');
      setPlans(FALLBACK_PLANS);
    } finally {
      setLoading(false);
    }
  };

  const getPrice = (plan) => {
    if (plan.price_monthly === 0) return 'Free';
    const price = billingCycle === 'yearly'
      ? Math.floor(plan.price_yearly / 12)
      : plan.price_monthly;
    return `$${(price / 100).toFixed(0)}`;
  };

  const getSavings = (plan) => {
    if (plan.price_monthly === 0) return null;
    return plan.discount_percent > 0 ? plan.discount_percent : null;
  };

  const getIcon = (planId) => {
    return PLAN_ICONS[planId] || PLAN_ICONS.default;
  };

  const getButtonVariant = (plan) => {
    if (plan.is_featured) return 'primary';
    if (plan.id === 'unbreakable') return 'gold';
    return 'secondary';
  };

  return (
    <div className="min-h-screen bg-obsidian-950 noise-bg">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-obsidian-100 mb-4 sm:mb-6">
            Lock In Your <span className="text-gold-500">Promise</span>
          </h1>
          <p className="text-obsidian-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-10">
            Every milestone starts with a promise. Choose how committed you want to be.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 bg-obsidian-800/50 rounded-lg p-1 border border-obsidian-700">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-obsidian-700 text-obsidian-100'
                  : 'text-obsidian-400 hover:text-obsidian-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-obsidian-700 text-obsidian-100'
                  : 'text-obsidian-400 hover:text-obsidian-200'
              }`}
            >
              Yearly
              <span className="text-gold-500 text-xs font-semibold">Save 27%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 mb-6">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <p className="text-yellow-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <section className="pb-16 sm:pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 text-gold-500 animate-spin" />
            </div>
          ) : (
            <div className={`grid gap-6 lg:gap-8 ${
              plans.length === 1 ? 'max-w-md mx-auto' :
              plans.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' :
              'md:grid-cols-3'
            }`}>
              {plans.map((plan) => {
                const PlanIcon = getIcon(plan.id);
                const savings = getSavings(plan);
                const features = buildFeatureList(plan, plans);

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-xl border p-6 sm:p-8 transition-all ${
                      plan.is_featured
                        ? 'bg-obsidian-800/80 border-gold-500/50 shadow-lg shadow-gold-500/10 scale-[1.02] md:scale-105'
                        : 'bg-obsidian-900/50 border-obsidian-700 hover:border-obsidian-600'
                    }`}
                  >
                    {/* Badge */}
                    {plan.badge_text && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          plan.is_featured
                            ? 'bg-gold-500 text-obsidian-950'
                            : 'bg-obsidian-700 text-obsidian-300'
                        }`}>
                          {plan.badge_text}
                        </span>
                      </div>
                    )}

                    {/* Header */}
                    <div className="text-center mb-6">
                      <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        plan.is_featured
                          ? 'bg-gold-500/20 border border-gold-500/30'
                          : 'bg-obsidian-800 border border-obsidian-600'
                      }`}>
                        <PlanIcon className={`w-6 h-6 ${
                          plan.is_featured ? 'text-gold-500' : 'text-obsidian-400'
                        }`} />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-obsidian-100 mb-1">
                        {plan.name}
                      </h3>
                      <p className="text-obsidian-500 text-sm">{plan.tagline}</p>
                    </div>

                    {/* Price */}
                    <div className="text-center mb-6">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl sm:text-4xl font-bold text-obsidian-100">
                          {getPrice(plan)}
                        </span>
                        {plan.price_monthly > 0 && (
                          <span className="text-obsidian-500 text-sm">/month</span>
                        )}
                      </div>
                      {billingCycle === 'yearly' && savings && (
                        <p className="text-gold-500 text-sm mt-1">
                          Save {savings}% with yearly billing
                        </p>
                      )}
                      {billingCycle === 'yearly' && plan.price_yearly > 0 && (
                        <p className="text-obsidian-600 text-xs mt-1">
                          ${(plan.price_yearly / 100).toFixed(0)} billed annually
                        </p>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="mb-6">
                      <Link to="/login">
                        <Button
                          variant={getButtonVariant(plan)}
                          size="lg"
                          className="w-full"
                          icon={ArrowRight}
                          iconPosition="right"
                        >
                          {plan.cta_text || `Get ${plan.name}`}
                        </Button>
                      </Link>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      {features.map((feature, index) => (
                        <div
                          key={index}
                          className={`flex items-start gap-3 ${
                            feature.included ? 'text-obsidian-300' : 'text-obsidian-600'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            feature.included
                              ? plan.is_featured
                                ? 'bg-gold-500/20 text-gold-500'
                                : 'bg-obsidian-700 text-obsidian-400'
                              : 'bg-obsidian-800'
                          }`}>
                            {feature.included ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <span className="w-1.5 h-0.5 bg-obsidian-600 rounded" />
                            )}
                          </div>
                          <span className="text-sm">{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Comparison Note */}
      <section className="pb-16 sm:pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-obsidian-800/30 border border-obsidian-700 rounded-xl p-6 sm:p-8 text-center">
            <h3 className="text-lg sm:text-xl font-semibold text-obsidian-100 mb-3">
              Not sure which plan is right for you?
            </h3>
            <p className="text-obsidian-400 text-sm sm:text-base mb-4">
              Start with <span className="text-obsidian-200 font-medium">{plans[0]?.name || 'Pledge'}</span> for free.
              Upgrade when you're ready for more.
            </p>
            <p className="text-obsidian-500 text-xs">
              All plans include core accountability features. Your integrity score follows you everywhere.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pb-16 sm:pb-20 px-4 bg-obsidian-900/30">
        <div className="max-w-3xl mx-auto pt-12 sm:pt-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-obsidian-100 text-center mb-8 sm:mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4 sm:space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-obsidian-800/50 border border-obsidian-700 rounded-lg p-4 sm:p-6"
              >
                <h3 className="text-obsidian-100 font-medium mb-2 text-sm sm:text-base">
                  {faq.question}
                </h3>
                <p className="text-obsidian-400 text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-obsidian-100 mb-4">
            Ready to make your first promise?
          </h2>
          <p className="text-obsidian-400 mb-8">
            Start free. No credit card required. Your word starts here.
          </p>
          <Link to="/login">
            <Button variant="gold" size="lg" icon={ArrowRight} iconPosition="right">
              {plans[0]?.cta_text || 'Make Your Pledge'}
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
