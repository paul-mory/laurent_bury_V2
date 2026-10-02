import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { isFirebaseConfigured } from '../../environments/environment';
import { errorText, firebaseApp } from './firebase';
import { Livre, livreFromUnknown, newLivreId, toFirestoreLivre, withStableIds } from './models';

const STORAGE_KEY = 'lb-livres-v1';

@Injectable({ providedIn: 'root' })
export class LivresService {
  private readonly http = inject(HttpClient);
  private readonly items = signal<Livre[]>([]);
  private seed: Livre[] = [];

  readonly livres = this.items.asReadonly();
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly remoteWarning = signal<string | null>(null);
  readonly source = signal<'local' | 'firebase'>('local');
  readonly remoteEmpty = signal(false);
  readonly editedLocally = signal(false);

  constructor() {
    void this.init();
  }

  async add(livre: Livre): Promise<void> {
    const next = { ...livre, id: livre.id || newLivreId() };
    if (await this.persistRemote(next, 'set')) {
      this.upsert(next);
      return;
    }
    this.writeLocal([next, ...this.items().filter((item) => item.id !== next.id)]);
  }

  async update(livre: Livre): Promise<void> {
    if (await this.persistRemote(livre, 'set')) {
      this.upsert(livre);
      return;
    }
    this.writeLocal(this.items().map((item) => (item.id === livre.id ? livre : item)));
  }

  async remove(id: string): Promise<void> {
    if (this.source() === 'firebase') {
      const app = await firebaseApp();
      if (!app) throw new Error('Firebase n’est pas configuré.');
      const { deleteDoc, doc, getFirestore } = await import('firebase/firestore');
      await deleteDoc(doc(getFirestore(app), 'livres', id));
      this.items.update((list) => list.filter((item) => item.id !== id));
      return;
    }
    this.writeLocal(this.items().filter((item) => item.id !== id));
  }

  async publishToFirebase(): Promise<void> {
    const app = await firebaseApp();
    if (!app) throw new Error('Firebase n’est pas configuré.');
    const { doc, getFirestore, writeBatch } = await import('firebase/firestore');
    const db = getFirestore(app);
    const batch = writeBatch(db);
    for (const livre of this.items()) {
      batch.set(doc(db, 'livres', livre.id), toFirestoreLivre(livre));
    }
    await batch.commit();
    this.source.set('firebase');
    this.remoteEmpty.set(false);
  }

  resetLocal(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.items.set(this.seed);
    this.editedLocally.set(false);
    this.source.set('local');
  }

  private async init(): Promise<void> {
    try {
      const rows = await firstValueFrom(this.http.get<unknown[]>('/data/livres.json'));
      this.seed = withStableIds(Array.isArray(rows) ? rows : []);
      const cached = this.readCache();
      this.items.set(cached ?? this.seed);
      this.editedLocally.set(cached !== null);
    } catch (error) {
      this.error.set(errorText(error, 'Le catalogue n’a pas pu être chargé.'));
    } finally {
      this.loading.set(false);
    }

    if (!isFirebaseConfigured()) return;

    try {
      const app = await firebaseApp();
      if (!app) return;
      const { collection, getFirestore, onSnapshot } = await import('firebase/firestore');
      onSnapshot(
        collection(getFirestore(app), 'livres'),
        (snapshot) => {
          if (snapshot.empty) {
            this.remoteEmpty.set(true);
            this.source.set('local');
            return;
          }
          this.remoteEmpty.set(false);
          this.source.set('firebase');
          this.items.set(snapshot.docs.map((entry) => livreFromUnknown(entry.id, entry.data())));
        },
        () => {
          this.remoteWarning.set(
            'Firestore refuse la lecture pour le moment. Le catalogue d’origine reste affiché. Déployez les règles du fichier firestore.rules.',
          );
        },
      );
    } catch (error) {
      this.error.set(errorText(error, 'Connexion à Firestore impossible.'));
    }
  }

  private async persistRemote(livre: Livre, _mode: 'set'): Promise<boolean> {
    if (this.source() !== 'firebase') return false;
    const app = await firebaseApp();
    if (!app) throw new Error('Firebase n’est pas configuré.');
    const { doc, getFirestore, setDoc } = await import('firebase/firestore');
    await setDoc(doc(getFirestore(app), 'livres', livre.id), toFirestoreLivre(livre));
    return true;
  }

  private upsert(livre: Livre): void {
    this.items.update((list) => {
      const index = list.findIndex((item) => item.id === livre.id);
      if (index === -1) return [livre, ...list];
      const next = [...list];
      next[index] = livre;
      return next;
    });
  }

  private writeLocal(next: Livre[]): void {
    this.items.set(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    this.editedLocally.set(true);
    this.source.set('local');
  }

  private readCache(): Livre[] | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return null;
      return parsed.map((row) => {
          const storedId =
            row && typeof row === 'object' && 'id' in row && typeof row.id === 'string' ? row.id : '';
          return livreFromUnknown(storedId || newLivreId(), row);
        });
    } catch {
      return null;
    }
  }
}
