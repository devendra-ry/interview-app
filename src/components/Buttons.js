import React from 'react';
import PropTypes from 'prop-types';  // Import PropTypes for type checking
import styles from '../styles/App.module.css';  // Import CSS module for styling

const Buttons = ({ 
    startInterview = null, 
    endInterview = null, 
    goToNextQuestion = null, 
    submitText = null 
}) => {
    return (
        <div className={styles.buttonsContainer}>
            {/* Render buttons conditionally based on the provided props */}
            {startInterview && (
                <button onClick={startInterview}>Start Interview</button>
            )}
            {endInterview && (
                <button onClick={endInterview}>End Interview</button>
            )}
            {goToNextQuestion && (
                <button onClick={goToNextQuestion}>Next Question</button>
            )}
            {submitText && (
                <button onClick={submitText}>Submit Answer</button>
            )}
        </div>
    );
};

// Define PropTypes to ensure correct prop types are passed
Buttons.propTypes = {
    startInterview: PropTypes.func,
    endInterview: PropTypes.func,
    goToNextQuestion: PropTypes.func,
    submitText: PropTypes.func,
};

export default Buttons;
