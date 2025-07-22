import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-octocat',
    standalone: true,
    templateUrl: './octocat.component.html',
    styleUrls: ['./octocat.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OctocatComponent  {}
