/**
 * Quotes Manager Component
 * 
 * Admin interface for managing motivational quotes displayed on user dashboards.
 * Features: Create, Edit, Delete, Toggle Active, Category filter
 */

import { useState, useEffect } from 'react';
import { quotesService } from '../../services/adminContentService';
import { Quote, Edit2, Trash2, Plus, Eye, EyeOff, Save, X, Sparkles } from 'lucide-react';

const CATEGORIES = [
  { value: 'motivation', label: 'Motivation', emoji: '🔥' },
  { value: 'integrity', label: 'Integrity', emoji: '🛡️' },
  { value: 'success', label: 'Success', emoji: '🏆' },
  { value: 'perseverance', label: 'Perseverance', emoji: '💪' }
];

const QuotesManager = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState({
    text: '',
    author: '',
    category: 'motivation',
    is_active: true
  });

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const data = await quotesService.getAll();
      setQuotes(data || []);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await quotesService.update(editingId, formData);
      } else {
        await quotesService.create(formData);
      }
      resetForm();
      loadQuotes();
    } catch (error) {
      console.error('Error saving quote:', error);
      alert('Error saving quote: ' + error.message);
    }
  };

  const handleEdit = (quote) => {
    setFormData({
      text: quote.text,
      author: quote.author || '',
      category: quote.category || 'motivation',
      is_active: quote.is_active
    });
    setEditingId(quote.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quote?')) return;
    try {
      await quotesService.delete(id);
      loadQuotes();
    } catch (error) {
      console.error('Error deleting quote:', error);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await quotesService.toggleActive(id, !currentStatus);
      loadQuotes();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      text: '',
      author: '',
      category: 'motivation',
      is_active: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getCategoryConfig = (categoryValue) => {
    return CATEGORIES.find(c => c.value === categoryValue) || CATEGORIES[0];
  };

  const filteredQuotes = filterCategory === 'all' 
    ? quotes 
    : quotes.filter(q => q.category === filterCategory);

  const activeCount = quotes.filter(q => q.is_active).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Quotes Manager</h2>
          <p className="text-gray-400 text-sm mt-1">
            Motivational quotes for user dashboards • {activeCount} active / {quotes.length} total
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Quote
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-200 text-sm">
            Active quotes are randomly displayed on user dashboards to inspire and motivate.
            Each user sees a different random quote each time they visit.
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            filterCategory === 'all'
              ? 'bg-amber-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          All ({quotes.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = quotes.filter(q => q.category === cat.value).length;
          return (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filterCategory === cat.value
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {cat.emoji} {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  {editingId ? 'Edit Quote' : 'Add New Quote'}
                </h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Quote Text *</label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  placeholder="The promises you make to yourself are the most important ones to keep."
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Author</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  placeholder="e.g., John Maxwell, Unknown, Shift Ascent"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.emoji} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-600 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-300">Active (show on dashboards)</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quotes Grid */}
      {filteredQuotes.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
          <Quote className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No quotes found</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-3 text-amber-500 hover:text-amber-400"
          >
            Add your first quote
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredQuotes.map((quote) => {
            const category = getCategoryConfig(quote.category);

            return (
              <div
                key={quote.id}
                className={`bg-gray-800/50 rounded-xl border ${
                  quote.is_active ? 'border-gray-700' : 'border-gray-800 opacity-60'
                } p-4`}
              >
                <div className="flex items-start gap-4">
                  {/* Quote Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-xl">
                    {category.emoji}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-200 italic">"{quote.text}"</p>
                    <div className="flex items-center gap-3 mt-2">
                      {quote.author && (
                        <span className="text-sm text-amber-500">— {quote.author}</span>
                      )}
                      <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-400 rounded">
                        {category.label}
                      </span>
                      {!quote.is_active && (
                        <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-500 rounded">
                          Hidden
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(quote.id, quote.is_active)}
                      className={`p-2 rounded-lg transition-colors ${
                        quote.is_active
                          ? 'hover:bg-gray-700 text-gray-400'
                          : 'hover:bg-gray-700 text-gray-600'
                      }`}
                      title={quote.is_active ? 'Hide' : 'Show'}
                    >
                      {quote.is_active ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(quote)}
                      className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(quote.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuotesManager;
