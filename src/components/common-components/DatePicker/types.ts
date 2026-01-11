export interface IDatePickerProps {
  modal?: boolean;
  mode?: 'date' | 'time' | 'datetime';
  open?: boolean;
  date?: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  onConfirm?: (date: Date) => void;
  onCancel?: () => void;
  title?: string;
  confirmText?: string;
  cancelText?: string;
}
