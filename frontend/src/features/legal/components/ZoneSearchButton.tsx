import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ZoneSearchButtonProps {
  projectId: string;
}

const ZoneSearchButton: React.FC<ZoneSearchButtonProps> = ({ projectId }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/zone-search/${projectId}`);
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
          clipRule="evenodd"
        />
      </svg>
      用途地域検索
    </button>
  );
};

export default ZoneSearchButton; 