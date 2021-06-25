import { EditType } from '../../../models/editType';
import { FormFieldBase, FormFieldBaseOptions, ValueLabel } from '../../../models/form-field-base';
import { Observable } from 'rxjs';

export type SelectOptionsFilter = { page?: number; size?: number; query?: string };
export type SelectOptionsResponse = { options: ValueLabel[]; total?: number };

export type SelectOptions =
  | ((filter?: SelectOptionsFilter) => SelectOptionsResponse | Observable<SelectOptionsResponse>)
  | SelectOptionsResponse
  | Observable<SelectOptionsResponse>;

export interface FormFieldSelectOptions extends FormFieldBaseOptions {
  multiple?: boolean;
  compareWith?: (o1: any, o2: any) => boolean;
  displayOptionFn?: (option: ValueLabel) => string;
  selectOptions?: SelectOptions;
  paging?: {
    enabled: boolean;
    size: number;
  };
  search?: {
    enabled: boolean;
    placeholder: string;
  };
}

export interface FormFieldSelect<T extends string | number = string> extends FormFieldBase<T, FormFieldSelectOptions> {
  editType: EditType.Select;
}
