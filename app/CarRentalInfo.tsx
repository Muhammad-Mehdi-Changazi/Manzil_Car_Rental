import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, FlatList, Modal } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import io from 'socket.io-client';
import Icon from 'react-native-vector-icons/Ionicons'; // For icons
import { BarChart } from 'react-native-chart-kit';
import ReservationRequests from './ReservationsRequest';
import CarManagementScreen from './CarsManagement';
import { Audio } from 'expo-av';
import EditCompanyDetails from './EditCompanyDetails';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';


export interface Car {
  _id: string;
  model: string;
  registration_number: string;
  type: string;
  rent_per_day: number;
  available: boolean;
}

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface Location {
  coordinates: LocationCoordinates;
  address: string;
  city: string;
}

export interface CarRentalCompany {
  _id: string;
  name: string;
  contact_email: string;
  contact_phone: string;
  total_cars: number;
  location: Location;
  cars: Car[];
  __v: number;
}


let socket;

function CarRental() {
    const {car_rental_company_id } = useLocalSearchParams<{car_rental_company_id: string }>();
    const [reservations, setReservations] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeScreen, setActiveScreen] = useState<string>("Company Details");
    const [expandedTab, setExpandedTab] = useState<string | null>(null); // Track expanded menu
    const [isSidebarOpen, setIsSidebarOpen] = useState(Dimensions.get('window').width > 768); // Show sidebar only on large screens

    const [selectedTab, setSelectedTab] = useState<string>("Company Details"); // Track selected tab
    const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
    // Dummy Data for Reservations
    const [currentBookings, setCurrentBookings] = useState<number>(0);
    const [pendingRequests, setPendingRequests] = useState<number>(0);
    const [bookingHistory, setBookingHistory] = useState<number>(0);
    const [modalVisible, setModalVisible] = useState(false); // For controlling modal visibility
    const [alarmSound, setAlarmSound] = useState<Audio.Sound | null>(null);
    const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
    const alarmTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isAlarmMuted, setIsAlarmMuted] = useState(false);
    const [company, setCompany] = useState<CarRentalCompany | null>(null);
    const carTypes: { [key: string]: number } = {};
        company?.cars.forEach(car => {
        carTypes[car.model] = (carTypes[car.model] || 0) + 1;
        });

        const carTypesData = {
        labels: Object.keys(carTypes),
        datasets: [{ data: Object.values(carTypes) }],
        };
    

        useFocusEffect(
            useCallback(() => {
                const fetchCompanyDetails = async () => {
                try {
                    const response = await axios.get(`http://10.130.114.185:3000/companies/${car_rental_company_id}`);
                    setCompany(response.data);

                    const availableCarsCount: number = (response.data.cars as Car[]).filter((car: Car) => car.available).length;
                    // use availableCarsCount here or set in state if needed
                } catch (err) {
                    console.error(err);
                    setError('Failed to load company details.');
                } finally {
                    setLoading(false);
                }
                };

                fetchCompanyDetails();
            }, [car_rental_company_id, selectedTab==="Company Details"])
            );

 
    console.log("Object is :", company);

    if (loading) {
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.loadingText}>Loading Company Details...</Text>
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

    // Calculate available cars count
    const availableCarsCount = company ? company.cars.filter(car => car.available).length : 0;

    //  console.log("Company is:", company);
    // Render content based on the selected screen
    const renderContent = () => {
        switch (activeScreen) {
            case "Company Details":
                return (
                    <View style={{ borderRadius: 12, padding: 20, marginBottom: 20 }}>
                        {/* Company Info */}
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                        {company ? company.name : 'Company Name Not Available'}
                        </Text>

                        <Text style={{ marginBottom: 6 }}>
                        <Text style={{ fontWeight: 'bold' }}>Address: </Text>
                        {company ? `${company.location.address}, ${company.location.city}` : ''}
                        </Text>

                        <Text style={{ marginBottom: 6 }}>
                        <Text style={{ fontWeight: 'bold' }}>Contact Email: </Text>
                        {company?.contact_email}
                        </Text>

                        <Text style={{ marginBottom: 6 }}>
                        <Text style={{ fontWeight: 'bold' }}>Contact Phone: </Text>
                        {company?.contact_phone}
                        </Text>

                        <Text style={{ marginBottom: 6 }}>
                        <Text style={{ fontWeight: 'bold' }}>Total Cars: </Text>
                        {company?.total_cars}
                        </Text>

                        <Text style={{ marginBottom: 6 }}>
                        <Text style={{ fontWeight: 'bold' }}>Currently Available Cars: </Text>
                        {availableCarsCount}
                        </Text>

                        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: 20 }}>
                            Fleet Overview by Type
                        </Text>
                        {/* Car Stats Chart */}
                        <View style={{ marginTop: 20, marginLeft: 28 }}>
                        
                        <BarChart
                            data={carTypesData}
                            width={Dimensions.get('window').width * 0.7}
                            height={240}
                            fromZero={true}
                            yAxisLabel="" // Add a label for the Y-axis (e.g., "$")
                            yAxisSuffix="" // Add a suffix for the Y-axis (optional, e.g., "k")
                            chartConfig={{
                            backgroundColor: '#f0f0f0',
                            backgroundGradientFrom: '#f0f0f0',
                            backgroundGradientTo: '#f0f0f0',
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`, // Blue bars
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            style: {
                                borderRadius: 16,
                                marginLeft: 10,
                            },
                            propsForDots: {
                                r: '6',
                                strokeWidth: '2',
                                stroke: '#007aff',
                            },
                            }}
                            style={{
                            marginVertical: 0,
                            borderRadius: 16,
                            }}
                        />
                        </View>

                         <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 }}>
                    {/* Current Bookings */}
                    <View style={styles.statCard}>
                        <Text style={styles.statTitle}>Current Bookings</Text>
                        <Text style={styles.statCount}>{currentBookings}</Text>
                    </View>

                    {/* Booking History */}
                    <View style={styles.statCard}>
                        <Text style={styles.statTitle}>History Data</Text>
                        <Text style={styles.statCount}>{bookingHistory}</Text>
                    </View>

                    {/* Pending Requests */}
                    <View style={styles.statCard}>
                        <Text style={styles.statTitle}>Pending Rent Requests</Text>
                        <Text style={styles.statCount}>{pendingRequests}</Text>
                    </View>
                    </View>


                    </View>

                    );
                case "Cars Information":
                     return <CarManagementScreen car_rental_company_id={car_rental_company_id} />;

            case "Offers":

            case "Staff Info":
                 
            case "Current Bookings":
                return (
                <ReservationRequests
                    status={["CONFIRMED"]}
                    companyId={car_rental_company_id}
                />
                );

            case "Request History":
                return (
                <ReservationRequests
                    status={["CANCELLED", "CONFIRMED"]}
                    companyId={car_rental_company_id}
                />
                );

            case "Pending Requests":
                return (
                <ReservationRequests
                    status={["PENDING"]}
                    companyId={car_rental_company_id}
                />
                );

            case "Edit Company Details":
                 return <EditCompanyDetails car_rental_company_id={car_rental_company_id} />;
               
  
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
                <Text style={styles.sidebarHeaderText}>Car Rental Panel</Text>
                <Text style={styles.headerText}>{company ? company.name : 'Guest'}</Text>
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
                    style={[styles.menuButton, selectedTab === "Company Details" && styles.selectedTab]}
                    onPress={() => handleTabSelect("Company Details")}
                >
                    <Text style={[styles.menuText, selectedTab === "Company Details" && styles.selectedMenuText]}>
                        Dashboard
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.menuButton, selectedTab === "Cars Information" && styles.selectedTab]}
                    onPress={() => handleTabSelect("Cars Information")}
                >
                    <Text style={[styles.menuText, selectedTab === "Cars Information" && styles.selectedMenuText]}>
                        Cars Information
                    </Text>
                </TouchableOpacity>

                {[
                    { title: "Booking Requests", subItems: ["Current Bookings", "Request History", "Pending Requests"] },
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

                
                <TouchableOpacity
                    style={[styles.menuButton, selectedTab === "Edit Company Details" && styles.selectedTab]}
                    onPress={() => handleTabSelect("Edit Company Details")}
                >
                    <Text style={[styles.menuText, selectedTab === "Edit Company Details" && styles.selectedMenuText]}>
                        Edit Company Details
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

     statCard: {
    flex: 1,
    backgroundColor: '#e0f7ff',
    borderRadius: 50,
    paddingVertical: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007aff',
    marginBottom: 6,
  },
  statCount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
carCard: {
  width: '48%',
  marginBottom: 15,
  padding: 15,
  borderRadius: 12,
  borderWidth: 1,
  backgroundColor: '#fff',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
},
carModel: {
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 6,
  color: '#007bff', // Blue color
},
carDetails: {
  fontSize: 14,
  color: '#555',
  marginBottom: 4,
},
});

export default CarRental;