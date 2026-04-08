import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Megaphone, 
    Image as ImageIcon, 
    Video,
    Link as LinkIcon, 
    Calendar, 
    CheckCircle, 
    ArrowRight, 
    TrendingUp, 
    Layers, 
    MousePointer2, 
    Clock, 
    IndianRupee, 
    Plus, 
    History,
    ShieldCheck,
    AlertCircle,
    X
} from 'lucide-react';
import api from '../utils/api';
import { uploadMedia } from '../utils/upload';
import RazorpayModal from '../components/RazorpayModal';
import './PlaceAd.css';

const PlaceAd = () => {
    const [activeTab, setActiveTab] = useState('create'); // 'create', 'my-ads'
    const [myAds, setMyAds] = useState([]);
    const [loadingAds, setLoadingAds] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '',
        imageUrls: [],
        videoUrls: [],
        linkUrl: '',
        type: 'banner', // banner, event_boost, sidebar
        days: 7
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdAd, setCreatedAd] = useState(null);
    const [showPayment, setShowPayment] = useState(false);
    const [uploadingMedia, setUploadingMedia] = useState(false);

    const pricing = {
        banner: { rate: 1000, label: 'Main Hero Banner', desc: 'Prominent placement on the homepage hero section.' },
        event_boost: { rate: 500, label: 'Event Boost', desc: 'Rank your event at the top of search results.' },
        sidebar: { rate: 300, label: 'Sidebar Placement', desc: 'Display on event detail pages and listings.' }
    };

    const placementDetails = [
        {
            type: 'banner',
            icon: <Megaphone size={20} />,
            title: 'Homepage Hero Banner',
            description: 'Best for launches, festivals, ticket drops, and brand campaigns that need instant top visibility.',
            price: '₹1,000 / day',
            points: ['Top homepage exposure', 'Ideal for broad reach', 'Strong visual storytelling']
        },
        {
            type: 'event_boost',
            icon: <TrendingUp size={20} />,
            title: 'Event Boost Placement',
            description: 'Push your event higher in discovery flows so users notice it faster while browsing.',
            price: '₹500 / day',
            points: ['Improved event discovery', 'Useful for active ticket sales', 'High intent audience']
        },
        {
            type: 'sidebar',
            icon: <Layers size={20} />,
            title: 'Sidebar Placement',
            description: 'Show your creative alongside content-heavy pages for sustained visibility and reminder traffic.',
            price: '₹300 / day',
            points: ['Budget-friendly exposure', 'Good for retargeting', 'Runs across supporting pages']
        }
    ];

    const campaignSteps = [
        { title: 'Choose Placement', desc: 'Pick the ad format that matches your launch, audience, and budget.' },
        { title: 'Upload Creatives', desc: 'Add banner images, optional videos, and your target landing link.' },
        { title: 'Reserve & Pay', desc: 'Confirm duration, review budget, and activate your campaign securely.' }
    ];

    const creativeGuidelines = [
        'Use one strong headline and one clear call-to-action.',
        'Keep destination links direct and mobile-friendly.',
        'Upload polished visuals that match your event or brand theme.',
        'Avoid cluttered creatives with too much small text.'
    ];

    const faqItems = [
        { q: 'When does my campaign go live?', a: 'Your campaign becomes active right after successful payment and approval-ready activation in the system.' },
        { q: 'Can I promote an event and a brand together?', a: 'Yes, as long as the banner, link, and campaign copy point to one clear action for the user.' },
        { q: 'Can I upload multiple creatives?', a: 'Yes. You can upload multiple images and videos for a single campaign, and the first image acts as the main cover.' }
    ];

    const totalAmount = pricing[formData.type].rate * formData.days;

    useEffect(() => {
        if (activeTab === 'my-ads') fetchMyAds();
    }, [activeTab]);

    const fetchMyAds = async () => {
        setLoadingAds(true);
        try {
            const { data } = await api.get('/ads/my-ads');
            if (data.success) setMyAds(data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingAds(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { data } = await api.post('/ads', formData);
            if (data.success) {
                setCreatedAd(data.data);
                setShowPayment(true);
            }
        } catch (error) {
            alert('Failed to create ad campaign');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePaymentSuccess = () => {
        setShowPayment(false);
        setCreatedAd(null);
        setActiveTab('my-ads');
    };

    const handleMediaUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        try {
            setUploadingMedia(true);
            const uploads = await Promise.all(files.map((file) => uploadMedia(file, 'eventsphere/ads')));
            setFormData((prev) => {
                const nextImages = [...new Set([
                    ...prev.imageUrls,
                    ...uploads.filter((item) => item.mediaType === 'image').map((item) => item.secureUrl)
                ])].slice(0, 20);
                const nextVideos = [...new Set([
                    ...prev.videoUrls,
                    ...uploads.filter((item) => item.mediaType === 'video').map((item) => item.secureUrl)
                ])].slice(0, 10);
                return {
                    ...prev,
                    imageUrl: nextImages[0] || prev.imageUrl,
                    imageUrls: nextImages,
                    videoUrls: nextVideos,
                };
            });
        } catch (error) {
            alert(error.message || 'Creative upload failed');
        } finally {
            setUploadingMedia(false);
            e.target.value = '';
        }
    };

    const removeAsset = (type, url) => {
        setFormData((prev) => {
            if (type === 'image') {
                const nextImages = prev.imageUrls.filter((item) => item !== url);
                return {
                    ...prev,
                    imageUrl: nextImages[0] || '',
                    imageUrls: nextImages,
                };
            }

            return {
                ...prev,
                videoUrls: prev.videoUrls.filter((item) => item !== url),
            };
        });
    };

    return (
        <div className="place-ad-page container">
            <header className="ad-header">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="gradient-text">Brand <br />Amplifier</h1>
                    <p>Promote your event, brand, or campaign with clear placement options, transparent pricing, and fast campaign activation.</p>
                </motion.div>

                <div className="ad-tabs glass-panel">
                    <button className={activeTab === 'create' ? 'active' : ''} onClick={() => setActiveTab('create')}>
                        <Plus size={18} /> New Campaign
                    </button>
                    <button className={activeTab === 'my-ads' ? 'active' : ''} onClick={() => setActiveTab('my-ads')}>
                        <History size={18} /> My Campaigns
                    </button>
                </div>
            </header>

            <section className="ad-info-shell">
                <div className="ad-package-grid">
                    {placementDetails.map((item) => (
                        <div key={item.type} className={`ad-package-card glass-panel ${formData.type === item.type ? 'active' : ''}`}>
                            <div className="ad-package-head">
                                <div className="ad-package-icon">{item.icon}</div>
                                <div>
                                    <h3>{item.title}</h3>
                                    <span>{item.price}</span>
                                </div>
                            </div>
                            <p>{item.description}</p>
                            <div className="ad-package-points">
                                {item.points.map((point) => (
                                    <div key={point} className="ad-package-point">
                                        <CheckCircle size={14} />
                                        <span>{point}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="ad-education-grid">
                    <div className="ad-education-card glass-panel">
                        <div className="section-title-sm">How It Works</div>
                        <div className="campaign-step-list">
                            {campaignSteps.map((step, index) => (
                                <div key={step.title} className="campaign-step-item">
                                    <div className="campaign-step-number">{index + 1}</div>
                                    <div>
                                        <strong>{step.title}</strong>
                                        <p>{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="ad-education-card glass-panel">
                        <div className="section-title-sm">Creative Guidelines</div>
                        <div className="guideline-list">
                            {creativeGuidelines.map((item) => (
                                <div key={item} className="guideline-item">
                                    <ShieldCheck size={16} />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <AnimatePresence mode="wait">
                {activeTab === 'create' ? (
                    <motion.div 
                        key="create"
                        initial={{ opacity: 0, x: -20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: 20 }}
                        className="ad-grid"
                    >
                        <main className="ad-form-wrap glass-panel">
                            <form onSubmit={handleSubmit}>
                                <div className="section-title-sm">Campaign Essentials</div>
                                <div className="form-group">
                                    <label><Megaphone size={16} /> Campaign Title</label>
                                    <input type="text" placeholder="e.g. Summer Tech Summit 2026" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label><Layers size={16} /> Description</label>
                                    <textarea placeholder="Briefly explain what you are promoting..." required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                                
                                <div className="section-title-sm" style={{ marginTop: '2rem' }}>Assets & Links</div>
                                <div className="form-group">
                                    <label><ImageIcon size={16} /> Banner Image URL</label>
                                    <input type="url" placeholder="https://cdn.yourbrand.com/banner.jpg" required value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value, imageUrls: e.target.value ? [e.target.value, ...formData.imageUrls.filter((item) => item !== e.target.value)].slice(0, 20) : formData.imageUrls })} />
                                    <input id="ad-banner-upload" type="file" hidden accept="image/*,video/*" multiple onChange={handleMediaUpload} />
                                    <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }} onClick={() => document.getElementById('ad-banner-upload')?.click()}>
                                        {uploadingMedia ? 'Uploading...' : 'Upload Images / Videos'}
                                    </button>
                                    <p className="asset-copy">Add up to 20 images and 10 videos for one campaign.</p>
                                    {(formData.imageUrls.length > 0 || formData.videoUrls.length > 0) && (
                                        <div className="creative-strip">
                                            {formData.imageUrls.map((url, index) => (
                                                <div key={`${url}-${index}`} className="creative-item">
                                                    <img src={url} alt={`Creative ${index + 1}`} />
                                                    <span className="creative-tag">IMG</span>
                                                    <button type="button" onClick={() => removeAsset('image', url)}>
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            {formData.videoUrls.map((url, index) => (
                                                <div key={`${url}-${index}`} className="creative-item video">
                                                    <video src={url} muted playsInline />
                                                    <span className="creative-tag">VID</span>
                                                    <button type="button" onClick={() => removeAsset('video', url)}>
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label><LinkIcon size={16} /> Call-to-Action Link</label>
                                    <input type="url" placeholder="https://yourbrand.com/signup" required value={formData.linkUrl} onChange={e => setFormData({ ...formData, linkUrl: e.target.value })} />
                                </div>

                                <div className="section-title-sm" style={{ marginTop: '2rem' }}>Scheduling</div>
                                <div className="form-group-row">
                                    <div className="form-group">
                                        <label>Placement Type</label>
                                        <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                            <option value="banner">Main Hero Banner</option>
                                            <option value="event_boost">Event Boost</option>
                                            <option value="sidebar">Sidebar Placement</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label><Calendar size={16} /> Days</label>
                                        <input type="number" min="1" max="90" value={formData.days} onChange={e => setFormData({ ...formData, days: e.target.value })} />
                                    </div>
                                </div>

                                <div className="ad-estimate glass-panel">
                                    <div className="est-info">
                                        <span>Estimated Reach</span>
                                        <strong>{formData.days * 5000}+ Users</strong>
                                    </div>
                                    <div className="est-info price">
                                        <span>Total Budget</span>
                                        <strong className="gradient-text">₹{totalAmount}</strong>
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary create-btn" style={{ width: '100%', padding: '1.25rem' }} disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating Campaign...' : 'Reserve Ad Space'} <ArrowRight size={18} />
                                </button>
                            </form>
                        </main>

                        <aside className="ad-visual-preview">
                            <div className="preview-label">Live Preview</div>
                            <div className="glass-panel preview-card">
                                <div className="preview-banner-mock">
                                    {formData.imageUrl ? (
                                        <img src={formData.imageUrl} alt="Preview" />
                                    ) : (
                                        <div className="mock-placeholder"><ImageIcon size={40} /></div>
                                    )}
                                    <div className="mock-badge">SPONSORED</div>
                                </div>
                                <div className="preview-content-mock">
                                    <h3>{formData.title || 'Campaign Title'}</h3>
                                    <p>{formData.description || 'Global tech event of the year...'}</p>
                                    {(formData.imageUrls.length > 0 || formData.videoUrls.length > 0) && (
                                        <div className="preview-assets-row">
                                            {formData.imageUrls.slice(0, 4).map((url, index) => (
                                                <div key={`preview-image-${index}`} className="preview-asset-thumb">
                                                    <img src={url} alt={`Asset ${index + 1}`} />
                                                </div>
                                            ))}
                                            {formData.videoUrls.slice(0, 2).map((url, index) => (
                                                <div key={`preview-video-${index}`} className="preview-asset-thumb video">
                                                    <Video size={16} />
                                                    <video src={url} muted playsInline />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <button className="btn btn-primary btn-sm" disabled>{formData.type === 'banner' ? 'Learn More' : 'Book Now'}</button>
                                </div>
                            </div>

                            <div className="benefit-stack">
                                <div className="benefit-item">
                                    <TrendingUp size={18} color="var(--primary)" />
                                    <div><strong>Maximized Visibility</strong><span>Priority placement above organic content.</span></div>
                                </div>
                                <div className="benefit-item">
                                    <MousePointer2 size={18} color="var(--secondary)" />
                                    <div><strong>High CTR</strong><span>Optimized for clicks and engagement.</span></div>
                                </div>
                            </div>
                        </aside>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="history"
                        initial={{ opacity: 0, x: 20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: -20 }}
                        className="ad-history-view"
                    >
                        {loadingAds ? (
                            <div className="text-center" style={{ padding: '5rem' }}>Loading campaigns...</div>
                        ) : myAds.length === 0 ? (
                            <div className="glass-panel text-center" style={{ padding: '5rem' }}>
                                <Megaphone size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                <h3>No campaigns yet</h3>
                                <p style={{ color: 'var(--text-dim)' }}>Your advertising journey starts here.</p>
                                <button className="btn btn-secondary btn-sm" style={{ marginTop: '2rem' }} onClick={() => setActiveTab('create')}>Launch First Ad</button>
                            </div>
                        ) : (
                            <div className="ad-table-wrap glass-panel">
                                <table className="ad-table">
                                    <thead>
                                        <tr>
                                            <th>Campaign</th>
                                            <th>Type</th>
                                            <th>Status</th>
                                            <th>Period</th>
                                            <th>Budget</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myAds.map(ad => (
                                            <tr key={ad._id}>
                                                <td>
                                                    <div className="td-campaign">
                                                        <img src={ad.imageUrl} alt="" />
                                                        <div>
                                                            <strong>{ad.title}</strong>
                                                            <span>{ad.imageUrls?.length || 1} images{ad.videoUrls?.length ? ` • ${ad.videoUrls.length} videos` : ''}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span className={`type-tag ${ad.type}`}>{ad.type.replace('_', ' ')}</span></td>
                                                <td>
                                                    <span className={`status-pill ${ad.status}`}>
                                                        {ad.status === 'active' ? <div className="pulse-dot"></div> : null}
                                                        {ad.status}
                                                    </span>
                                                </td>
                                                <td><div className="td-date"><Clock size={12} /> {new Date(ad.startDate).toLocaleDateString()}</div></td>
                                                <td><strong>₹{ad.totalAmount}</strong></td>
                                                <td>
                                                    {ad.status === 'pending' && (
                                                        <button 
                                                            className="btn btn-primary btn-sm" 
                                                            onClick={() => { setCreatedAd(ad); setShowPayment(true); }}
                                                        >
                                                            Pay Now
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <section className="ad-faq-shell">
                <div className="faq-heading">
                    <h2>Advertising <span className="gradient-text">FAQ</span></h2>
                    <p>Quick answers before you launch your next campaign.</p>
                </div>
                <div className="ad-faq-grid">
                    {faqItems.map((item) => (
                        <div key={item.q} className="ad-faq-card glass-panel">
                            <div className="ad-faq-question">
                                <AlertCircle size={18} />
                                <strong>{item.q}</strong>
                            </div>
                            <p>{item.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            <RazorpayModal 
                isOpen={showPayment}
                onClose={() => setShowPayment(false)}
                amount={createdAd?.totalAmount || 0}
                onSuccess={handlePaymentSuccess}
                eventTitle={createdAd?.title}
                targetId={createdAd?._id}
                type="ad"
            />
        </div>
    );
};

export default PlaceAd;

