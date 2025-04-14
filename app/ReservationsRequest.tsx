import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';

interface Reservation {
  _id: string;
  cnic: string;
  contactNumber: string;
  fromDate: string;
  endDate: string;
  carModel: string;
  registrationNumber: string;
  paymentMethod: string;
  reservationStatus: string;
  rentCarCompany: string;
  user: {
    _id: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}


const ReservationRequests = ({ status, companyId }: { status: string | string[], companyId: string }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await axios.get(
          `http://10.130.114.185:3000/car-rental/reservations`,
          { params: { companyId, status } }
        );
        setReservations(response.data);
        console.log(response.data);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch reservations');
      }
    };
    fetchReservations();
  }, [companyId, status]);

  const updateReservationStatus = async (id: string, newStatus: string) => {
    try {
      await axios.put(
        `http://10.130.114.185:3000/update-reservations/${id}`,
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
          <Text style={styles.carModel}>{reservation.carModel}</Text>
          <Text>Registration Number: {reservation.registrationNumber}</Text>
          <Text>CNIC: {reservation.cnic}</Text>
          <Text>Contact Number: {reservation.contactNumber}</Text>
          <Text>User Email: {reservation.user?.email}</Text>
          <Text>Payment Method: {reservation.paymentMethod}</Text>
          <Text>From: {new Date(reservation.fromDate).toLocaleDateString()}</Text>
          <Text>To: {new Date(reservation.endDate).toLocaleDateString()}</Text>
          <Text>Created At: {new Date(reservation.createdAt).toLocaleDateString()}</Text>

          <View style={styles.statusContainer}>
            <Text
              style={[
                styles.statusText,
                reservation.reservationStatus === 'PENDING' && styles.pending,
                reservation.reservationStatus === 'CONFIRMED' && styles.confirmed,
              ]}
            >
              {reservation.reservationStatus}
            </Text>
          </View>

          {reservation.reservationStatus === 'PENDING' && (
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