import * as React from 'react';
import PropTypes from 'prop-types';
import * as styles from '../styles/button.module.css';

const ButtonList = ({ list, handleClick }) => (
  <div style={{ textAlign: 'center', padding: '30px' }}>
    {list.map((buttonLabel, i) => (
      <button
        className={styles.button}
        key={i}
        name={buttonLabel}
        onClick={() => handleClick(buttonLabel)}
      >
        {buttonLabel}
      </button>
    ))}
  </div>
);
export default ButtonList;

ButtonList.propTypes = {
  list: PropTypes.array,
  handleClick: PropTypes.any,
};
