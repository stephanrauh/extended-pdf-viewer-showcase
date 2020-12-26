import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-default-routes',
  templateUrl: './default-routes.component.html',
  styleUrls: ['./default-routes.component.css']
})
export class DefaultRoutesComponent implements OnInit {

  constructor(private router: Router, private currentRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.currentRoute.paramMap.subscribe(route => {
      const path = route.get("path");
      this.router.navigateByUrl("/extended-pdf-viewer/" + path);
    });
  }

}
