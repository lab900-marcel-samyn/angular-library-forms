import { AfterViewInit, Directive, Inject, Input, OnInit, NgZone, OnDestroy } from '@angular/core';
import { NgControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { catchError, debounceTime, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, fromEvent, isObservable, Observable, of, Subject } from 'rxjs';
import { ValueLabel } from '../../../models/form-field-base';
import { SelectOptions, SelectOptionsResponse } from './field-select.model';

@Directive({
  selector: 'mat-select[Lab900SelectDataSource]',
})
export class Lab900SelectDataSourceDirective implements OnInit, AfterViewInit, OnDestroy {
  private selectFilter$ = new BehaviorSubject<{ page?: number; size?: number; query?: string }>(null);

  public options$ = new BehaviorSubject<ValueLabel[]>([]);

  @Input()
  public selectData!: SelectOptions;

  @Input()
  public loading: boolean;

  @Input()
  public debounceTime = 150;

  @Input()
  public offset = 0;

  @Input()
  public limit = 10;

  @Input()
  public total = 0;

  @Input()
  public threshold = '15%';

  @Input()
  public infiniteScroll: boolean = false;

  private thrPx = 0;
  private thrPc = 0;
  private unsub = new Subject();
  private panel!: Element;
  private singleOptionHeight = 3; // in em
  private abstractControl: NgControl;

  constructor(@Inject(MatSelect) public matSelect: MatSelect, private ngZone: NgZone) {
    if (this.matSelect.ngControl) {
      this.abstractControl = this.matSelect.ngControl;
    } else {
      console.error('Invalid mat select control');
    }
  }

  public ngOnInit() {
    this.initOptions();
    if (this.infiniteScroll) {
      this.evaluateThreshold();
    }
  }

  public ngAfterViewInit() {
    if (this.infiniteScroll) {
      this.matSelect.openedChange.pipe(takeUntil(this.unsub)).subscribe((opened) => {
        if (opened) {
          this.panel = this.matSelect.panel.nativeElement;
          this.singleOptionHeight = this.getSelectItemHeightPx();
          this.registerScrollListener();
        }
      });
    }
  }

  public ngOnDestroy() {
    this.unsub.next();
    this.unsub.complete();
  }

  private evaluateThreshold() {
    if (this.threshold.lastIndexOf('%') > -1) {
      this.thrPx = 0;
      this.thrPc = parseFloat(this.threshold) / 100;
    } else {
      this.thrPx = parseFloat(this.threshold);
      this.thrPc = 0;
    }
  }

  private registerScrollListener() {
    fromEvent(this.panel, 'scroll')
      .pipe(
        takeUntil(this.unsub),
        debounceTime(this.debounceTime),
        tap((event) => {
          this.handleScrollEvent(event);
        }),
      )
      .subscribe();
  }

  private handleScrollEvent(event: any) {
    this.ngZone.runOutsideAngular(() => {
      if (this.loading || this.offset >= this.total) {
        return;
      }
      const countOfRenderedOptions = this.matSelect.options.length;
      const infiniteScrollDistance = this.singleOptionHeight * countOfRenderedOptions;
      const threshold = this.thrPc !== 0 ? infiniteScrollDistance * this.thrPc : this.thrPx;
      const scrolledDistance = this.panel.clientHeight + event.target.scrollTop;
      if (scrolledDistance + threshold >= infiniteScrollDistance) {
        this.ngZone.run(() => this.loadOptions(this.offset + this.limit));
      }
    });
  }

  private getSelectItemHeightPx(): number {
    return parseFloat(getComputedStyle(this.panel).fontSize) * 3;
  }

  private initOptions(): void {
    if (this.selectData) {
      const selectOptions = this.selectData;
      let options$: Observable<SelectOptionsResponse>;

      if (typeof selectOptions === 'function') {
        if (this.infiniteScroll) {
          options$ = this.selectFilter$.pipe(
            filter((f) => !!f),
            switchMap((f) => {
              const res = selectOptions(f);
              return isObservable(res) ? res : of(res);
            }),
          );
        } else {
          const res = selectOptions();
          options$ = isObservable(res) ? res : of(res);
        }
      } else {
        options$ = isObservable(selectOptions) ? selectOptions : of(selectOptions);
      }
      options$.pipe(catchError(() => of({ options: [], total: 0 } as SelectOptionsResponse))).subscribe((res: SelectOptionsResponse) => {
        this.options$.next(this.infiniteScroll ? (this.options$.value ?? []).concat(res?.options) : res?.options);
        this.total = res?.total ?? res?.options?.length;
        this.loading = false;
      });

      if (this.infiniteScroll) {
        this.loadOptions(0);
      }
    } else {
      this.options$.next([]);
      this.total = 0;
      this.loading = false;
    }
  }

  private loadOptions(nextOffset: number): void {
    this.offset = nextOffset;
    this.selectFilter$.next({ page: this.offset / this.limit, size: this.limit });
  }
}
