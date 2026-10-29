import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MagazzinoService } from '../services/magazzino.service';
import { Prodotto } from '../models/prodotto.model';
import jsPDF from 'jspdf';

interface ElementoCarrello {
  prodotto: Prodotto;
  quantitaPrelevata: number;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="checkout-container">
      <h2>Carrello / Prelievo per Festa</h2>
      <!-- Qui inseriresti la tua interfaccia di selezione -->
      <button (click)="confermaCheckout()">Conferma Prelievo e Stampa PDF</button>
    </div>
  `
})
export class CheckoutComponent {
  private magazzinoService = inject(MagazzinoService);

  // Esempio di elementi selezionati per la festa
  carrelloFesta: ElementoCarrello[] = [];

  async confermaCheckout() {
    if (this.carrelloFesta.length === 0) {
      alert('Nessun prodotto selezionato per il prelievo.');
      return;
    }

    try {
      // 1. Inizializza il documento PDF
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Pro Loco - Resoconto Prelievo Magazzino', 14, 20);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Data prelievo: ${new Date().toLocaleDateString('it-IT')}`, 14, 28);

      // Intestazione tabella PDF
      let y = 40;
      doc.setFont('helvetica', 'bold');
      doc.text('Prodotto', 14, y);
      doc.text('Posizione', 80, y);
      doc.text('Prelevato', 140, y);
      doc.text('Rimanente', 170, y);
      doc.line(14, y + 2, 196, y + 2);
      
      y += 8;
      doc.setFont('helvetica', 'normal');

      // 2. Ciclo di aggiornamento database e scrittura PDF
      for (const item of this.carrelloFesta) {
        if (!item.prodotto.id) continue;

        const nuovaQuantita = Math.max(0, item.prodotto.quantitaTotale - item.quantitaPrelevata);

        // Aggiorna la quantità su Firebase
        await this.magazzinoService.updateProdotto(item.prodotto.id, {
          quantitaTotale: nuovaQuantita
        });

        // Scrivi la riga nel PDF
        doc.text(item.prodotto.nome, 14, y);
        doc.text(item.prodotto.posizione || "", 80, y);
        doc.text(`${item.quantitaPrelevata}`, 140, y);
        doc.text(`${nuovaQuantita}`, 170, y);

        y += 7;

        // Gestione cambio pagina se necessario
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      }

      // 3. Salva e scarica il PDF
      doc.save(`prelievo-festa-${new Date().toISOString().slice(0, 10)}.pdf`);
      
      alert('Checkout completato! Quantità scalate su Firebase e PDF scaricato.');
      this.carrelloFesta = []; // Svuota il carrello locale

    } catch (error) {
      console.error('Errore durante il checkout:', error);
      alert('Si è verificato un errore durante il salvataggio.');
    }
  }
}