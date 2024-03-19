import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../img/logo.jpg';
import './Loading.css';

function Loading() {
  const [animationComplete, setAnimationComplete] = useState(false);
  const navigate = useNavigate(); 

  const handleAnimationEnd = () => {
    setAnimationComplete(true);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      navigate('login-user');
    }, 3000);

    
    return () => clearTimeout(timeoutId);
  }, [navigate, animationComplete]);

  return (
    <>
      <div className={`image ${animationComplete ? 'animation-complete' : ''}`} onAnimationEnd={handleAnimationEnd}>
        <img src={logo} alt="Logo" />
      </div>
      {animationComplete && (
        <>
          <div className="slogan">
            <h1>SmartRoad</h1>
          </div>
          <div className="credits">
            <p>ITC/IES El Rincon</p>
          </div>
        </>
      )}
    </>
  );
}

export default Loading;
