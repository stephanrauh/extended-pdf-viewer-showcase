import { Component } from '@angular/core';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';

@Component({
    selector: 'app-keycloak',
    
    standalone: true,
    templateUrl: './keycloak.component.html',
    styleUrls: ['./keycloak.component.css'],
    imports: [
        Ie11MarkdownComponent,
    ],
})
export class KeycloakComponent {}
