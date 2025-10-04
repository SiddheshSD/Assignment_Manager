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
import { ThemeContext } from '../utils/theme';
import DateTimePicker from '@react-native-community/datetimepicker';

const AssignmentDetailScreen = ({ route, navigation }) => {
  const { assignment: initialAssignment } = route.params;
  const [assignment, setAssignment] = useState(initialAssignment);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newTotal, setNewTotal] = useState('');
  const [newCourseCode, setNewCourseCode] = useState(initialAssignment.courseCode || '');
  const palette = React.useContext(ThemeContext).palette;

  // Date-time picker state
  const [pickerItemId, setPickerItemId] = useState(null);
  const [pickerMode, setPickerMode] = useState(null); // 'date' | null
  const [tempDate, setTempDate] = useState(new Date());

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

  const handleStatusChange = async (assignmentId, newStatus) => {
    const updatedAssignment = {
      ...assignment,
      assignments: assignment.assignments.map((item) =>
        item.id === assignmentId ? { ...item, status: newStatus } : item
      ),
    };
    setAssignment(updatedAssignment);
    
    // Auto-save the changes
    const allAssignments = await loadAssignments();
    const statusSavedAssignments = allAssignments.map((item) =>
      item.id === updatedAssignment.id ? updatedAssignment : item
    );
    await saveAssignments(statusSavedAssignments);
  };

  const clearSubmissionDate = async (assignmentId) => {
    const updatedAssignment = {
      ...assignment,
      assignments: assignment.assignments.map((item) =>
        item.id === assignmentId ? { ...item, submissionDate: null, submissionNotifIds: [] } : item
      ),
    };
    setAssignment(updatedAssignment);
    
    // Auto-save the changes
    const allAssignments = await loadAssignments();
    const clearDateSavedAssignments = allAssignments.map((item) =>
      item.id === updatedAssignment.id ? updatedAssignment : item
    );
    await saveAssignments(clearDateSavedAssignments);
  };

  const openPickerForItem = (item) => {
    const current = item.submissionDate ? new Date(item.submissionDate) : new Date();
    setTempDate(current);
    setPickerItemId(item.id);
    setPickerMode('date');
  };

  const onPickerChange = async (_event, selectedDate) => {
    if (!selectedDate) {
      setPickerMode(null);
      setPickerItemId(null);
      return;
    }

    if (pickerMode === 'date') {
      // Set time to start of day (only date, no time)
      const d = new Date(selectedDate);
      d.setHours(0, 0, 0, 0);

      const updatedAssignment = {
        ...assignment,
        assignments: assignment.assignments.map((i) =>
          i.id === pickerItemId ? { ...i, submissionDate: d.toISOString(), submissionNotifIds: [] } : i
        ),
      };
      setAssignment(updatedAssignment);
      setPickerMode(null);
      setPickerItemId(null);
      
      // Auto-save the changes
      const allAssignments = await loadAssignments();
      const pickerSavedAssignments = allAssignments.map((item) =>
        item.id === updatedAssignment.id ? updatedAssignment : item
      );
      await saveAssignments(pickerSavedAssignments);
    }
  };


  const handleEditTotal = async () => {
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
      for (let i = currentTotal + 1; i <= total; i++) {
        updatedAssignments.push({
          id: i,
          name: `Assignment ${i}`,
          status: 'not_given',
        });
      }
    } else if (total < currentTotal) {
      updatedAssignments = updatedAssignments.slice(0, total);
    }

    const updatedAssignment = {
      ...assignment,
      courseCode: (newCourseCode || '').trim(),
      totalAssignments: total,
      assignments: updatedAssignments,
    };

    setAssignment(updatedAssignment);
    setNewTotal('');
    setShowEditForm(false);
    
    // Auto-save the changes
    const allAssignments = await loadAssignments();
    const editSavedAssignments = allAssignments.map((item) =>
      item.id === updatedAssignment.id ? updatedAssignment : item
    );
    await saveAssignments(editSavedAssignments);
  };

  const handleDeleteSubject = () => {
    Alert.alert(
      'Delete Subject',
      `Delete ${assignment.subjectName}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const allAssignments = await loadAssignments();
            const updated = allAssignments.filter((item) => item.id !== assignment.id);
            await saveAssignments(updated);
            navigation.goBack();
          },
        },
      ]
    );
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

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'written': return 'Written';
      case 'not_completed': return 'Not Completed';
      case 'not_given': return 'Not Given';
      default: return 'Unknown';
    }
  };

  const renderAssignmentItem = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);
    const statusText = getStatusText(item.status);

    return (
      <NeumorphicCard style={styles.assignmentCard}>
        {/* Header with assignment name and status */}
        <View style={styles.assignmentHeader}>
          <View style={styles.assignmentTitleContainer}>
            <Text style={[styles.assignmentName, { color: palette.textPrimary }]}>{item.name}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusIndicator, { backgroundColor: statusColor }]}>
                <Ionicons name={statusIcon} size={14} color="white" />
              </View>
              <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
            </View>
          </View>
        </View>
        
        {/* Status Selection */}
        <View style={styles.statusSection}>
          <Text style={[styles.sectionTitle, { color: palette.textSecondary }]}>Status</Text>
          <View style={styles.statusButtons}>
            <TouchableOpacity
              style={[
                styles.statusButton,
                item.status === 'completed' && styles.activeButton,
                { borderColor: '#10b981' }
              ]}
              onPress={() => handleStatusChange(item.id, 'completed')}
            >
              <Ionicons name="checkmark-circle" size={16} color={item.status === 'completed' ? '#10b981' : '#9ca3af'} />
              <Text style={[
                styles.statusButtonText,
                item.status === 'completed' && styles.activeButtonText,
                { color: item.status === 'completed' ? '#10b981' : '#6b7280' }
              ]}>
                Done
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
              <Ionicons name="create" size={16} color={item.status === 'written' ? '#f59e0b' : '#9ca3af'} />
              <Text style={[
                styles.statusButtonText,
                item.status === 'written' && styles.activeButtonText,
                { color: item.status === 'written' ? '#f59e0b' : '#6b7280' }
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
              <Ionicons name="close-circle" size={16} color={item.status === 'not_completed' ? '#ef4444' : '#9ca3af'} />
              <Text style={[
                styles.statusButtonText,
                item.status === 'not_completed' && styles.activeButtonText,
                { color: item.status === 'not_completed' ? '#ef4444' : '#6b7280' }
              ]}>
                Pending
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
              <Ionicons name="ellipse-outline" size={16} color={item.status === 'not_given' ? '#6b7280' : '#9ca3af'} />
              <Text style={[
                styles.statusButtonText,
                item.status === 'not_given' && styles.activeButtonText,
                { color: item.status === 'not_given' ? '#6b7280' : '#6b7280' }
              ]}>
                Not Given
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submission Date Section */}
        <View style={styles.dateSection}>
          <Text style={[styles.sectionTitle, { color: palette.textSecondary }]}>Submission Date</Text>
          <View style={styles.dateContainer}>
            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: palette.surface }]}
              onPress={() => openPickerForItem(item)}
            >
              <Ionicons name="calendar-outline" size={18} color="#6366f1" />
              <Text style={[styles.dateText, { color: item.submissionDate ? '#6366f1' : '#9ca3af' }]}>
                {item.submissionDate ? new Date(item.submissionDate).toLocaleDateString() : 'Set Date'}
              </Text>
            </TouchableOpacity>
            {item.submissionDate && (
              <TouchableOpacity
                style={[styles.clearDateButton, { backgroundColor: palette.surface }]}
                onPress={() => clearSubmissionDate(item.id)}
              >
                <Ionicons name="trash-outline" size={16} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </NeumorphicCard>
    );
  };

  const renderEditForm = () => {
    if (!showEditForm) return null;

    return (
      <NeumorphicCard style={styles.editForm}>
        <Text style={[styles.formTitle, { color: palette.textPrimary }]}>Edit Total Assignments</Text>
        <NeumorphicInput
          placeholder="New total number"
          value={newTotal}
          onChangeText={setNewTotal}
          keyboardType="numeric"
          style={styles.input}
        />
        <NeumorphicInput
          placeholder="Course Code (optional)"
          value={newCourseCode}
          onChangeText={setNewCourseCode}
          style={styles.input}
        />
        <View style={styles.buttonRow}>
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

        <View style={styles.deleteRow}>
          <Text style={[styles.deleteLabel, { color: '#ef4444' }]}>Delete Subject</Text>
          <View style={styles.deleteButtonRow}>
            <View style={{ flex: 1 }} />
            <NeumorphicButton
              title="Delete"
              onPress={handleDeleteSubject}
              style={[styles.button, styles.deleteButton]}
              textStyle={styles.deleteButtonText}
            />
          </View>
        </View>
      </NeumorphicCard>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={[styles.header, { backgroundColor: palette.background }]}>
        <Text style={[styles.subjectName, { color: palette.textPrimary }]}>{assignment.subjectName}</Text>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: palette.surface }]}
          onPress={() => {
            setNewTotal(String(assignment.assignments.length));
            setNewCourseCode(assignment.courseCode || '');
            setShowEditForm(true);
          }}
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

      {pickerMode && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={onPickerChange}
        />
      )}
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
    color: '#111827',
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
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 20,
  },
  assignmentHeader: {
    marginBottom: 20,
  },
  assignmentTitleContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  assignmentName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusButton: {
    flex: 1,
    minWidth: '22%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    backgroundColor: 'transparent',
    gap: 4,
  },
  activeButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  statusButtonText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeButtonText: {
    fontWeight: '700',
  },
  dateSection: {
    marginTop: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
  },
  clearDateButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fee2e2',
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 4,
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
  deleteButton: {
    backgroundColor: '#f0f0f3',
  },
  deleteButtonText: {
    color: '#ef4444',
  },
  deleteRow: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deleteLabel: {
    fontSize: 18,
    color: '#374151',
    fontWeight: '600',
  },
  deleteButtonRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});

export default AssignmentDetailScreen;



