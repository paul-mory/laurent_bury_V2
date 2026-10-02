import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-cv',
  templateUrl: './cv.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvPage {}
