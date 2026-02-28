export interface ICountryCode {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

export interface ICountryCodePickerProps {
  onSelect: (country: ICountryCode) => void;
  selectedCode?: string;
}

