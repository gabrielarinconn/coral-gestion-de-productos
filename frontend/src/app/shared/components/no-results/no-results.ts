import { Component, input } from '@angular/core';

@Component({
  selector: 'app-no-results',
  templateUrl: './no-results.html',
  styleUrl: './no-results.css',
})
export class NoResults {
  message = input<string>('No hay resultados');
}