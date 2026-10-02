import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

@Component({
  selector: 'app-cover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cover">
      @if (showImage()) {
        <img [src]="src()" [alt]="alt()" loading="lazy" (error)="markFailed()" />
      } @else {
        <span class="cover-fallback" aria-hidden="true"></span>
      }
    </div>
  `,
})
export class Cover {
  readonly src = input('');
  readonly alt = input('Couverture');
  private readonly failedSrc = signal<string | null>(null);
  readonly showImage = computed(() => {
    const src = this.src();
    return Boolean(src) && this.failedSrc() !== src;
  });

  markFailed(): void {
    this.failedSrc.set(this.src());
  }
}
