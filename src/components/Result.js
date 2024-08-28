import React from 'react';
import styles from '../styles/App.module.css';

const Result = ({ evaluationResult }) => {
  return (
    <div className={styles.evaluationResult}>
      {evaluationResult}
    </div>
  );
};

export default Result;
