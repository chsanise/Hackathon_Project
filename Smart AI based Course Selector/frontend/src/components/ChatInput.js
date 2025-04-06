import React, { useState } from 'react';
import './ChatInput.css';

const ChatInput = ({ step, options, onSubmit }) => {
  const [inputValue, setInputValue] = useState('');

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      submitInput();
    }
  };

  const submitInput = () => {
    if (inputValue.trim() !== '') {
      onSubmit(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="chat-input-bubble">
      {/* Only show question for input fields */}
      {step.type !== 'dropdown' && (
        <div className="chat-question">{step.question}</div>
      )}

      <div className="chat-input-row">
        {step.type === 'dropdown' ? (
          <select value={inputValue} onChange={handleChange}>
            <option value="">Select an option</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            placeholder="Type your answer..."
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        )}
        <button onClick={submitInput} disabled={inputValue === ''}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
