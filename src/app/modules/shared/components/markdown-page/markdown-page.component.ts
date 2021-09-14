import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { SubscriptionBasedDirective } from '../../../../../../lib/src/lib/directives/subscription-based.directive';

@Component({
  selector: 'lab900-markdown-page',
  templateUrl: './markdown-page.component.html',
  styleUrls: ['./markdown-page.component.scss'],
})
export class MarkdownPageComponent extends SubscriptionBasedDirective {
  @Input()
  public filePath: string;

  constructor(private activatedRoute: ActivatedRoute) {
    super();
    this.addSubscription(
      this.activatedRoute.data.pipe(
        filter((data: { filePath: string }) => !!data?.filePath),
        take(1),
      ),
      (data) => {
        this.filePath = data.filePath;
      },
    );
  }
}
