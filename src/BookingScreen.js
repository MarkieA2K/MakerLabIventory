import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from 'react-native';
import {
  ExpandableCalendar,
  TimelineList,
  CalendarProvider,
} from 'react-native-calendars';
import supabase from './supabase'; // Import your Supabase client instance
import { FAB, Portal, Modal, Button, TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

const BookingScreen = () => {
  const [currentDate, setCurrentDate] = useState('2024-03-20');
  const [eventsByDate, setEventsByDate] = useState({});
  const [visible, setVisible] = useState(false);
  const [facility, setFacility] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase.from('BookingLog').select('*');
      if (error) {
        console.error('Error fetching events:', error.message);
        return;
      }
      if (data && data.length > 0) {
        console.log('Fetched data:', data); // Log fetched data for debugging    Fetched data: [{"Book_Day": "2024-03-20", "Book_Description": "LAHAT KAMAY", "Book_End": "17:00:00+08", "Book_Facility": "Training Hub", "Book_ID": 1, "Book_Start": "16:00:00+08", "Book_Title": "ALL HANDS", "Book_User": "Markie"}]
        const eventsData = data.reduce((events, log) => {
          const startDateTime = `${log.Book_Day}T${log.Book_Start}`; // Combine date and start time  no longer needed if using timestamptz format
          const endDateTime = `${log.Book_Day}T${log.Book_End}`; // Combine date and end time
          console.log('Start Date Time:', startDateTime);
          console.log('End Date Time:', endDateTime);
          if (!events[log.Book_Day]) {
            events[log.Book_Day] = [];
          }
          events[log.Book_Day].push({
            //will use date as psudo id
            start: startDateTime, //timestaptz format
            end: endDateTime, //timestamptz format
            title: log.Book_Facility + ' - ' + log.Book_User,
            color: 'pink', // You can set colors dynamically based on your data
          });
          return events;
        }, {});
        console.log('Events data claimed:', eventsData); // Log events data for debugging
        setEventsByDate(eventsData);
      }
    } catch (error) {
      console.error('Error fetching events:', error.message);
    }
  };

  const onDateChanged = (date) => {
    setCurrentDate(date);
  };

  const onMonthChange = (month) => {
    console.log('BookingScreen onMonthChange:', month);
  };
  const onChangeStartTime = (event, selectedDate) => {
    const currentDate = selectedDate || startTime;
    setShowStartTimePicker(false);
    setStartTime(currentDate);
  };

  const onChangeEndTime = (event, selectedDate) => {
    const currentDate = selectedDate || endTime;
    setShowEndTimePicker(false);
    setEndTime(currentDate);
  };

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const addBooking = () => {};

  return (
    <SafeAreaView style={styles.container}>
      <CalendarProvider
        date={currentDate}
        onDateChanged={onDateChanged}
        onMonthChange={onMonthChange}
        showTodayButton
        disabledOpacity={0.6}
      >
        <ExpandableCalendar
          firstDay={1}
          markedDates={{ [currentDate]: { selected: true } }}
        />
        <TimelineList
          events={eventsByDate}
          showNowIndicator
          scrollToFirst
          initialTime={{ hour: 9, minute: 0 }}
          onEventPress={(event) => console.log(event)}
        />
      </CalendarProvider>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modalContainer}
        >
          <Text>Add Booking</Text>
          <TextInput
            style={styles.input}
            placeholder='Facility'
            onChangeText={setFacility}
            value={facility}
          />
          <TouchableOpacity onPress={() => setShowStartTimePicker(true)}>
            <Text>Start Time: {startTime.toLocaleTimeString()}</Text>
          </TouchableOpacity>
          {showStartTimePicker && (
            <DateTimePicker
              value={startTime}
              mode='time'
              is24Hour={true}
              display='default'
              onChange={onChangeStartTime}
            />
          )}
          <TouchableOpacity onPress={() => setShowEndTimePicker(true)}>
            <Text>End Time: {endTime.toLocaleTimeString()}</Text>
          </TouchableOpacity>
          {showEndTimePicker && (
            <DateTimePicker
              value={endTime}
              mode='time'
              is24Hour={true}
              display='default'
              onChange={onChangeEndTime}
            />
          )}
          <Button mode='contained' onPress={addBooking}>
            Save
          </Button>
        </Modal>
      </Portal>
      <FAB style={styles.fab} icon='plus' onPress={showModal} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
  },
});

export default BookingScreen;
