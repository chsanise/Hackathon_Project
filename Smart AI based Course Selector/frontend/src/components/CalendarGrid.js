
import React, { useState } from 'react';
import './CalendarGrid.css';

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const times = ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM'];

const CalendarGrid = ({ onSelect }) => {
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const toggleSlot = (day, time) => {
    const slot = `${day} ${time}`;
    setSelectedSlots(prev =>
      prev.includes(slot)
        ? prev.filter(s => s !== slot)
        : [...prev, slot]
    );
  };

  const handleDone = () => {
    setSubmitted(true);
    onSelect(selectedSlots);
  };

  return (
    <div className="calendar-container">
      <table className="calendar-grid">
        <thead>
          <tr>
            <th></th>
            {weekdays.map(day => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {times.map(time => (
            <tr key={time}>
              <td className="time-header">{time}</td>
              {weekdays.map(day => {
                const slot = `${day} ${time}`;
                const selected = selectedSlots.includes(slot);
                return (
                  <td
                    key={slot}
                    className={`slot ${selected ? 'selected' : ''}`}
                    onClick={() => toggleSlot(day, time)}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <button className="done-button" onClick={handleDone}>Done Selecting</button>
      {/* {submitted && (
        <div style={{ marginTop: '10px', fontSize: '14px', color: '#333' }}>
          <strong>Selected Slots:</strong>
          <ul style={{ marginTop: '6px', paddingLeft: '18px' }}>
            {selectedSlots.map((slot, index) => (
              <li key={index}>{slot}</li>
            ))}
          </ul>
        </div>
      )} */}
    </div>
  );
};

export default CalendarGrid;
