/**
 * Users Manager Component
 * 
 * Admin interface for viewing and managing all registered users.
 * Features: View all users, Search, Filter, View user stats
 */

import { useState, useEffect } from 'react';
import { usersService } from '../../services/adminContentService';
import { Users, Search, TrendingUp, Calendar, Mail, Shield, ChevronDown, ChevronUp, Award } from 'lucide-react';

const UsersManager = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('joined_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [expandedUserId, setExpandedUserId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        usersService.getWithGoals(),
        usersService.getStats()
      ]);
      setUsers(usersData || []);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }
    try {
      setLoading(true);
      const results = await usersService.search(searchQuery);
      setUsers(results || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    // Handle null values
    if (aVal === null || aVal === undefined) aVal = '';
    if (bVal === null || bVal === undefined) bVal = '';

    // Handle dates
    if (sortField === 'joined_at' || sortField === 'updated_at') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  const filteredUsers = searchQuery
    ? sortedUsers.filter(user =>
        (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : sortedUsers;

  const getScoreTier = (score) => {
    if (score >= 90) return { label: 'Legendary', color: 'text-amber-400 bg-amber-500/20' };
    if (score >= 80) return { label: 'Trusted', color: 'text-emerald-400 bg-emerald-500/20' };
    if (score >= 65) return { label: 'Steady', color: 'text-blue-400 bg-blue-500/20' };
    if (score >= 50) return { label: 'Rising', color: 'text-cyan-400 bg-cyan-500/20' };
    if (score >= 30) return { label: 'Mending', color: 'text-orange-400 bg-orange-500/20' };
    return { label: 'Shattered', color: 'text-red-400 bg-red-500/20' };
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-white">Users Manager</h2>
        <p className="text-gray-400 text-xs sm:text-sm mt-1">
          View and monitor all registered users • {users.length} total
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-[10px] sm:text-xs text-gray-400">Total Users</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-white">+{stats.newThisWeek}</p>
                <p className="text-[10px] sm:text-xs text-gray-400">This Week</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-white">+{stats.newThisMonth}</p>
                <p className="text-[10px] sm:text-xs text-gray-400">This Month</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-white">{stats.avgIntegrityScore}</p>
                <p className="text-[10px] sm:text-xs text-gray-400">Avg Score</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            className="flex-1 sm:flex-none px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg transition-colors"
          >
            Search
          </button>
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              loadData();
            }}
            className="flex-1 sm:flex-none px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
          >
            Clear
          </button>
        )}
        </div>
      </div>

      {/* Users List - Mobile Cards / Desktop Table */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-white"
                  >
                    User
                    <SortIcon field="name" />
                  </button>
                </th>
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort('email')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-white"
                  >
                    Email
                    <SortIcon field="email" />
                  </button>
                </th>
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort('integrity_score')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-white"
                  >
                    Score
                    <SortIcon field="integrity_score" />
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Goals</th>
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort('joined_at')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-white"
                  >
                    Joined
                    <SortIcon field="joined_at" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const tier = getScoreTier(user.integrity_score || 0);
                  const isExpanded = expandedUserId === user.id;

                  return (
                    <>
                      <tr
                        key={user.id}
                        onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                        className="border-b border-gray-700/50 hover:bg-gray-700/30 cursor-pointer transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {user.name?.substring(0, 2).toUpperCase() || '??'}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-white">{user.name || 'Unknown'}</p>
                              <p className="text-xs text-gray-500">{user.id.substring(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{user.email}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-white">
                              {user.integrity_score || 0}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${tier.color}`}>
                              {tier.label}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-white">{user.goals?.length || 0}</span>
                            <span className="text-xs text-gray-500">
                              ({user.goals?.filter(g => g.status === 'active').length || 0} active)
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-300">
                              {user.joined_at
                                ? new Date(user.joined_at).toLocaleDateString()
                                : 'N/A'}
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row */}
                      {isExpanded && user.goals && user.goals.length > 0 && (
                        <tr className="bg-gray-900/50">
                          <td colSpan={5} className="p-4 pl-16">
                            <div className="space-y-2">
                              <p className="text-sm text-gray-400 mb-2">User Goals:</p>
                              {user.goals.map((goal, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-3 text-sm"
                                >
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      goal.status === 'active'
                                        ? 'bg-emerald-500'
                                        : goal.status === 'completed'
                                        ? 'bg-blue-500'
                                        : 'bg-gray-500'
                                    }`}
                                  />
                                  <span className="text-white">{goal.title}</span>
                                  <span className="text-xs text-gray-500 capitalize">
                                    ({goal.status})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-gray-700">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No users found
            </div>
          ) : (
            filteredUsers.map((user) => {
              const tier = getScoreTier(user.integrity_score || 0);
              return (
                <div
                  key={user.id}
                  className="p-4 hover:bg-gray-700/30"
                  onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                >
                  <div className="flex items-center gap-3">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {user.name?.substring(0, 2).toUpperCase() || '??'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{user.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-bold text-white">{user.integrity_score || 0}</span>
                        <Shield className="w-4 h-4 text-amber-500" />
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${tier.color}`}>{tier.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{user.goals?.length || 0} goals</span>
                    <span>Joined {user.joined_at ? new Date(user.joined_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  {expandedUserId === user.id && user.goals && user.goals.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700 space-y-1.5">
                      <p className="text-xs text-gray-400">Goals:</p>
                      {user.goals.map((goal, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            goal.status === 'active' ? 'bg-emerald-500' :
                            goal.status === 'completed' ? 'bg-blue-500' : 'bg-gray-500'
                          }`} />
                          <span className="text-white">{goal.title}</span>
                          <span className="text-gray-500 capitalize">({goal.status})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersManager;
