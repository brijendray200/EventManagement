import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle, XCircle, Camera, RefreshCcw, ArrowLeft, ShieldCheck } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import './TicketScanner.css';

const TicketScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    // Only initialize if the element exists
    const readerElement = document.getElementById("reader");
    if (!readerElement) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 30, 
        qrbox: { width: 300, height: 300 },
        rememberLastUsedCamera: true,
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        videoConstraints: {
          facingMode: "environment"
        }
      },
      /* verbose= */ false
    );

    const onScanSuccess = (decodedText) => {
      scanner.pause(true); // Pause with video on
      handleVerification(decodedText);
    };

    const onScanFailure = (error) => {
      // Normal behavior: ignore scanning errors
    };

    try {
      scanner.render(onScanSuccess, onScanFailure);
    } catch (err) {
      console.error("Scanner render error:", err);
      setError("Unable to start camera. Please check permissions.");
    }

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.warn("Cleanup warning:", e));
      }
    };
  }, []);

  const handleVerification = async (scannedData) => {
    setIsVerifying(true);
    setError(null);
    try {
      let bookingId;
      try {
        // Try to parse JSON first (our new format)
        const data = JSON.parse(scannedData);
        bookingId = data.bookingId;
      } catch (e) {
        // Fallback for raw ID strings
        bookingId = scannedData;
      }

      if (!bookingId) {
        throw new Error("Invalid Ticket QR Format");
      }

      const { data } = await api.post('/bookings/verify-ticket', { bookingId });
      if (data.success) {
        setScanResult(data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Verification Failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setError(null);
    if (scannerRef.current) {
      scannerRef.current.resume();
    }
  };

  return (
    <div className="scanner-page container">
      <div className="scanner-header">
        <NavLink to="/organizer/dashboard" className="btn-back">
          <ArrowLeft size={18} /> Back to Dashboard
        </NavLink>
        <h1 className="gradient-text">Ticket <br />Scanner</h1>
        <p>Scan attendee QR codes to verify entry at the gate.</p>
      </div>

      <div className="scanner-container">
        {!scanResult && !error && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="scanner-viewport glass-panel"
          >
            <div id="reader"></div>
            {isVerifying && (
              <div className="verifying-overlay">
                <RefreshCcw className="spin" size={48} />
                <p>Verifying Ticket...</p>
              </div>
            )}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {scanResult && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="verification-result result-success glass-panel"
            >
              <div className="result-icon success-icon">
                <CheckCircle size={40} />
              </div>
              <h2>Admission <span className="gradient-text">Granted</span></h2>
              <p>This ticket is valid for entry.</p>

              <div className="result-details">
                <div className="detail-row"><span>Attendee</span><strong>{scanResult.attendeeName}</strong></div>
                <div className="detail-row"><span>Event</span><strong>{scanResult.eventName}</strong></div>
                <div className="detail-row"><span>Tickets</span><strong>{scanResult.quantity} Person(s)</strong></div>
                <div className="detail-row"><span>Status</span><strong style={{ color: '#22c55e' }}>{scanResult.status.toUpperCase()}</strong></div>
                <div className="detail-row"><span>Payment</span><strong>PAID</strong></div>
              </div>

              <div className="scanner-actions">
                <button className="btn btn-primary" onClick={resetScanner}>
                   Next Ticket <Camera size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="verification-result result-error glass-panel"
            >
              <div className="result-icon error-icon">
                <XCircle size={40} />
              </div>
              <h2>Admission <span className="gradient-text">Denied</span></h2>
              <p>{error}</p>

              <div className="scanner-actions">
                <button className="btn btn-primary" onClick={resetScanner}>
                   Try Again <RefreshCcw size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="scanner-help glass-panel" style={{ marginTop: '2rem', padding: '1.5rem', textAlign: 'center' }}>
          <ShieldCheck size={24} style={{ color: 'var(--primary)', marginBottom: '10px' }} />
          <h4>Organizer Verification</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>
            Only authorized organizers can verify tickets. Ensure you have a stable internet connection for real-time validation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TicketScanner;
