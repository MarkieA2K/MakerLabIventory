import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingTop: 100,
    paddingBottom: 100, // Adjust the value as needed
  },
  scrollViewContentLog: {
    paddingBottom: 100, // Adjust the value as needed
  },
  whiteText: {
    color: '#EAEAEA',
    marginVertical: 10,
  },
  flexview: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 100,
  },
  listItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    height: 130,
    marginHorizontal: 30,
    marginVertical: 10,
    borderRadius: 20,
  },
  title: {
    color: '#EAEAEA',
  },
  description: {
    color: '#888',
  },
  emptyList: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    height: 130,
    marginHorizontal: 30,
    marginVertical: 10,
    borderRadius: 20,
  },
  emptyDescription: {
    fontStyle: 'italic',
    color: '#888',
    marginTop: 5,
  },
  emptyTitle: {
    color: '#EAEAEA',
  },
  icon: {
    resizeMode: 'contain',
    width: 100,
    height: 100,
  },
  modalContent: {
    padding: 16,
    flex: 1,
  },
  modalBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.13)',
    padding: 40,
    borderRadius: 40,
    color: '#EAEAEA',
    margin: 1,
  },
  modalHeaderText: {
    color: '#FFFFFF', // White color for the text
    marginBottom: 10, // Add margin bottom to separate it from other content
  },
  imageView: {
    alignItems: 'center',
  },
  imageFrame: {
    width: 200, // Adjust the width to make it smaller
    height: 200, // Adjust the height to make it smaller

    borderWidth: 1,
    resizeMode: 'contain',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: 'bold',
  },
  infoValue: {},

  borrowDateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  successModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  successModalText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  borrowButton: {
    marginTop: 16,
    marginBottom: 8,
  },
  returnButton: {
    marginTop: 8,
  },
  closeButton: {
    marginTop: 8,
  },
  optionButton: {
    marginTop: 8,
    flex: 1,
  },
  returnDateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  headerRightContainer: {
    flexDirection: 'row',
    marginRight: 16,
  },
  // New items added below
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5', // Background color of the container
  },
  formContainer: {
    width: '80%',
    padding: 20,
    borderRadius: 8,
    elevation: 4,
    backgroundColor: '#FFF', // Background color of the form container
  },
  input: {
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  loginButton: {
    marginTop: 16,
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
});

export default styles;
