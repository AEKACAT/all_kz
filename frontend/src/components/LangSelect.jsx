import React from 'react';

const langOptions = [
  { label: 'KK', value: 'kk' },
  { label: 'RU', value: 'ru' },
];

export const LangSelect = ({
  defaultValue,
  onChange,
}) => {
  const [langValue, setValue] = React.useState(defaultValue);

  const handleChange = (event) => {
    onChange?.(event.target.value);
    setValue(event.target.value);
  };

  return (
    <div className="">
      <select
        className="rounded-md p-[8px] bg-alphaBlack45 text-neutralWhite h-10"
        value={langValue}
        onChange={handleChange}>
        {langOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
