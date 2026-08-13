    import { Component } from '@angular/core';
    import {RouterLink} from '@angular/router';
    import {NgIf} from '@angular/common'

    @Component({
    selector: 'app-layout',
    imports: [RouterLink, NgIf],
    templateUrl: './layout.html',
    styleUrls: ['./layout.css']
    })
    export class Layout {
    isLoggedIn: boolean = false; // Este será un marcador de posición para el estado de inicio de sesión

    toggleLogin(): void {
        this.isLoggedIn = !this.isLoggedIn; // Cambia el estado de inicio de sesión (simulación)
    }
    }