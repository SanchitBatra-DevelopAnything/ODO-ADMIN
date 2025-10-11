import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api/api.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

@Component({
  selector: 'app-delivery-route-maker',
  templateUrl: './delivery-route-maker.component.html',
  styleUrls: ['./delivery-route-maker.component.scss']
})
export class DeliveryRouteMakerComponent {
  shopsAvailableForDelivery: any[] = [];
  filteredShops: any[] = [];
  deliveryRoutes: any[] = [];
  uniqueShopsSubscription: Subscription = new Subscription();
  selectedRoute: any = null;
  isLoading: boolean = false;

  constructor(private apiService: ApiService, private utilityService: UtilityService, private toastr: ToastrService) { }

  ngOnInit() {
    this.uniqueShopsSubscription = this.utilityService.sendUniqueShopsForDeliveryRoute.subscribe(
      (shops: any) => {
        if (shops?.length > 0) {
          this.shopsAvailableForDelivery = shops;
          this.filteredShops = [...this.shopsAvailableForDelivery];
        }
      }
    );

    this.loadExistingRoutes();
  }

  loadExistingRoutes() {
    this.isLoading = true;
    this.apiService.getDeliveryRoutesFromDB().subscribe((routes: any) => {
      if (routes == null) {
        this.deliveryRoutes = [];
        this.selectedRoute = null;
        this.isLoading = false;
        return;
      }
      this.deliveryRoutes = Object.values(routes);
      this.isLoading = false;
    });
  }

  createNewRoute() {
    const newRoute = {
      id: Date.now().toString(),
      driver: '',
      shops: []
    };
    this.deliveryRoutes.push(newRoute);
    this.selectedRoute = newRoute;
  }

  addShopToRoute(shop: any, route: any) {
    const routeShop = {
      ...shop,
      priority: route.shops.length + 1
    };
    route.shops.push(routeShop);
  }

  updateShopPriority(route: any, shop: any, newPriority: number) {
    const shopIndex = route.shops.findIndex((s: any) => s === shop);
    if (shopIndex !== -1) {
      route.shops[shopIndex].priority = newPriority;
      route.shops.sort((a: any, b: any) => a.priority - b.priority);
    }
  }

  assignDriver(route: any, driverName: string) {
    route.driver = driverName;
  }

  saveRouteToDatabase(route: any) {
    if (!route.driver || route.driver.trim().length == 0) {
      this.toastr.error('Please assign a driver before sending the route.', 'Error!', {
        timeOut: 4000,
        closeButton: true,
        positionClass: 'toast-top-right'
      });
      return;
    }
    //for now only saving metadata of a route in database.
    this.isLoading = true;
    this.apiService.saveRouteInDB(route, route.id).subscribe((_: any) => {
      this.isLoading = false;
      this.toastr.success('Route Saved Successfully', 'Notification!', {
        timeOut: 4000,
        closeButton: true,
        positionClass: 'toast-top-right'
      });
    })
  }

  deleteRouteFromDatabase(route: any) {
    this.isLoading = true;
    this.apiService.deleteRouteFromDB(route.id).subscribe((_: any) => {
      this.isLoading = false;
      this.toastr.success('Route Deleted Successfully', 'Notification!', {
        timeOut: 4000,
        closeButton: true,
        positionClass: 'toast-top-right'
      });
      this.deliveryRoutes = this.deliveryRoutes.filter(r => r.id !== route.id);
      if (this.selectedRoute?.id === route.id) {
        this.selectedRoute = null;
      }
    });
  }

  sendRouteViaWhatsApp(route: any) {
    if (!route.driver || route.driver.trim().length == 0) {
      this.toastr.error('Please assign a driver before sending the route.', 'Error!', {
        timeOut: 4000,
        closeButton: true,
        positionClass: 'toast-top-right'
      });
      return;
    }
    //we can split into multiple messages also later , if this grows too long.
    let message = `Delivery Route for Driver: ${route.driver}\n\n`;

    route.shops.forEach((shop: any, index: number) => {

      let mapsLink = `https://www.google.com/maps?q=${shop.latitude},${shop.longitude}`;
      if(shop.latitude == "not-found" || shop.longitude == "not-found")
      {
        mapsLink = "Location not available";
      }

      message += `${index + 1}. ${shop.shop}\n` +
        `Address : ${shop.address}\n` +
        `Contact: ${shop.contact}\n` +
        `Location: ${mapsLink}\n\n`;
    });
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }

  filterShops(e:any)
  {
    let query = e.target.value.toLowerCase().trim();
    if(query.length == 0)
    {
      this.filteredShops = [...this.shopsAvailableForDelivery];
      return;
    }
    this.filteredShops = this.shopsAvailableForDelivery.filter((shop)=>{
      return shop.shop.toLowerCase().includes(query);
    });
  }

  ngOnDestroy() {
    if (this.uniqueShopsSubscription) {
      this.uniqueShopsSubscription.unsubscribe();
    }
  }
}