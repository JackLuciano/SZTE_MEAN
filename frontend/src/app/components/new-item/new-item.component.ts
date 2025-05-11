import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../app.config';

@Component({
  selector: 'app-new-item',
  imports: [],
  templateUrl: './new-item.component.html',
  styleUrl: './new-item.component.scss'
})
export class NewItemComponent implements OnInit {

  constructor(private httpClient : HttpClient) { }

  ngOnInit() : void {
    // this.httpClient.post(API_URL + 'items', { name: 'New Item' })
    //   .subscribe({});
  }
}
