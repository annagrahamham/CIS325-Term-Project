function StatusBanner({ type = 'error', message }) {
  if (!message) return null;
  return <p className={`form-message ${type === 'success' ? 'success' : ''}`}>{message}</p>;
}

export default StatusBanner;
