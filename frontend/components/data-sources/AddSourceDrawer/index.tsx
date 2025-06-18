import React from 'react';

interface AddSourceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddSourceDrawer: React.FC<AddSourceDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div style={{ padding: 24, background: '#f3f4f6', borderRadius: 8, textAlign: 'center' }}>
      <h2>Add Source Drawer</h2>
      <p>This is a placeholder component. Replace with your actual implementation.</p>
      <button onClick={onClose} style={{ marginTop: 16, padding: 8, borderRadius: 4, background: '#e5e7eb' }}>Close</button>
    </div>
  );
};

export default AddSourceDrawer; 