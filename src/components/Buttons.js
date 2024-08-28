import React from 'react';
import styles from '../styles/App.module.css';

const Buttons = ({ startInterview, endInterview, goToNextQuestion, submitText }) => (
  <div className={styles.buttonsContainer}>
    {startInterview && <button onClick={startInterview}>Start Interview</button>}
    {endInterview && <button onClick={endInterview}>End Interview</button>}
    {goToNextQuestion && <button onClick={goToNextQuestion}>Next Question</button>}
    {submitText && <button onClick={submitText}>Submit Answer</button>}
  </div>
);

export default Buttons;
