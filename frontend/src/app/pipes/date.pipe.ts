import { Pipe, PipeTransform, signal } from '@angular/core';
import { DatePipe as AngularDatePipe } from '@angular/common';

@Pipe({
  name: 'hungarianDate'
})
export class DatePipe implements PipeTransform {
  private readonly datePipe = signal<AngularDatePipe>(new AngularDatePipe('en-US'));
  private readonly format = signal<string>('yyyy.MM.dd. HH:mm:ss');

  transform(value: string | Date): string {
    return this.datePipe().transform(value, this.format()) || '';
  }
}
