import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';

@Component({
    selector: 'app-keycloak',
    
    standalone: true,
    templateUrl: './keycloak.component.html',
    styleUrls: ['./keycloak.component.css'],
    imports: [MatCard, Ie11MarkdownComponent],
})
export class KeycloakComponent {}
