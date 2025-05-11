import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe as AngularDatePipe } from '@angular/common';

@Pipe({
  name: 'hungarianDate'
})
export class DatePipe implements PipeTransform {
  private readonly datePipe = new AngularDatePipe('en-US');
  private readonly format = 'yyyy. MMMM d., HH:mm';

  transform(value: string | Date): string {
    return this.datePipe.transform(value, this.format) || '';
  }
}
