import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe as AngularDatePipe } from '@angular/common';

@Pipe({
  name: 'hungarianDate'
})
export class DatePipe implements PipeTransform {
  transform(value: string | Date): string {
    const datePipe = new AngularDatePipe('en-US');
    return datePipe.transform(value, 'yyyy. MMMM d., HH:mm') || '';
  }
}
