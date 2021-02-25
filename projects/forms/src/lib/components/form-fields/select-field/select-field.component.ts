import { Component, HostBinding, OnInit } from '@angular/core';
import { FormComponent } from '../../../models/IFormComponent';
import { SelectFieldOptions, ValueLabel } from '../../../models/FormField';
import { TranslateService } from '@ngx-translate/core';
import { isObservable, Observable, of, Subject } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { IFieldConditions } from '../../../models/IFieldConditions';

@Component({
  selector: 'lab900-select-field',
  templateUrl: './select-field.component.html',
})
export class SelectFieldComponent extends FormComponent<SelectFieldOptions> implements OnInit {
  private conditionalChange = new Subject();

  @HostBinding('class')
  public classList = 'lab900-form-field';

  public selectOptions: ValueLabel[];

  public loading = true;

  public get selectedOption(): any {
    if (this.selectOptions && this.fieldControl.value) {
      return this.selectOptions.find((opt) =>
        this.options?.compareWith
          ? this.options?.compareWith(opt.value, this.fieldControl.value)
          : this.defaultCompare(opt.value, this.fieldControl.value),
      );
    }
    return null;
  }

  public constructor(translateService: TranslateService) {
    super(translateService);
    this.subs.push(
      this.conditionalChange
        .pipe(switchMap(({ condition, value }) => this.getConditionalOptions(condition, value)))
        .subscribe((options: ValueLabel[]) => {
          this.selectOptions = options;
          this.loading = false;
        }),
    );
  }

  public defaultCompare = (o1: any, o2: any) => o1 === o2;

  public ngOnInit(): void {
    if (this.options?.selectOptions) {
      const selectOptions = this.options?.selectOptions;
      const values = typeof selectOptions === 'function' ? selectOptions() : selectOptions;
      this.subs.push(
        (isObservable(values) ? values : of(values)).pipe(catchError(() => of([]))).subscribe((options: ValueLabel[]) => {
          this.selectOptions = options;
          this.loading = false;
        }),
      );
    } else {
      this.selectOptions = [];
      this.loading = false;
    }
  }

  public onConditionalChange(dependOn: string, value: string, firstRun: boolean): void {
    setTimeout(() => {
      const condition = this.schema.conditions.find((c) => c.dependOn === dependOn);
      if (condition?.conditionalOptions) {
        if (!firstRun || !value) {
          this.fieldControl.reset();
        }
        this.conditionalChange.next({ condition, value });
      } else {
        this.selectOptions = [];
      }
    });
  }

  private getConditionalOptions(condition: IFieldConditions, value: any): Observable<ValueLabel[]> {
    this.selectOptions = [];
    this.loading = true;
    const values = condition?.conditionalOptions(value, this.fieldControl);
    return (isObservable(values) ? values : of(values)).pipe(catchError(() => of([])));
  }
}
