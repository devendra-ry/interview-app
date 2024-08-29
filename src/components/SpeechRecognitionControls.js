import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes for type checking
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // FontAwesomeIcon import
import { faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons'; // Import necessary icons
import styles from '../styles/App.module.css'; // Import CSS module for styling

const SpeechRecognitionControls = ({ listening, handleMicClick }) => (
  <div className={styles.micWrapper}>
    <button className={styles.micButton} onClick={handleMicClick}>
      <FontAwesomeIcon icon={listening ? faMicrophoneSlash : faMicrophone} />
    </button>
    <div className={styles.micStatus}>
      {listening ? 'Recording...' : 'Click to Start Recording'}
    </div>
  </div>
);

// Define PropTypes to ensure correct prop types are passed
SpeechRecognitionControls.propTypes = {
  listening: PropTypes.bool.isRequired, // listening should be a boolean and is required
  handleMicClick: PropTypes.func.isRequired, // handleMicClick should be a function and is required
};

export default SpeechRecognitionControls;
