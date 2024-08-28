import React, { useRef, useEffect } from 'react';
import styles from '../styles/App.module.css'; 
const VideoStream = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const startLocalVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing local video stream:', error);
      }
    };

    startLocalVideo();

    return () => {
      if (videoRef.current) {
        const stream = videoRef.current.srcObject;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    };
  }, []);

  return (
    <div className={styles.videoWrapper}>
      <div className={styles.videoContainer}>
        <video ref={videoRef} autoPlay muted />
      </div>
    </div>
  );
};

export default VideoStream;
