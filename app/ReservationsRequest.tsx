import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import io from 'socket.io-client';

let socket;
interface Reservation {
    _id: string;
    customer_name: string;
    CNIC: string;
    phone_number: string;
    email: string;
    reservation_date: { from: string; to: string };
    reservationStatus: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
    roomDetails: {
        room_type: string;
        room_number: string;
        rent: number;
        bed_size: string;
    }
}

interface ReservationRequestsProps {
    status: string | string[];
    hotel_id: string;
}

export default function ReservationRequests({ status, hotel_id }: ReservationRequestsProps) {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        socket = io('http://10.130.114.185:3000');

        socket.on('connect', () => console.log('Connected to Socket.IO server'));
        socket.on('reservation-created', (data: { placeID: string, reservationDetails: any }) => {
            console.log("Received reservation-created event:", data);

            if (data.placeID === hotel_id && data.reservationDetails?._id) {
                setReservations((prevReservations) =>
                    prevReservations.some((res) => res._id === data.reservationDetails._id) ? prevReservations
                        : [...prevReservations, data.reservationDetails]
                );
            }
        });

        socket.on('disconnect', () => console.log('Disconnected from Socket.IO server'));

        const fetchReservations = async () => {
            try {
                const statusQuery = Array.isArray(status) ? status.join(",") : status;
                const response = await axios.get(`http://10.130.114.185:3000/GetReservations?status=${statusQuery}&hotel_id=${hotel_id}`);
                setReservations(response.data);
                console.log("fetched reservations:", response.data);
            } catch (error) {
                console.error("Error fetching reservations:", error);
                setError("Failed to fetch reservations.");
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, [status, hotel_id]);

    // console.log("Reservations are:", reservations);

    const updateReservationStatus = async (id: string, newStatus: "CONFIRMED" | "CANCELLED") => {
        try {
            await axios.put(`http://10.130.114.185:3000/UpdateReservationsStatus/${id}/updateStatus`, { status: newStatus });
            setReservations(reservations.map(res => res._id === id ? { ...res, reservationStatus: newStatus } : res));
        } catch (error) {
            console.error("Error updating reservation:", error);
        }
    };


    if (loading) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color="blue" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>
                {status === "PENDING" && "Reservation Requests"}
                {status === "CONFIRMED" && "Ongoing Reservations"}
                {(Array.isArray(status) ? status.some(s => ["CANCELLED", "COMPLETED"].includes(s)) : ["CANCELLED", "COMPLETED"].includes(status)) && "Reservation History"}
            </Text>

            <FlatList
                data={reservations}
                keyExtractor={(item) => item._id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.text}><Text style={styles.bold}>Guest:</Text> {item.customer_name}</Text>
                        <Text style={styles.text}><Text style={styles.bold}>CNIC:</Text> {item.CNIC}</Text>
                        <Text style={styles.text}><Text style={styles.bold}>Phone:</Text> {item.phone_number}</Text>
                        <Text style={styles.text}><Text style={styles.bold}>Email:</Text> {item.email}</Text>
                        <Text style={styles.text}><Text style={styles.bold}>Check-in:</Text> {new Date(item.reservation_date.from).toDateString()}</Text>
                        <Text style={styles.text}><Text style={styles.bold}>Check-out:</Text> {new Date(item.reservation_date.to).toDateString()}</Text>
                        <Text style={styles.text}><Text style={styles.bold}>Room Type:</Text> {item.roomDetails.room_type}</Text>
                        <Text style={styles.text}><Text style={styles.bold}>Room Number:</Text> {item.roomDetails.room_number}</Text>
                        <Text style={styles.text}><Text style={styles.bold}>Rent:</Text> {item.roomDetails.rent}</Text>
                        {/* Status */}
                        <View style={[styles.statusContainer, { borderColor: getStatusColor(item.reservationStatus) }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(item.reservationStatus) }]}>
                                {item.reservationStatus}
                            </Text>
                        </View>

                        {status === "PENDING" && (
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={[styles.button, styles.acceptButton]} onPress={() => updateReservationStatus(item._id, "CONFIRMED")}>
                                    <Text style={styles.buttonText}>Accept</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.button, styles.rejectButton]} onPress={() => updateReservationStatus(item._id, "CANCELLED")}>
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            />
        </View>
    );
}

// Function to set color based on reservation status
const getStatusColor = (status: string) => {
    switch (status) {
        case "PENDING": return "#FFA500"; // Orange
        case "CONFIRMED": return "#008000"; // Green
        case "CANCELLED": return "#FF0000"; // Red
        case "COMPLETED": return "#0000FF"; // Blue
        default: return "#808080"; // Gray
    }
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#f4f7fc" },
    centeredContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: '25%' },
    headerText: { fontSize: 22, fontWeight: "bold", marginBottom: 15, textAlign: "center" },

    row: { justifyContent: "space-between" },
    card: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        elevation: 3,
        marginHorizontal: 5,
    },

    text: { fontSize: 16, marginBottom: 5 },
    bold: { fontWeight: "bold" },

    statusContainer: {
        borderWidth: 2,
        borderRadius: 5,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginTop: 5,
        alignSelf: "flex-start",
    },
    statusText: { fontWeight: "bold" },

    buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    button: { flex: 1, padding: 10, borderRadius: 5, alignItems: "center", marginHorizontal: 5 },
    acceptButton: { backgroundColor: "green" },
    rejectButton: { backgroundColor: "red" },
    buttonText: { color: "white", fontWeight: "bold" },

    errorText: { fontSize: 18, color: "red", textAlign: "center" },
});

