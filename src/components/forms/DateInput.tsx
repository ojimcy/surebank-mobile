/**
 * SureBank DateInput Component
 *
 * A professional date input component with automatic formatting,
 * date picker modal, and validation for KYC forms.
 */

import React, { forwardRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  Modal,
  ViewStyle,
  TextStyle,
  Platform,
  Button,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, parse, isValid, isAfter, isBefore } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';

export interface DateInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  disabled?: boolean;

  // Date specific props
  value?: Date | string;
  onDateChange?: (date: Date | null) => void;
  dateFormat?: string;
  minDate?: Date;
  maxDate?: Date;
  showDatePicker?: boolean;

  // Validation
  required?: boolean;
  validateAge?: number; // Minimum age in years
}

const DateInput = forwardRef<TextInput, DateInputProps>(function DateInput(
  {
    label,
    placeholder = 'DD/MM/YYYY',
    helperText,
    errorText,
    containerStyle,
    inputStyle,
    disabled = false,
    value,
    onDateChange,
    dateFormat = 'dd/MM/yyyy',
    minDate,
    maxDate,
    showDatePicker = true,
    required = false,
    validateAge,
    onFocus,
    onBlur,
    ...textInputProps
  },
  ref
) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [displayValue, setDisplayValue] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);

  // Initialize display value and selected date
  useEffect(() => {
    if (value) {
      const date = value instanceof Date ? value : new Date(value);
      if (isValid(date)) {
        setSelectedDate(date);
        setDisplayValue(format(date, dateFormat));
      }
    } else {
      setSelectedDate(null);
      setDisplayValue('');
    }
  }, [value, dateFormat]);

  // Format input as user types
  const formatDateInput = (text: string): string => {
    // Remove all non-numeric characters
    const cleanText = text.replace(/\D/g, '');

    // Add separators based on length
    if (cleanText.length <= 2) {
      return cleanText;
    } else if (cleanText.length <= 4) {
      return `${cleanText.slice(0, 2)}/${cleanText.slice(2)}`;
    } else {
      return `${cleanText.slice(0, 2)}/${cleanText.slice(2, 4)}/${cleanText.slice(4, 8)}`;
    }
  };

  // Validate date
  const validateDate = (dateStr: string): string | null => {
    if (!dateStr && required) {
      return 'Date is required';
    }

    if (!dateStr) return null;

    // Check if format is complete
    if (dateStr.length !== 10) {
      return 'Please enter a complete date (DD/MM/YYYY)';
    }

    // Parse date
    const parsedDate = parse(dateStr, dateFormat, new Date());

    if (!isValid(parsedDate)) {
      return 'Please enter a valid date';
    }

    // Check min/max dates
    if (minDate && isBefore(parsedDate, minDate)) {
      return `Date must be after ${format(minDate, dateFormat)}`;
    }

    if (maxDate && isAfter(parsedDate, maxDate)) {
      return `Date must be before ${format(maxDate, dateFormat)}`;
    }

    // Check age if specified
    if (validateAge) {
      const today = new Date();
      const ageInYears = today.getFullYear() - parsedDate.getFullYear();
      const monthDiff = today.getMonth() - parsedDate.getMonth();
      const dayDiff = today.getDate() - parsedDate.getDate();

      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)
        ? ageInYears - 1
        : ageInYears;

      if (actualAge < validateAge) {
        return `You must be at least ${validateAge} years old`;
      }
    }

    return null;
  };

  const handleTextChange = (text: string) => {
    const formattedText = formatDateInput(text);
    setDisplayValue(formattedText);

    // Validate and notify parent
    const error = validateDate(formattedText);
    setValidationError(error);

    if (formattedText.length === 10 && !error) {
      const parsedDate = parse(formattedText, dateFormat, new Date());
      if (isValid(parsedDate)) {
        setSelectedDate(parsedDate);
        onDateChange?.(parsedDate);
      }
    } else {
      setSelectedDate(null);
      onDateChange?.(null);
    }
  };

  const handleDatePickerSelect = (date: Date) => {
    setSelectedDate(date);
    setDisplayValue(format(date, dateFormat));
    setIsPickerVisible(false);

    const error = validateDate(format(date, dateFormat));
    setValidationError(error);

    if (!error) {
      onDateChange?.(date);
    }
  };

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);

    // Final validation on blur
    const error = validateDate(displayValue);
    setValidationError(error);

    onBlur?.(e);
  };

  const openDatePicker = () => {
    if (!disabled && showDatePicker) {
      setIsPickerVisible(true);
    }
  };

  const currentError = errorText || validationError;
  const borderColor = currentError
    ? '#ef4444'
    : isFocused
      ? '#0066A1'
      : '#d1d5db';

  const iconColor = currentError
    ? '#ef4444'
    : isFocused
      ? '#0066A1'
      : '#6b7280';

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
        onPress={openDatePicker}
        disabled={disabled || !showDatePicker}
        activeOpacity={showDatePicker ? 0.7 : 1}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            backgroundColor: disabled ? '#f3f4f6' : '#ffffff',
          }}
        >
          <View style={{ marginRight: 8 }}>
            <Ionicons name="calendar-outline" size={20} color={iconColor} />
          </View>

          <TextInput
            ref={ref}
            style={[
              {
                flex: 1,
                fontSize: 16,
                color: '#111827',
                padding: 0,
              },
              inputStyle,
            ]}
            value={displayValue}
            onChangeText={handleTextChange}
            placeholder={placeholder}
            placeholderTextColor="#64748b"
            editable={!disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            keyboardType="numeric"
            maxLength={10}
            {...textInputProps}
          />

          {showDatePicker && (
            <TouchableOpacity
              onPress={openDatePicker}
              disabled={disabled}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="chevron-down" size={20} color={iconColor} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {(helperText || currentError) && (
        <Text
          style={{
            color: currentError ? '#ef4444' : '#6b7280',
            fontSize: 12,
            marginTop: 4,
          }}
        >
          {currentError || helperText}
        </Text>
      )}

      {/* Simple Date Picker Modal */}
      <Modal
        visible={isPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsPickerVisible(false)}
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
              paddingHorizontal: 16,
              paddingVertical: 20,
              maxHeight: '50%',
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#111827',
                }}
              >
                Select Date
              </Text>
              <TouchableOpacity
                onPress={() => setIsPickerVisible(false)}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: '#f3f4f6',
                }}
              >
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Date Input */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: 8,
                }}
              >
                Enter Date (DD/MM/YYYY)
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 16,
                  color: '#111827',
                }}
                value={displayValue}
                onChangeText={handleTextChange}
                placeholder="DD/MM/YYYY"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            {/* Date Picker */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: 8,
                }}
              >
                Select Date
              </Text>

              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={selectedDate || new Date()}
                  mode="date"
                  display="spinner"
                  onChange={(event, date) => {
                    if (date) {
                      setSelectedDate(date);
                      setDisplayValue(format(date, dateFormat));
                    }
                  }}
                  minimumDate={minDate}
                  maximumDate={maxDate}
                  style={{ height: 200 }}
                />
              ) : (
                <View>
                  <TouchableOpacity
                    onPress={() => setShowAndroidPicker(true)}
                    style={{
                      backgroundColor: '#0066A1',
                      paddingVertical: 12,
                      paddingHorizontal: 20,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                      Open Calendar
                    </Text>
                  </TouchableOpacity>
                  {selectedDate && (
                    <Text style={{ marginTop: 10, fontSize: 16, textAlign: 'center' }}>
                      Selected: {format(selectedDate, 'dd/MM/yyyy')}
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Confirm Button */}
            {selectedDate && (
              <TouchableOpacity
                onPress={() => {
                  if (selectedDate) {
                    handleDatePickerSelect(selectedDate);
                  }
                }}
                style={{
                  backgroundColor: '#0066A1',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  Confirm Date
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Android Date Picker */}
      {Platform.OS === 'android' && showAndroidPicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowAndroidPicker(false);
            if (event.type === 'set' && date) {
              handleDatePickerSelect(date);
            }
          }}
          minimumDate={minDate}
          maximumDate={maxDate}
        />
      )}
    </View>
  );
});

export default DateInput;