import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, Button, ActivityIndicator, Switch, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

interface Hotel {
    hotel_name: string;
    hotel_class: string;
    number_of_rooms: string;
    complete_address: string;
    room_types: string[];
    functional: boolean;
    mess_included: boolean;
    city: string;
    latitude: string;
    longitude: string;
}

const EditAccount = ({ hotel_id }: { hotel_id: string }) => {
    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [addRoomModalVisible, setAddRoomModalVisible] = useState(false);
    const [updatedHotel, setUpdatedHotel] = useState<Partial<Hotel>>({});
    const [loading, setLoading] = useState(true);
    const [newRoom, setNewRoom] = useState({
        room_type: '',
        room_number: '',
        rent: '',
        available: '',
        bed_size: '',
    });

     const fetchHotel = async () => {
            try {
                const response = await axios.get(`http://10.130.114.185:3000/hotels/${hotel_id}`);
                setHotel(response.data.hotel);
                setUpdatedHotel(response.data.hotel);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching hotel info:", error);
                setLoading(false);
            }
        };

    useEffect(() => {  
        fetchHotel();
    }, [hotel_id]);

    const handleAddRoom = async () => {
        try {
            const roomPayload = {
                ...newRoom,
                hotel_id,
                rent: Number(newRoom.rent),
                room_number: Number(newRoom.room_number),
                available: newRoom.available.toLowerCase() === 'true',
            };
            await axios.post('http://10.130.114.185:3000/room', roomPayload);
            alert('Room added successfully!');
            setAddRoomModalVisible(false);
            setNewRoom({ room_type: '', room_number: '', rent: '', available: '', bed_size: '' });
            fetchHotel(); // Refresh hotel data after adding room
        } catch (error) {
            console.error('Error adding room:', error);
            alert('Failed to add room.');
        }
    };

        const handleUpdate = async () => {
            try {
                const response = await axios.put(`http://10.130.114.185:3000/edithotel/${hotel_id}`, updatedHotel);
                console.log('Hotel updated successfully', response.data);
                setEditModalVisible(false);
                fetchHotel();

            } catch (error) {
                console.error('Failed to update hotel:', error);
            }
        };


    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#176FF2" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Account Information</Text>

            {hotel && (
                <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}><Text style={{ fontWeight: 'bold' }}>Name:</Text> {hotel.hotel_name}</Text>
                    <Text style={styles.infoLabel}><Text style={{ fontWeight: 'bold' }}>Class:</Text> {hotel.hotel_class}</Text>
                    <Text style={styles.infoLabel}><Text style={{ fontWeight: 'bold' }}>No. of Rooms:</Text> {hotel.number_of_rooms}</Text>
                    <Text style={styles.infoLabel}><Text style={{ fontWeight: 'bold' }}>Room Types:</Text> {hotel.room_types.join(', ')}</Text>
                    <Text style={styles.infoLabel}><Text style={{ fontWeight: 'bold' }}>Functional:</Text> {hotel.functional ? 'Yes' : 'No'}</Text>
                    <Text style={styles.infoLabel}><Text style={{ fontWeight: 'bold' }}>Mess Included:</Text> {hotel.mess_included ? 'Yes' : 'No'}</Text>
                    <Text style={styles.infoLabel}><Text style={{ fontWeight: 'bold' }}>City:</Text> {hotel.city}</Text>
                    <Text style={styles.infoLabel}><Text style={{ fontWeight: 'bold' }}>Address:</Text> {hotel.complete_address}</Text>
                    <Text style={styles.infoLabel}><Text style={{ fontWeight: 'bold' }}>Coordinates:</Text> Lat -- {hotel.latitude}, Long -- {hotel.longitude}</Text>
                </View>
            )}

            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.editButton} onPress={() => setEditModalVisible(true)}>
                    <Text style={styles.buttonText}>Edit Info</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addRoomButton} onPress={() => setAddRoomModalVisible(true)}>
                    <Text style={styles.buttonText}>Add Room</Text>
                </TouchableOpacity>
            </View>

            {/* Edit Info Modal */}
           <Modal visible={editModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Edit Hotel Information</Text>

                        <ScrollView>
                            <TextInput
                                style={styles.input}
                                placeholder="Hotel Name"
                                value={updatedHotel.hotel_name}
                                onChangeText={(text) => setUpdatedHotel({ ...updatedHotel, hotel_name: text })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Hotel Class"
                                value={updatedHotel.hotel_class}
                                onChangeText={(text) => setUpdatedHotel({ ...updatedHotel, hotel_class: text })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Number of Rooms"
                                keyboardType="numeric"
                                value={updatedHotel.number_of_rooms}
                                onChangeText={(text) => setUpdatedHotel({ ...updatedHotel, number_of_rooms: text })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Complete Address"
                                value={updatedHotel.complete_address}
                                onChangeText={(text) => setUpdatedHotel({ ...updatedHotel, complete_address: text })}
                            />

                            <Text style={styles.label}>Room Types:</Text>
                            {(updatedHotel.room_types || []).map((type, index) => (
                                <View key={index} style={styles.roomTypeRow}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        placeholder={`Room Type ${index + 1}`}
                                        value={type}
                                        onChangeText={(text) => {
                                            const newTypes = [...(updatedHotel.room_types || [])];
                                            newTypes[index] = text;
                                            setUpdatedHotel({ ...updatedHotel, room_types: newTypes });
                                        }}
                                    />
                                    <TouchableOpacity onPress={() => {
                                        const filtered = (updatedHotel.room_types || []).filter((_, i) => i !== index);
                                        setUpdatedHotel({ ...updatedHotel, room_types: filtered });
                                    }}>
                                        <Text style={styles.removeButton}>❌</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                       <TouchableOpacity
                            onPress={() =>
                                setUpdatedHotel({
                                    ...updatedHotel,
                                    room_types: [...(updatedHotel.room_types || []), ""],
                                })
                            }
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginVertical: 8,
                            }}
                        >
                            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
                            <Text style={{ marginLeft: 6, color: '#007AFF' }}>Add Room Type</Text>
                        </TouchableOpacity>
                                            
                            <TextInput
                                style={styles.input}
                                placeholder="City"
                                value={updatedHotel.city}
                                onChangeText={(text) => setUpdatedHotel({ ...updatedHotel, city: text })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Latitude"
                                keyboardType="numeric"
                                value={updatedHotel.latitude}
                                onChangeText={(text) => setUpdatedHotel({ ...updatedHotel, latitude: text })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Longitude"
                                keyboardType="numeric"
                                value={updatedHotel.longitude}
                                onChangeText={(text) => setUpdatedHotel({ ...updatedHotel, longitude: text })}
                            />

                            <View style={styles.checkboxRow}>
                                <Text>Functional:</Text>
                                <Switch
                                    value={updatedHotel.functional}
                                    onValueChange={(val) => setUpdatedHotel({ ...updatedHotel, functional: val })}
                                />
                            </View>

                            <View style={styles.checkboxRow}>
                                <Text>Mess Included:</Text>
                                <Switch
                                    value={updatedHotel.mess_included}
                                    onValueChange={(val) => setUpdatedHotel({ ...updatedHotel, mess_included: val })}
                                />
                            </View>

                            <View style={styles.buttonRow}>
                                <Button title="Update" onPress={handleUpdate} />
                                <Button title="Cancel" color="red" onPress={() => setEditModalVisible(false)} />
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>


            {/* Add Room Modal */}
            <Modal visible={addRoomModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Add New Room</Text>
                        <Text style={styles.dropdownLabel}>Room Type</Text>
                        <Picker
                            selectedValue={newRoom.room_type}
                            onValueChange={(itemValue) => setNewRoom({ ...newRoom, room_type: itemValue })}
                            style={styles.picker}
                        >
                            <Picker.Item label="Select Room Type" value="" />
                            <Picker.Item label="Single" value="Single" />
                            <Picker.Item label="Double" value="Double" />
                            <Picker.Item label="Suite" value="Suite" />
                        </Picker>

                        <Text style={styles.dropdownLabel}>Room Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Room Number"
                            keyboardType="numeric"
                            value={newRoom.room_number}
                            onChangeText={(text) => setNewRoom({ ...newRoom, room_number: text })}
                        />

                        <Text style={styles.dropdownLabel}>Rent</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Rent"
                            keyboardType="numeric"
                            value={newRoom.rent}
                            onChangeText={(text) => setNewRoom({ ...newRoom, rent: text })}
                        />

                        <Text style={styles.dropdownLabel}>Available</Text>
                        <Picker
                            selectedValue={newRoom.available}
                            onValueChange={(itemValue) => setNewRoom({ ...newRoom, available: itemValue })}
                            style={styles.picker}
                        >
                            <Picker.Item label="Select Availability" value="" />
                            <Picker.Item label="Available" value="true" />
                            <Picker.Item label="Not Available" value="false" />
                        </Picker>

                        <Text style={styles.dropdownLabel}>Bed Size</Text>
                        <Picker
                            selectedValue={newRoom.bed_size}
                            onValueChange={(itemValue) => setNewRoom({ ...newRoom, bed_size: itemValue })}
                            style={styles.picker}
                        >
                            <Picker.Item label="Select Bed Size" value="" />
                            <Picker.Item label="Single" value="Single" />
                            <Picker.Item label="Double" value="Double" />
                            <Picker.Item label="Queen" value="Queen" />
                            <Picker.Item label="King" value="King" />
                        </Picker>

                        <View style={styles.buttonRow}>
                            <View style={styles.buttonWrapper}>
                                <Button title="Add Room" onPress={handleAddRoom} />
                            </View>
                            <View style={styles.buttonWrapper}>
                                <Button title="Cancel" color="red" onPress={() => setAddRoomModalVisible(false)} />
                            </View>
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
    infoBox: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        marginBottom: 20,
    },
    infoLabel: { fontSize: 16, color: '#333', marginBottom: 8 },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        gap: 10,
        borderRadius: 12,
    },
    buttonWrapper: {
        flex: 1,
        maxWidth: 120, // or any width that looks right to you
    }
    ,
    editButton: {
        flex: 1,
        backgroundColor: '#176FF2',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    addRoomButton: {
        flex: 1,
        backgroundColor: '#176FF2',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContainer: { 
        backgroundColor: 'white', 
        padding: 20, 
        borderRadius: 10, 
        width: '90%', 
        maxHeight: '80%',
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', paddingBottom: 10},
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#cccccc',
        borderRadius: 5,
        marginBottom: 10,
    },
    dropdownLabel: {
        marginTop: 10,
        marginBottom: 5,
        fontSize: 14,
        color: '#333',
    },
    roomTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
},
removeButton: {
    marginLeft: 10,
    color: 'red',
    fontSize: 18,
},
checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // Align items to the start
    marginVertical: 10,            // Reduce vertical space
    gap: 10,                      // Add small space between text and switch (optional)
},

label: {
    marginTop: 10,
    marginBottom: 8,
    fontWeight: 'bold',
},

    picker: {
        height: 50,
        backgroundColor: '#ffffff',
        borderRadius: 5,
        marginBottom: 10,
    },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default EditAccount;