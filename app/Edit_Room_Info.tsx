import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import axios from 'axios';
import io from 'socket.io-client';

let socket;

interface Room {
    _id: string;
    room_type: string;
    room_number: number;
    rent: number;
    available: boolean;
    bed_size: string;
}

const EditRoomInfo = ({ hotel_id }: { hotel_id: string }) => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [updatedRoom, setUpdatedRoom] = useState<Partial<Room>>({});

    // Fetch all rooms from backend
    useEffect(() => {

        socket = io('http://10.130.114.185:3000');

        socket.on('connect', () => console.log('Connected to Socket.IO server'));

        console.log("Hotel ID:", hotel_id);
        const fetchRooms = async () => {
            try {
                const response = await axios.get(`http://10.130.114.185:3000/${hotel_id}/rooms`);
                setRooms(response.data.rooms);
            } catch (error) {
                console.error("Error fetching rooms:", error);
            }
        };

        fetchRooms();

        socket.on('room_updated', (updatedRoom: Room) => {
            console.log('Room updated:', updatedRoom);

            setRooms((prevRooms) =>
                prevRooms.map((room) => (room._id === updatedRoom._id ? updatedRoom : room))
            );
        });

    }, [hotel_id]);

    // Handle edit button click
    const handleEdit = (room: Room) => {
        setSelectedRoom(room);
        setUpdatedRoom(room); // Pre-fill with existing room data
        setModalVisible(true);
    };

    // Handle update API request
    const handleUpdateRoom = async () => {
        if (!selectedRoom) return;
        try {
            const response = await axios.put(`http://10.130.114.185:3000/editroominfo/${selectedRoom._id}`, updatedRoom);
            console.log("Room updated successfully:", response.data);

            // Update the room list
            setRooms(rooms.map(room => (room._id === selectedRoom._id ? { ...room, ...updatedRoom } : room)));

            setModalVisible(false);
            setSelectedRoom(null);
        } catch (error) {
            console.error("Error updating room:", error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Edit Room Information</Text>

            {/* Grid Layout of Rooms */}
            <FlatList
                data={rooms}
                keyExtractor={(item) => item._id}
                numColumns={3} // Three columns
                columnWrapperStyle={styles.row}
                renderItem={({ item }) => (
                    <View style={styles.roomCard}>
                        <Text style={styles.roomNumber}>Room {item.room_number}</Text>
                        <Text style={styles.roomText}>{item.room_type}</Text>
                        <Text style={styles.roomText}>Rent: {item.rent} Pkr</Text>

                        {/* Edit Button at Bottom Left */}
                        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
                            <Text style={styles.buttonText}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />

            {/* Edit Room Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Edit Room</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Room Type"
                            value={updatedRoom.room_type}
                            onChangeText={(text) => setUpdatedRoom({ ...updatedRoom, room_type: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Rent"
                            keyboardType="numeric"
                            value={updatedRoom.rent?.toString()}
                            onChangeText={(text) => setUpdatedRoom({ ...updatedRoom, rent: parseFloat(text) })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Bed Size"
                            value={updatedRoom.bed_size}
                            onChangeText={(text) => setUpdatedRoom({ ...updatedRoom, bed_size: text })}
                        />

                        <TouchableOpacity
                            style={[styles.availabilityButton, updatedRoom.available ? styles.available : styles.unavailable]}
                            onPress={() => setUpdatedRoom({ ...updatedRoom, available: !updatedRoom.available })}
                        >
                            <Text style={styles.buttonText}>{updatedRoom.available ? "Available" : "Occupied"}</Text>
                        </TouchableOpacity>

                        {/* Update & Close Buttons */}
                        <View style={styles.buttonRow}>
                            <Button title="Update" onPress={handleUpdateRoom} />
                            <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f4f7fc' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },

    // Grid Layout
    row: { justifyContent: 'space-between', marginBottom: 15 },
    roomCard: {
        flex: 1,
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },

    roomNumber: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    roomText: { fontSize: 14, color: '#555' },

    // Edit Button (Bottom-Left)
    editButton: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        backgroundColor: '#176FF2',
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 5
    },
    buttonText: { color: 'white', fontSize: 14, fontWeight: 'bold' },

    // Modal Styles
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContainer: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%', alignItems: 'center' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },

    input: { width: '100%', padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 10 },

    availabilityButton: { padding: 10, borderRadius: 5, marginBottom: 10 },
    available: { backgroundColor: 'green' },
    unavailable: { backgroundColor: 'red' },

    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10, borderRadius:5, padding:5 },
});

export default EditRoomInfo;
