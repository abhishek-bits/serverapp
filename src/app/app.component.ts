import { Component, OnInit } from '@angular/core';
import { ServerService } from './service/server.service';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { AppState } from './interface/app-state';
import { CustomResponse } from './interface/custom-response';
import { DataState } from './enum/data-state.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

/*
 * Inside this class, we can use all the functions that
 * we just defined in our ServerService class and then
 * get the data that we need. 
 */
export class AppComponent implements OnInit {

  // Our entire application state will be inside this observable.
  appState$: Observable<AppState<CustomResponse>>;

  title = 'serverapp';

  constructor(private serverService: ServerService) { }

  // Lifecycle Hook
  ngOnInit(): void {
    this.appState$ = this.serverService.servers$
      .pipe(
        // If we get the response, then our data is in loaded state.
        map(response => {
          return { dataState: DataState.LOADED_STATE, appData: response }
        }),
        // But while we are making the request to the backend,
        // we are going to return this observable.
        startWith({ dataState: DataState.LOADING_STATE }),
        // OR if we get an error:
        // The catchError method internally gives call to handleError
        // which returns us a message of type string
        catchError((error: string) => {
          // of() is used to create an observable on the fly
          return of({ dataState: DataState.ERROR_STATE, error: error })
        })
      );
  }
}
