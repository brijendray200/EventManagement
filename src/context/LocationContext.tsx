import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();
const DEFAULT_LOCATION = {
    city: 'Lucknow',
    fullLocation: 'Lucknow, Uttar Pradesh, India',
    latitude: null,
    longitude: null,
    error: null,
    loading: false
};

export const LocationProvider = ({ children }) => {
    // Check localStorage for persisted location
    const persistedLocation = JSON.parse(localStorage.getItem('user_location'));
    
    const [location, setLocation] = useState({
        city: persistedLocation?.city || DEFAULT_LOCATION.city,
        fullLocation: persistedLocation?.fullLocation || DEFAULT_LOCATION.fullLocation,
        latitude: persistedLocation?.latitude || DEFAULT_LOCATION.latitude,
        longitude: persistedLocation?.longitude || DEFAULT_LOCATION.longitude,
        error: null,
        loading: false
    });

    useEffect(() => {
        if (!persistedLocation) {
            localStorage.setItem('user_location', JSON.stringify(DEFAULT_LOCATION));
            setLocation(DEFAULT_LOCATION);
        } else {
            setLocation(prev => ({ ...prev, loading: false }));
        }
    }, []);

    const changeLocation = (newCity) => {
        const updated = { ...location, city: newCity, fullLocation: `${newCity}, Uttar Pradesh, India` };
        setLocation(updated);
        localStorage.setItem('user_location', JSON.stringify(updated));
    };

    const refreshLocation = () => {
        setLocation(DEFAULT_LOCATION);
        localStorage.setItem('user_location', JSON.stringify(DEFAULT_LOCATION));
    };

    return (
        <LocationContext.Provider value={{ ...location, changeLocation, refreshLocation }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};

