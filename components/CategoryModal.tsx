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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Category, categories as defaultCategories } from '../context/CategoryData';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const CATEGORY_STORAGE_KEY = '@categories';

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCategory: (categoryLabel: string) => void;
}

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

const CategoryModal: React.FC<CategoryModalProps> = ({ visible, onClose, onSelectCategory }) => {
  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [createCategoryModalVisible, setCreateCategoryModalVisible] = useState(false);
  const [editCategoryModalVisible, setEditCategoryModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<IoniconsName>('home-outline');

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
    }
  };

  const handleCategorySelect = (categoryLabel: string) => {
    onSelectCategory(categoryLabel);
    onClose();
  };

  const filteredCategories = localCategories.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCategory = () => {
    if (newCategoryTitle.trim() !== '') {
      const newCategory: Category = {
        id: Date.now(),
        label: newCategoryTitle,
        icon: selectedIcon,
      };
      const updatedCategories = [...localCategories, newCategory];
      setLocalCategories(updatedCategories);
      saveCategories(updatedCategories);
      setCreateCategoryModalVisible(false);
      setNewCategoryTitle('');
      setSelectedIcon('home-outline');
    } else {
      console.log('Please enter a valid category title.');
    }
  };

  const handleLongPressCategory = (category: Category) => {
    setSelectedCategory(category);
    setNewCategoryTitle(category.label);
    setSelectedIcon(category.icon);
    setEditCategoryModalVisible(true);
  };

  const handleEditCategory = () => {
    if (selectedCategory && newCategoryTitle.trim() !== '') {
      const updatedCategories = localCategories.map((cat) =>
        cat.id === selectedCategory.id ? { ...cat, label: newCategoryTitle, icon: selectedIcon } : cat
      );
      setLocalCategories(updatedCategories);
      saveCategories(updatedCategories);
      setEditCategoryModalVisible(false);
      setSelectedCategory(null);
      setNewCategoryTitle('');
      setSelectedIcon('home-outline');
    } else {
      console.log('Please enter a valid category title.');
    }
  };

  const handleDeleteCategory = () => {
    if (selectedCategory) {
      const updatedCategories = localCategories.filter((cat) => cat.id !== selectedCategory.id);
      setLocalCategories(updatedCategories);
      saveCategories(updatedCategories);
      setEditCategoryModalVisible(false);
      setSelectedCategory(null);
      setNewCategoryTitle('');
      setSelectedIcon('home-outline');
    }
  };

  if (isLoading) {
    return (
      <Modal visible={visible} transparent={true} animationType="slide">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </Modal>
    );
  }

  return (
    <>
      {/* Modal for Category Selection */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-outline" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>CATEGORIES</Text>
          <TouchableOpacity onPress={() => setCreateCategoryModalVisible(true)}>
            <Text style={styles.modalNewText}>+ New</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.searchBar}
          placeholder="Search"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FlatList
          data={filteredCategories}
          numColumns={3}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => handleCategorySelect(item.label)}
              onLongPress={() => handleLongPressCategory(item)}
            >
              <Ionicons name={item.icon} size={24} color="#666" />
              <Text style={styles.categoryLabel}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </Modal>

      {/* Modal for Creating New Category */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={createCategoryModalVisible}
        onRequestClose={() => setCreateCategoryModalVisible(false)}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setCreateCategoryModalVisible(false)}>
            <Ionicons name="close-outline" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>CREATE NEW CATEGORY</Text>
        </View>

        <TextInput
          style={styles.searchBar}
          placeholder="Category Title"
          value={newCategoryTitle}
          onChangeText={setNewCategoryTitle}
        />

        <Text style={styles.modalTitle}>Select an Icon</Text>
        <FlatList
          data={iconOptions}
          numColumns={4}
          keyExtractor={(item) => item.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.iconItem,
                selectedIcon === item && styles.selectedIconItem,
              ]}
              onPress={() => setSelectedIcon(item)}
            >
              <Ionicons name={item} size={32} color="#666" />
            </TouchableOpacity>
          )}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleCreateCategory}
          >
            <Text style={styles.buttonText}>Save Category</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modal for Editing/Deleting Category */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={editCategoryModalVisible}
        onRequestClose={() => setEditCategoryModalVisible(false)}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setEditCategoryModalVisible(false)}>
            <Ionicons name="close-outline" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>EDIT CATEGORY</Text>
        </View>

        <TextInput
          style={styles.searchBar}
          placeholder="Category Title"
          value={newCategoryTitle}
          onChangeText={setNewCategoryTitle}
        />

        <Text style={styles.modalTitle}>Select an Icon</Text>
        <FlatList
          data={iconOptions}
          numColumns={4}
          keyExtractor={(item) => item.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.iconItem,
                selectedIcon === item && styles.selectedIconItem,
              ]}
              onPress={() => setSelectedIcon(item)}
            >
              <Ionicons name={item} size={32} color="#666" />
            </TouchableOpacity>
          )}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleEditCategory}
          >
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() =>
              Alert.alert('Delete Category', 'Are you sure you want to delete this category?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: handleDeleteCategory },
              ])
            }
          >
            <Text style={styles.buttonText}>Delete Category</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Styles for the modals
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalNewText: {
    color: '#007BFF',
    fontSize: 16,
  },
  searchBar: {
    padding: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    margin: 16,
    fontSize: 16,
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    width: '33%',
  },
  categoryLabel: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  iconItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    width: '25%',
  },
  selectedIconItem: {
    backgroundColor: '#D3D3D3',
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    paddingHorizontal: 16,
  },
  button: {
    flex: 1,
    padding: 16,
    marginHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CategoryModal;
