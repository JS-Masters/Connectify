import { formatDate } from '@fullcalendar/core'
import './Calendar.css';
import { Box, Checkbox, Flex, Spacer } from '@chakra-ui/react';

const Sidebar = ({ weekendsVisible, handleWeekendsToggle, currentEvents }) => {
  return (
    <Flex  className='demo-app-sidebar'
    direction='column'
    justifyContent='space-between'>
      <div className='demo-app-sidebar-section' >
        <div style={{textAlign:'center'}}>
        <h2 id='all-events-title'><span>{currentEvents.length}</span> MEETINGS</h2>
        </div>
     
        <ul>
          {currentEvents.map((event) => (
            <li key={event.id}>
              <b>{formatDate(event.start, { year: 'numeric', month: 'short', day: 'numeric' })}</b>
              <i>{event.title}</i>
            </li>
          ))}
        </ul>
      </div>

      <div className='demo-app-sidebar-section'>
        <label id='weekends-lable'>
          <Checkbox
            _checked={{
              "& .chakra-checkbox__control": {
                background: "black", // Set your desired color here
                borderColor:"rgb(116, 108, 37)",
      
              },
            }}
            iconColor="rgb(116, 108, 37)"
            borderColor="rgb(116, 108, 37)"
          size='lg'
          mr='7px'
          ml='10px'
            checked={weekendsVisible}
            onChange={handleWeekendsToggle}
          />
         Show Weekends
        </label>
      </div>
    </Flex>
  );
};

export default Sidebar;