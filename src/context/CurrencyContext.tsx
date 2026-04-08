import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState({
        code: 'INR',
        symbol: '₹',
        rate: 1,
        country: 'India'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLocationAndRates = async () => {
            try {
                // 1. Get user location and local currency code
                const ipResponse = await fetch('https://ipapi.co/json/');
                const ipData = await ipResponse.json();
                
                const userCurrencyCode = ipData.currency || 'INR';
                const userCountry = ipData.country_name || 'India';

                // 2. Get conversion rates from INR (since our mock data is in INR)
                const rateResponse = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
                const rateData = await rateResponse.json();
                
                const userRate = rateData.rates[userCurrencyCode] || 1;

                // 3. Set standard symbols for common currencies
                const symbols = {
                    'USD': '$',
                    'EUR': '€',
                    'GBP': '£',
                    'INR': '₹',
                    'JPY': '¥',
                    'CAD': 'CA$',
                    'AUD': 'A$',
                    'AED': 'د.إ',
                    'SAR': '﷼',
                    'CNY': '¥'
                };

                setCurrency({
                    code: userCurrencyCode,
                    symbol: symbols[userCurrencyCode] || userCurrencyCode,
                    rate: userRate,
                    country: userCountry
                });
            } catch (error) {
                console.error('Error fetching currency/location:', error);
                // Fallback to INR if something goes wrong
            } finally {
                setLoading(false);
            }
        };

        fetchLocationAndRates();
    }, []);

    const formatPrice = (priceInINR) => {
        if (priceInINR === 0) return 'FREE';
        
        const convertedPrice = priceInINR * currency.rate;
        
        // Use Intl.NumberFormat for nice formatting
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currency.code,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(convertedPrice);
    };

    return (
        <CurrencyContext.Provider value={{ ...currency, formatPrice, loading }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};

