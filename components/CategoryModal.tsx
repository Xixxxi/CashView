// components/CategoryModal.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, categories as defaultCategories } from '../context/CategoryData';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCategory: (categoryLabel: string) => void;
}

const CATEGORY_STORAGE_KEY = '@categories';

// Calculate item width based on screen width and desired number of columns
const screenWidth = Dimensions.get('window').width;
const numColumns = 4;
const itemMargin = 12;
const itemSize = (screenWidth - (numColumns + 1) * itemMargin) / numColumns;

const CategoryModal: React.FC<CategoryModalProps> = ({
  visible,
  onClose,
  onSelectCategory,
}) => {
  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [createCategoryModalVisible, setCreateCategoryModalVisible] = useState(false);
  const [editCategoryModalVisible, setEditCategoryModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<IoniconsName>('home-outline');

  // Icon options for category creation/editing
  const iconOptions: IoniconsName[] = [
    'home-outline',
    'car-outline',
    'fast-food-outline',
    'cart-outline',
    'cash-outline',
    'heart-outline',
    'airplane-outline',
    'barbell-outline',
    'restaurant-outline',
    'gift-outline',
    'bus-outline',
    'trending-up-outline',
    'wallet-outline',
    'tv-outline',
    'cafe-outline',
    'wifi-outline',
    'bicycle-outline',
    'school-outline',
    'camera-outline',
    'laptop-outline',
    'medkit-outline',
    'hammer-outline',
    'shirt-outline',
    'book-outline',
    'fitness-outline',
    'umbrella-outline',
    'phone-portrait-outline',
    'headset-outline',
    'musical-notes-outline',
    'game-controller-outline',
    'bed-outline',
    'leaf-outline',
    'paw-outline',
  ];

  // Load categories from AsyncStorage when the modal becomes visible
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const savedCategories = await AsyncStorage.getItem(CATEGORY_STORAGE_KEY);
        if (savedCategories) {
          setLocalCategories(JSON.parse(savedCategories));
        } else {
          setLocalCategories(defaultCategories);
        }
      } catch (error) {
        console.error('Failed to load categories from storage:', error);
        setLocalCategories(defaultCategories);
      } finally {
        setIsLoading(false);
      }
    };

    if (visible) {
      loadCategories();
    }
  }, [visible]);

  // Save categories to AsyncStorage
  const saveCategories = async (categories: Category[]) => {
    try {
      await AsyncStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
    } catch (error) {
      console.error('Failed to save categories to storage:', error);
      Alert.alert('Error', 'Failed to save categories.');
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryLabel: string) => {
    onSelectCategory(categoryLabel);
    onClose();
  };

  // Filtered categories based on search query
  const filteredCategories = localCategories.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle creating a new category
  const handleCreateCategory = () => {
    if (newCategoryTitle.trim() !== '') {
      const existingCategory = localCategories.find(
        (cat) => cat.label.toLowerCase() === newCategoryTitle.trim().toLowerCase()
      );
      if (existingCategory) {
        Alert.alert('Duplicate Category', 'This category already exists.');
        return;
      }

      const newCategory: Category = {
        id: Date.now(),
        label: newCategoryTitle.trim(),
        icon: selectedIcon,
      };
      const updatedCategories = [...localCategories, newCategory];
      setLocalCategories(updatedCategories);
      saveCategories(updatedCategories);
      setCreateCategoryModalVisible(false);
      setNewCategoryTitle('');
      setSelectedIcon('home-outline');
    } else {
      Alert.alert('Invalid Input', 'Please enter a valid category title.');
    }
  };

  // Handle editing an existing category
  const handleEditCategory = () => {
    if (selectedCategory && newCategoryTitle.trim() !== '') {
      const existingCategory = localCategories.find(
        (cat) =>
          cat.label.toLowerCase() === newCategoryTitle.trim().toLowerCase() &&
          cat.id !== selectedCategory.id
      );
      if (existingCategory) {
        Alert.alert('Duplicate Category', 'This category already exists.');
        return;
      }

      const updatedCategories = localCategories.map((cat) =>
        cat.id === selectedCategory.id
          ? { ...cat, label: newCategoryTitle.trim(), icon: selectedIcon }
          : cat
      );
      setLocalCategories(updatedCategories);
      saveCategories(updatedCategories);
      setEditCategoryModalVisible(false);
      setSelectedCategory(null);
      setNewCategoryTitle('');
      setSelectedIcon('home-outline');
    } else {
      Alert.alert('Invalid Input', 'Please enter a valid category title.');
    }
  };

  // Handle deleting a category
  const handleDeleteCategory = () => {
    if (selectedCategory) {
      Alert.alert(
        'Delete Category',
        `Are you sure you want to delete the category "${selectedCategory.label}"? This will also remove it from all associated transactions.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              const updatedCategories = localCategories.filter((cat) => cat.id !== selectedCategory.id);
              setLocalCategories(updatedCategories);
              saveCategories(updatedCategories);
              setEditCategoryModalVisible(false);
              setSelectedCategory(null);
              setNewCategoryTitle('');
              setSelectedIcon('home-outline');
            },
          },
        ]
      );
    }
  };

  if (isLoading) {
    return (
      <Modal visible={visible} transparent={true} animationType="fade">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </Modal>
    );
  }

  return (
    <>
      {/* Main Category Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Categories</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-outline" size={28} color="#555" />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.searchBar}
          placeholder="Search Categories"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#AAA"
        />
        <FlatList
          data={filteredCategories}
          numColumns={numColumns}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => handleCategorySelect(item.label)}
              onLongPress={() => {
                setSelectedCategory(item);
                setNewCategoryTitle(item.label);
                setSelectedIcon(item.icon);
                setEditCategoryModalVisible(true);
              }}
            >
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon as IoniconsName} size={24} color="#FFF" />
              </View>
              <Text style={styles.categoryLabel}>{item.label}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No categories found.</Text>
          }
          contentContainerStyle={styles.flatListContent}
        />
        <TouchableOpacity
          style={styles.newCategoryButton}
          onPress={() => setCreateCategoryModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={28} color="#4CAF50" />
          <Text style={styles.newCategoryText}>Add New Category</Text>
        </TouchableOpacity>
      </Modal>

      {/* Modal for Creating New Category */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createCategoryModalVisible}
        onRequestClose={() => setCreateCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.createModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Category</Text>
              <TouchableOpacity onPress={() => setCreateCategoryModalVisible(false)}>
                <Ionicons name="close-outline" size={28} color="#555" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Category Title"
              placeholderTextColor="#AAA"
              value={newCategoryTitle}
              onChangeText={setNewCategoryTitle}
            />
            <Text style={styles.selectIconText}>Select an Icon</Text>
            <FlatList
              data={iconOptions}
              numColumns={numColumns}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.iconItem,
                    selectedIcon === item && styles.selectedIconItem,
                  ]}
                  onPress={() => setSelectedIcon(item)}
                >
                  <Ionicons
                    name={item}
                    size={24}
                    color={selectedIcon === item ? '#FFF' : '#4CAF50'}
                  />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.iconList}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleCreateCategory}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCreateCategoryModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for Editing Category */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editCategoryModalVisible}
        onRequestClose={() => setEditCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.createModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Category</Text>
              <TouchableOpacity onPress={() => setEditCategoryModalVisible(false)}>
                <Ionicons name="close-outline" size={28} color="#555" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Category Title"
              placeholderTextColor="#AAA"
              value={newCategoryTitle}
              onChangeText={setNewCategoryTitle}
            />
            <Text style={styles.selectIconText}>Select an Icon</Text>
            <FlatList
              data={iconOptions}
              numColumns={numColumns}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.iconItem,
                    selectedIcon === item && styles.selectedIconItem,
                  ]}
                  onPress={() => setSelectedIcon(item)}
                >
                  <Ionicons
                    name={item}
                    size={24}
                    color={selectedIcon === item ? '#FFF' : '#4CAF50'}
                  />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.iconList}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleEditCategory}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteCategory}
              >
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Loading Indicator Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Main Modal Styles
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  searchBar: {
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#DDD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  flatListContent: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: itemMargin / 2,
    width: itemSize,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50', // Accent Green
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    fontSize: 16,
    marginTop: 20,
  },
  newCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  newCategoryText: {
    fontSize: 16,
    color: '#4CAF50',
    marginLeft: 8,
    fontWeight: '600',
  },
  // Create/Edit Category Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  createModalContainer: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  selectIconText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  iconItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    margin: 6,
    borderRadius: 8,
    backgroundColor: '#E8F5E9', // Light Green Background
    width: itemSize - 24, // Adjusted for padding and margins
    height: itemSize - 24,
  },
  selectedIconItem: {
    backgroundColor: '#4CAF50',
  },
  iconList: {
    justifyContent: 'center',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CategoryModal;
