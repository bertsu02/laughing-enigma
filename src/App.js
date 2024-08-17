import React, { useState, useEffect, useCallback } from 'react';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import {
  ViewState,
  EditingState,
  IntegratedEditing,
} from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  WeekView,
  DayView,
  MonthView,
  Toolbar,
  DateNavigator,
  Appointments,
  AppointmentTooltip,
  ConfirmationDialog,
  AllDayPanel,
  AppointmentForm,
} from '@devexpress/dx-react-scheduler-material-ui';
import { db } from './firebase-config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

//fetch
const fetchEvents = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'events'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate.toDate(),
      endDate: doc.data().endDate.toDate(),
    }));
  } catch (error) {
    console.error('Error fetching events: ', error);
    return [];
  }
};

// add
const addEvent = async (event) => {
  try {
    await addDoc(collection(db, 'events'), event);
  } catch (error) {
    console.error('Error adding event: ', error);
  }
};

//update
const updateEvent = async (id, updatedEvent) => {
  try {
    await updateDoc(doc(db, 'events', id), updatedEvent);
  } catch (error) {
    console.error('Error updating event: ', error);
  }
};

// delete
const deleteEvent = async (id) => {
  try {
    await deleteDoc(doc(db, 'events', id));
  } catch (error) {
    console.error('Error deleting event: ', error);
  }
};

const SchedulerDemo = () => {
  const [data, setData] = useState([]);
  const [currentDate, setCurrentDate] = useState(getTodayDate());
  const [currentViewName, setCurrentViewName] = useState('Week');
  const [locale, setLocale] = useState('pl-PL');

  useEffect(() => {
    const loadEvents = async () => {
      const events = await fetchEvents();
      setData(events);
    };
    loadEvents();
  }, []);

  const commitChanges = useCallback(async ({ added, changed, deleted }) => {
    if (added) {
      const newEvent = { ...added };
      try {
        await addEvent(newEvent);
        setData(prevData => [...prevData, { id: newEvent.id, ...newEvent }]);
      } catch (error) {
        console.error('Error adding event: ', error);
      }
    }

    if (changed) {
      try {
        await Promise.all(Object.keys(changed).map(id => updateEvent(id, changed[id])));
        setData(prevData =>
          prevData.map(appointment =>
            changed[appointment.id] ? { ...appointment, ...changed[appointment.id] } : appointment
          )
        );
      } catch (error) {
        console.error('Error updating event: ', error);
      }
    }

    if (deleted !== undefined) {
      try {
        await deleteEvent(deleted);
        setData(prevData => prevData.filter(appointment => appointment.id !== deleted));
      } catch (error) {
        console.error('Error deleting event: ', error);
      }
    }
  }, []);

  const handleViewChange = (viewName) => setCurrentViewName(viewName);

  return (
    <Paper>
      <div style={{ padding: 16 }}>
        <Button variant="contained" onClick={() => handleViewChange('Month')}>Miesiąc</Button>
        <Button variant="contained" onClick={() => handleViewChange('Week')} style={{ marginLeft: 8 }}>Tydzień</Button>
        <Button variant="contained" onClick={() => handleViewChange('Day')} style={{ marginLeft: 8 }}>Dzień</Button>
      </div>
      <Scheduler data={data} locale={locale} height={1000}>
        <ViewState
          currentDate={currentDate}
          currentViewName={currentViewName}
          onCurrentDateChange={setCurrentDate}
          onCurrentViewNameChange={setCurrentViewName}
        />
        <EditingState onCommitChanges={commitChanges} />
        <IntegratedEditing />
        <DayView startDayHour={9} endDayHour={19} />
        <WeekView startDayHour={9} endDayHour={19} firstDayOfWeek={1} />
        <MonthView />
        <Toolbar />
        <DateNavigator />
        <Appointments />
        <AppointmentTooltip showOpenButton showDeleteButton />
        <AppointmentForm />
        <ConfirmationDialog />
        <AllDayPanel messages={{ 'pl-PL': { allDay: 'Cały dzień' }, 'en-US': { allDay: 'All Day' } }[locale]} />
      </Scheduler>
    </Paper>
  );
};

export default SchedulerDemo;
