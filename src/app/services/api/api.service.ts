import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable, ObservedValueOf } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  

  //category can be considered a brand in ODO's scenario.
  //distributoriships can be considered as areas.

  dbUrl = "https://odo-admin-app-default-rtdb.asia-southeast1.firebasedatabase.app/";
  constructor(private http:HttpClient) { }

  public getAdmins() : Observable<any>
  { 
     return this.http.get(this.dbUrl + "admins.json");
  }

  public getCategories() : Observable<any> {
    return this.http.get(this.dbUrl+"onlyCategories.json");
  }

  public addItem(value:any , catKey:any) : Observable<any>
  {
    return this.http.post(this.dbUrl+"Categories/"+catKey+"/items.json" , value);
  }

  public getItems(categoryKey : string) : Observable<any>
  {
    return this.http.get(this.dbUrl+"Categories/"+categoryKey+"/items.json");
  }

  public deleteItem(categoryKey:string , itemKey:string) : Observable<any>
  {
    return this.http.delete(this.dbUrl+"Categories/"+categoryKey+"/items/"+itemKey+".json");
  }

  public editItem(categoryKey : string , itemKey : string , updatedItem:any)
  {
    return this.http.put(this.dbUrl+"Categories/" + categoryKey + "/items/" + itemKey+".json" , updatedItem);
  }

  public getNotificationRequests() : Observable<any>
  {
    return this.http.get(this.dbUrl+"DistributorNotifications.json");
  }

  public makeUser(data:any) : Observable<any>
  {
    return this.http.post(this.dbUrl+"Distributors.json" , data);
  }

  public deleteNotification(key:any) :Observable<any> {
    return this.http.delete(this.dbUrl+"DistributorNotifications/"+key+".json");
  }

  public getDistributors() : Observable<any>
  {
    return this.http.get(this.dbUrl+"Distributors.json");
  }

  public deleteDistributor(key:any) : Observable<any>
  {
    return this.http.delete(this.dbUrl+"Distributors/"+key+".json");
  }

  public getActiveOrders():Observable<any>
  {
    return this.http.get(this.dbUrl+"activeDistributorOrders.json");
  }

  public getOrder(orderKey : String) : Observable<any>
  {
    return this.http.get(this.dbUrl+"activeDistributorOrders/"+orderKey+".json");
  }

  public acceptOrderForReporting(area:String , orderedBy:String , orderInformation:any) : Observable<any>
  {
    let orderDate = orderInformation['orderTime'].split(' ')[0];
    console.log("Order date = "+orderDate);
    let year = orderDate.split('/')[2];
    // console.log("year = "+year);
    // let quarter = this.getQuarter(orderDate.split('/')[0]);
    // console.log("Quarter = "+quarter);
    let month = this.processMonth(orderDate.split('/')[0]);
    console.log("Month = "+month);
    return this.http.post(this.dbUrl+"reportingDistributorOrders/"+area+"/"+orderedBy+"/"+year+"/"+month+".json" , orderInformation);
  }

  private processMonth(num:any)
  {
    if(num == 1)
    { 
      return "JANUARY";
    }
    else if(num == 2)
    {
      return "FEBRUARY";
    }
    else if(num == 3)
    {
      return "MARCH";
    }
    else if(num == 4)
    {
      return "APRIL";
    }
    else if(num == 5)
    {
      return "MAY";
    }
    else if(num == 6)
    {
      return "JUNE";
    }
    else if(num == 7)
    {
      return "JULY";
    } 
    else if(num == 8)
    {
      return "AUGUST";
    }
    else if(num == 9)
    {
      return "SEPTEMBER";
    }
    else if(num == 10)
    {
      return "OCTOBER";
    }
    else if(num == 11)
    {
      return "NOVEMBER";
    }
    else if(num == 12)
    {
      return "DECEMBER";
    }
    else
    {
      return undefined;
    }
  }

  private getWeek(day:String)
  {
    console.log("Day for week = "+day);
    if(day.substring(0,1) == '0')
    {
      day = day.substring(1);
    }

    var asli_day:number = +day;
    if(asli_day >=1 && asli_day<=7)
    {
      return '1';
    }
    if(asli_day > 7 && asli_day<=14)
    {
      return '2';
    }
    if(asli_day > 14 && asli_day<=21)
    {
      return '3';
    }
    return '4';
  }

  private getQuarter(month:String)
  {
    //1,2,3,4 hai
    if(month == '1' || month == '2' || month == '3')
    {
      return '1';
    }
    if(month == '4' || month == '5' || month == '6')
    {
      return '2';
    }
    if(month == '7' || month == '8' || month == '9')
    {
      return '3';
    }
    else
    {
      return '4';
    }
  }

  public acceptOrderForProcessed(orderInformation:any) : Observable<any>
  {
    let date = orderInformation['orderDate'];
    return this.http.post(this.dbUrl+"processedDistributorOrders/"+date+".json",orderInformation);
  }

  public deleteActiveOrder(orderKey:String) : Observable<any>
  {
    return this.http.delete(this.dbUrl+"activeDistributorOrders/"+orderKey+".json");
  }

  public getDistributorships() : Observable<any>
  {
    return this.http.get(this.dbUrl+"Areas.json");
  }

  public deleteDistributorship(key:any) : Observable<any>
  {
    return this.http.delete(this.dbUrl+"Areas/"+key+".json");
  }

  public addDistributorship(params:any) : Observable<any>
  {
     return this.http.post(this.dbUrl+"Areas.json" , params);
  }

  public getPriceLists() : Observable<any>
  {
    return this.http.get(this.dbUrl+"priceLists.json");
  }

  public updatePriceList(key:string , params:any) : Observable<any>
  {
    return this.http.patch(this.dbUrl+"priceLists/"+key+".json" , params);
  }

  public getOrdersForReports(year:any , area:any , distributor:any) : Observable<any>
  {
    return this.http.get(this.dbUrl+"reportingDistributorOrders/"+area+"/"+distributor+"/"+year+".json");
  }

  public saveOrdersForSuperAdmins(order:any ,date:string) : Observable<any>
  {
    return this.http.post(this.dbUrl+"processedOrdersView/"+date+".json" , order);
  }

  public getProcessedDistributorViewOrders(date:string) : Observable<any>
  {
    return this.http.get(this.dbUrl+"processedDistributorOrders/"+date+".json");
  }

  public sendPushNotification(title : string , matter:string,token : string) : Observable<any>
  {
    
    return this.http.post("https://us-central1-kidysadminapp.cloudfunctions.net/sendApprovalNotification" , {
      title : title,
      matter : matter,
      deviceToken : token
    })
  }

  public signup(data:any ,selectedAdminType:any):Observable<any>
  {
    data['type'] = selectedAdminType;
    return this.http.post(this.dbUrl+"admins.json",data);
  }

  public checkMaintenance() : Observable<any>
  {
    return this.http.get(this.dbUrl+"maintenance/-NfL2-nXXnqVLMMwUpVa.json");
  }

  public getOrderItemsLength(orderPlace:string , orderedBy:string , orderKey:string) : Observable<any>
  {
    return this.http.get(this.dbUrl+"/activeDistributorOrders/"+orderPlace+"/"+orderedBy+"/"+orderKey+"/items.json?shallow=true");
  }

  public addItemToExistingOrder(orderPlace:string , orderedBy : string , orderKey:string , index:any , itemToBeAdded:any) : Observable<any>
  {
    return this.http.put(this.dbUrl+"/activeDistributorOrders/"+orderPlace+"/"+orderedBy+"/"+orderKey+"/items/"+index+".json" , itemToBeAdded);
  }

  public onboardBrandAsParent(formValue:any) : Observable<any>
  {
    return this.http.post(this.dbUrl+"Categories.json" , formValue);
  }

  public onboardBrandForViewing(formValue:any , parentKey:any) : Observable<any>
  {
    return this.http.put(this.dbUrl+"onlyCategories/"+parentKey+".json" , formValue);
  }

  public deleteAdmin(adminKey:any) : Observable<any>
  {
    return this.http.delete(this.dbUrl+"admins/"+adminKey+".json");
    
  }

  public addAdmin(adminBody:any) : Observable<any>
  {
    return this.http.post(this.dbUrl+"admins.json" , adminBody);
  }

  public updateSortOrder(brands:any) : Observable<any>
  {
    return this.http.put(this.dbUrl+"onlyCategories.json",brands);
  }

  public uploadB2BBanner(bannerData:any) : Observable<any>
  {
    return this.http.post(this.dbUrl+"B2BBanners.json" , bannerData);
  }
  public getB2bBanners() : Observable<any>
  {
    return this.http.get(this.dbUrl+"B2BBanners.json");
  }

  public deleteB2BBanner(bannerKey:any) : Observable<any>
  {
    return this.http.delete(this.dbUrl+"B2BBanners/"+bannerKey+".json");
  }

  public getReferralLeaderboardData() : Observable<any>
  {
    return this.http.get(this.dbUrl+"ReferralLeaderboard.json");
  }

  public addReferrer(referrerData:any) : Observable<any>
  {
    return this.http.post(this.dbUrl+"ReferralLeaderboard.json" , referrerData);
  }

  private generateFirebaseKey(): string {
    return '-' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
  }
  
  public updateReferralLeaderboardData(fullLeaderboard: any[]): Observable<any> {
    const leaderboardMap: any = {};
  
    fullLeaderboard.forEach(item => {
      const key = this.generateFirebaseKey();
      leaderboardMap[key] = item;
    });
  
    return this.http.put(this.dbUrl + "ReferralLeaderboard.json", leaderboardMap);
  }

  public updateOrderStatus(orderKey:string , newStatus:string) : Observable<any>
  {
    return this.http.patch(this.dbUrl+"activeDistributorOrders/"+orderKey+".json" , {status : newStatus});
  }

  public saveRouteInDB(routeData:any , routeId:any): Observable<any>
  {
    return this.http.put(this.dbUrl+"deliveryRoutes/"+routeId+".json" , routeData);
  }

  public deleteRouteFromDB(routeId:any) : Observable<any>
  {
    return this.http.delete(this.dbUrl+"deliveryRoutes/"+routeId+".json");
  }

  public getDeliveryRoutesFromDB() : Observable<any>
  {
    return this.http.get(this.dbUrl+"deliveryRoutes.json");
  }

  public getKhokhaStoresForActiveKhokhaOrders(date:string) : Observable<any>
  {
    return this.http.post("https://getaggregatedstoreparchibydate-jipkkwipyq-uc.a.run.app" , {date});
  }

  public getKhokhaAggregatedOrderDetail(storeId:string, date:string):Observable<any>
  {
    return this.http.post("https://generateadminsummary-jipkkwipyq-uc.a.run.app" , {storeId , date , operation:"view"});
  }

  public getCategoriesForPaanIndia() : Observable<any> {
    return this.http.get(this.dbUrl+"khokhaCategories.json");
  }

  public getPaanIndiaStores() : Observable<any> {
    return this.http.get(this.dbUrl+"khokhaStores.json");
  }

  public createKhokhaItem(payload:any) : Observable<any> {
    return this.http.post(this.dbUrl+"khokhaItems.json" , payload);
  }

  public getItemsForPaanIndia(categoryKey:string) : Observable<any>
  {
    return this.http.post("https://getkhokhaitemsbycategory-jipkkwipyq-uc.a.run.app" , {categoryKey});
  }
  
}
