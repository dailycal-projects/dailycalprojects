import React from 'react';

const BikeTheftTips = () => (
  <div style={{
    backgroundColor: '#e9edf0',
    padding: '40px 40px 15px 40px',
    borderRadius: '5px',
    // marginLeft: '10px',
    // marginRight: '10px',
  }}
  >
    <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>How sources say to protect your scooter or bike</h3>
    <ul style={{ fontSize: '1.00em', listStylePosition: 'inside' }}>
      <style>
        {`
          li {
            margin-bottom: 5px; 
          }
        `}
      </style>
      <li>
        Use U-Locks instead of cable locks
        <ul style={{ listStyleType: 'circle', paddingLeft: '20px', marginTop: '5px' }}>
          {/* Sub-bullets */}
          <li>For bike owners, use a solid U-lock along with a cable to secure both the frame and wheels of the bike.</li>
          <li>For scooter owners, use a U-lock “between the scooter stem and the deck” to secure the vehicle to the rack.</li>
        </ul>
      </li>
      {/* <li>For bike owners, use a solid U-lock along with a cable in order to secure both the frame and wheels of the bike. </li> */}
      <li>Replace bicycle “quick-release” skewers on wheels</li>
      {/* <li>For scooter owners, use a U-lock “between the scooter stem and the deck” to secure the vehicle to the rack.</li> */}
      <li>Leave vehicles in visible, well-lit areas</li>
      <li>Don’t leave vehicles out overnight or for extended periods</li>
      <li>Keep a record of vehicle serial numbers</li>
      {}
    </ul>
  </div>
);

export default BikeTheftTips;
