/**
 * SelectAccountTypeModal Component
 *
 * Modal for selecting account type when creating a new account
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AccountType, ACCOUNT_TYPE_DISPLAY } from '@/services/api/accounts';

interface SelectAccountTypeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (accountType: AccountType) => void;
  isLoading?: boolean;
  preselectedType?: AccountType | null;
}

interface AccountTypeOption {
  id: AccountType;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const accountTypeOptions: AccountTypeOption[] = [
  {
    id: 'ds',
    name: ACCOUNT_TYPE_DISPLAY.ds,
    description: 'Save regularly with flexible daily, weekly, or monthly deposits',
    icon: 'calendar-outline',
    color: '#0066A1',
  },
  {
    id: 'sb',
    name: ACCOUNT_TYPE_DISPLAY.sb,
    description: 'Save towards specific goals with SureBank packages',
    icon: 'flag-outline',
    color: '#7952B3',
  },
  {
    id: 'ibs',
    name: ACCOUNT_TYPE_DISPLAY.ibs,
    description: 'Earn competitive interest rates on your locked savings',
    icon: 'trending-up-outline',
    color: '#28A745',
  },
];

export function SelectAccountTypeModal({
  visible,
  onClose,
  onSelect,
  isLoading = false,
  preselectedType = null,
}: SelectAccountTypeModalProps) {
  const [selectedType, setSelectedType] = useState<AccountType | null>(preselectedType);

  const handleSelect = (type: AccountType) => {
    if (isLoading) return;
    setSelectedType(type);
  };

  const handleConfirm = () => {
    if (selectedType) {
      onSelect(selectedType);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl max-h-[90%]">
          {/* Header */}
          <View className="bg-gradient-to-r from-[#0066A1] to-[#0088CC] px-6 py-6 rounded-t-3xl">
            <View className="flex-row justify-between items-start">
              <View className="flex-1 mr-4">
                <Text className="text-2xl font-semibold text-white mb-2">
                  Select Account Type
                </Text>
                <Text className="text-white/80 text-sm">
                  Choose the type of account you want to create. You can have multiple
                  accounts of different types.
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="p-1"
                disabled={isLoading}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
            <View className="space-y-4 mb-6">
              {accountTypeOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => handleSelect(option.id)}
                  disabled={isLoading}
                  className={`flex-row items-center p-4 border-2 rounded-xl ${
                    selectedType === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  } ${isLoading ? 'opacity-50' : ''}`}
                  activeOpacity={0.7}
                >
                  <View
                    className={`w-12 h-12 rounded-full items-center justify-center mr-4`}
                    style={{
                      backgroundColor:
                        selectedType === option.id ? option.color : '#F3F4F6',
                    }}
                  >
                    <Ionicons
                      name={option.icon}
                      size={24}
                      color={selectedType === option.id ? 'white' : '#6B7280'}
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="font-medium text-gray-800 text-base mb-1">
                      {option.name}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {option.description}
                    </Text>
                  </View>

                  {selectedType === option.id && (
                    <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center">
                      <Ionicons name="checkmark" size={16} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Action Buttons */}
            <View className="flex-row justify-between pt-4 border-t border-gray-200">
              <TouchableOpacity
                onPress={onClose}
                disabled={isLoading}
                className="px-6 py-3"
              >
                <Text className="text-gray-600 font-medium">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirm}
                disabled={isLoading || !selectedType}
                className={`px-6 py-3 rounded-lg flex-row items-center ${
                  !selectedType || isLoading
                    ? 'bg-gray-300'
                    : 'bg-[#0066A1]'
                }`}
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-medium ml-2">Creating...</Text>
                  </>
                ) : (
                  <Text className="text-white font-medium">Create Account</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}