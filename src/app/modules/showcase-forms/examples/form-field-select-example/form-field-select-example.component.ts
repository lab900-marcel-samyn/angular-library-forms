import { Component } from '@angular/core';
import { EditType, Lab900FormConfig, ValueLabel } from '@lab900/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const mockBankList: any[] = Array.from({ length: 1000 }).map((_, i) => ({
  id: String(i),
  name: `Bank ${i}`,
}));

@Component({
  selector: 'lab900-form-field-select-example',
  template: '<lab900-form [schema]="formSchema"></lab900-form>',
})
export class FormFieldSelectExampleComponent {
  public formSchema: Lab900FormConfig = {
    fields: [
      {
        attribute: '',
        editType: EditType.Row,
        nestedFields: [
          {
            attribute: 'somePropName',
            title: 'Select yes or no',
            editType: EditType.Select,
            options: {
              selectOptions: (filters) => this.get(filters),
              colspan: 6,
              required: (data) => {
                return data?.secondPropName;
              },
              search: {
                enabled: true,
                placeholder: 'Search all options',
              },
              paging: {
                enabled: true,
                size: 15,
              },
            },
          },
          {
            attribute: 'secondPropName',
            title: 'Select yes or no',
            editType: EditType.Select,
            options: {
              selectOptions: {
                options: [
                  {
                    value: true,
                    label: 'yes',
                  },
                  {
                    value: false,
                    label: 'no',
                  },
                ],
              },
              colspan: 6,
            },
          },
        ],
      },
    ],
  };

  constructor(private http: HttpClient) {}

  public get({ page = 0, size = 5 }): Observable<{ options: ValueLabel[]; total: number }> {
    return this.http.get<any[]>('https://restcountries.eu/rest/v2/all', { params: { page, size } as any }).pipe(
      map((res) => res.map((r) => ({ value: r, label: r.name }))),
      map((res) => {
        return { options: res.slice(page * size, page * size + size), total: res?.length };
      }),
    );
  }
}
