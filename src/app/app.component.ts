import { Component, OnInit } from '@angular/core';
import { ServerService } from './service/server.service';
import { BehaviorSubject, Observable, catchError, map, of, startWith } from 'rxjs';
import { AppState } from './interface/app-state';
import { CustomResponse } from './interface/custom-response';
import { DataState } from './enum/data-state.enum';
import { Status } from './enum/status.enum';

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

  /*
   * All these variables are required
   * in our app.component.html file
   * to have dynamic data flush on browser
   */
  readonly DataState = DataState;
  readonly Status = Status;
  private filterSubject = new BehaviorSubject<string>("");
  // will be used to store the response we get from the server.
  private dataSubject = new BehaviorSubject<CustomResponse>(null);

  /*
   * But why did we take an observable and not a normal variable ???
   * To be answered at the end of the course.
   */
  // filterStatus, which we are going to use in our UI,
  // is an observable of BehaviorSubject: filterSubject
  filterStatus$ = this.filterSubject.asObservable();

  title = 'serverapp';

  constructor(private serverService: ServerService) { }

  // Lifecycle Hook
  // ngOnInit() is called whenever we request a resource.
  ngOnInit(): void {
    this.appState$ = this.serverService.servers$
      .pipe(
        // If we get the response, then our data is in loaded state.
        map(response => {
          // save the response inside dataSubject
          this.dataSubject.next(response);
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

  // Before pingServer(), data is already received via ngOnInit()
  pingServer(ipAddress: string): void {
    // will show the spinner on browser
    this.filterSubject.next(ipAddress);
    // When we ping the server,
    // it returns the server that is pinged.
    this.appState$ = this.serverService.ping$(ipAddress)
      .pipe(
        // What will we do with the response that we get ?
        // loop through all the servers that we have 
        // and replace the server that we get from the backend
        // inside of the array of servers (Server[]): this.dataSubject.value
        // so that we can update any updated information that we might get
        // from the backend.
        map(response => {
          // we need to get the index of the server that the user pinged
          const index = this.dataSubject.value.data.servers
            .findIndex(
              server => server.id === response.data.server.id);
          // and then replace it in the servers[] that we get in the response.
          this.dataSubject.value.data.servers[index] = response.data.server;
          // reset the behavioral: filterSubject
          // actually, this stops the spinner from spinning.
          this.filterSubject.next('');
          // then pass the same value we just updated.
          return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
        }),
        startWith({ 
          // Why? Because the data is already loaded.
          dataState: DataState.LOADED_STATE, 
          appData: this.dataSubject.value     // to get the CustomResponse object.
        }),
        catchError(( error: string ) => {
          // reset the behavioral: filterSubject
          // actually, this stops the spinner from spinning.
          this.filterSubject.next('');
          return of({ dataState: DataState.ERROR_STATE, error })
        })
      )
  }
}
