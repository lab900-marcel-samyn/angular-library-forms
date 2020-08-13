import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Lab900DataListModule } from 'projects/ui/src/lib/data-list/data-list.module';
import { Lab900SharingModule } from 'projects/ui/src/lib/sharing/sharing.module';
import { ShowcaseUiRoutingModule } from './showcase-ui-routing.module';
import { SharedModule } from '../shared/shared.module';
import { DataListExampleComponent } from './examples/data-list-example/data-list-example.component';
import { SharingExampleComponent } from './examples/sharing-example/sharing-example.component';
import { AlertsExampleComponent } from './examples/alerts-example/alerts-example.component';
import { NavListExampleComponent } from './examples/nav-list-example/nav-list-example.component';
import { AlertModule } from 'projects/ui/src/lib/alert/alert.module';

const examples = [SharingExampleComponent, DataListExampleComponent, AlertsExampleComponent, NavListExampleComponent];

@NgModule({
  declarations: examples,
  imports: [CommonModule, ShowcaseUiRoutingModule, SharedModule, Lab900DataListModule, Lab900SharingModule, AlertModule],
})
export class ShowcaseUiModule {}
