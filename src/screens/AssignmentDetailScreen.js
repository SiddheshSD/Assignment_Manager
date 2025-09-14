import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NeumorphicCard from '../components/NeumorphicCard';
import NeumorphicButton from '../components/NeumorphicButton';
import NeumorphicInput from '../components/NeumorphicInput';
import { saveAssignments, loadAssignments } from '../utils/storage';

const AssignmentDetailScreen = ({ route, navigation }) => {
  const { assignment: initialAssignment } = route.params;
  const [assignment, setAssignment] = useState(initialAssignment);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newTotal, setNewTotal] = useState('');

  useEffect(() => {
    navigation.setOptions({
      title: assignment.subjectName,
    });
  }, [assignment.subjectName]);

  const saveData = async () => {
    const allAssignments = await loadAssignments();
    const updatedAssignments = allAssignments.map((item) =>
      item.id === assignment.id ? assignment : item
    );
    await saveAssignments(updatedAssignments);
  };

  const handleStatusChange = (assignmentId, newStatus) => {
    const updatedAssignment = {
      ...assignment,
      assignments: assignment.assignments.map((item) =>
        item.id === assignmentId ? { ...item, status: newStatus } : item
      ),
    };
    setAssignment(updatedAssignment);
    saveData();
  };

  const handleEditTotal = () => {
    if (!newTotal.trim()) {
      Alert.alert('Error', 'Please enter a number');
      return;
    }

    const total = parseInt(newTotal);
    if (isNaN(total) || total <= 0) {
      Alert.alert('Error', 'Please enter a valid number');
      return;
    }

    const currentTotal = assignment.assignments.length;
    let updatedAssignments = [...assignment.assignments];

    if (total > currentTotal) {
      // Add new assignments
      for (let i = currentTotal + 1; i <= total; i++) {
        updatedAssignments.push({
          id: i,
          name: `Assignment ${i}`,
          status: 'not_given',
        });
      }
    } else if (total < currentTotal) {
      // Remove assignments
      updatedAssignments = updatedAssignments.slice(0, total);
    }

    const updatedAssignment = {
      ...assignment,
      totalAssignments: total,
      assignments: updatedAssignments,
    };

    setAssignment(updatedAssignment);
    setNewTotal('');
    setShowEditForm(false);
    saveData();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'written':
        return '#f59e0b';
      case 'not_completed':
        return '#ef4444';
      case 'not_given':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'written':
        return 'create';
      case 'not_completed':
        return 'close-circle';
      case 'not_given':
        return 'ellipse-outline';
      default:
        return 'ellipse-outline';
    }
  };

  const renderAssignmentItem = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);

    return (
      <NeumorphicCard style={styles.assignmentCard}>
        <View style={styles.assignmentHeader}>
          <Text style={styles.assignmentName}>{item.name}</Text>
          <View style={[styles.statusIndicator, { backgroundColor: statusColor }]}>
            <Ionicons name={statusIcon} size={16} color="white" />
          </View>
        </View>
        
        <View style={styles.statusButtons}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              item.status === 'completed' && styles.activeButton,
              { borderColor: '#10b981' }
            ]}
            onPress={() => handleStatusChange(item.id, 'completed')}
          >
            <Text style={[
              styles.statusButtonText,
              item.status === 'completed' && styles.activeButtonText,
              { color: '#10b981' }
            ]}>
              Completed
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.statusButton,
              item.status === 'written' && styles.activeButton,
              { borderColor: '#f59e0b' }
            ]}
            onPress={() => handleStatusChange(item.id, 'written')}
          >
            <Text style={[
              styles.statusButtonText,
              item.status === 'written' && styles.activeButtonText,
              { color: '#f59e0b' }
            ]}>
              Written
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.statusButton,
              item.status === 'not_completed' && styles.activeButton,
              { borderColor: '#ef4444' }
            ]}
            onPress={() => handleStatusChange(item.id, 'not_completed')}
          >
            <Text style={[
              styles.statusButtonText,
              item.status === 'not_completed' && styles.activeButtonText,
              { color: '#ef4444' }
            ]}>
              Not Completed
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.statusButton,
              item.status === 'not_given' && styles.activeButton,
              { borderColor: '#6b7280' }
            ]}
            onPress={() => handleStatusChange(item.id, 'not_given')}
          >
            <Text style={[
              styles.statusButtonText,
              item.status === 'not_given' && styles.activeButtonText,
              { color: '#6b7280' }
            ]}>
              Not Given
            </Text>
          </TouchableOpacity>
        </View>
      </NeumorphicCard>
    );
  };

  const renderEditForm = () => {
    if (!showEditForm) return null;

    return (
      <NeumorphicCard style={styles.editForm}>
        <Text style={styles.formTitle}>Edit Total Assignments</Text>
        <NeumorphicInput
          placeholder="New total number"
          value={newTotal}
          onChangeText={setNewTotal}
          keyboardType="numeric"
          style={styles.input}
        />
        <View style={styles.buttonContainer}>
          <NeumorphicButton
            title="Cancel"
            onPress={() => {
              setShowEditForm(false);
              setNewTotal('');
            }}
            style={[styles.button, styles.cancelButton]}
            textStyle={styles.cancelButtonText}
          />
          <NeumorphicButton
            title="Update"
            onPress={handleEditTotal}
            style={[styles.button, styles.updateButton]}
          />
        </View>
      </NeumorphicCard>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subjectName}>{assignment.subjectName}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setShowEditForm(!showEditForm)}
        >
          <Ionicons name="create-outline" size={20} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {renderEditForm()}

      <FlatList
        data={assignment.assignments}
        renderItem={renderAssignmentItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6e6e6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#e6e6e6',
  },
  subjectName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#f0f0f3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listContainer: {
    paddingBottom: 20,
  },
  assignmentCard: {
    marginVertical: 6,
    marginHorizontal: 16,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  assignmentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  activeButton: {
    backgroundColor: '#f0f0f3',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeButtonText: {
    fontWeight: 'bold',
  },
  editForm: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#f0f0f3',
  },
  cancelButtonText: {
    color: '#ef4444',
  },
  updateButton: {
    backgroundColor: '#f0f0f3',
  },
});

export default AssignmentDetailScreen;
