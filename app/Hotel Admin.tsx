import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, FlatList, Modal } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import io from 'socket.io-client';
import Icon from 'react-native-vector-icons/Ionicons'; // For icons
import { BarChart } from 'react-native-chart-kit';
import EditRoomInfo from './Edit_Room_Info';
import ReservationRequests from './ReservationsRequest';
import EditAccount from './EditAccInfo';
import { Audio } from 'expo-av';



let socket;

function HotelAdmin() {
    const { username, hotel_id } = useLocalSearchParams<{ username: string; hotel_id: string }>();

    // Define types
    interface HotelDetails {
        hotel_name: string;
        complete_address: string;
        city: string;
        hotel_class: string;
        functional: boolean;
    }

    interface RoomDetails {
        roomID: string;
        room_type: string;
        room_number: number;
        rent: number;
        available: boolean;
        bed_size: string;
    }

    interface Room {
        _id: string;
        room_type: string;
        room_number: number;
        rent: number;
        available: boolean;
        bed_size: string;
    }

    // State Variables
    const [hotelDetails, setHotelDetails] = useState<HotelDetails | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [reservations, setReservations] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeScreen, setActiveScreen] = useState<string>("Hotel Details");
    const [expandedTab, setExpandedTab] = useState<string | null>(null); // Track expanded menu
    const [isSidebarOpen, setIsSidebarOpen] = useState(Dimensions.get('window').width > 768); // Show sidebar only on large screens
    const [expandedRoom, setExpandedRoom] = useState<Room | null>(null);
    const [selectedTab, setSelectedTab] = useState<string>("Hotel Details"); // Track selected tab
    const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
    const totalRooms = rooms.length;
    const roomsOccupied = rooms.filter(room => !room.available).length;
    const roomsAvailable = totalRooms - roomsOccupied;  // or filter for 'available'
    // Dummy Data for Reservations
    const [CurrentReservationRequests, setCurrentReservationRequests] = useState<number>(0);
    const [OngoingReservations, setOngoingReservations] = useState<number>(0);
    const [pastReservation, setPastReservations] = useState<number>(0);
    const [modalVisible, setModalVisible] = useState(false); // For controlling modal visibility
    const [alarmSound, setAlarmSound] = useState<Audio.Sound | null>(null);
    const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
    const alarmTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isAlarmMuted, setIsAlarmMuted] = useState(false);



    const handleRoomClick = (room) => {
        setExpandedRoom(room);
        setModalVisible(true); // Show the modal when a room is clicked
    };

    // Graph Data
    const graphData = {
        labels: ['Requests', 'Ongoing', 'History'],  // Categories
        datasets: [
            {
                data: [CurrentReservationRequests, OngoingReservations, pastReservation],  // Values
                color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`,  // Green color for bars
                strokeWidth: 2,
            },
        ],
    };

    // const sidebarWidth = windowWidth > 768 && isSidebarOpen ? 350 : 0; // Sidebar width based on screen size and its state

    useEffect(() => {
        // Connect to Socket.IO server
        socket = io('http://10.130.114.185:3000');

        socket.on('connect', () => console.log('Connection to Socket.IO server'));
        socket.on('reservation-created', async (data: { placeID: string, reservationDetails: any }) => {
            console.log("Reservation Created Update:", data);
            if (data.placeID === hotel_id) {
                setCurrentReservationRequests((prevCount: number) => prevCount + 1);

                // Only play alarm if not muted
                if (!isAlarmPlaying && !isAlarmMuted) {
                    const { sound } = await Audio.Sound.createAsync(
                        require('./../assets/alarm.mp3')
                    );
                    setAlarmSound(sound);
                    setIsAlarmPlaying(true);
                    await sound.playAsync();

                    // Stop alarm after 10 seconds
                    alarmTimeoutRef.current = setTimeout(async () => {
                        await sound.stopAsync();
                        setIsAlarmPlaying(false);
                    }, 10000);
                }
            }
        });



        socket.on("room_reserved", (data: { room: RoomDetails }) => {
            console.log("Room Reserved Update:", data);

            setRooms((prevRooms) => {
                const updatedRooms = [...prevRooms];

                // Check if room already exists, if yes, update availability
                const roomIndex = updatedRooms.findIndex(room => room._id === data.room.roomID);

                if (roomIndex !== -1) {
                    updatedRooms[roomIndex] = { ...updatedRooms[roomIndex], available: data.room.available };
                } else {
                    updatedRooms.push({
                        _id: data.room.roomID,
                        room_type: data.room.room_type,
                        room_number: data.room.room_number,
                        rent: data.room.rent,
                        available: data.room.available,
                        bed_size: data.room.bed_size,
                    });
                }

                return updatedRooms;
            });

            setCurrentReservationRequests((prevCount: number) => prevCount + 1);  // Update based on your logic
            
        });


        socket.on('disconnect', () => console.log('Disconnected from Socket.IO server'));

        return () => {
            socket.disconnect();
        };
    }, [hotel_id]);

    useEffect(() => {
        return () => {
            if (alarmSound) {
                alarmSound.unloadAsync();
            }
            if (alarmTimeoutRef.current) {
                clearTimeout(alarmTimeoutRef.current);
            }
        };
    }, []);


    useEffect(() => {
        const fetchHotelData = async () => {
            try {
                const hotelResponse: { data: { hotel: HotelDetails } } = await axios.get(`http://10.130.114.185:3000/hotels/${hotel_id}`);
                setHotelDetails(hotelResponse.data.hotel);

                const roomsResponse = await axios.get(`http://10.130.114.185:3000/${hotel_id}/rooms`);

                // Ensure uniqueness before updating the state
                setRooms(roomsResponse.data.rooms);
                setLoading(false);
            } catch (err) {
                setError("Error fetching data");
                setLoading(false);
            }
        };

        const fetchReservations = async () => {
            try {
                // Fetch all reservations with hotel_id and status filtering
                const response = await axios.get(`http://10.130.114.185:3000/GetAllReservationsByHotelID?hotel_id=${hotel_id}`);

                // Store the fetched data
                const allReservations = response.data;
                setReservations(allReservations);


                // Count the length of each status category
                const pendingCount: number = allReservations.filter((reservation: { reservationStatus: string }) => reservation.reservationStatus === "PENDING").length;
                const confirmedCount: number = allReservations.filter((reservation: { reservationStatus: string }) => reservation.reservationStatus === "CONFIRMED").length;
                const cancelledOrCompletedCount: number = allReservations.filter((reservation: { reservationStatus: string }) =>
                    reservation.reservationStatus === "CANCELLED" || reservation.reservationStatus === "COMPLETED"
                ).length;

                // Set the counts to state (assuming you have states for these)
                setCurrentReservationRequests(pendingCount);
                setOngoingReservations(confirmedCount);
                setPastReservations(cancelledOrCompletedCount);

                // Stop loading
                setLoading(false);
            } catch (error) {
                console.error("Error fetching reservations:", error);
                setError("Failed to fetch reservations.");
                setLoading(false);
            }
        };

        fetchReservations();
        fetchHotelData();
         socket.on('room_updated', (updatedRoom: Room) => {
            console.log('Room updated:', updatedRoom);

            setRooms((prevRooms) =>
                prevRooms.map((room) => (room._id === updatedRoom._id ? updatedRoom : room))
            );
        });
    }, [hotel_id, selectedTab]);

    useEffect(() => {
        const onChange = () => setWindowWidth(Dimensions.get('window').width);
        Dimensions.addEventListener('change', onChange);

        return () => Dimensions.removeEventListener('change', onChange);
    }, []);

    if (loading) {
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.loadingText}>Loading hotel and room details...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        );
    }

    // Render content based on the selected screen
    const renderContent = () => {
        switch (activeScreen) {
            case "Hotel Details":
                return hotelDetails && (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Hotel Statistics</Text>
                        <Text style={styles.text}>{hotelDetails.hotel_name}</Text>
                        <Text style={styles.text}>{hotelDetails.complete_address}</Text>

                        {/* Additional Stats */}
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Reservations Overview</Text>
                            <BarChart
                                data={graphData}
                                width={ Dimensions.get('window').width * 0.7 }  // Chart width, with some padding
                                height={220}
                                fromZero={true}
                                chartConfig={{
                                    backgroundColor: '#f0f0f0',
                                    backgroundGradientFrom: '#f0f0f0',
                                    backgroundGradientTo: '#f0f0f0',
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,  // Red text
                                    labelColor: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,  // Red labels
                                    style: {
                                        borderRadius: 16,
                                        fontSize: 20,
                                    },
                                    propsForDots: {
                                        r: '6',
                                        strokeWidth: '2',
                                        stroke: '#ff0000',
                                    },
                                }}
                                style={{
                                    marginVertical: 0,
                                    borderRadius: 16,
                                    marginTop: 10,
                                }}
                            />
                        </View>

                        <View style={styles.statsContainer}>
                            <View style={styles.statColumn}>
                                <Text style={styles.statText}>Total Rooms</Text>
                                <Text style={styles.statValue}>{rooms.length}</Text>
                            </View>
                            <View style={styles.statColumn}>
                                <Text style={styles.statText}>Rooms Occupied</Text>
                                <Text style={styles.statValue}>{roomsOccupied}</Text>
                            </View>
                            <View style={styles.statColumn}>
                                <Text style={styles.statText}>Rooms Available</Text>
                                <Text style={styles.statValue}>{roomsAvailable}</Text>
                            </View>
                            <View style={styles.statColumn}>
                                <Text style={styles.statText}>Total Reservation</Text>
                                <Text style={styles.statValue}>{pastReservation + OngoingReservations}</Text>
                            </View>
                            <View style={styles.statColumn}>
                                <Text style={styles.statText}>Reservation Requests</Text>
                                <Text style={styles.statValue}>{CurrentReservationRequests}</Text>
                            </View>
                        </View>

                    </View>
                );


            case "Offers":
                return (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>{activeScreen}</Text>
                        <Text style={styles.text}>Coming soon...</Text>
                    </View>
                );
            case "Staff Info":
                 return (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>{activeScreen}</Text>
                        <Text style={styles.text}>Coming soon...</Text>
                    </View>
                );
            case "Ongoing Reservations":
                return <ReservationRequests status="CONFIRMED" hotel_id={hotel_id} />;
            case "Reservation History":
                return <ReservationRequests status={["CANCELLED", "COMPLETED"]} hotel_id={hotel_id} />;
            case "Reservation Requests":
                return <ReservationRequests status="PENDING" hotel_id={hotel_id} />;
            case "Edit Details":
                return <EditAccount hotel_id={hotel_id}/>;

            case "Edit Room Info":
                return <EditRoomInfo hotel_id={hotel_id} />;
            case "Room Information":
                return (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Room Information</Text>

                        {/* FlatList to display rooms in a grid of 3 columns */}
                        <FlatList
                            data={rooms}
                            keyExtractor={(item) => item.room_number.toString()}
                            numColumns={3} // Display 3 items per row
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.roomBox,
                                        !item.available && styles.roomUnavailable, // Apply red shade for unavailable rooms
                                    ]}
                                    onPress={() => handleRoomClick(item)} // Handle click to show details in modal
                                >
                                    <Text style={styles.roomText}>Room {item.room_number}</Text>
                                    <Text style={styles.roomStatus}>
                                        Status: {item.available ? 'Available' : 'Occupied'}
                                    </Text>
                                    <Text style={styles.roomStatus}>
                                        Type: {item.room_type}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />

                        {/* Modal for displaying room details */}
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={modalVisible}
                            onRequestClose={() => setModalVisible(false)}
                        >
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalContainer}>
                                    {expandedRoom && (
                                        <>
                                            <Text style={styles.modalTitle}>Room Details</Text>
                                            <Text style={styles.roomDetailText}>Room Type: {expandedRoom.room_type}</Text>
                                            <Text style={styles.roomDetailText}>Rent: {expandedRoom.rent}</Text>
                                            <Text style={styles.roomDetailText}>Available: {expandedRoom.available ? 'Yes' : 'No'}</Text>
                                            <Text style={styles.roomDetailText}>Bed Size: {expandedRoom.bed_size}</Text>
                                        </>
                                    )}
                                    <TouchableOpacity
                                        style={styles.closeButton}
                                        onPress={() => setModalVisible(false)} // Close the modal
                                    >
                                        <Text style={styles.closeButtonText}>Close</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    </View>
                );

            default:
                return null;
        }
    };

    // Function to handle the sidebar close on smaller screens when a tab is selected
    const handleTabSelect = (subItem: string) => {
        setActiveScreen(subItem);
        setSelectedTab(subItem); // Set selected tab color
        if (windowWidth <= 768) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <View style={styles.container}>

            {/* Fixed Header */}
            <View style={styles.header}>
                <Icon style={{ alignSelf: "flex-start", paddingTop: 10 }} name="person-circle" size={50} color="white" />
                <Text style={styles.sidebarHeaderText}>Hotel Admin Panel</Text>
                <Text style={styles.headerText}>Welcome, {username}</Text>
                <TouchableOpacity
                    style={styles.notificationIcon}
                    onPress={() => {
                        // Toggle mute state
                        setIsAlarmMuted((prev) => !prev);

                        // Stop the alarm if it's playing
                        if (alarmSound && isAlarmPlaying) {
                            alarmSound.stopAsync();
                            setIsAlarmPlaying(false);
                        }

                        // Clear the alarm timeout if active
                        if (alarmTimeoutRef.current) {
                            clearTimeout(alarmTimeoutRef.current);
                            alarmTimeoutRef.current = null;
                        }
                    }}
                >
                    <Icon
                        name={isAlarmMuted ? "notifications-off" : "notifications"}
                        size={35}
                        color="white"
                    />
                </TouchableOpacity>


            </View>
            {/* Hamburger icon for small screens */}
            {windowWidth <= 768 && !isSidebarOpen && (
                <TouchableOpacity style={styles.hamburgerIcon} onPress={() => setIsSidebarOpen(true)}>
                    <Icon name="menu" size={30} color="black" />
                </TouchableOpacity>
            )}

            {/* Back Arrow to close sidebar */}
            {windowWidth <= 768 && isSidebarOpen && (
                <TouchableOpacity style={styles.arrowIcon} onPress={() => setIsSidebarOpen(false)}>
                    <Icon name="arrow-back" size={30} color="black" />
                </TouchableOpacity>
            )}

            {/* Sidebar */}
            <View style={[styles.sidebar, windowWidth > 768 && { position: 'relative', width: '18%' }, isSidebarOpen && { left: 0 }, !isSidebarOpen && { left: -250 }]}>
                {/* Admin Panel Text and Icon */}
                <TouchableOpacity
                    style={[styles.menuButton, selectedTab === "Hotel Details" && styles.selectedTab]}
                    onPress={() => handleTabSelect("Hotel Details")}
                >
                    <Text style={[styles.menuText, selectedTab === "Hotel Details" && styles.selectedMenuText]}>
                        Dashboard
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.menuButton, selectedTab === "Offers" && styles.selectedTab]}
                    onPress={() => handleTabSelect("Offers")}
                >
                    <Text style={[styles.menuText, selectedTab === "Offers" && styles.selectedMenuText]}>
                        Offers
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.menuButton, selectedTab === "Staff Info" && styles.selectedTab]}
                    onPress={() => handleTabSelect("Staff Info")}
                >
                    <Text style={[styles.menuText, selectedTab === "Staff Info" && styles.selectedMenuText]}>
                        Staff Info
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.menuButton, selectedTab === "Edit Details" && styles.selectedTab]}
                    onPress={() => handleTabSelect("Edit Details")}
                >
                    <Text style={[styles.menuText, selectedTab === "Edit Details" && styles.selectedMenuText]}>
                        Edit Details
                    </Text>
                </TouchableOpacity>

                {[
                    { title: "Rooms", subItems: ["Room Information", "Edit Room Info"] },
                    { title: "Reservations", subItems: ["Ongoing Reservations", "Reservation History", "Reservation Requests"] },
                ].map((menu) => (
                    <View key={menu.title}>
                        <TouchableOpacity
                            style={[styles.menuButton, selectedTab === menu.title && styles.selectedTab]}
                            onPress={() => setExpandedTab(expandedTab === menu.title ? null : menu.title)}
                        >
                            <Text style={[styles.menuText, selectedTab === menu.title && styles.selectedMenuText]}>
                                {menu.title}
                            </Text>
                            <Icon name={expandedTab === menu.title ? "chevron-up" : "chevron-down"} size={20} color="black" />
                        </TouchableOpacity>

                        {expandedTab === menu.title &&
                            menu.subItems.map((subItem) => (
                                <TouchableOpacity
                                    key={subItem}
                                    style={[styles.menuButton, selectedTab === subItem && styles.selectedTab]}
                                    onPress={() => handleTabSelect(subItem)}
                                >
                                    <Text style={[styles.subMenuText, selectedTab === subItem && styles.selectedMenuText]}>
                                        {subItem}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                    </View>
                ))}

            </View>

            {/* Main Content */}
            <ScrollView style={[styles.content, windowWidth > 768 ? { flex: 1, paddingLeft: 20, paddingTop: 50 } : { flex: 1, paddingLeft: 20 }]}>
                {renderContent()}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    selectedMenuText: {
        color: 'white', // Change text color when selected
        fontWeight: 'bold',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 75,
        backgroundColor: '#176FF2',
        flexDirection: 'row',
        // alignItems: 'center',
        // justifyContent: 'space-between',
        paddingHorizontal: 15,
        zIndex: 3,
    },
    section: {
        padding: 20,
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    roomBox: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        margin: 10,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        height: 120, // Set height to fit the boxes nicely
    },
    roomText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    roomStatus: {
        fontSize: 14,
        color: 'gray',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '40%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    roomDetailText: {
        fontSize: 16,
        marginVertical: 5,
    },
    closeButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#ff0000',
        borderRadius: 5,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, flexDirection: 'row', backgroundColor: '#f4f7fc' },
    notificationContainer: { position: 'absolute', top: 10, right: 10, zIndex: 2 },
    notificationIcon: { marginLeft: '58%', marginRight: 0, right:0, marginTop: 20},
    sidebar: { backgroundColor: '#f0f0f0', padding: 0, paddingTop: 90, position: 'absolute', top: 0, bottom: 0, left: -250, zIndex: 1, transition: 'left 0.3s' },
    // sidebarHeader: { flexDirection: 'row', alignItems: 'center', marginBottom:0, marginTop:0 },
    sidebarHeaderText: { fontSize: 17, fontWeight: 'bold', marginLeft: 5, color:'white', textAlign: 'left', marginTop:28 },
    menuButton: {marginLeft:10, marginRight:10, padding: 12, backgroundColor: 'white', marginBottom: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    menuText: { fontSize: 16, color: 'black', textAlign: 'center', paddingLeft: 15 },
    selectedTab: { backgroundColor: '#176FF2' },
    text: { fontSize: 16, margin: 5 },
    loadingText: { fontSize: 18 },
    errorText: { fontSize: 18, color: 'red' },
    subMenuText: { fontSize: 16, color: 'black', paddingLeft:15, textAlign: 'center' },
    // roomText: { fontSize: 18 },
    // roomStatus: { fontSize: 14, color: 'gray' },
    roomDetail: { marginTop: 10, padding: 10, backgroundColor: '#f9f9f9' },
    // section: { padding: 20, backgroundColor: 'white', borderRadius: 10, marginBottom: 20 },
    // roomDetailText: { fontSize: 16, marginBottom: 5 },
    headerText: { fontSize: 24, fontWeight: 'bold', marginLeft: '5%', color:'white', marginTop: 20 },
    hamburgerIcon: { position: 'absolute', top: 20, left: 10, zIndex: 2 },
    arrowIcon: { position: 'absolute', top: 20, left: 200, zIndex: 2 },
    content: { padding: 20, marginTop: 20 },
    // // roomBox: {
    //     padding: 15,
    //     backgroundColor: 'white',
    //     marginBottom: 10,
    //     borderRadius: 10,
    // },
    roomUnavailable: {
        backgroundColor: 'rgba(255, 0, 0, 0.2)', // Red opaque shade
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Allow columns to wrap to the next row if needed
        justifyContent: 'space-between', // Ensure even spacing between columns
        marginTop: 20,  // Optional margin for top space
    },
    statColumn: {
        flex: 1,  // This makes each column take equal space
        alignItems: 'center',  // Center items horizontally within each column
        margin: 5,  // Optional margin between columns
    },
    statText: {
        fontSize: 16,
        color: '#333',  // Color for the label
    },
    statValue: {
        fontSize: 18,
        paddingTop: 25,
        fontWeight: 'bold',
        color: '#f00',  // Color for the stat value (e.g., red)
    },
    chartContainer: {
        paddingTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});

export default HotelAdmin;