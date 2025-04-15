import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import io from 'socket.io-client';

let socket;

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

  const fetchReservations = async () => {
      try {
        const response = await axios.get(
          `http://34.226.13.20:3000/car-rental/reservations`,
          { params: { companyId, status } }
        );
        setReservations(response.data);
        console.log(response.data);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch reservations');
      }
    };

     useEffect(() => {
  
              socket = io('http://34.226.13.20:3000');
              socket.on('connect', () => console.log('Connection to Socket.IO server'));
  
  
              socket.on('newReservation', async (reservation: Reservation) => {
                  console.log('Received new reservation:', reservation);
  
                  if (reservation.rentCarCompany === companyId) {
                      fetchReservations();  }
                  
                  });
          return () => {
              socket.disconnect();
          };
  
      }, [companyId]);


  useEffect(() => {
    
    fetchReservations();
  }, [companyId, status]);

  const updateReservationStatus = async (id: string, newStatus: string) => {
    try {
      await axios.put(
        `http://34.226.13.20:3000/update-reservations/${id}`,
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
      <View style={styles.cardsWrapper}>
        {reservations.map(reservation => (
          <View key={reservation._id} style={styles.reservationCard}>
            <Text style={styles.carModel}>{reservation.carModel}</Text>
            <Text style={styles.detailText}>
              <Text style={styles.label}>Registration Number: </Text>
              <Text style={styles.value}>{reservation.registrationNumber}</Text>
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.label}>CNIC: </Text>
              <Text style={styles.value}>{reservation.cnic}</Text>
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.label}>Contact Number: </Text>
              <Text style={styles.value}>{reservation.contactNumber}</Text>
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.label}>User Email: </Text>
              <Text style={styles.value}>{reservation.user?.email}</Text>
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.label}>Payment Method: </Text>
              <Text style={styles.value}>{reservation.paymentMethod}</Text>
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.label}>From: </Text>
              <Text style={styles.value}>{new Date(reservation.fromDate).toLocaleDateString()}</Text>
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.label}>To: </Text>
              <Text style={styles.value}>{new Date(reservation.endDate).toLocaleDateString()}</Text>
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.label}>Created At: </Text>
              <Text style={styles.value}>{new Date(reservation.createdAt).toLocaleDateString()}</Text>
            </Text>

            <View style={styles.statusContainer}>
              <Text
                style={[
                  styles.statusText,
                  reservation.reservationStatus === 'PENDING' && styles.pending,
                  reservation.reservationStatus === 'CONFIRMED' && styles.confirmed,
                  reservation.reservationStatus === 'CANCELLED' && styles.cancelled,
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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  cardsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  reservationCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    width: '48%',
  },
  carModel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#176FF2',
  },
  detailText: {
    marginBottom: 6,
    lineHeight: 20,
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    color: '#666',
  },
  statusContainer: {
    marginTop: 10,
  },
  statusText: {
    padding: 5,
    borderRadius: 5,
    alignSelf: 'flex-start',
    fontWeight: 'bold',
  },
  pending: {
    backgroundColor: '#ffeeba',
    color: '#856404',
  },
  confirmed: {
    backgroundColor: '#c3e6cb',
    color: '#155724',
  },
  cancelled: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
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
    paddingHorizontal: 12,
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
