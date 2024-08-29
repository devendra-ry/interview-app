import React from 'react';
import PropTypes from 'prop-types';  // Import PropTypes for type checking
import styles from '../styles/App.module.css';  // Import CSS module for styling

const Result = ({ evaluationResult = '' }) => {
    return (
        <div className={styles.evaluationResult}>
            {evaluationResult}
        </div>
    );
};

// Define PropTypes to ensure correct prop types are passed
Result.propTypes = {
    evaluationResult: PropTypes.string,  // Expecting a string for evaluationResult
};

export default Result;
