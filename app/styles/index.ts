import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Adjusted for better readability
  },
  headerText: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ffffff',
    fontFamily: 'serif', // Adjusted font to match the Figma design
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    color: '#dddddd',
    paddingHorizontal: 20,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#1E90FF', // Adjusted color to match Figma design
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 25,
    marginVertical: 10,
    width: '70%', // Adjusted button width to match design
    alignItems: 'center',
    shadowColor: '#000', // Added shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  footerText: {
    marginTop: 50,
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
});
