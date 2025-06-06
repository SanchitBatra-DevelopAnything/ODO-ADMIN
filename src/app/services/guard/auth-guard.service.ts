import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate{

  constructor(private router : Router) { }

  canActivate(route : ActivatedRouteSnapshot , state : RouterStateSnapshot) : boolean{
    if(sessionStorage.getItem('loggedIn')!==null && sessionStorage.getItem('loggedIn')=='true')
    {
      return true;
    }
    else
    {
      this.router.navigate(['/']);
      return false;
    }
  }
}