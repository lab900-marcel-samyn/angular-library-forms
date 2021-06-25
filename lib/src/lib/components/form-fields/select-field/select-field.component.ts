import { Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { FormComponent } from '../../AbstractFormComponent';
import { TranslateService } from '@ngx-translate/core';
import { isObservable, Observable, of, Subject } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { IFieldConditions } from '../../../models/IFieldConditions';
import { FormFieldSelect, SelectOptions } from './field-select.model';
import { ValueLabel } from '../../../models/form-field-base';
import { Lab900SelectDataSourceDirective } from './lab900-select-data-source.directive';

@Component({
  selector: 'lab900-select-field',
  templateUrl: './select-field.component.html',
})
export class SelectFieldComponent extends FormComponent<FormFieldSelect> implements OnInit {
  private conditionalChange = new Subject();

  @HostBinding('class')
  public classList = 'lab900-form-field';

  @ViewChild(Lab900SelectDataSourceDirective)
  public dataSource: Lab900SelectDataSourceDirective;

  public selectData!: SelectOptions;

  public selectOptselectOptionsions: ValueLabel[];

  public loading = true;

  public searchValue: string;

  public searching = false;

  /*public get selectedOption(): any {
    if (this.selectOptions && this.fieldControl.value) {
      return this.selectOptions.find((opt) =>
        this.options?.compareWith
          ? this.options?.compareWith(opt.value, this.fieldControl.value)
          : this.defaultCompare(opt.value, this.fieldControl.value),
      );
    }
    return null;
  }*/

  public constructor(translateService: TranslateService) {
    super(translateService);
    this.addSubscription(
      this.conditionalChange.pipe(switchMap(({ condition, value }) => this.getConditionalOptions(condition, value))),
      (options: ValueLabel[]) => {
        this.loading = false;
      },
    );
  }

  public ngOnInit(): void {
    if (this.options?.selectOptions) {
      this.selectData = this.options?.selectOptions;
    }
  }

  public defaultCompare = (o1: any, o2: any) => o1 === o2;

  public trackByFn(_index: number, value: ValueLabel): string {
    return value?.label;
  }

  public onConditionalChange(dependOn: string, value: string, firstRun: boolean): void {
    setTimeout(() => {
      const condition = this.schema.conditions.find((c) => c.dependOn === dependOn);
      if (condition?.conditionalOptions) {
        if (!firstRun || !value) {
          this.fieldControl.reset();
        }
        this.conditionalChange.next({ condition, value });
      }
    });
  }

  private getConditionalOptions(condition: IFieldConditions, value: any): Observable<ValueLabel[]> {
    this.loading = true;
    const values = condition?.conditionalOptions(value, this.fieldControl);
    return (isObservable(values) ? values : of(values)).pipe(catchError(() => of([])));
  }
}
