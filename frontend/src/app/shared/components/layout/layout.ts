    import { Component } from '@angular/core';

    @Component({
    selector: 'app-layout',
    templateUrl: './layout.html',
    styleUrls: ['./layout.css']
    })
    export class LayoutComponent {
    isLoggedIn: boolean = false; // Este será un marcador de posición para el estado de inicio de sesión

    toggleLogin(): void {
        this.isLoggedIn = !this.isLoggedIn; // Cambia el estado de inicio de sesión (simulación)
    }
    }