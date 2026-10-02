import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { recentLivres } from '../../core/catalogue';
import { LivresService } from '../../core/livres.service';
import { Cover } from '../../shared/cover';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Cover],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly livresService = inject(LivresService);
  readonly loading = this.livresService.loading;
  readonly shelf = computed(() => recentLivres(this.livresService.livres()));
  readonly stats = computed(() => {
    const livres = this.livresService.livres().filter((livre) => livre.titre.trim());
    return {
      livres: livres.length,
      editeurs: new Set(livres.map((livre) => livre.editeur).filter(Boolean)).size,
      genres: new Set(livres.map((livre) => livre.genre).filter(Boolean)).size,
    };
  });
}
