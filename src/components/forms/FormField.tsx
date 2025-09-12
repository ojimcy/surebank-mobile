/**
 * SureBank Form Field Component
 * 
 * React Hook Form integrated field component with validation,
 * error handling, and professional styling.
 */

import React from 'react';
import { 
  Control, 
  FieldPath, 
  FieldValues, 
  useController,
  RegisterOptions,
} from 'react-hook-form';
import Input, { InputProps } from './Input';
import { ViewStyle } from 'react-native';

export interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<InputProps, 'value' | 'onChangeText' | 'errorText'> {
  // React Hook Form props
  control: Control<TFieldValues>;
  name: TName;
  rules?: RegisterOptions<TFieldValues, TName>;
  
  // Custom validation message
  customErrorMessage?: string;
  
  // Styling
  containerStyle?: ViewStyle;
}

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  rules,
  customErrorMessage,
  containerStyle,
  ...inputProps
}: FormFieldProps<TFieldValues, TName>) {
  const {
    field: { value, onChange, onBlur },
    fieldState: { error, isTouched },
  } = useController({
    name,
    control,
    rules,
  });

  // Only show error if field has been touched or form was submitted
  const showError = error && isTouched;
  const errorMessage = customErrorMessage || error?.message;

  return (
    <Input
      {...inputProps}
      value={value || ''}
      onChangeText={onChange}
      onBlur={onBlur}
      errorText={showError ? errorMessage : undefined}
      containerStyle={containerStyle}
    />
  );
}

export default FormField;