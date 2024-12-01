import React from 'react';
import { FixedSizeList as List } from 'react-window';
import addDays from 'date-fns/addDays';
import format from 'date-fns/format';

const Day = ({ index, style }) => {
  const date = addDays(new Date(), index - 10000); // Start from "today", can be any date
  return (
    <div style={style}>
      <div>{format(date, 'EEEE')}</div>
      <div>{format(date, 'dd/MM/yyyy')}</div>
    </div>
  );
};

const horizontalcalendar = () => (
  <List
    height={75} // Adjust based on your requirement
    itemCount={20000} // Total count of days
    itemSize={100} // Width of each day item
    layout="horizontal"
    width={1000} // Width of the List component
  >
    {Day}
  </List>
);

export default horizontalcalendar;
