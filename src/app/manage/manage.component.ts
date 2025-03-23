import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit{

  constructor(private router : Router){}

  ngOnInit()
  {
    this.router.navigate(['/manage/distributors']);
  }

}
