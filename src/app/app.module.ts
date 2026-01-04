import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from "@angular/fire/compat";
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { ToastrModule } from 'ngx-toastr';
import { SidebarModule } from 'primeng/sidebar';
import {MatCardModule} from '@angular/material/card';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TableModule } from 'primeng/table';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MatInputModule } from '@angular/material/input';

import { environment } from 'src/environments/environment';


import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HeaderComponent } from './header/header.component';
// import { CategoriesListComponent } from './categories-list/categories-list.component';
// import { CategoryItemComponent } from './category-item/category-item.component';
// import { AddItemComponent } from './add-item/add-item.component';
// import { ManageComponent } from './manage/manage.component';
// import { NotificationsComponent } from './notifications/notifications.component';
// import { OrdersComponent } from './orders/orders.component';
// import { ReportingComponent } from './reporting/reporting.component';
// import { ItemListComponent } from './item-list/item-list.component';
// import { ItemComponent } from './item/item.component';

 import { SpeedDialModule } from 'primeng/speeddial';
import { CategoriesListComponent } from './categories-list/categories-list.component';
import { CategoryItemComponent } from './category-item/category-item.component';
import { AddItemComponent } from './add-item/add-item.component';
import { BrandOnboardComponent } from './brand-onboard/brand-onboard.component';
import { ItemListComponent } from './item-list/item-list.component';
import { ItemComponent } from './item/item.component';
import { EditItemComponent } from './edit-item/edit-item.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ManageComponent } from './manage/manage.component';
import { DistributorsListComponent } from './manage/distributors-list/distributors-list.component';
import { OrdersComponent } from './orders/orders.component';
import { OrderDetailComponent } from './orders/order-detail/order-detail.component';
import { OldOrdersComponent } from './orders/old-orders/old-orders.component';
import { OldOrderDetailComponent } from './orders/old-order-detail/old-order-detail.component';
import { DistributorAreasComponent } from './manage/distributor-areas/distributor-areas.component';
import { AddAreaFormComponent } from './add-area-form/add-area-form.component';
import { AdminsComponent } from './manage/admins/admins.component';
import { AddAdminFormComponent } from './add-admin-form/add-admin-form.component';
import { BrandSortFormComponent } from './brand-sort-form/brand-sort-form.component';
import { AuthGuardService } from './services/guard/auth-guard.service';
import { AdminGuardService } from './services/guard/admin-guard.service';
import { BannersComponent } from './manage/banners/banners.component';
import { AddB2bBannerFormComponent } from './add-b2b-banner-form/add-b2b-banner-form.component';
import { ReferralLeaderboardComponent } from './manage/referral-leaderboard/referral-leaderboard.component';
import { AddReferrerFormComponent } from './add-referrer-form/add-referrer-form.component';
import { GoogleMapComponent } from './google-map/google-map.component';
import { SafeUrlPipe } from './safe-url.pipe';
import { DeliveryRouteMakerComponent } from './orders/delivery-route-maker/delivery-route-maker.component';
import { KhokhaOrdersComponent } from './khokha-orders/khokha-orders.component';
import { AggregatedOrderDetailsComponent } from './khokha-orders/aggregated-order-details/aggregated-order-details.component';

// import { EditItemComponent } from './edit-item/edit-item.component';
// import { DistributorAreasComponent } from './manage/distributor-areas/distributor-areas.component';
// import { DistributorsListComponent } from './manage/distributors-list/distributors-list.component';
// import { PriceListsNDiscountsComponent } from './manage/price-lists-n-discounts/price-lists-n-discounts.component';
// import { OrderDetailComponent } from './orders/order-detail/order-detail.component';
// import { AddAreaFormComponent } from './add-area-form/add-area-form.component';
// import { OldOrdersComponent } from './orders/old-orders/old-orders.component';
// import { OldOrderDetailComponent } from './orders/old-order-detail/old-order-detail.component';
// import { SignupFormComponent } from './signup-form/signup-form.component';
// import { PaymentCollectionMaintenanceComponent } from './payment-collection-maintenance/payment-collection-maintenance.component';
// import { AddItemInOrderComponent } from './add-item-in-order/add-item-in-order.component';

const appRoutes : Routes = [
  {path: '' , component:LoginComponent , pathMatch:"full"},
  {path: 'categories' , component : CategoriesListComponent , canActivate : [AuthGuardService , AdminGuardService]},
  {path : 'itemsOf/:categoryKey/:categoryName' , component : ItemListComponent , canActivate : [AuthGuardService , AdminGuardService] },
  {path:'notifications' , component:NotificationsComponent , canActivate : [AuthGuardService]},
  {path : 'dailyReport' , component : OrdersComponent , canActivate : [AuthGuardService]},
  {path : 'khokhaDailyReport' , component : KhokhaOrdersComponent , canActivate : [AuthGuardService]},
  {path : 'manage' , component : ManageComponent , canActivate : [AuthGuardService , AdminGuardService]},
  {path : 'manage' , component : ManageComponent , children:[
    {path : 'distributors', component : DistributorsListComponent , canActivate : [AuthGuardService , AdminGuardService]},
    {path : 'areas', component : DistributorAreasComponent , canActivate : [AuthGuardService , AdminGuardService]},
    {path : 'admins' , component : AdminsComponent , canActivate : [AuthGuardService , AdminGuardService]},
    {path : 'banners/b2b' , component : BannersComponent , canActivate : [AuthGuardService , AdminGuardService]},
    {path : 'referral/leaderboard' , component : ReferralLeaderboardComponent , canActivate : [AuthGuardService , AdminGuardService]},
    {path : 'delivery' , component : GoogleMapComponent , canActivate : [AuthGuardService , AdminGuardService]}
  ]},
  {path : 'processedOrders' , component : OldOrdersComponent , canActivate : [AuthGuardService]},
  {path : 'orderBill/:orderKey' , component : OrderDetailComponent , canActivate :[AuthGuardService]},
  {path : 'deliveryRouteMaker' , component : DeliveryRouteMakerComponent , canActivate :[AuthGuardService]},
  {
    path: 'aggregated-order-details',
    component: AggregatedOrderDetailsComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'aggregated-order-details/:storeId/:date',
    component: AggregatedOrderDetailsComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'aggregated-order-details/:storeId/:date/bill',
    component: AggregatedOrderDetailsComponent,
    canActivate: [AuthGuardService]
  }
];

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD-MM-YYYY',
  },
  display: {
    dateInput: 'd-M-yyyy',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LoginComponent,
    CategoriesListComponent,
    CategoryItemComponent,
    AddItemComponent,
    BrandOnboardComponent,
    ItemListComponent,
    ItemComponent,
    EditItemComponent,
    NotificationsComponent,
    ManageComponent,
    DistributorsListComponent,
    OrdersComponent,
    OrderDetailComponent,
    OldOrdersComponent,
    OldOrderDetailComponent,
    DistributorAreasComponent,
    AddAreaFormComponent,
    AdminsComponent,
    AddAdminFormComponent,
    BrandSortFormComponent,
    BannersComponent,
    AddB2bBannerFormComponent,
    ReferralLeaderboardComponent,
    AddReferrerFormComponent,
    GoogleMapComponent,
    SafeUrlPipe,
    DeliveryRouteMakerComponent,
    KhokhaOrdersComponent,
    AggregatedOrderDetailsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    SidebarModule,
    SpeedDialModule,
    DialogModule,
    CardModule,
    DropdownModule,
    DynamicDialogModule,
    ToastrModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireStorageModule,
    MatTableModule , 
    MatPaginatorModule,
    OverlayPanelModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatCardModule,
    TableModule,
    RadioButtonModule,
    MatInputModule,
    RouterModule.forRoot(appRoutes,{useHash: true}),
  ],
  providers: [DialogService , { provide: MAT_DATE_LOCALE, useValue: 'en-GB' } , { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },],
  bootstrap: [AppComponent]
})


export class AppModule { }


