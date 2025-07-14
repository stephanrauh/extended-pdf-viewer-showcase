import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-octocat',
    templateUrl: './octocat.component.html',
    styleUrls: ['./octocat.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OctocatComponent  {}
