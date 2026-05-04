import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  ArrowRight, 
  ArrowUpDown, 
  Calendar, 
  MapPin, 
  Tag, 
  Grid2X2,
  FilterX
} from 'lucide-react';
import EventCard from '../components/EventCard';
import { useCurrency } from '../context/CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import './EventListing.css';

const formatDateParam = (dateValue) => {
  if (!dateValue) return '';
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (_error) {
    return '';
  }
};

const EventListing = () => {
  const { formatPrice } = useCurrency();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialDate = searchParams.get('date') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [priceRange, setPriceRange] = useState('All');
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'price'
  
  const categoriesList = ['All', 'Concerts', 'Workshops', 'Seminars', 'Corporate', 'Weddings'];

  const [realEvents, setRealEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 9;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await api.get('/events');
        if (data.success) {
          setRealEvents(data.data);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const q = searchParams.get('search');
    const c = searchParams.get('category');
    const d = searchParams.get('date');
    if (q !== null) setSearchTerm(q);
    if (c !== null) setCategory(c);
    if (d !== null) setSelectedDate(d);
  }, [searchParams]);

  const displayEvents = realEvents;

  const filteredEvents = displayEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'All' || event.category === category;
    const eventDateNormalized = formatDateParam(event.date);
    const matchesDate = !selectedDate || eventDateNormalized === selectedDate;
    
    if (priceRange === 'Free' && event.price !== 0) return false;
    if (priceRange === 'Budget' && (event.price === 0 || event.price > 1000)) return false;
    if (priceRange === 'Premium' && event.price <= 1000) return false;

    return matchesSearch && matchesCategory && matchesDate;
  }).sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    return new Date(a.date) - new Date(b.date);
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, category, selectedDate, priceRange, sortBy]);

  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const paginatedEvents = filteredEvents.slice((currentPage - 1) * eventsPerPage, currentPage * eventsPerPage);

  const clearFilters = () => {
    setSearchTerm('');
    setCategory('All');
    setSelectedDate('');
    setPriceRange('All');
    setSearchParams({});
  };

  const handleDateChange = (value) => {
    setSelectedDate(value);
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set('date', value);
    } else {
      nextParams.delete('date');
    }
    setSearchParams(nextParams);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    const nextParams = new URLSearchParams(searchParams);
    if (value.trim()) {
      nextParams.set('search', value);
    } else {
      nextParams.delete('search');
    }
    setSearchParams(nextParams);
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    const nextParams = new URLSearchParams(searchParams);
    if (value && value !== 'All') {
      nextParams.set('category', value);
    } else {
      nextParams.delete('category');
    }
    setSearchParams(nextParams);
  };

  return (
    <div className="event-listing-page">
      {/* PAGE HEADER */}
      <section className="listing-hero">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hero-badge"
          ><Tag size={16} /> Upcoming Events</motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="gradient-text"
          >
            Explore Events
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Find upcoming events by category, city, date, and budget.
          </motion.p>
        </div>
      </section>

      <div className="container">
        {/* FILTER & SEARCH BAR */}
        <div className="listing-controls glass-panel">
          <div className="search-wrapper">
            <Search className="control-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search by event or city..." 
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <div className="control-group">
            <div className="select-wrapper">
              <Tag className="control-icon" size={18} />
              <select value={category} onChange={(e) => handleCategoryChange(e.target.value)}>
                {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="select-wrapper">
              <SlidersHorizontal className="control-icon" size={18} />
              <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
                <option value="All">All Prices</option>
                <option value="Free">Free Only</option>
                <option value="Budget">Under {formatPrice(1000)}</option>
                <option value="Premium">Above {formatPrice(1000)}</option>
              </select>
            </div>

            <div className="select-wrapper">
              <Calendar className="control-icon" size={18} />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="date-filter-input"
              />
            </div>

            <div className="select-wrapper">
              <ArrowUpDown className="control-icon" size={18} />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="date">Sort by Date</option>
                <option value="price">Sort by Price</option>
              </select>
            </div>
            
            {(searchTerm || category !== 'All' || priceRange !== 'All' || selectedDate) && (
              <button className="clear-btn" onClick={clearFilters}>
                <FilterX size={18} /> <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* CATEGORY CHIPS */}
        <div className="category-scroll">
          {categoriesList.map(cat => (
            <button 
              key={cat} 
              className={`cat-chip ${category === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* RESULTS COUNT */}
        <div className="results-header">
          <p>
            Showing <strong>{filteredEvents.length}</strong> events
            {selectedDate ? <span className="results-date-chip"> on {selectedDate}</span> : null}
          </p>
          <div className="view-toggle">
             <Grid2X2 size={20} className="active" />
          </div>
        </div>

        <div className="listing-grid">
          <AnimatePresence mode="popLayout">
            {paginatedEvents.map((event, i) => (
              <motion.div 
                layout
                key={event._id || event.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* PAGINATION UI */}
        {totalPages > 1 && (
          <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '3rem', paddingBottom: '3rem' }}>
            <button 
              className="btn btn-secondary" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              style={{ padding: '0.5rem 1rem', opacity: currentPage === 1 ? 0.5 : 1 }}
            >
              Previous
            </button>
            <div className="page-numbers" style={{ display: 'flex', gap: '0.5rem' }}>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  className={`btn ${currentPage === idx + 1 ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setCurrentPage(idx + 1)}
                  style={{ width: '36px', height: '36px', padding: 0, display: 'grid', placeItems: 'center', borderRadius: '8px' }}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <button 
              className="btn btn-secondary" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              style={{ padding: '0.5rem 1rem', opacity: currentPage === totalPages ? 0.5 : 1 }}
            >
              Next
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {filteredEvents.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="empty-state glass-panel"
          >
            <div className="empty-icon"><Search size={48} /></div>
            <h2>No Events Found</h2>
            <p>We could not find any events matching your filters. Try changing the search or clear all filters.</p>
            <button className="btn btn-primary" onClick={clearFilters}>Clear All Filters</button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EventListing;

