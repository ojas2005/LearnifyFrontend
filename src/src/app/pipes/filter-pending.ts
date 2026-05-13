import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterPending',
  standalone: false
})
export class FilterPendingPipe implements PipeTransform {
  transform(courses: any[]): any[] {
    if (!courses) return [];
    return courses.filter(c => !c.isApproved && c.isPublished);
  }
}
