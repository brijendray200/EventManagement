import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Camera, Calendar, MapPin, IndianRupee, ArrowRight, Save, Clock, Type, Tag, LayoutPanelLeft, CheckCircle, Images, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrency } from '../../context/CurrencyContext';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../utils/api';
import { uploadImage } from '../../utils/upload';
import './CreateEvent.css';

const CreateEvent = () => {
  const { symbol } = useCurrency();
  const { showNotification, pushNotification } = useNotifications();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'Concerts',
    price: '0',
    image: '',
    galleryImages: [],
    highlightPoints: ['']
  });

  const handlePublish = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data } = await api.post('/events', {
        ...formData,
        price: Number(formData.price),
        image: formData.galleryImages[0] || formData.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
        galleryImages: formData.galleryImages,
        highlightPoints: formData.highlightPoints.filter((point) => point.trim()),
        ticketsAvailable: 100 // Default for now
      });

      if (data.success) {
        setIsSubmitting(false);
        setShowSuccess(true);
        showNotification(`"${formData.title}" is now LIVE!`, 'success');
        pushNotification('Event published', `"${formData.title}" is now live and visible to attendees.`, 'event');
        setTimeout(() => navigate('/organizer/dashboard'), 2500);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create event');
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      setUploadingImage(true);
      const uploads = await Promise.all(files.slice(0, 20).map((file) => uploadImage(file, 'eventsphere/events')));
      setFormData((prev) => {
        const nextGallery = [...new Set([...prev.galleryImages, ...uploads.map((item) => item.secureUrl)])].slice(0, 20);
        return { ...prev, image: nextGallery[0] || '', galleryImages: nextGallery };
      });
      showNotification(`${uploads.length} event image${uploads.length > 1 ? 's' : ''} uploaded`, 'success');
      pushNotification('Event media uploaded', `${uploads.length} event image${uploads.length > 1 ? 's were' : ' was'} added to your draft.`, 'event');
    } catch (error) {
      alert(error.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const updateHighlightPoint = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      highlightPoints: prev.highlightPoints.map((point, pointIndex) => pointIndex === index ? value : point)
    }));
  };

  const addHighlightPoint = () => {
    setFormData((prev) => ({
      ...prev,
      highlightPoints: [...prev.highlightPoints, ''].slice(0, 8)
    }));
  };

  const removeHighlightPoint = (index) => {
    setFormData((prev) => ({
      ...prev,
      highlightPoints: prev.highlightPoints.filter((_, pointIndex) => pointIndex !== index).length
        ? prev.highlightPoints.filter((_, pointIndex) => pointIndex !== index)
        : ['']
    }));
  };

  const removeGalleryImage = (imageUrl) => {
    setFormData((prev) => {
      const nextGallery = prev.galleryImages.filter((item) => item !== imageUrl);
      return {
        ...prev,
        image: nextGallery[0] || '',
        galleryImages: nextGallery
      };
    });
  };

  return (
    <div className="create-event-page container">
      <div className="page-header">
        <h1 className="gradient-text">Create New Event</h1>
        <p>Fill in the details below to launch your next big event.</p>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="success-overlay glass-panel"
          >
            <CheckCircle size={64} className="success-icon" />
            <h2>Event Published!</h2>
            <p>Your event is now live on EventSphere. Redirecting to dashboard...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form 
        initial={{ opacity:0, y:20 }} 
        animate={{ opacity:1, y:0 }} 
        className="create-event-form"
        onSubmit={handlePublish}
      >
        <div className="form-sections-grid">
          <div className="form-main-pane glass-panel">
            <div className="form-group">
              <label><Type size={16} /> Event Title</label>
              <input 
                type="text" 
                placeholder="e.g. Neon Dreams Music Festival" 
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label><LayoutPanelLeft size={16} /> Description</label>
              <textarea 
                rows="6" 
                placeholder="Describe your event in detail..."
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label><Calendar size={16} /> Date</label>
                <input 
                  type="date" 
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label><Clock size={16} /> Time</label>
                <input 
                  type="time" 
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label><MapPin size={16} /> Location</label>
              <input 
                type="text" 
                placeholder="Venue name or city" 
                required
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          <aside className="form-side-pane">
            <div className="glass-panel side-panel-card upload-card text-center">
              <div className="upload-placeholder">
                <Images size={48} />
                <span>Upload Event Gallery</span>
                <p>Up to 20 images. First image becomes cover.</p>
                {formData.galleryImages[0] && <img src={formData.galleryImages[0]} alt="Banner preview" style={{ width: '100%', borderRadius: '1rem', margin: '1rem 0', aspectRatio: '4 / 3', objectFit: 'cover' }} />}
                <input id="event-banner-upload" type="file" hidden accept="image/*" multiple onChange={handleImageUpload} />
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => document.getElementById('event-banner-upload')?.click()}>
                  {uploadingImage ? 'Uploading...' : 'Select Images'}
                </button>
                {formData.galleryImages.length > 0 && (
                  <div className="media-strip">
                    {formData.galleryImages.map((imageUrl, index) => (
                      <div key={imageUrl} className="media-chip">
                        <img src={imageUrl} alt={`Event asset ${index + 1}`} />
                        <button type="button" onClick={() => removeGalleryImage(imageUrl)}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="glass-panel side-panel-card">
              <div className="form-group">
                <label><Tag size={16} /> Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option>Concerts</option>
                  <option>Workshops</option>
                  <option>Seminars</option>
                  <option>Corporate</option>
                  <option>Weddings</option>
                </select>
              </div>
              
              <div className="form-group">
                <label><IndianRupee size={16} /> Price ({symbol})</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
                <p className="price-hint">Set to 0 for free events</p>
              </div>

              <div className="form-group">
                <label><Plus size={16} /> Highlight Points</label>
                <div className="highlight-points">
                  {formData.highlightPoints.map((point, index) => (
                    <div key={`point-${index}`} className="highlight-point-row">
                      <input
                        type="text"
                        placeholder={`Highlight ${index + 1}`}
                        value={point}
                        onChange={(e) => updateHighlightPoint(index, e.target.value)}
                      />
                      {formData.highlightPoints.length > 1 && (
                        <button type="button" className="point-remove-btn" onClick={() => removeHighlightPoint(index)}>
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {formData.highlightPoints.length < 8 && (
                  <button type="button" className="btn btn-secondary btn-sm add-point-btn" onClick={addHighlightPoint}>
                    <Plus size={14} /> Add Point
                  </button>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary create-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Publishing...' : 'Publish Event'} <ArrowRight size={18}/>
                </button>
                <button type="button" className="btn btn-secondary save-btn"><Save size={18}/> Draft</button>
              </div>
            </div>
          </aside>
        </div>
      </motion.form>
    </div>
  );
};

export default CreateEvent;

