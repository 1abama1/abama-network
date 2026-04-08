import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Ghost } from 'lucide-react';
import './NotFoundPage.css';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-content glass">
        <motion.div 
          className="not-found-icon"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Ghost size={120} strokeWidth={1} className="ghost-icon" />
          <div className="basketball-shadow"></div>
        </motion.div>
        
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Out of Bounds</h2>
        <p className="not-found-text">
          Looks like you've drifted off the court. The page you're looking for doesn't exist or has been moved.
        </p>
        
        <motion.button 
          className="btn-primary back-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={18} />
          <span>Back to Court</span>
        </motion.button>
      </div>
      
      {/* Decorative background elements */}
      <div className="court-line line-1"></div>
      <div className="court-line line-2"></div>
      <div className="court-line line-3"></div>
    </div>
  );
};

export default NotFoundPage;
