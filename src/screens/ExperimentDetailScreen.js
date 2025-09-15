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
import { saveExperiments, loadExperiments } from '../utils/storage';

const ExperimentDetailScreen = ({ route, navigation }) => {
  const { experiment: initialExperiment } = route.params;
  const [experiment, setExperiment] = useState(initialExperiment);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newTotal, setNewTotal] = useState('');

  useEffect(() => {
    navigation.setOptions({
      title: experiment.subjectName,
    });
  }, [experiment.subjectName]);

  const saveData = async () => {
    const allExperiments = await loadExperiments();
    const updatedExperiments = allExperiments.map((item) =>
      item.id === experiment.id ? experiment : item
    );
    await saveExperiments(updatedExperiments);
  };

  const handleStatusChange = (experimentId, newStatus) => {
    const updatedExperiment = {
      ...experiment,
      experiments: experiment.experiments.map((item) =>
        item.id === experimentId ? { ...item, status: newStatus } : item
      ),
    };
    setExperiment(updatedExperiment);
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

    const currentTotal = experiment.experiments.length;
    let updatedExperiments = [...experiment.experiments];

    if (total > currentTotal) {
      // Add new experiments
      for (let i = currentTotal + 1; i <= total; i++) {
        updatedExperiments.push({
          id: i,
          name: `Experiment ${i}`,
          status: 'not_given',
        });
      }
    } else if (total < currentTotal) {
      // Remove experiments
      updatedExperiments = updatedExperiments.slice(0, total);
    }

    const updatedExperiment = {
      ...experiment,
      totalExperiments: total,
      experiments: updatedExperiments,
    };

    setExperiment(updatedExperiment);
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

  const renderExperimentItem = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);

    return (
      <NeumorphicCard style={styles.experimentCard}>
        <View style={styles.experimentHeader}>
          <Text style={styles.experimentName}>{item.name}</Text>
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
        <Text style={styles.formTitle}>Edit Total Experiments</Text>
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
        <Text style={styles.subjectName}>{experiment.subjectName}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setShowEditForm(!showEditForm)}
        >
          <Ionicons name="create-outline" size={20} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {renderEditForm()}

      <FlatList
        data={experiment.experiments}
        renderItem={renderExperimentItem}
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
  experimentCard: {
    marginVertical: 6,
    marginHorizontal: 16,
  },
  experimentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  experimentName: {
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

export default ExperimentDetailScreen;



