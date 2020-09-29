import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arrayFilter',
  pure: false //A long-running impure pipe could dramatically slow down your app.
})
export class ArrayFilterPipe implements PipeTransform {

  transform(items: any[], implementation: (item: any) => boolean): any {
    if (!items || !implementation) {
      return items;
  }
  return items.filter(item => implementation(item));
  }

}
