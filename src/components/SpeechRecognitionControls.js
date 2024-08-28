import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/App.module.css'; 

const SpeechRecognitionControls = ({ listening, handleMicClick }) => {
  return (
    <div className={styles.micWrapper}>
      <button className={styles.micButton} onClick={handleMicClick}>
        <FontAwesomeIcon icon={listening ? faMicrophoneSlash : faMicrophone} />
      </button>
      <div className={styles.micStatus}>
        {listening ? 'Recording...' : 'Click to Start Recording'}
      </div>
    </div>
  );
};

export default SpeechRecognitionControls;
