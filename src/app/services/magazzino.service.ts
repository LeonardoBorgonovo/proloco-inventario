import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Prodotto } from '../models/prodotto.model';

@Injectable({
  providedIn: 'root'
})
export class MagazzinoService {
  private firestore = inject(Firestore);
  private prodottiCollection = collection(this.firestore, 'prodotti');

  // Leggi tutti i prodotti in tempo reale
  getProdotti(): Observable<Prodotto[]> {
    return collectionData(this.prodottiCollection, { idField: 'id' }) as Observable<Prodotto[]>;
  }

  // Aggiungi un nuovo prodotto
  async addProdotto(prodotto: Prodotto): Promise<string> {
    const docRef = await addDoc(this.prodottiCollection, prodotto);
    return docRef.id;
  }

  // Aggiorna un prodotto esistente
  async updateProdotto(id: string, data: Partial<Prodotto>): Promise<void> {
    const docRef = doc(this.firestore, `prodotti/${id}`);
    await updateDoc(docRef, data);
  }

  // Elimina un prodotto
  async deleteProdotto(id: string): Promise<void> {
    const docRef = doc(this.firestore, `prodotti/${id}`);
    await deleteDoc(docRef);
  }
}