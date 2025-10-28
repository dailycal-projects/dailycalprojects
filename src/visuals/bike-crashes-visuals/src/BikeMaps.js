import React, { useState } from 'react';

const years = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];

const mapUrls = {
  2019: 'https://api.mapbox.com/styles/v1/eshabansiya/cmdgkdy5v03k901r41nes8tq1.html?title=view&access_token=pk.eyJ1IjoiZXNoYWJhbnNpeWEiLCJhIjoiY21kZ2s3cDQ5MHI2eTJxb2U0N3M2YmF6eCJ9.lECv9CCR7GA1SCyPAP3gXw&zoomwheel=true&fresh=true#12.72/37.87285/-122.2797',
  2020: 'https://api.mapbox.com/styles/v1/eshabansiya/cmdxlu24q00d301srf9fh571v.html?title=view&access_token=pk.eyJ1IjoiZXNoYWJhbnNpeWEiLCJhIjoiY21kZ2s3cDQ5MHI2eTJxb2U0N3M2YmF6eCJ9.lECv9CCR7GA1SCyPAP3gXw&zoomwheel=true&fresh=true#12.72/37.87285/-122.2797',
  2021: 'https://api.mapbox.com/styles/v1/eshabansiya/cmdxlwsd800t801rhchta28ix.html?title=view&access_token=pk.eyJ1IjoiZXNoYWJhbnNpeWEiLCJhIjoiY21kZ2s3cDQ5MHI2eTJxb2U0N3M2YmF6eCJ9.lECv9CCR7GA1SCyPAP3gXw&zoomwheel=true&fresh=true#12.72/37.87285/-122.2797',
  2022: 'https://api.mapbox.com/styles/v1/eshabansiya/cmdxly06s00t901rh4w6m2i2s.html?title=view&access_token=pk.eyJ1IjoiZXNoYWJhbnNpeWEiLCJhIjoiY21kZ2s3cDQ5MHI2eTJxb2U0N3M2YmF6eCJ9.lECv9CCR7GA1SCyPAP3gXw&zoomwheel=true&fresh=true#12.72/37.87285/-122.2797',
  2023: 'https://api.mapbox.com/styles/v1/eshabansiya/cmdxlzdpa00d401sr0myj65z2.html?title=view&access_token=pk.eyJ1IjoiZXNoYWJhbnNpeWEiLCJhIjoiY21kZ2s3cDQ5MHI2eTJxb2U0N3M2YmF6eCJ9.lECv9CCR7GA1SCyPAP3gXw&zoomwheel=true&fresh=true#12.72/37.87285/-122.2797',
  2024: 'https://api.mapbox.com/styles/v1/eshabansiya/cmdxm0fsc00c801rebs0v7l8q.html?title=view&access_token=pk.eyJ1IjoiZXNoYWJhbnNpeWEiLCJhIjoiY21kZ2s3cDQ5MHI2eTJxb2U0N3M2YmF6eCJ9.lECv9CCR7GA1SCyPAP3gXw&zoomwheel=true&fresh=true#12.72/37.87285/-122.2797',
  2025: 'https://api.mapbox.com/styles/v1/eshabansiya/cmdxm1q3i00ia01sp6rdt93wb.html?title=view&access_token=pk.eyJ1IjoiZXNoYWJhbnNpeWEiLCJhIjoiY21kZ2s3cDQ5MHI2eTJxb2U0N3M2YmF6eCJ9.lECv9CCR7GA1SCyPAP3gXw&zoomwheel=true&fresh=true#12.72/37.87285/-122.2797',
};

const yearColors = {
  2020: '#ffe5ba',
  2021: '#fcac73',
  2022: '#f4854d',
  2023: '#e5653d',
  2024: '#bd5050',
  2025: '#aa3a45',
};

function BikeMaps() {
  const [selectedYear, setSelectedYear] = useState('2025');

  return (
    <div>
      <h3 style={{ textAlign: 'center' }}>Pedestrian and Biking Crashes in Berkeley as Road Improvements Continue</h3>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '10px',
        textAlign: 'center',
      }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginBottom: '10px',
        }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{
              width: '15px',
              height: '15px',
              backgroundColor: '#0b6b13',
              borderRadius: '50%',
            }}
            />
            <span>Biking Crash</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{
              width: '15px',
              height: '15px',
              backgroundColor: '#0f77d2',
              borderRadius: '50%',
            }}
            />
            <span>Pedestrian Crash</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{
              width: '15px',
              height: '15px',
              backgroundColor: 'white',
              borderRadius: '50%',
              border: '3px solid #b140b5',
            }}
            />
            <span>Fatality</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{
              width: '30px',
              height: '4px',
              backgroundColor: '#e5653d',
              borderRadius: '2px',
            }}
            />
            <span>Road improvements</span>
          </div>
        </div>

      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px',
      }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
        }}
        >
          <div style={{
            display: 'flex',
            width: '900px',
            overflow: 'hidden',
            border: '1px solid #ccc',
          }}
          >
            {years.map((year) => (
              <button
                type="button"
                key={year}
                onClick={() => setSelectedYear(year)}
                style={{
                  padding: '8px 5.49%',
                  backgroundColor: yearColors[year],
                  color: selectedYear === year ? 'white' : 'black',
                  border: selectedYear === year ? 'black 2px solid' : 'none',
                  cursor: 'pointer',
                  fontWeight: selectedYear === year ? 'bold' : 'normal',
                  opacity: selectedYear === year ? 1 : 0.85,
                  transition: 'opacity 0.2s',
                }}
              >
                {year}
              </button>
            ))}
          </div>

        </div>

        <iframe
          width="100%"
          height="600px"
          src={mapUrls[selectedYear]}
          title="Pedestrian and Biking Crashes in Berkeley"
          style={{ border: 'none' }}
        />
      </div>
    </div>
  );
}

export default BikeMaps;
