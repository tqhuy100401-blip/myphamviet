import React from 'react';

const SkeletonLoader = ({ type = 'text', count = 1 }) => {
  const skeletons = {
    text: (
      <div className="skeleton" style={{
        height: '20px',
        backgroundColor: '#e0e0e0',
        borderRadius: '4px',
        marginBottom: '10px',
        animation: 'skeleton-loading 1s linear infinite alternate'
      }} />
    ),
    card: (
      <div className="card" style={{ border: '1px solid #e0e0e0' }}>
        <div style={{
          height: '200px',
          backgroundColor: '#e0e0e0',
          animation: 'skeleton-loading 1s linear infinite alternate'
        }} />
        <div className="card-body">
          <div style={{
            height: '20px',
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            marginBottom: '10px',
            animation: 'skeleton-loading 1s linear infinite alternate'
          }} />
          <div style={{
            height: '20px',
            width: '60%',
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            animation: 'skeleton-loading 1s linear infinite alternate'
          }} />
        </div>
      </div>
    ),
    productGrid: (
      <div className="row">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="col-md-3 col-6 mb-4">
            <div className="card">
              <div style={{
                height: '200px',
                backgroundColor: '#e0e0e0',
                animation: 'skeleton-loading 1s linear infinite alternate'
              }} />
              <div className="card-body">
                <div style={{
                  height: '20px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '4px',
                  marginBottom: '10px',
                  animation: 'skeleton-loading 1s linear infinite alternate'
                }} />
                <div style={{
                  height: '20px',
                  width: '60%',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '4px',
                  animation: 'skeleton-loading 1s linear infinite alternate'
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  };

  // Add CSS for animation if not already present
  React.useEffect(() => {
    if (!document.getElementById('skeleton-style')) {
      const style = document.createElement('style');
      style.id = 'skeleton-style';
      style.innerHTML = `
        @keyframes skeleton-loading {
          0% {
            opacity: 0.6;
          }
          100% {
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (type === 'productGrid') {
    return skeletons[type];
  }

  return (
    <>
      {Array(count).fill(0).map((_, i) => (
        <div key={i}>{skeletons[type]}</div>
      ))}
    </>
  );
};

export default SkeletonLoader;
