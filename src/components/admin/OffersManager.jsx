/**
 * Offers Manager Component
 * 
 * Admin interface for managing promotional offers displayed on the landing page.
 * Features: Create, Edit, Delete, Toggle Active, Schedule offers
 */

import { useState, useEffect } from 'react';
import { offersService } from '../../services/adminContentService';
import { Tag, Edit2, Trash2, Plus, Eye, EyeOff, Save, X, Calendar, Percent, Gift } from 'lucide-react';

const BG_COLORS = [
  { value: 'gold', label: 'Gold', class: 'bg-gradient-to-r from-amber-500 to-amber-600' },
  { value: 'blue', label: 'Blue', class: 'bg-gradient-to-r from-blue-500 to-blue-600' },
  { value: 'green', label: 'Green', class: 'bg-gradient-to-r from-emerald-500 to-emerald-600' },
  { value: 'purple', label: 'Purple', class: 'bg-gradient-to-r from-purple-500 to-purple-600' },
  { value: 'red', label: 'Red', class: 'bg-gradient-to-r from-red-500 to-red-600' }
];

const OffersManager = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    badge_text: '',
    discount_percent: null,
    discount_code: '',
    cta_text: 'Get Started',
    cta_link: '/login',
    bg_color: 'gold',
    is_active: true,
    starts_at: '',
    ends_at: ''
  });

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const data = await offersService.getAll();
      setOffers(data || []);
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        discount_percent: formData.discount_percent ? parseInt(formData.discount_percent) : null,
        starts_at: formData.starts_at || null,
        ends_at: formData.ends_at || null
      };

      if (editingId) {
        await offersService.update(editingId, submitData);
      } else {
        await offersService.create(submitData);
      }
      resetForm();
      loadOffers();
    } catch (error) {
      console.error('Error saving offer:', error);
      alert('Error saving offer: ' + error.message);
    }
  };

  const handleEdit = (offer) => {
    setFormData({
      title: offer.title,
      description: offer.description || '',
      badge_text: offer.badge_text || '',
      discount_percent: offer.discount_percent || '',
      discount_code: offer.discount_code || '',
      cta_text: offer.cta_text || 'Get Started',
      cta_link: offer.cta_link || '/login',
      bg_color: offer.bg_color || 'gold',
      is_active: offer.is_active,
      starts_at: offer.starts_at ? offer.starts_at.substring(0, 16) : '',
      ends_at: offer.ends_at ? offer.ends_at.substring(0, 16) : ''
    });
    setEditingId(offer.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      await offersService.delete(id);
      loadOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await offersService.toggleActive(id, !currentStatus);
      loadOffers();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      badge_text: '',
      discount_percent: null,
      discount_code: '',
      cta_text: 'Get Started',
      cta_link: '/login',
      bg_color: 'gold',
      is_active: true,
      starts_at: '',
      ends_at: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getBgColorClass = (colorValue) => {
    return BG_COLORS.find(c => c.value === colorValue)?.class || BG_COLORS[0].class;
  };

  const getOfferStatus = (offer) => {
    const now = new Date();
    if (!offer.is_active) return { label: 'Inactive', color: 'text-gray-500' };
    if (offer.starts_at && new Date(offer.starts_at) > now) return { label: 'Scheduled', color: 'text-blue-400' };
    if (offer.ends_at && new Date(offer.ends_at) < now) return { label: 'Expired', color: 'text-red-400' };
    return { label: 'Active', color: 'text-emerald-400' };
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
          <h2 className="text-xl font-bold text-white">Offers Manager</h2>
          <p className="text-gray-400 text-sm mt-1">
            Promotional offers for the landing page • {offers.length} total
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Offer
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  {editingId ? 'Edit Offer' : 'Add New Offer'}
                </h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  placeholder="e.g., Start Your Journey Free"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  placeholder="Brief description of the offer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={formData.badge_text}
                    onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g., Limited Time, New"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Discount %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percent || ''}
                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g., 20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Discount Code</label>
                  <input
                    type="text"
                    value={formData.discount_code}
                    onChange={(e) => setFormData({ ...formData, discount_code: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g., LAUNCH20"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Background Color</label>
                  <select
                    value={formData.bg_color}
                    onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    {BG_COLORS.map(color => (
                      <option key={color.value} value={color.value}>{color.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={formData.cta_text}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    placeholder="Get Started"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">CTA Link</label>
                  <input
                    type="text"
                    value={formData.cta_link}
                    onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    placeholder="/login"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Start Date (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.starts_at}
                    onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    End Date (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.ends_at}
                    onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
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

              {/* Preview */}
              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-2">Preview:</p>
                <div className={`${getBgColorClass(formData.bg_color)} rounded-lg p-4 text-white`}>
                  <div className="flex items-center justify-between">
                    <div>
                      {formData.badge_text && (
                        <span className="text-xs bg-white/20 px-2 py-1 rounded mr-2">
                          {formData.badge_text}
                        </span>
                      )}
                      <span className="font-bold">{formData.title || 'Offer Title'}</span>
                      {formData.discount_percent && (
                        <span className="ml-2 text-2xl font-bold">
                          {formData.discount_percent}% OFF
                        </span>
                      )}
                    </div>
                    <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium">
                      {formData.cta_text || 'Get Started'}
                    </button>
                  </div>
                  {formData.description && (
                    <p className="mt-2 text-sm opacity-90">{formData.description}</p>
                  )}
                </div>
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

      {/* Offers List */}
      {offers.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
          <Gift className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No offers yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-3 text-amber-500 hover:text-amber-400"
          >
            Create your first offer
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => {
            const status = getOfferStatus(offer);

            return (
              <div
                key={offer.id}
                className={`bg-gray-800/50 rounded-xl border ${
                  offer.is_active ? 'border-gray-700' : 'border-gray-800 opacity-60'
                } overflow-hidden`}
              >
                {/* Color Bar */}
                <div className={`h-2 ${getBgColorClass(offer.bg_color)}`}></div>

                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white">{offer.title}</h4>
                        {offer.badge_text && (
                          <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                            {offer.badge_text}
                          </span>
                        )}
                        <span className={`text-xs ${status.color}`}>{status.label}</span>
                      </div>

                      {offer.description && (
                        <p className="text-sm text-gray-400 mb-2">{offer.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {offer.discount_percent && (
                          <span className="flex items-center gap-1">
                            <Percent className="w-3 h-3" />
                            {offer.discount_percent}% off
                          </span>
                        )}
                        {offer.discount_code && (
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            Code: {offer.discount_code}
                          </span>
                        )}
                        {offer.ends_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Ends: {new Date(offer.ends_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleActive(offer.id, offer.is_active)}
                        className={`p-2 rounded-lg transition-colors ${
                          offer.is_active
                            ? 'hover:bg-gray-700 text-gray-400'
                            : 'hover:bg-gray-700 text-gray-600'
                        }`}
                        title={offer.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {offer.is_active ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(offer)}
                        className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(offer.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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

export default OffersManager;
