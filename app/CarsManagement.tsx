import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

type Car = {
  model: string;
  type: string;
  registration_number: string;
  available: boolean;
  rent_per_day: number;
};

type Props = {
  car_rental_company_id: string;
};

const CarManagementScreen: React.FC<Props> = ({ car_rental_company_id }) => {
  const [company, setCompany] = useState<{ name: string; cars: Car[] }>({ name: '', cars: [] });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editCarIndex, setEditCarIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Car>({
    model: '',
    type: '',
    registration_number: '',
    available: true,
    rent_per_day: 0,
  });

  useEffect(() => {
    fetchCompanyData();
  }, [car_rental_company_id]);

  const fetchCompanyData = async () => {
    try {
      const response = await axios.get(`http://34.226.13.20:3000/companies/${car_rental_company_id}`);
      setCompany(response.data);
    } catch (error) {
      console.error("Error fetching company data:", error);
    }
  };

  const handleSaveCar = async () => {
    try {
      if (editCarIndex !== null) {
        const updatedCar = form;
        console.log("Updating car:", updatedCar);
        await axios.put(`http://34.226.13.20:3000/api/cars/${company.cars[editCarIndex].registration_number}`, updatedCar);
        const updatedCars = [...company.cars];
        updatedCars[editCarIndex] = updatedCar;
        setCompany({ ...company, cars: updatedCars });
      } else {
        console.log("Adding new car:", form);
        await axios.post(`http://34.226.13.20:3000/api/cars`, { ...form, companyId: car_rental_company_id });
        setCompany({ ...company, cars: [...company.cars, form] });
      }

      setForm({ model: '', type: '', registration_number: '', available: true, rent_per_day: 0 });
      setEditCarIndex(null);
      setShowAddForm(false);
    } catch (error) {
      console.error("Error saving car:", error);
    }
  };

  const handleEditPress = (index: number) => {
    setForm(company.cars[index]);
    setEditCarIndex(index);
    setShowAddForm(true);
  };

  const handleAddNewCar = () => {
    setForm({ model: '', type: '', registration_number: '', available: true, rent_per_day: 0 });
    setEditCarIndex(null);
    setShowAddForm(true);
  };

  const toggleAvailability = (value: boolean) => {
    setForm((prevState) => ({
      ...prevState,
      available: value,
    }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Cars Information</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddNewCar}>
          <Ionicons name="add-circle-outline" size={24} color="#007aff" />
          <Text style={styles.addButtonText}>Add Car</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.carGrid}>
        {company.cars.map((car, index) => (
          <View
            key={index}
            style={[
              styles.carCard,
              {
                backgroundColor: car.available ? '#ffffff' : '#ffe6e6',
                borderColor: car.available ? '#ccc' : '#ff4d4d',
              },
            ]}
          >
            <Text style={styles.carModel}>{car.model}</Text>
            <Text style={styles.carDetails}>Type: {car.type}</Text>
            <Text style={styles.carDetails}>Reg No.: {car.registration_number}</Text>
            <Text style={styles.carDetails}>Status: {car.available ? 'Yes' : 'No'}</Text>
            <Text style={styles.carDetails}>Rent/Day: {car.rent_per_day}</Text>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditPress(index)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Modal visible={showAddForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalTitle}>{editCarIndex !== null ? 'Edit Car' : 'Add Car'}</Text>
              {['model', 'type', 'registration_number', 'rent_per_day'].map((field) => (
                <TextInput
                  key={field}
                  placeholder={field.replace('_', ' ').toUpperCase()}
                  value={String(form[field as keyof Car])}
                  onChangeText={(val) => setForm({ ...form, [field]: field === 'rent_per_day' ? Number(val) : val })}
                  style={styles.input}
                  keyboardType={field === 'rent_per_day' ? 'numeric' : 'default'}
                />
              ))}
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>Available:</Text>
                <Switch
                  value={form.available}
                  onValueChange={toggleAvailability}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={form.available ? '#f5dd4b' : '#f4f3f4'}
                />
              </View>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveCar}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowAddForm(false)}>
                <Text style={{ textAlign: 'center', marginTop: 10, color: '#007aff' }}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: { fontSize: 20, fontWeight: 'bold' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  addButton: { flexDirection: 'row', alignItems: 'center' },
  addButtonText: { marginLeft: 5, color: '#007aff', fontWeight: 'bold' },
  carGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
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
    position: 'relative',
  },
  carModel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#007bff',
  },
  carDetails: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  editButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#007aff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  toggleLabel: {
    fontSize: 14,
    marginRight: 10,
  },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContainer: { backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#007aff',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  saveButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});

export default CarManagementScreen;
