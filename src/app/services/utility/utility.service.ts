import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  //these are for delivery route making.
  private _shopsForDelivery : any[]=[];
  sendUniqueShopsForDeliveryRoute = new BehaviorSubject<any[]>([]);
  

  setDeliveryShops(shops: any[]) {
    this._shopsForDelivery = shops;
    this.sendUniqueShopsForDeliveryRoute.next(shops);
  }

  getDeliveryShops(): any[] {
    return this._shopsForDelivery;
  }

  hasDeliveryShops(): boolean {
    return this._shopsForDelivery.length > 0;
  }

  userLoggedIn : Subject<boolean>;
  itemDeleted:Subject<string>;
  itemEditted:Subject<string>;
  areaAdded:Subject<string>;
  skippedMaintenance:Subject<boolean>;

  itemAddedInExistingOrder:Subject<boolean>;
  adminAdded:Subject<boolean>;
  categoryAdded:Subject<boolean>;
  bannerAdded:Subject<boolean>;
  referrerAdded:Subject<boolean>;
  paanIndiaItemDeleted:Subject<boolean>;
  paanIndiaItemEditted:Subject<boolean>;

  constructor() { 
    this.userLoggedIn = new Subject<boolean>();
    this.itemDeleted = new Subject<string>();
    this.itemEditted = new Subject<string>();
    this.areaAdded = new Subject<string>();
    this.skippedMaintenance = new Subject<boolean>();
    this.itemAddedInExistingOrder = new Subject<boolean>();
    this.adminAdded = new Subject<boolean>();
    this.categoryAdded = new Subject<boolean>();
    this.bannerAdded = new Subject<boolean>();
    this.referrerAdded = new Subject<boolean>();
    this.paanIndiaItemDeleted = new Subject<boolean>();
    this.paanIndiaItemEditted = new Subject<boolean>();
}
}
