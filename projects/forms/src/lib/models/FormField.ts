import { EditType } from './editType';
import { AngularEditorConfig } from '@kolkov/angular-editor';

export interface FieldOptions {
  hide?: boolean;
  hint?: string;
  required?: boolean;
}

export interface WysiwygFieldOptions extends FieldOptions {
  editorConfig?: AngularEditorConfig;
}
export interface SelectFieldOptions extends FieldOptions {
  multiple?: boolean;
  values?: { key: string; value: string }[];
  valuesFn?: () => Promise<{ key: string; value: string }[]>;
}

export interface FormField {
  title: string;
  attribute: string;
  editType: EditType;
  options?: SelectFieldOptions | WysiwygFieldOptions | FieldOptions;
}
