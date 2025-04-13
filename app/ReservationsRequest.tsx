import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';

interface Reservation {
  _id: string;
  user: string;
  car: {
    model: string;
    registration_number: string;
  };
  start_date: string;
  end_date: string;
  total_cost: number;
  status: string;
}

const ReservationRequests = ({ status, companyId }: { status: string | string[], companyId: string }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await axios.get(
          `http://34.226.13.20:3000/car-rental/reservations`,
          { params: { companyId, status } }
        );
        setReservations(response.data);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch reservations');
      }
    };
    fetchReservations();
  }, [companyId, status]);

  const updateReservationStatus = async (id: string, newStatus: string) => {
    try {
      await axios.patch(
        `http://34.226.13.20:3000/car-rental/reservations/${id}`,
        { status: newStatus }
      );
      setReservations(reservations.filter(r => r._id !== id));
      Alert.alert('Success', `Reservation ${newStatus.toLowerCase()}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update reservation');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {reservations.map(reservation => (
        <View key={reservation._id} style={styles.reservationCard}>
          <Text style={styles.carModel}>{reservation.car.model}</Text>
          <Text>Registration: {reservation.car.registration_number}</Text>
          <Text>User: {reservation.user}</Text>
          <Text>Dates: {new Date(reservation.start_date).toLocaleDateString()} - 
                {new Date(reservation.end_date).toLocaleDateString()}</Text>
          <Text>Total: ${reservation.total_cost}</Text>
          
          <View style={styles.statusContainer}>
            <Text style={[
              styles.statusText,
              reservation.status === 'PENDING' && styles.pending,
              reservation.status === 'CONFIRMED' && styles.confirmed
            ]}>
              {reservation.status}
            </Text>
          </View>

          {reservation.status === 'PENDING' && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.confirmButton]}
                onPress={() => updateReservationStatus(reservation._id, 'CONFIRMED')}
              >
                <Icon name="checkmark-circle" size={20} color="white" />
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => updateReservationStatus(reservation._id, 'CANCELLED')}
              >
                <Icon name="close-circle" size={20} color="white" />
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  reservationCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
  },
  carModel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statusContainer: {
    marginTop: 10,
  },
  statusText: {
    padding: 5,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  pending: {
    backgroundColor: '#ffeeba',
    color: '#856404',
  },
  confirmed: {
    backgroundColor: '#c3e6cb',
    color: '#155724',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  confirmButton: {
    backgroundColor: '#28a745',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ReservationRequests;