import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { CustomResponse } from '../interface/custom-response';
import { Server } from '../interface/server';
import { Status } from '../enum/status.enum';

@Injectable({
  providedIn: 'root'
})

/*
 * Inside this class, we're gonna create all the functions
 * that we need to make HTTP requests.
 */

export class ServerService {

  private readonly apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  /*
   * This is the Procedural Approach of doing things.
   * But we will go for Reactive Approach instead.
   */
  // getServers(): Observable<CustomResponse> {
  //   return this.http.get<CustomResponse>(`http://localhost:8080/server/list`);
  // }

  servers$ = <Observable<CustomResponse>>this.http
  .get<CustomResponse>(`${this.apiUrl}/server/list`)
  .pipe(
    tap(console.log),
    catchError(this.handleError)
  );

  save$ = (server: Server) => <Observable<CustomResponse>>this.http
  .post<CustomResponse>(
    `${this.apiUrl}/server/save`,
    server)
  .pipe(
    tap(console.log),
    catchError(this.handleError)
  );

  ping$ = (ipAddress: string) => <Observable<CustomResponse>>this.http
  .get<CustomResponse>(`${this.apiUrl}/server/ping/${ipAddress}`)
  .pipe(
    tap(console.log),
    catchError(this.handleError)
  );

  filter$ = (status: Status, response: CustomResponse) => <Observable<CustomResponse>>
  new Observable<CustomResponse>(
    subscriber => {
      console.log(response);
      // Show something to whoever is subscribed to the observable.
      subscriber.next(
        status === Status.ALL 
        // send the same response but override the message
        ? { ...response, message: `Servers filtered by ${status} status` } 
        // send the same response but override the message and override the data after filtering.
        : { ...response, message: response.data.servers.filter(server => server.status === status).length > 0 
          ? `Servers filtered by ${status === Status.SERVER_UP ? 'SERVER_UP' : 'SERVER_DOWN'} status`
          : `No servers of ${status} found`,
        data: {
          servers: response.data.servers.filter(server => server.status === status)
        }}
      );
      // Tell the subsriber that we're done whatever we were trying to show.
      subscriber.complete();
    }
  )
  .pipe(
    tap(console.log),
    catchError(this.handleError)
  );

  delete$ = (serverId: number) => <Observable<CustomResponse>>this.http
  .delete<CustomResponse>(`${this.apiUrl}/server/delete/${serverId}`)
  .pipe(
    tap(console.log),
    catchError(this.handleError)
  );

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.log(error);
    return throwError(`An error occurred - Error code: ${error.status}`);
  }
}
