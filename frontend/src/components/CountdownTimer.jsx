import { useState, useEffect } from 'react';

function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date(targetDate || now.setHours(23, 59, 59));
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
      {timeLeft.days > 0 && (
        <>
          <div style={{ 
            background: 'rgba(255,255,255,0.3)', 
            padding: '4px 8px', 
            borderRadius: '4px',
            fontWeight: 700,
            minWidth: '35px',
            textAlign: 'center'
          }}>
            {String(timeLeft.days).padStart(2, '0')}
          </div>
          <span style={{ fontSize: '12px', opacity: 0.8 }}>ngày</span>
        </>
      )}
      <div style={{ 
        background: 'rgba(255,255,255,0.3)', 
        padding: '4px 8px', 
        borderRadius: '4px',
        fontWeight: 700,
        minWidth: '35px',
        textAlign: 'center'
      }}>
        {String(timeLeft.hours).padStart(2, '0')}
      </div>
      <span>:</span>
      <div style={{ 
        background: 'rgba(255,255,255,0.3)', 
        padding: '4px 8px', 
        borderRadius: '4px',
        fontWeight: 700,
        minWidth: '35px',
        textAlign: 'center'
      }}>
        {String(timeLeft.minutes).padStart(2, '0')}
      </div>
      <span>:</span>
      <div style={{ 
        background: 'rgba(255,255,255,0.3)', 
        padding: '4px 8px', 
        borderRadius: '4px',
        fontWeight: 700,
        minWidth: '35px',
        textAlign: 'center'
      }}>
        {String(timeLeft.seconds).padStart(2, '0')}
      </div>
    </div>
  );
}

export default CountdownTimer;
