import * as React from 'react';
import '../styles/button.css'; 

type AnimationProps = {
  list: string[]; 
  handleClick: any;
}

const ButtonList = (props: AnimationProps) => {

  return (
  <div>
    {props.list.map((buttonLabel: string, i) => (
        <button
          className="button"
          key={i}
          name={buttonLabel}
          onClick={() => props.handleClick(buttonLabel)}
        >
          {buttonLabel}
        </button>
      ))}
  </div>
  )
}
export default ButtonList;
