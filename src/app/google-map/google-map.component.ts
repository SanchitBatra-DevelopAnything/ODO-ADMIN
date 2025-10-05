import { Component } from '@angular/core';

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss']
})
export class GoogleMapComponent {
  mapUrl = 'https://www.google.com/mymaps';

  openGoogleMaps()
  {
    window.open('https://www.google.com/mymaps', '_blank');
  }
}
