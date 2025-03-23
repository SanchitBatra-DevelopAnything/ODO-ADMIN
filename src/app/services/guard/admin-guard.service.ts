import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuardService implements CanActivate{

  constructor(private router : Router) { }

  canActivate(route : ActivatedRouteSnapshot , state : RouterStateSnapshot) : boolean{
    if(sessionStorage.getItem('adminType')=='Super')
    {
      return true;
    }
    else
    {
      alert('You are not allowed to go there!');
      return false;
    }
  }
}