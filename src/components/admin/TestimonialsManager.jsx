/**
 * Testimonials Manager Component
 * 
 * Admin interface for managing testimonials/reviews displayed on the landing page.
 * Features: Create, Edit, Delete, Toggle Active/Featured, Reorder
 */

import { useState, useEffect } from 'react';
import { testimonialsService } from '../../services/adminContentService';
import { Star, Edit2, Trash2, Plus, Eye, EyeOff, Award, GripVertical, Save, X } from 'lucide-react';

const TestimonialsManager = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    score: 85,
    quote: '',
    highlight: '',
    kept_promises: 0,
    broken_promises: 0,
    is_featured: false,
    is_active: true
  });

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const data = await testimonialsService.getAll();
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error loading testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await testimonialsService.update(editingId, formData);
      } else {
        await testimonialsService.create(formData);
      }
      resetForm();
      loadTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      alert('Error saving testimonial: ' + error.message);
    }
  };

  const handleEdit = (testimonial) => {
    setFormData({
      name: testimonial.name,
      role: testimonial.role || '',
      score: testimonial.score || 85,
      quote: testimonial.quote,
      highlight: testimonial.highlight || '',
      kept_promises: testimonial.kept_promises || 0,
      broken_promises: testimonial.broken_promises || 0,
      is_featured: testimonial.is_featured,
      is_active: testimonial.is_active
    });
    setEditingId(testimonial.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await testimonialsService.delete(id);
      loadTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await testimonialsService.toggleActive(id, !currentStatus);
      loadTestimonials();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleToggleFeatured = async (id, currentStatus) => {
    try {
      await testimonialsService.toggleFeatured(id, !currentStatus);
      loadTestimonials();
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      score: 85,
      quote: '',
      highlight: '',
      kept_promises: 0,
      broken_promises: 0,
      is_featured: false,
      is_active: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-amber-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

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
          <h2 className="text-xl font-bold text-white">Testimonials Manager</h2>
          <p className="text-gray-400 text-sm mt-1">
            Manage reviews displayed on the landing page • {testimonials.length} total
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Testimonial
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  {editingId ? 'Edit Testimonial' : 'Add New Testimonial'}
                </h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Role</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g., Software Engineer"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Quote *</label>
                <textarea
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Highlight Phrase</label>
                <input
                  type="text"
                  value={formData.highlight}
                  onChange={(e) => setFormData({ ...formData, highlight: e.target.value })}
                  placeholder="Key phrase to highlight in quote"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Integrity Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Kept Promises</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.kept_promises}
                    onChange={(e) => setFormData({ ...formData, kept_promises: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Broken Promises</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.broken_promises}
                    onChange={(e) => setFormData({ ...formData, broken_promises: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-600 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-300">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-600 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-300">Featured</span>
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

      {/* Testimonials List */}
      <div className="space-y-3">
        {testimonials.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
            <Star className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No testimonials yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-amber-500 hover:text-amber-400"
            >
              Add your first testimonial
            </button>
          </div>
        ) : (
          testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={`bg-gray-800/50 rounded-xl border ${
                testimonial.is_active ? 'border-gray-700' : 'border-gray-800 opacity-60'
              } p-4`}
            >
              <div className="flex items-start gap-4">
                {/* Drag Handle */}
                <div className="pt-1 cursor-move text-gray-600 hover:text-gray-400">
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Avatar */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                  <span className="text-white font-bold">{testimonial.initials}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white">{testimonial.name}</h4>
                    {testimonial.is_featured && (
                      <Award className="w-4 h-4 text-amber-500" title="Featured" />
                    )}
                    {!testimonial.is_active && (
                      <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-400 rounded">
                        Hidden
                      </span>
                    )}
                  </div>
                  {testimonial.role && (
                    <p className="text-sm text-gray-400 mb-2">{testimonial.role}</p>
                  )}
                  <p className="text-gray-300 text-sm line-clamp-2">{testimonial.quote}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className={getScoreColor(testimonial.score)}>
                      Score: {testimonial.score}
                    </span>
                    <span>Kept: {testimonial.kept_promises}</span>
                    <span>Broken: {testimonial.broken_promises}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleFeatured(testimonial.id, testimonial.is_featured)}
                    className={`p-2 rounded-lg transition-colors ${
                      testimonial.is_featured
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'hover:bg-gray-700 text-gray-500'
                    }`}
                    title={testimonial.is_featured ? 'Remove from featured' : 'Make featured'}
                  >
                    <Award className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(testimonial.id, testimonial.is_active)}
                    className={`p-2 rounded-lg transition-colors ${
                      testimonial.is_active
                        ? 'hover:bg-gray-700 text-gray-400'
                        : 'hover:bg-gray-700 text-gray-600'
                    }`}
                    title={testimonial.is_active ? 'Hide' : 'Show'}
                  >
                    {testimonial.is_active ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(testimonial)}
                    className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TestimonialsManager;
