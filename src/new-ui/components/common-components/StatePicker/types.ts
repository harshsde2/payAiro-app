export interface IStatePickerProps {
  label?: string;
  /** 2-letter USPS code, e.g. "WA". */
  value?: string;
  onSelect: (code: string) => void;
  placeholder?: string;
  /** Renders the field with an error border. */
  hasError?: boolean;
  disabled?: boolean;
}
