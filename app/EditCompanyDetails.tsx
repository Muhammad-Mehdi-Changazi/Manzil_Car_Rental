import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, Alert, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';

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

interface Props {
  car_rental_company_id: string;
}

const EditCompanyDetails: React.FC<Props> = ({ car_rental_company_id }) => {
  const [company, setCompany] = useState<CarRentalCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCompanyDetails = async () => {
    try {
      const response = await axios.get(`http://10.130.114.185:3000/companies/${car_rental_company_id}`);
      setCompany(response.data);
    } catch (error) {
      console.error('Failed to fetch company details:', error);
      Alert.alert('Error', 'Could not fetch company details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!company) return;
    setSaving(true);
    try {
      await axios.put(`http://10.130.114.185:3000/update-company/${car_rental_company_id}`, company);
      Alert.alert('Success', 'Company details updated.');
    } catch (error) {
      console.error('Failed to update company:', error);
      Alert.alert('Error', 'Failed to update company details.');
    } finally {
      setSaving(false);
    }
  };

    const deleteCarFromList = (carId: string) => {
        if (!company) return;
        const updatedCars = company.cars.filter(car => car._id !== carId);
        setCompany(prev => prev ? {
            ...prev,
            cars: updatedCars,
            total_cars: updatedCars.length
        } : null);
        };

  useEffect(() => {
    fetchCompanyDetails();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 100 }} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Edit Car Rental Company</Text>

      <TextInput
        style={styles.input}
        value={company?.name}
        onChangeText={(text) => setCompany(prev => ({ ...prev!, name: text }))}
        placeholder="Company Name"
      />
      <TextInput
        style={styles.input}
        value={company?.contact_email}
        onChangeText={(text) => setCompany(prev => ({ ...prev!, contact_email: text }))}
        placeholder="Email"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        value={company?.contact_phone}
        onChangeText={(text) => setCompany(prev => ({ ...prev!, contact_phone: text }))}
        placeholder="Phone"
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        value={company?.location.address}
        onChangeText={(text) => setCompany(prev => ({
          ...prev!,
          location: { ...prev!.location, address: text }
        }))}
        placeholder="Address"
      />
      <TextInput
        style={styles.input}
        value={company?.location.city}
        onChangeText={(text) => setCompany(prev => ({
          ...prev!,
          location: { ...prev!.location, city: text }
        }))}
        placeholder="City"
      />
      <TextInput
        style={styles.input}
        value={company?.location.coordinates.lat?.toString()}
        onChangeText={(text) => setCompany(prev => ({
          ...prev!,
          location: {
            ...prev!.location,
            coordinates: { ...prev!.location.coordinates, lat: parseFloat(text) || 0 }
          }
        }))}
        placeholder="Latitude"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        value={company?.location.coordinates.lng?.toString()}
        onChangeText={(text) => setCompany(prev => ({
          ...prev!,
          location: {
            ...prev!.location,
            coordinates: { ...prev!.location.coordinates, lng: parseFloat(text) || 0 }
          }
        }))}
        placeholder="Longitude"
        keyboardType="numeric"
      />

      <Text style={styles.subheading}>Cars</Text>
      {company?.cars.map(car => (
        <View key={car._id} style={styles.carCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.carTitle}>{car.model} ({car.type})</Text>
            <Text>Reg #: {car.registration_number}</Text>
            <Text>Rent/Day: ${car.rent_per_day}</Text>
            <Text>Available: {car.available ? 'Yes' : 'No'}</Text>
          </View>
          <TouchableOpacity onPress={() => deleteCarFromList(car._id)}>
            <Text style={styles.deleteButton}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Button title={saving ? 'Saving...' : 'Save Changes'} onPress={handleSave} disabled={saving} />
    </ScrollView>
  );
};

export default EditCompanyDetails;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subheading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15,
  },
  input: {
    marginBottom: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
  },
  carCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  carTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  deleteButton: {
    color: 'red',
    fontSize: 20,
    paddingHorizontal: 10,
    fontWeight: 'bold',
  },
});
