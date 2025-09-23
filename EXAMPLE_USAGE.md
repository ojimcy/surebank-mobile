# DateInput and Dropdown Components Usage Examples

This document provides usage examples for the new DateInput and Dropdown components created for the SureBank KYC verification flow.

## DateInput Component

### Basic Usage

```tsx
import { DateInput } from '@/components/forms';

const KYCForm = () => {
  const [birthDate, setBirthDate] = useState<Date | null>(null);

  return (
    <DateInput
      label="Date of Birth"
      placeholder="DD/MM/YYYY"
      value={birthDate}
      onDateChange={setBirthDate}
      required
      validateAge={18} // Must be at least 18 years old
      helperText="You must be at least 18 years old to register"
    />
  );
};
```

### Advanced Usage with Validation

```tsx
import { DateInput } from '@/components/forms';

const DocumentForm = () => {
  const [issueDate, setIssueDate] = useState<Date | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);

  const today = new Date();
  const minIssueDate = new Date();
  minIssueDate.setFullYear(today.getFullYear() - 10); // Max 10 years old

  const minExpiryDate = new Date();
  minExpiryDate.setDate(today.getDate() + 1); // Must expire tomorrow or later

  return (
    <>
      <DateInput
        label="Document Issue Date"
        value={issueDate}
        onDateChange={setIssueDate}
        minDate={minIssueDate}
        maxDate={today}
        required
        helperText="When was your document issued?"
      />

      <DateInput
        label="Document Expiry Date"
        value={expiryDate}
        onDateChange={setExpiryDate}
        minDate={minExpiryDate}
        required
        helperText="Document must be valid for at least 6 months"
      />
    </>
  );
};
```

## Dropdown Component

### Basic Usage

```tsx
import { Dropdown, DropdownOption } from '@/components/forms';

const countryOptions: DropdownOption[] = [
  { label: 'Nigeria', value: 'NG', icon: 'flag-outline' },
  { label: 'Ghana', value: 'GH', icon: 'flag-outline' },
  { label: 'Kenya', value: 'KE', icon: 'flag-outline' },
  { label: 'South Africa', value: 'ZA', icon: 'flag-outline' },
];

const PersonalInfoForm = () => {
  const [country, setCountry] = useState<string>('');

  return (
    <Dropdown
      label="Country of Residence"
      placeholder="Select your country"
      options={countryOptions}
      value={country}
      onValueChange={(value) => setCountry(value as string)}
      required
      searchable
      showIcons
    />
  );
};
```

### Advanced Usage with Descriptions and Search

```tsx
import { Dropdown, DropdownOption } from '@/components/forms';

const occupationOptions: DropdownOption[] = [
  {
    label: 'Software Engineer',
    value: 'software_engineer',
    description: 'Computer programming and software development',
    icon: 'code-outline'
  },
  {
    label: 'Doctor',
    value: 'doctor',
    description: 'Medical practitioner and healthcare provider',
    icon: 'medical-outline'
  },
  {
    label: 'Teacher',
    value: 'teacher',
    description: 'Education and instruction professional',
    icon: 'school-outline'
  },
  {
    label: 'Banker',
    value: 'banker',
    description: 'Financial services professional',
    icon: 'card-outline'
  },
  {
    label: 'Entrepreneur',
    value: 'entrepreneur',
    description: 'Business owner and startup founder',
    icon: 'business-outline'
  },
];

const KYCOccupationForm = () => {
  const [occupation, setOccupation] = useState<string>('');

  return (
    <Dropdown
      label="Occupation"
      placeholder="Search and select your occupation"
      options={occupationOptions}
      value={occupation}
      onValueChange={(value, option) => {
        setOccupation(value as string);
        console.log('Selected:', option);
      }}
      required
      searchable
      searchPlaceholder="Type to search occupations..."
      showIcons
      showDescriptions
      leftIcon="briefcase-outline"
      helperText="Select the option that best describes your primary occupation"
    />
  );
};
```

### Usage with Dynamic Options

```tsx
import { Dropdown, DropdownOption } from '@/components/forms';

const StateForm = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [stateOptions, setStateOptions] = useState<DropdownOption[]>([]);

  // Mock function to get states by country
  const getStatesByCountry = (countryCode: string): DropdownOption[] => {
    const statesMap: Record<string, DropdownOption[]> = {
      'NG': [
        { label: 'Lagos', value: 'LA', description: 'Commercial capital' },
        { label: 'Abuja', value: 'AB', description: 'Federal capital territory' },
        { label: 'Kano', value: 'KN', description: 'Northern commercial hub' },
        { label: 'Rivers', value: 'RI', description: 'Oil and gas hub' },
      ],
      'GH': [
        { label: 'Greater Accra', value: 'GA', description: 'Capital region' },
        { label: 'Ashanti', value: 'AS', description: 'Cultural heartland' },
        { label: 'Northern', value: 'NO', description: 'Northern region' },
      ],
    };
    return statesMap[countryCode] || [];
  };

  useEffect(() => {
    if (selectedCountry) {
      setStateOptions(getStatesByCountry(selectedCountry));
      setSelectedState(''); // Reset state selection
    }
  }, [selectedCountry]);

  return (
    <>
      <Dropdown
        label="Country"
        placeholder="Select country"
        options={countryOptions}
        value={selectedCountry}
        onValueChange={(value) => setSelectedCountry(value as string)}
        required
      />

      <Dropdown
        label="State/Region"
        placeholder="Select state"
        options={stateOptions}
        value={selectedState}
        onValueChange={(value) => setSelectedState(value as string)}
        required
        disabled={!selectedCountry}
        searchable
        showDescriptions
        helperText={!selectedCountry ? 'Please select a country first' : 'Select your state or region'}
      />
    </>
  );
};
```

## Features

### DateInput Features
- ✅ Automatic date formatting (DD/MM/YYYY)
- ✅ Date picker modal with quick select options
- ✅ Manual typing with real-time formatting
- ✅ Date validation and range checking
- ✅ Age validation for KYC compliance
- ✅ Accessibility support
- ✅ Error handling and validation messages
- ✅ TypeScript support

### Dropdown Features
- ✅ Modal-based selection interface
- ✅ Search functionality for long lists
- ✅ Icons and descriptions support
- ✅ Keyboard navigation
- ✅ Option grouping and disabled states
- ✅ Dynamic option loading
- ✅ Accessibility support
- ✅ TypeScript support
- ✅ Customizable styling

## Design Consistency

Both components follow the SureBank design system:
- Primary color: #0066A1
- Consistent border radius (8px)
- Proper spacing and typography
- Error states with red (#ef4444)
- Accessibility considerations
- Mobile-optimized touch targets
- iOS and Android compatibility