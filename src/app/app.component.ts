import { Component, OnInit } from '@angular/core';
import { ServerService } from './service/server.service';
import { BehaviorSubject, Observable, catchError, map, of, startWith } from 'rxjs';
import { AppState } from './interface/app-state';
import { CustomResponse } from './interface/custom-response';
import { DataState } from './enum/data-state.enum';
import { Status } from './enum/status.enum';
import { NgForm } from '@angular/forms';
import { Server } from './interface/server';

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
   * Because we are using ngForms: RxJs
   */
  // filterStatus, which we are going to use in our UI,
  // is an observable of BehaviorSubject: filterSubject
  filterStatus$ = this.filterSubject.asObservable();
  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();

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
          return { 
            dataState: DataState.LOADED_STATE, 
            // if we want the response to be in some sorted order.
            // appData: {...response, data: { servers: response.data.servers.reverse() } } 
            appData: response 
          }
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
        // and replace the server that we get from the backend (response)
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
      );
  }

  filterServers(status: Status): void {
    this.appState$ = this.serverService.filter$(status, this.dataSubject.value)
      .pipe(
        // Here, we'll send the filtered response that comes from the backend.
        map(response => {
          return { dataState: DataState.LOADED_STATE, appData: response }
        }),
        startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }),
        catchError((error: string) => {
          return of({ dataState: DataState.ERROR_STATE, error })
        })
      );
  }

  saveServer(serverForm: NgForm): void {

    // Whoever in the UI is subscribed to this observable,
    // then they are gonna get this true value.
    // Then it's gonna show spinner to them.
    this.isLoading.next(true);

    // Can also do like this:
    // this.appState$ = this.serverService.save$(<Server> serverForm.value)
    // OR
    // this.appState$ = this.serverService.save$(serverForm.value as Server)
    // But, serverForm.value returns "any" type
    // which will be internally converted into Server type.
    this.appState$ = this.serverService.save$(serverForm.value)
      .pipe(
        // The response here will be the new server object
        // added into the server.
        map(response => {
          // We'll add the new server into the current list of servers
          
          // this.dataSubject.value.data.servers.push(response.data.server);
          
          this.dataSubject.next(
            {
              ...response,
              data: { servers: [...this.dataSubject.value.data.servers, response.data.server] }
            }
          );

          // Close the Modal
          document.getElementById('closeModal').click();

          // Stop the spinner
          this.isLoading.next(false);

          // Reset the form
          serverForm.resetForm({ status: this.Status.SERVER_DOWN })

          // then pass the same value we just updated.
          return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
        }),
        startWith({ 
          // Why? Because the data is already loaded.
          dataState: DataState.LOADED_STATE, 
          appData: this.dataSubject.value     // to get the CustomResponse object.
        }),
        catchError(( error: string ) => {
          // Stop the spinner
          this.isLoading.next(false);
          return of({ dataState: DataState.ERROR_STATE, error })
        })
      );
  }

  deleteServer(server: Server): void {
    // Call to backend requires only the id of the server
    this.appState$ = this.serverService.delete$(server.id)
      .pipe(
        map(response => {
          this.dataSubject.next(
            {
              // What do we want to return ?
              // Everything that we got in the response
              ...response,
              // Which property do we want to update ?
              data: { 
                // we need all the servers
                // except the one we just deleted.
                servers: this.dataSubject.value.data.servers
                  .filter(otherServer => otherServer.id !== server.id) 
              }
            }
          );
          return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
        }),
        startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }),
        catchError((error: string) => {
          return of({ dataState: DataState.ERROR_STATE, error });
        })
      );
  }

  // printReport() doesn't make any call to Backend API
  printReport(): void {
    // saveAsExcel();
    saveAsPdf();
  }
}

function saveAsPdf(): void {
  window.print();
}

function saveAsExcel(): void {
  let dataType = 'application/vnd.ms-excel.sheet.macroEnabled.12';
  let tableSelect = document.getElementById("servers");
  // Replace all space with the URL encoded value
  let tableHtml = tableSelect.outerHTML.replace(/ /g, '%20');
  // Create an achor tag that will be clicked only programmatically.
  let downloadLink = document.createElement('a');
  // Now, integrate this achor tag into the HTML.
  document.body.appendChild(downloadLink);
  // add href argument to the anchor tag
  downloadLink.href = 'data: ' + dataType + ', ' + tableHtml;
  // give a name to the file.
  downloadLink.download = 'server-report.xls';
  downloadLink.click();
  // Now, remove this anchor tag from the HTML.
  document.body.removeChild(downloadLink);
}
