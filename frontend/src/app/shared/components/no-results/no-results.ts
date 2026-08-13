import { Component, input } from '@angular/core';

@Component({
  selector: 'app-no-results',
  templateUrl: './no-results.html',
  styleUrls: ['./no-results.css']
})
export class NoResultsComponent {
  message = input <string>('No hay resultados');
}