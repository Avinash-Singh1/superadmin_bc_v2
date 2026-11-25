import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PushNotificationsRoutingModule } from './push-notifications-routing.module';
import { PushNotificationsComponent } from './push-notifications.component';

@NgModule({
  declarations: [PushNotificationsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    MatTabsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PushNotificationsRoutingModule,
  ],
})
export class PushNotificationsModule { }
