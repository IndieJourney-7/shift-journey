import React from 'react';
import { HelpCircle, Lock, Target, AlertTriangle, Calendar, User, ChevronRight } from 'lucide-react';
import { Card } from '../components/ui';

export default function HelpPage() {
  const faqs = [
    {
      question: 'What is Shift Journey?',
      answer: 'Shift Journey is a commitment system that helps you break big goals into milestones. Each milestone becomes a locked promise with a deadline. Unlike typical task managers, you cannot delete or edit promises once locked.',
    },
    {
      question: 'How do I create a goal?',
      answer: 'Click on "New Goal" from the dashboard or sidebar. You can only have one active goal at a time to maintain focus.',
    },
    {
      question: 'What happens when I lock a promise?',
      answer: 'Once locked, you cannot edit, delete, or skip the milestone. You must either complete it before the deadline or mark it as broken with a reason.',
    },
    {
      question: 'What is the Integrity Score?',
      answer: 'Your Integrity Score (0-100) reflects your track record of keeping promises. Completing milestones increases it, while breaking promises decreases it.',
    },
    {
      question: 'Can I have multiple goals?',
      answer: 'No. Shift Journey enforces one active goal at a time to help you stay focused. Complete or abandon your current goal before starting a new one.',
    },
    {
      question: 'What are the consequences of breaking a promise?',
      answer: 'Breaking a promise is recorded permanently in your history. Your Integrity Score decreases, and you must write a reason for failing. This creates accountability.',
    },
  ];

  const features = [
    {
      icon: Target,
      title: 'One Goal at a Time',
      description: 'Focus on what matters. No scattered attention.',
    },
    {
      icon: Lock,
      title: 'Locked Promises',
      description: 'Once locked, no backing out. Real commitment.',
    },
    {
      icon: AlertTriangle,
      title: 'Visible Failures',
      description: 'Broken promises are recorded. No hiding.',
    },
    {
      icon: Calendar,
      title: 'Daily Tracking',
      description: 'Track your work days for evidence.',
    },
    {
      icon: User,
      title: 'Integrity Score',
      description: 'Your reliability, quantified.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-obsidian-800 border border-obsidian-600 flex items-center justify-center">
          <HelpCircle className="w-8 h-8 text-gold-500" />
        </div>
        <h1 className="text-2xl font-bold text-obsidian-100 mb-2">Help Center</h1>
        <p className="text-obsidian-400">Learn how to use Shift Journey effectively</p>
      </div>

      {/* Core Concept */}
      <Card variant="highlighted" padding="lg">
        <h2 className="text-lg font-semibold text-obsidian-100 mb-4">Core Concept</h2>
        <p className="text-obsidian-300 leading-relaxed">
          Shift Journey is <strong>not</strong> a task manager. It's a commitment system designed for people who need real accountability. The key difference: <strong>you cannot escape your promises</strong>.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-obsidian-900/50 rounded-lg">
            <div className="text-gold-500 text-2xl font-bold mb-1">1</div>
            <div className="text-obsidian-300 text-sm">Set one goal</div>
          </div>
          <div className="text-center p-4 bg-obsidian-900/50 rounded-lg">
            <div className="text-gold-500 text-2xl font-bold mb-1">2</div>
            <div className="text-obsidian-300 text-sm">Lock milestones</div>
          </div>
          <div className="text-center p-4 bg-obsidian-900/50 rounded-lg">
            <div className="text-gold-500 text-2xl font-bold mb-1">3</div>
            <div className="text-obsidian-300 text-sm">Keep or break</div>
          </div>
        </div>
      </Card>

      {/* Features */}
      <Card variant="elevated" padding="lg">
        <h2 className="text-lg font-semibold text-obsidian-100 mb-6">Key Features</h2>
        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-obsidian-800 border border-obsidian-600 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 text-gold-500" />
              </div>
              <div>
                <h3 className="text-obsidian-200 font-medium">{feature.title}</h3>
                <p className="text-obsidian-500 text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* FAQ */}
      <div>
        <h2 className="text-lg font-semibold text-obsidian-100 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <Card key={index} variant="default" padding="md">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="text-obsidian-200 font-medium">{faq.question}</span>
                  <ChevronRight className="w-5 h-5 text-obsidian-500 transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-obsidian-400 text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact */}
      <Card variant="default" padding="md" className="text-center">
        <p className="text-obsidian-400 text-sm">
          Still have questions?{' '}
          <a href="#" className="text-gold-500 hover:text-gold-400">Contact Support</a>
        </p>
      </Card>
    </div>
  );
}
