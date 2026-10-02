import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { parutionsByYear } from '../../core/catalogue';
import { LivresService } from '../../core/livres.service';
import { Cover } from '../../shared/cover';

@Component({
  selector: 'app-parutions',
  imports: [Cover],
  templateUrl: './parutions.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParutionsPage {
  private readonly livresService = inject(LivresService);
  readonly loading = this.livresService.loading;
  readonly error = this.livresService.error;
  readonly years = computed(() => parutionsByYear(this.livresService.livres()));
}
