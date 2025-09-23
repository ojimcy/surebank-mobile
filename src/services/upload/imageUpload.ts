/**
 * Image Upload Service
 *
 * Handles image selection, compression, and upload to server
 * Used for KYC document uploads and profile pictures
 */

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import apiClient from '@/services/api/client';

export interface ImagePickerOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  base64?: boolean;
  mediaTypes?: ImagePicker.MediaTypeOptions;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  url: string;
  key: string;
  size?: number;
  mimeType?: string;
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  maxSizeInMB?: number;
  compress?: boolean;
}

class ImageUploadService {
  /**
   * Request camera permissions
   */
  async requestCameraPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Request media library permissions
   */
  async requestMediaLibraryPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Pick image from camera
   */
  async pickImageFromCamera(options: ImagePickerOptions = {}): Promise<ImagePicker.ImagePickerResult> {
    const hasPermission = await this.requestCameraPermissions();

    if (!hasPermission) {
      throw new Error('Camera permission not granted');
    }

    return await ImagePicker.launchCameraAsync({
      mediaTypes: options.mediaTypes || ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options.allowsEditing || false,
      aspect: options.aspect || [4, 3],
      quality: options.quality || 0.8,
      base64: options.base64 || false,
    });
  }

  /**
   * Pick image from gallery
   */
  async pickImageFromGallery(options: ImagePickerOptions = {}): Promise<ImagePicker.ImagePickerResult> {
    const hasPermission = await this.requestMediaLibraryPermissions();

    if (!hasPermission) {
      throw new Error('Media library permission not granted');
    }

    return await ImagePicker.launchImageLibraryAsync({
      mediaTypes: options.mediaTypes || ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options.allowsEditing || false,
      aspect: options.aspect || [4, 3],
      quality: options.quality || 0.8,
      base64: options.base64 || false,
    });
  }

  /**
   * Get file size in MB
   */
  async getFileSizeInMB(uri: string): Promise<number> {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if ('size' in fileInfo && fileInfo.size) {
      return fileInfo.size / (1024 * 1024);
    }
    return 0;
  }

  /**
   * Validate image size
   */
  async validateImageSize(uri: string, maxSizeInMB: number = 5): Promise<boolean> {
    const sizeInMB = await this.getFileSizeInMB(uri);
    return sizeInMB <= maxSizeInMB;
  }

  /**
   * Upload image to server
   * This method assumes the backend provides a presigned URL endpoint
   */
  async uploadImage(
    imageUri: string,
    uploadType: 'kyc' | 'profile' | 'document',
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      // Validate image size
      const maxSize = options.maxSizeInMB || 5;
      const isValidSize = await this.validateImageSize(imageUri, maxSize);

      if (!isValidSize) {
        throw new Error(`Image size exceeds ${maxSize}MB limit`);
      }

      // Get presigned URL from backend
      const presignedResponse = await apiClient.post<{
        url: string;
        key: string;
        fields?: Record<string, string>;
      }>('/upload/presigned-url', {
        type: uploadType,
        contentType: 'image/jpeg', // Default to JPEG
      });

      const { url: uploadUrl, key, fields } = presignedResponse.data;

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create form data
      const formData = new FormData();

      // Add any additional fields from presigned URL
      if (fields) {
        Object.entries(fields).forEach(([fieldKey, value]) => {
          formData.append(fieldKey, value);
        });
      }

      // Add the file
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any);

      // Upload to S3 or storage service
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      // Return the result
      return {
        url: `${uploadUrl}/${key}`,
        key,
      };
    } catch (error: any) {
      console.error('Image upload error:', error);
      throw new Error(error.message || 'Failed to upload image');
    }
  }

  /**
   * Upload image with base64 fallback
   * This method uploads the image as base64 if presigned URL is not available
   */
  async uploadImageWithBase64Fallback(
    imageUri: string,
    uploadType: 'kyc' | 'profile' | 'document'
  ): Promise<string> {
    try {
      // Try presigned URL upload first
      const result = await this.uploadImage(imageUri, uploadType);
      return result.url;
    } catch (error) {
      console.log('Presigned URL upload failed, trying base64 upload');

      // Fallback to base64 upload
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await apiClient.post<{ url: string }>('/upload/base64', {
        image: `data:image/jpeg;base64,${base64}`,
        type: uploadType,
      });

      return response.data.url;
    }
  }

  /**
   * Show image picker modal with camera/gallery options
   */
  async showImagePicker(options: ImagePickerOptions = {}): Promise<ImagePicker.ImagePickerResult | null> {
    return new Promise((resolve) => {
      // In React Native, we'll need to show an ActionSheet or Modal
      // For now, defaulting to gallery
      this.pickImageFromGallery(options)
        .then(resolve)
        .catch(() => resolve(null));
    });
  }
}

export default new ImageUploadService();