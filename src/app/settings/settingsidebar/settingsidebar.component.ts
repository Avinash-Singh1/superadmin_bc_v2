import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settingsidebar',
  templateUrl: './settingsidebar.component.html',
  styleUrls: ['./settingsidebar.component.scss']
})
export class SettingsidebarComponent implements OnInit {

  items = [
    {
      list: 'Profile',
      route:'/theme/settings'
    },
    {
      list: 'Password',
      route:'/theme/settings/password'
    },
    {
      list: 'FAQs',      
      route:'/theme/settings/faq'
    },
    {
      list: 'Social',
      route:'/theme/settings/social'
    },

  ]
  constructor( private route: Router) { }

  ngOnInit(): void {
    this.route.navigate(['/theme/settings'])
  }
  checkCurrentRoute(item: any) {
    if (item && item==this.route.url) {
      return true;
    }
    // if (this.route.url == item.route) {
    //   return true;
    // }
    return false;
  }
  

}
