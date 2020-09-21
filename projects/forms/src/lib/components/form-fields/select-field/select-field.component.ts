import { Component, OnInit, HostBinding } from '@angular/core';
import { FormComponent } from '../../../models/IFormComponent';
import { SelectFieldOptions } from '../../../models/FormField';
import { map } from 'rxjs/operators';

@Component({
  selector: 'lab900-select-field',
  templateUrl: './select-field.component.html',
})
export class SelectFieldComponent extends FormComponent<SelectFieldOptions> implements OnInit {
  @HostBinding('class')
  public classList = 'lab900-form-field';

  public values: { value: any; label: string }[];

  public ngOnInit(): void {
    this.values = (this.options && this.options.values) || [];
    if (this.options.valuesFn) {
      this.loadValues();
    }
  }

  public loadValues() {
    this.options.valuesFn().pipe(map((value) => (this.values = value)));
  }
}
