import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
standalone: false,
  selector: 'app-octocat',
  templateUrl: './octocat.component.html',
  styleUrls: ['./octocat.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OctocatComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
