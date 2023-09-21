# Notes

To write a service class use the command:

```shell
ng g service service/server
```

- `g` is short for generate.
- `service/` is the destination folder where this service file will be saved.
- `server` is the name of the service class.

This command will create the main file as well as the test file.

---

To mark an observable, write the variable name and append `$` sign at the end.

Example: `servers$`

To integrate notification functionality into our angular application: 

- [angular-notifier](https://www.npmjs.com/package/angular-notifier)
- Install angular-notifier: `npm install angular-notifier`


## Why did we go for Reactive Approach rather than Procedural Approach ?

In addition to advantages of not having to subscibe and unsubscribe in the components, we also have **performance advantage**.

Angular, behind the scenes, does something called *Change Detection Strategies*.

### Procedural Approach

This is the DEFAULT.

- Angular uses **Check Always** strategy which is always going to check for changes in a component and then update the UI appropriately.

- Angular also looks for any change in all our components for everything that is valid in the UI and then update everything appropriately in case there is a change in the component.

### Reactive Approach

When we use Reactive Approach, we have the option to opt for **On Push** strategy. With this strategy  is only going to do something:

- Whene there is an input change. Like there could be any change in a property of the class.

OR

- When we are using an emitter and an event occurs when that event is emitted.

OR

- When we are using *observable*s and an event occurs when that observable emits.

#### Performance Advantage

Now, because we are only using observable and we are subscribing in the template using the `async` pipe, we can actually improve our entire application performance by using the On-Push change detection strategy.

