/**
 * FAQs Manager Component
 * 
 * Admin interface for managing FAQ items displayed on the landing page.
 * Features: Create, Edit, Delete, Toggle Active, Category filter, Reorder
 */

import { useState, useEffect } from 'react';
import { faqsService } from '../../services/adminContentService';
import { HelpCircle, Edit2, Trash2, Plus, Eye, EyeOff, GripVertical, Save, X, ChevronDown, ChevronRight } from 'lucide-react';

const CATEGORIES = [
  { value: 'general', label: 'General', color: 'bg-blue-500' },
  { value: 'features', label: 'Features', color: 'bg-emerald-500' },
  { value: 'pricing', label: 'Pricing', color: 'bg-purple-500' },
  { value: 'account', label: 'Account', color: 'bg-amber-500' }
];

const FAQsManager = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
    is_active: true
  });

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      const data = await faqsService.getAll();
      setFaqs(data || []);
    } catch (error) {
      console.error('Error loading FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await faqsService.update(editingId, formData);
      } else {
        await faqsService.create(formData);
      }
      resetForm();
      loadFAQs();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert('Error saving FAQ: ' + error.message);
    }
  };

  const handleEdit = (faq) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'general',
      is_active: faq.is_active
    });
    setEditingId(faq.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await faqsService.delete(id);
      loadFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await faqsService.toggleActive(id, !currentStatus);
      loadFAQs();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'general',
      is_active: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getCategoryConfig = (categoryValue) => {
    return CATEGORIES.find(c => c.value === categoryValue) || CATEGORIES[0];
  };

  const filteredFaqs = filterCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === filterCategory);

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
          <h2 className="text-xl font-bold text-white">FAQs Manager</h2>
          <p className="text-gray-400 text-sm mt-1">
            Manage frequently asked questions • {faqs.length} total
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add FAQ
        </button>
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
          All ({faqs.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = faqs.filter(f => f.category === cat.value).length;
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
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  {editingId ? 'Edit FAQ' : 'Add New FAQ'}
                </h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Question *</label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Answer *</label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  required
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
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
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
                  <span className="text-sm text-gray-300">Active</span>
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

      {/* FAQs List */}
      <div className="space-y-2">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
            <HelpCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No FAQs found</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-amber-500 hover:text-amber-400"
            >
              Add your first FAQ
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const category = getCategoryConfig(faq.category);
            const isExpanded = expandedId === faq.id;

            return (
              <div
                key={faq.id}
                className={`bg-gray-800/50 rounded-xl border ${
                  faq.is_active ? 'border-gray-700' : 'border-gray-800 opacity-60'
                } overflow-hidden`}
              >
                <div className="flex items-center gap-3 p-4">
                  {/* Drag Handle */}
                  <div className="cursor-move text-gray-600 hover:text-gray-400">
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Expand/Collapse */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                    className="text-gray-400 hover:text-white"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>

                  {/* Category Badge */}
                  <span className={`px-2 py-0.5 text-xs rounded ${category.color} text-white`}>
                    {category.label}
                  </span>

                  {/* Question */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">{faq.question}</h4>
                  </div>

                  {/* Status Badge */}
                  {!faq.is_active && (
                    <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-400 rounded">
                      Hidden
                    </span>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(faq.id, faq.is_active)}
                      className={`p-2 rounded-lg transition-colors ${
                        faq.is_active
                          ? 'hover:bg-gray-700 text-gray-400'
                          : 'hover:bg-gray-700 text-gray-600'
                      }`}
                      title={faq.is_active ? 'Hide' : 'Show'}
                    >
                      {faq.is_active ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(faq)}
                      className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Answer */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 ml-12 mr-4">
                    <p className="text-gray-400 text-sm whitespace-pre-wrap">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FAQsManager;
