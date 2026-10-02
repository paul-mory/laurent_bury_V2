import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { uniqueValues } from '../../core/catalogue';
import { AuthService } from '../../core/auth.service';
import { errorText } from '../../core/firebase';
import { LivresService } from '../../core/livres.service';
import { Livre, newLivreId } from '../../core/models';
import { Cover } from '../../shared/cover';

type SortKey = 'titre' | 'auteur' | 'date' | 'editeur' | 'genre';

@Component({
  selector: 'app-admin',
  imports: [ReactiveFormsModule, RouterLink, Cover],
  templateUrl: './admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPage {
  readonly auth = inject(AuthService);
  readonly livres = inject(LivresService);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  readonly query = signal('');
  readonly sortKey = signal<SortKey>('titre');
  readonly sortDir = signal<'asc' | 'desc'>('asc');
  readonly editingId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly pendingDelete = signal<string | null>(null);
  readonly notice = signal('');
  readonly noticeError = signal(false);
  readonly loginError = signal('');
  readonly loggingIn = signal(false);

  readonly loginForm = this.fb.nonNullable.group({
    email: [''],
    password: ['', Validators.required],
  });

  readonly form = this.fb.nonNullable.group({
    titre: ['', Validators.required],
    auteur: [''],
    date: [''],
    editeur: [''],
    genre: [''],
    image_url: [''],
    info_supplementaires: [''],
  });

  readonly genres = computed(() => uniqueValues(this.livres.livres().map((livre) => livre.genre)));
  readonly editeurs = computed(() => uniqueValues(this.livres.livres().map((livre) => livre.editeur)));
  readonly auteurs = computed(() => uniqueValues(this.livres.livres().map((livre) => livre.auteur)));
  readonly rows = computed(() => {
    const needle = this.query().trim().toLocaleLowerCase('fr');
    const filtered = this.livres.livres().filter((livre) => {
      if (!needle) return true;
      return [livre.titre, livre.auteur, livre.editeur, livre.genre, livre.date, livre.info_supplementaires]
        .join(' ')
        .toLocaleLowerCase('fr')
        .includes(needle);
    });
    const key = this.sortKey();
    const direction = this.sortDir() === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (String(a[key]) !== String(b[key])) {
        return String(a[key]).localeCompare(String(b[key]), 'fr', { sensitivity: 'base', numeric: true }) * direction;
      }
      return a.titre.localeCompare(b.titre, 'fr', { sensitivity: 'base' });
    });
  });

  async submitLogin(): Promise<void> {
    this.loginError.set('');
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loggingIn.set(true);
    try {
      const { email, password } = this.loginForm.getRawValue();
      await this.auth.login(email, password);
      this.loginForm.reset();
    } catch (error) {
      this.loginError.set(errorText(error, 'Connexion impossible.'));
    } finally {
      this.loggingIn.set(false);
    }
  }

  async logout(): Promise<void> {
    await this.auth.logout();
  }

  toggleSort(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.update((dir) => (dir === 'asc' ? 'desc' : 'asc'));
      return;
    }
    this.sortKey.set(key);
    this.sortDir.set('asc');
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({
      titre: '',
      auteur: '',
      date: '',
      editeur: '',
      genre: '',
      image_url: '',
      info_supplementaires: '',
    });
    this.dialog()?.nativeElement.showModal();
  }

  openEdit(livre: Livre): void {
    this.editingId.set(livre.id);
    this.form.reset({
      titre: livre.titre,
      auteur: livre.auteur,
      date: livre.date,
      editeur: livre.editeur,
      genre: livre.genre,
      image_url: livre.image_url,
      info_supplementaires: livre.info_supplementaires,
    });
    this.dialog()?.nativeElement.showModal();
  }

  closeDialog(): void {
    this.dialog()?.nativeElement.close();
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const editing = this.editingId();
    try {
      const livre = this.toLivre(editing ?? newLivreId());
      if (editing) await this.livres.update(livre);
      else await this.livres.add(livre);
      this.flash(editing ? 'Livre modifié.' : 'Livre ajouté.');
      this.closeDialog();
    } catch (error) {
      this.flash(errorText(error, 'Enregistrement impossible.'), true);
    } finally {
      this.saving.set(false);
    }
  }

  async remove(livre: Livre): Promise<void> {
    try {
      await this.livres.remove(livre.id);
      this.pendingDelete.set(null);
      this.flash('Livre supprimé.');
    } catch (error) {
      this.flash(errorText(error, 'Suppression impossible.'), true);
    }
  }

  async publish(): Promise<void> {
    const count = this.livres.livres().length;
    if (!confirm(`Importer ${count} livres dans Firestore ? Les ouvrages déjà présents avec le même identifiant seront mis à jour.`)) {
      return;
    }
    this.saving.set(true);
    try {
      await this.livres.publishToFirebase();
      this.flash('Catalogue importé dans Firestore.');
    } catch (error) {
      this.flash(errorText(error, 'Import impossible. Vérifiez les règles Firestore et la connexion.'), true);
    } finally {
      this.saving.set(false);
    }
  }

  resetLocal(): void {
    if (!confirm('Effacer les modifications de ce navigateur et revenir au catalogue d’origine ?')) return;
    this.livres.resetLocal();
    this.flash('Catalogue d’origine rétabli.');
  }

  private toLivre(id: string): Livre {
    const value = this.form.getRawValue();
    return {
      id,
      titre: value.titre.trim(),
      auteur: value.auteur.trim(),
      date: value.date.trim(),
      editeur: value.editeur.trim(),
      genre: value.genre.trim(),
      image_url: value.image_url.trim(),
      info_supplementaires: value.info_supplementaires.trim(),
    };
  }

  private flash(message: string, isError = false): void {
    this.notice.set(message);
    this.noticeError.set(isError);
  }
}
