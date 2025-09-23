/**
 * SureBank Dropdown/Select Component
 *
 * A professional dropdown selector with modal interface,
 * search functionality, and support for icons and descriptions.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  ViewStyle,
  TextStyle,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface DropdownOption {
  label: string;
  value: string | number;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
}

export interface DropdownProps {
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  containerStyle?: ViewStyle;
  dropdownStyle?: TextStyle;
  disabled?: boolean;

  // Options and selection
  options: DropdownOption[];
  value?: string | number;
  onValueChange?: (value: string | number, option: DropdownOption) => void;

  // Search functionality
  searchable?: boolean;
  searchPlaceholder?: string;
  noResultsText?: string;

  // Display options
  showIcons?: boolean;
  showDescriptions?: boolean;
  maxHeight?: number;

  // Validation
  required?: boolean;

  // Icons
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  placeholder = 'Select an option',
  helperText,
  errorText,
  containerStyle,
  dropdownStyle,
  disabled = false,
  options = [],
  value,
  onValueChange,
  searchable = true,
  searchPlaceholder = 'Search options...',
  noResultsText = 'No options found',
  showIcons = true,
  showDescriptions = true,
  maxHeight = 400,
  required = false,
  leftIcon,
  rightIcon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<DropdownOption[]>(options);

  // Get selected option
  const selectedOption = options.find(option => option.value === value);

  // Filter options based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchQuery, options]);

  const handleSelect = (option: DropdownOption) => {
    if (option.disabled) return;

    onValueChange?.(option.value, option);
    setIsOpen(false);
    setSearchQuery('');
  };

  const openDropdown = () => {
    if (!disabled) {
      setIsOpen(true);
      setSearchQuery('');
    }
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setSearchQuery('');
  };

  const borderColor = errorText
    ? '#ef4444'
    : isOpen
      ? '#0066A1'
      : '#d1d5db';

  const iconColor = errorText
    ? '#ef4444'
    : isOpen
      ? '#0066A1'
      : '#6b7280';

  const renderOption = ({ item }: { item: DropdownOption }) => (
    <TouchableOpacity
      onPress={() => handleSelect(item)}
      disabled={item.disabled}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: item.disabled ? '#f9fafb' : '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        opacity: item.disabled ? 0.5 : 1,
      }}
    >
      {/* Option Icon */}
      {showIcons && item.icon && (
        <View style={{ marginRight: 12 }}>
          <Ionicons
            name={item.icon}
            size={20}
            color={item.disabled ? '#9ca3af' : '#6b7280'}
          />
        </View>
      )}

      {/* Option Content */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            color: item.disabled ? '#9ca3af' : '#111827',
            fontWeight: '500',
          }}
        >
          {item.label}
        </Text>
        {showDescriptions && item.description && (
          <Text
            style={{
              fontSize: 12,
              color: item.disabled ? '#d1d5db' : '#6b7280',
              marginTop: 2,
            }}
          >
            {item.description}
          </Text>
        )}
      </View>

      {/* Selected indicator */}
      {value === item.value && (
        <Ionicons name="checkmark" size={20} color="#0066A1" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={containerStyle}>
      {label && (
        <Text
          style={{
            color: '#374151',
            fontSize: 14,
            fontWeight: '500',
            marginBottom: 4,
          }}
        >
          {label}
          {required && <Text style={{ color: '#ef4444' }}>*</Text>}
        </Text>
      )}

      <TouchableOpacity
        onPress={openDropdown}
        disabled={disabled}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            backgroundColor: disabled ? '#f3f4f6' : '#ffffff',
            minHeight: 44,
          },
          dropdownStyle,
        ]}
      >
        {/* Left Icon */}
        {leftIcon && (
          <View style={{ marginRight: 8 }}>
            <Ionicons name={leftIcon} size={20} color={iconColor} />
          </View>
        )}

        {/* Selected Option Icon */}
        {showIcons && selectedOption?.icon && (
          <View style={{ marginRight: 8 }}>
            <Ionicons
              name={selectedOption.icon}
              size={20}
              color="#6b7280"
            />
          </View>
        )}

        {/* Selected Text */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              color: selectedOption ? '#111827' : '#64748b',
            }}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
          {showDescriptions && selectedOption?.description && (
            <Text
              style={{
                fontSize: 12,
                color: '#6b7280',
                marginTop: 1,
              }}
            >
              {selectedOption.description}
            </Text>
          )}
        </View>

        {/* Right Icon */}
        <View style={{ marginLeft: 8 }}>
          <Ionicons
            name={rightIcon || (isOpen ? 'chevron-up' : 'chevron-down')}
            size={20}
            color={iconColor}
          />
        </View>
      </TouchableOpacity>

      {(helperText || errorText) && (
        <Text
          style={{
            color: errorText ? '#ef4444' : '#6b7280',
            fontSize: 12,
            marginTop: 4,
          }}
        >
          {errorText || helperText}
        </Text>
      )}

      {/* Dropdown Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={closeDropdown}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: '#ffffff',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: maxHeight + 120, // Extra space for header and search
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#f3f4f6',
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#111827',
                }}
              >
                {label || 'Select Option'}
              </Text>
              <TouchableOpacity
                onPress={closeDropdown}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: '#f3f4f6',
                }}
              >
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            {searchable && (
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: '#f3f4f6',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: '#f9fafb',
                  }}
                >
                  <Ionicons
                    name="search"
                    size={20}
                    color="#6b7280"
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: '#111827',
                      padding: 0,
                    }}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={searchPlaceholder}
                    placeholderTextColor="#64748b"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearchQuery('')}
                      style={{ marginLeft: 8 }}
                    >
                      <Ionicons name="close-circle" size={20} color="#6b7280" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Options List */}
            <View style={{ maxHeight: maxHeight }}>
              {filteredOptions.length > 0 ? (
                <FlatList
                  data={filteredOptions}
                  keyExtractor={(item) => String(item.value)}
                  renderItem={renderOption}
                  showsVerticalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled"
                />
              ) : (
                <View
                  style={{
                    paddingVertical: 40,
                    paddingHorizontal: 16,
                    alignItems: 'center',
                  }}
                >
                  <Ionicons
                    name="search"
                    size={48}
                    color="#d1d5db"
                    style={{ marginBottom: 12 }}
                  />
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#6b7280',
                      textAlign: 'center',
                    }}
                  >
                    {noResultsText}
                  </Text>
                  {searchQuery && (
                    <TouchableOpacity
                      onPress={() => setSearchQuery('')}
                      style={{
                        marginTop: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        backgroundColor: '#0066A1',
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ color: '#ffffff', fontSize: 14 }}>
                        Clear Search
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Dropdown;