import { formatDate } from '@fullcalendar/core'
import './Calendar.css';

const Sidebar = ({ weekendsVisible, handleWeekendsToggle, currentEvents }) => {
  return (
    <div className='demo-app-sidebar'>
      <div className='demo-app-sidebar-section'>
        <label>
          <input
            type='checkbox'
            checked={weekendsVisible}
            onChange={handleWeekendsToggle}
          ></input>
         Show Weekends
        </label>
      </div>
      <div className='demo-app-sidebar-section'>
        <h2>All Events ({currentEvents.length})</h2>
        <ul>
          {currentEvents.map((event) => (
            <li key={event.id}>
              <b>{formatDate(event.start, { year: 'numeric', month: 'short', day: 'numeric' })}</b>
              <i>{event.title}</i>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;