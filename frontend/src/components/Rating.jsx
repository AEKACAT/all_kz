import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export const Rating= ({
  value,
  max = 5,
  size = 'text-xl',
  showValue = true,
}) => {
  const stars = [];

  for (let i = 1; i <= max; i++) {
    if (value >= i) {
      stars.push(<FaStar key={i} />);
    } else if (value >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} />);
    } else {
      stars.push(<FaRegStar key={i} />);
    }
  }

  return (
    <div className={`flex items-center space-x-2 text-yellow-400 ${size}`}>
      <div className="flex">{stars}</div>
      {showValue && (
        <span className="text-black text-base ml-1">
          {value} / <span className="text-gray-400">{max}</span>
        </span>
      )}
    </div>
  );
};
