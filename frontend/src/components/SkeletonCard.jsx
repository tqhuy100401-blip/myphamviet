function SkeletonCard() {
  const shimmer = `
    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }
  `;

  const skeletonStyle = {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '1000px 100%',
    animation: 'shimmer 2s infinite',
    borderRadius: '8px'
  };

  return (
    <>
      <style>{shimmer}</style>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        border: '2px solid #e2e8f0',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '10px'
      }}>
        {/* Image skeleton */}
        <div style={{
          ...skeletonStyle,
          width: '100%',
          height: '220px',
          marginBottom: '12px'
        }} />
        
        {/* Category skeleton */}
        <div style={{
          ...skeletonStyle,
          width: '60px',
          height: '14px',
          marginBottom: '8px'
        }} />
        
        {/* Title skeleton */}
        <div style={{
          ...skeletonStyle,
          width: '100%',
          height: '16px',
          marginBottom: '6px'
        }} />
        <div style={{
          ...skeletonStyle,
          width: '80%',
          height: '16px',
          marginBottom: '12px'
        }} />
        
        {/* Price skeleton */}
        <div style={{
          ...skeletonStyle,
          width: '100px',
          height: '20px',
          marginBottom: '12px'
        }} />
        
        {/* Description skeleton */}
        <div style={{
          ...skeletonStyle,
          width: '100%',
          height: '12px',
          marginBottom: '4px'
        }} />
        <div style={{
          ...skeletonStyle,
          width: '90%',
          height: '12px',
          marginBottom: '12px'
        }} />
        
        {/* Rating skeleton */}
        <div style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '12px'
        }}>
          <div style={{
            ...skeletonStyle,
            width: '80px',
            height: '14px'
          }} />
        </div>
        
        {/* Stats skeleton */}
        <div style={{
          ...skeletonStyle,
          width: '120px',
          height: '12px',
          marginBottom: '8px'
        }} />
        
        {/* Progress bar skeleton */}
        <div style={{
          ...skeletonStyle,
          width: '100%',
          height: '4px',
          marginBottom: '12px'
        }} />
        
        {/* Buttons skeleton */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: 'auto'
        }}>
          <div style={{
            ...skeletonStyle,
            flex: 1,
            height: '42px'
          }} />
          <div style={{
            ...skeletonStyle,
            flex: 1,
            height: '42px'
          }} />
        </div>
      </div>
    </>
  );
}

export default SkeletonCard;
