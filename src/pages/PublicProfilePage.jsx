import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, Target, Flame, Users, AlertTriangle, ArrowLeft, ExternalLink } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { IntegrityBadgeCard, ShareableBadgeImage } from '../components/badges';
import { Button, Card, Modal } from '../components/ui';
import { getIntegrityTier } from '../lib/badgeDefinitions';

/**
 * Public Profile Page - Shareable badge showcase
 * Route: /p/{userId}
 */
export default function PublicProfilePage() {
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured()) {
        // Fallback for demo/dev mode
        setProfileData(getDemoProfile());
        setLoading(false);
        return;
      }

      // Fetch user data - Note: Requires public read RLS policy on users table
      // See migration: 009_add_public_profile_access.sql
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, avatar_url, integrity_score, status, joined_at')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('User fetch error:', userError);
        // Check if it's an RLS error
        if (userError.code === 'PGRST116' || userError.message?.includes('row-level security')) {
          throw new Error('Profile is private or not accessible');
        }
        throw userError;
      }
      if (!userData) throw new Error('User not found');

      // Fetch user's goals and milestones for stats
      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('id, status')
        .eq('user_id', userId);
      
      if (goalsError) {
        console.warn('Goals fetch error (may be RLS):', goalsError);
      }

      let milestones = [];
      if (goals && goals.length > 0) {
        const { data: milestonesData, error: milestonesError } = await supabase
          .from('milestones')
          .select('status, updated_at, witness_count')
          .in('goal_id', goals.map(g => g.id));
        
        if (milestonesError) {
          console.warn('Milestones fetch error (may be RLS):', milestonesError);
        } else {
          milestones = milestonesData || [];
        }
      }

      // Calculate stats
      const stats = calculateStats(milestones, goals || []);

      setProfileData({
        user: userData,
        stats,
        goals: goals || [],
        milestones: milestones,
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (milestones, goals) => {
    const totalKept = milestones.filter(m => m.status === 'KEPT' || m.status === 'completed').length;
    const totalBroken = milestones.filter(m => m.status === 'BROKEN' || m.status === 'broken').length;
    const goalsCompleted = goals.filter(g => g.status === 'completed').length;

    // Calculate streak (consecutive kept promises)
    let currentStreak = 0;
    const sortedMilestones = [...milestones]
      .filter(m => m.status === 'KEPT' || m.status === 'completed' || m.status === 'BROKEN' || m.status === 'broken')
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    for (const m of sortedMilestones) {
      if (m.status === 'KEPT' || m.status === 'completed') {
        currentStreak++;
      } else {
        break;
      }
    }

    // Count total witnesses across all milestones
    const totalWitnesses = milestones.reduce((acc, m) => {
      return acc + (m.witness_count || 0);
    }, 0);

    return {
      totalKept,
      totalBroken,
      currentStreak,
      goalsCompleted,
      totalWitnesses,
    };
  };

  const getDemoProfile = () => ({
    user: {
      id: 'demo',
      name: 'Demo User',
      integrity_score: 75,
      created_at: new Date().toISOString(),
    },
    stats: {
      totalKept: 15,
      totalBroken: 2,
      currentStreak: 5,
      goalsCompleted: 2,
      totalWitnesses: 23,
    },
    goals: [],
    milestones: [],
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-obsidian-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center p-4">
        <Card variant="elevated" padding="lg" className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-obsidian-100 mb-2">Profile Not Found</h1>
          <p className="text-obsidian-400 mb-4">{error}</p>
          <p className="text-obsidian-500 text-sm mb-6">
            This profile may be private, or the link may be incorrect.
          </p>
          <div className="space-y-3">
            <Link to="/">
              <Button variant="gold" icon={ArrowLeft} className="w-full">
                Go to Shift Ascent
              </Button>
            </Link>
            <a href="https://www.shiftascent.com" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" icon={ExternalLink} className="w-full">
                Learn More
              </Button>
            </a>
          </div>
        </Card>
      </div>
    );
  }

  const { user, stats } = profileData;
  const score = user.integrity_score || 50;
  const tier = getIntegrityTier(score);
  const username = user.name || 'User';
  const profileUrl = `${window.location.origin}/p/${userId}`;

  return (
    <div className="min-h-screen bg-obsidian-950">
      {/* Header */}
      <header className="border-b border-obsidian-800 bg-obsidian-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-obsidian-400 hover:text-obsidian-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back to app</span>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold-500" />
            <span className="font-bold text-obsidian-100">Shift Ascent</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Profile Header */}
        <div className="text-center">
          {/* Avatar */}
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-obsidian-800 border-4 border-obsidian-700 flex items-center justify-center overflow-hidden">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={username} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-obsidian-400">
                {username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Name and Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-obsidian-100 mb-2">
            {username}
          </h1>
          <p className={`text-lg font-medium ${tier.color.text} mb-1`}>
            {tier.name}
          </p>
          <p className="text-obsidian-400 italic">"{tier.tagline}"</p>
        </div>

        {/* Main Badge Card */}
        <div className="max-w-lg mx-auto">
          <IntegrityBadgeCard
            score={score}
            stats={stats}
            username={username}
            showProgress={true}
            showStats={true}
            variant="full"
          />
        </div>

        {/* Share Button */}
        <div className="flex justify-center">
          <Button
            variant="gold"
            size="lg"
            icon={ExternalLink}
            onClick={() => setShowShareModal(true)}
          >
            Share My Badge
          </Button>
        </div>

        {/* Journey Stats */}
        <Card variant="default" padding="lg">
          <h2 className="text-lg font-semibold text-obsidian-100 mb-6 text-center">
            Journey Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox
              icon={Target}
              value={stats.totalKept}
              label="Promises Kept"
              color="text-green-400"
            />
            <StatBox
              icon={Flame}
              value={stats.currentStreak}
              label="Current Streak"
              color="text-amber-400"
            />
            <StatBox
              icon={Shield}
              value={stats.totalBroken}
              label="Promises Broken"
              color="text-red-400"
            />
            <StatBox
              icon={Users}
              value={stats.totalWitnesses}
              label="Total Witnesses"
              color="text-blue-400"
            />
          </div>
        </Card>

        {/* Call to Action */}
        <Card variant="elevated" padding="lg" className="text-center">
          <h2 className="text-xl font-bold text-obsidian-100 mb-2">
            Your Word is Your Identity
          </h2>
          <p className="text-obsidian-400 mb-6 max-w-md mx-auto">
            Track your promises, build your integrity score, and prove that you're someone
            who does what they say they'll do.
          </p>
          <Link to="/">
            <Button variant="gold">
              Start Your Journey
            </Button>
          </Link>
        </Card>

        {/* Footer */}
        <footer className="text-center text-obsidian-500 text-sm py-8">
          <p>Built with commitment. Shared with pride.</p>
          <p className="mt-1">
            <a href="/" className="text-gold-500 hover:text-gold-400 transition-colors">
              shiftascent.com
            </a>
          </p>
        </footer>
      </main>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Your Badge"
        size="lg"
      >
        <ShareableBadgeImage
          score={score}
          username={username}
          stats={stats}
          profileUrl={profileUrl}
          onDownload={() => {
            // Track download if analytics available
            console.log('Badge downloaded');
          }}
        />
      </Modal>
    </div>
  );
}

// Stat box component
function StatBox({ icon: Icon, value, label, color }) {
  return (
    <div className="text-center p-4 bg-obsidian-800/50 rounded-xl">
      <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
      <div className="text-2xl font-bold text-obsidian-100 mb-1">{value}</div>
      <div className="text-obsidian-500 text-sm">{label}</div>
    </div>
  );
}
