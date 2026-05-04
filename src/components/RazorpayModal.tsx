import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { X, ShieldCheck, CreditCard, Laptop, Smartphone, CheckCircle, IndianRupee } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useNotifications } from '../context/NotificationContext';

const RazorpayModal = ({ isOpen, onClose, amount, onSuccess, eventTitle, targetId, type = 'booking' }) => {
    const { formatPrice } = useCurrency();
    const { showNotification, pushNotification } = useNotifications();
    const [step, setStep] = useState('payment_methods');

    useEffect(() => {
        if (isOpen) setStep('payment_methods');
    }, [isOpen]);

    if (!isOpen) return null;

    const handlePayment = async () => {
        if (!targetId) {
            alert('Payment target missing. Please refresh and try again.');
            return;
        }

        setStep('processing');

        // MOCK PAYMENT BYPASS
        if (targetId === 'mock-payment-id' || targetId.startsWith('mock')) {
            setTimeout(() => {
                setStep('success');
                showNotification(`Demo Payment Successful!`, 'success');
                pushNotification(
                    'Demo Payment successful',
                    `Your demo payment for ${eventTitle || 'this event'} was completed successfully.`,
                    'payment'
                );
                setTimeout(() => {
                    onSuccess();
                }, 1500);
            }, 2000);
            return;
        }

        try {
            // 1. Create order on backend based on type
            const endpoint = type === 'booking' ? `/bookings/${targetId}/pay` : `/ads/${targetId}/pay`;
            const { data } = await api.post(endpoint);
            if (!data.success) throw new Error(data.message);

            const order = data.order || data.data;

            // 2. Verify payment
            const verifyEndpoint = type === 'booking' ? `/bookings/verify` : `/ads/verify`;
            const verifyPayload = {
                razorpay_order_id: order.id,
                razorpay_payment_id: 'pay_' + Math.random().toString(36).substr(2, 9),
                razorpay_signature: 'dummy_sig'
            };

            if (type === 'ad') verifyPayload.adId = targetId;

            const verifyRes = await api.post(verifyEndpoint, verifyPayload);

            if (verifyRes.data.success) {
                setStep('success');
                showNotification(`Payment of ${formatPrice(amount)} Successful!`, 'success');
                pushNotification(
                    type === 'booking' ? 'Payment successful' : 'Campaign payment successful',
                    type === 'booking'
                        ? `Your payment for ${eventTitle || 'your booking'} was completed successfully.`
                        : `Your ad campaign payment for ${eventTitle || 'your campaign'} was completed successfully.`,
                    'payment'
                );
                setTimeout(() => {
                    onSuccess();
                }, 1500);
            }
        } catch (error) {
            console.error('Payment Error:', error);
            alert(error.response?.data?.message || 'Payment failed');
            setStep('payment_methods');
        }
    };

    const handleCODPayment = async () => {
        if (!targetId) return;
        
        setStep('processing');

        // MOCK PAYMENT BYPASS
        if (targetId === 'mock-payment-id' || targetId.startsWith('mock')) {
            setTimeout(() => {
                setStep('success');
                showNotification(`Demo COD Confirmation Successful!`, 'success');
                pushNotification(
                    'Demo COD confirmed',
                    `Your demo booking for ${eventTitle || 'this event'} was confirmed via COD.`,
                    'payment'
                );
                setTimeout(() => {
                    onSuccess();
                }, 1500);
            }, 1000);
            return;
        }

        try {
            const { data } = await api.post(`/bookings/${targetId}/cod`);
            if (data.success) {
                setStep('success');
                showNotification(`Booking Confirmed via COD!`, 'success');
                pushNotification(
                    'Booking Confirmed (COD)',
                    `Your booking for ${eventTitle || 'the event'} has been confirmed. Please pay at the venue.`,
                    'payment'
                );
                setTimeout(() => {
                    onSuccess();
                }, 1500);
            }
        } catch (error) {
            console.error('COD Error:', error);
            alert(error.response?.data?.message || 'COD confirmation failed');
            setStep('payment_methods');
        }
    };

    return (
        <div className="razorpay-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="razorpay-modal">
                <div className="razorpay-header">
                    <div className="rzp-brand">
                        <div className="rzp-logo-wrap"><span className="rzp-logo-letter">R</span></div>
                        <div className="rzp-header-text"><h3>EventSphere</h3><p>{eventTitle || 'Digital Payment'}</p></div>
                    </div>
                    <button className="rzp-close" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="razorpay-amount-bar"><span className="amt-label">Amount Payable</span><span className="amt-value">{formatPrice(amount)}</span></div>

                <div className="razorpay-body">
                    {step === 'payment_methods' && (
                        <div className="rzp-methods">
                            <h4 className="rzp-section-title">CARDS, UPI & MORE</h4>
                            <button className="rzp-method-item" onClick={handlePayment}>
                                <div className="rzp-method-icon card"><CreditCard size={20} /></div>
                                <div className="rzp-method-info"><strong>Card</strong><span>Visa, Mastercard & More</span></div>
                            </button>
                            <button className="rzp-method-item" onClick={handlePayment}>
                                <div className="rzp-method-icon upi"><Smartphone size={20} /></div>
                                <div className="rzp-method-info"><strong>UPI / QR</strong><span>Google Pay, PhonePe, Paytm</span></div>
                            </button>
                            <button className="rzp-method-item" onClick={handlePayment}>
                                <div className="rzp-method-icon netbanking"><Laptop size={20} /></div>
                                <div className="rzp-method-info"><strong>Netbanking</strong><span>All Indian Banks</span></div>
                            </button>

                            {type === 'booking' && (
                                <button className="rzp-method-item" onClick={handleCODPayment}>
                                    <div className="rzp-method-icon cod" style={{background: '#fff0f0', color: '#e74c3c'}}><IndianRupee size={20} /></div>
                                    <div className="rzp-method-info"><strong>Cash on Delivery (COD)</strong><span>Pay at the venue</span></div>
                                </button>
                            )}
                        </div>
                    )}
                    {step === 'processing' && (
                        <div className="rzp-processing"><div className="rzp-spinner"></div><h4>Processing Payment</h4><p>Do not refresh or press back</p></div>
                    )}
                    {step === 'success' && (
                        <div className="rzp-success">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }}><CheckCircle color="#10b981" size={64} /></motion.div>
                            <h4>Payment Successful</h4><p>Redirecting back to EventSphere...</p>
                        </div>
                    )}
                </div>
                <div className="razorpay-footer">
                  <div className="rzp-secure" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#1aab1a', fontSize: '0.75rem', fontWeight: 600 }}>
                    <ShieldCheck size={16} /> 
                    <span>END-TO-END ENCRYPTED PAYMENTS</span>
                  </div>
                </div>
            </motion.div>
            <style>{`
                .razorpay-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
                .razorpay-modal { width: 400px; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3); color: #333; }
                .razorpay-header { background: #232a38; color: white; padding: 16px; display: flex; justify-content: space-between; align-items: center; }
                .rzp-brand { display: flex; gap: 12px; align-items: center; }
                .rzp-logo-wrap { width: 36px; height: 36px; background: #339aff; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px; }
                .rzp-header-text h3 { margin: 0; font-size: 16px; }
                .rzp-header-text p { margin: 0; font-size: 11px; opacity: 0.7; }
                .rzp-close { background: transparent; border: none; color: white; cursor: pointer; opacity: 0.6; }
                .razorpay-amount-bar { background: #f8f9fa; padding: 12px 16px; display: flex; justify-content: space-between; border-bottom: 1px solid #eee; }
                .amt-label { font-size: 12px; color: #666; }
                .amt-value { font-size: 16px; font-weight: 700; }
                .razorpay-body { padding: 20px 16px; min-height: 280px; }
                .rzp-section-title { font-size: 11px; color: #888; margin-bottom: 16px; }
                .rzp-method-item { width: 100%; padding: 12px; display: flex; align-items: center; gap: 16px; background: white; border: 1px solid #eee; border-radius: 8px; margin-bottom: 10px; cursor: pointer; transition: all 0.2s; }
                .rzp-method-item:hover { border-color: #339aff; background: #f0f7ff; }
                .rzp-method-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
                .rzp-method-icon.card { background: #e7f3ff; color: #339aff; }
                .rzp-method-icon.upi { background: #f0fff4; color: #2ecc71; }
                .rzp-method-icon.netbanking { background: #fff5eb; color: #f39c12; }
                .rzp-method-info { display: flex; flex-direction: column; }
                .rzp-method-info strong { font-size: 14px; }
                .rzp-method-info span { font-size: 11px; color: #777; }
                .rzp-processing, .rzp-success { display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 40px; text-align: center; }
                .rzp-spinner { width: 48px; height: 48px; border: 4px solid #eee; border-top: 4px solid #339aff; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .razorpay-footer { padding: 12px; background: #f8f9fa; border-top: 1px solid #eee; text-align: center; }
                .rzp-secure { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 10px; color: #aaa; }
            `}</style>
        </div>
    );
};

export default RazorpayModal;

