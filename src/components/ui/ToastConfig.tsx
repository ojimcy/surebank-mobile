/**
 * Custom Toast Configuration for SureBank
 */

import React from 'react';
import { View, Text } from 'react-native';
import { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#10b981',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginTop: 10,
        paddingVertical: 12,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#064e3b',
      }}
      text2Style={{
        fontSize: 14,
        color: '#065f46',
        marginTop: 4,
      }}
      renderLeadingIcon={() => (
        <View style={{ justifyContent: 'center', paddingLeft: 10 }}>
          <Ionicons name="checkmark-circle" size={24} color="#10b981" />
        </View>
      )}
    />
  ),

  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#ef4444',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginTop: 10,
        paddingVertical: 12,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#7f1d1d',
      }}
      text2Style={{
        fontSize: 14,
        color: '#991b1b',
        marginTop: 4,
      }}
      renderLeadingIcon={() => (
        <View style={{ justifyContent: 'center', paddingLeft: 10 }}>
          <Ionicons name="alert-circle" size={24} color="#ef4444" />
        </View>
      )}
    />
  ),

  info: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#0066A1',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginTop: 10,
        paddingVertical: 12,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#1e3a8a',
      }}
      text2Style={{
        fontSize: 14,
        color: '#1e40af',
        marginTop: 4,
      }}
      renderLeadingIcon={() => (
        <View style={{ justifyContent: 'center', paddingLeft: 10 }}>
          <Ionicons name="information-circle" size={24} color="#0066A1" />
        </View>
      )}
    />
  ),
};