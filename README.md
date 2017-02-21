# Tink interactive table Angular directive

v3.1.0

## What is this repository for?

The Tink Angular interactive table provides with a table on steroids.

Tink is an in-house developed easy-to-use front-end framework for quick prototyping and simple deployment of all kinds of websites and apps, keeping a uniform and consistent look and feel.

## Setup

### Prerequisites

* nodeJS [http://nodejs.org/download/](http://nodejs.org/download/)
* bower: `npm install -g bower`

### Install

1. Go to the root of your project and type the following command in your terminal:

   `bower install tink-interactive-table-angular --save`

2. Add the following files to your project:

   `<link rel="stylesheet" href="bower_components/tink-core/dist/tink.css" />` (or one of the Tink themes)

   `<script src="bower_components/tink-interactive-table-angular/dist/tink-interactive-table-angular.js"></script>`

   `<script src="bower_components/ng-lodash/build/ng-lodash.js"></script>`

   `<script src="bower_components/Sortable/Sortable.js"></script>`

   `<script src="bower_components/tink-popover-angular/dist/tink-popover-angular.js"></script>`

   `<script src="bower_components/tink-helper-safe-apply-angular/dist/tink-helper-safe-apply-angular.js"></script>`

   `<script src="bower_components/tink-tooltip-angular/dist/tink-tooltip-angular.js"></script>`

   `<script src="bower_components/tink-sort-table-angular/dist/tink-sort-table-angular.js"></script>`

3. Add `tink.interactivetable` to your app module's dependency.

   `angular.module('myApp', ['tink.interactivetable']);`



----------



## How to use

### tink-interactive-table

```html
<tink-interactive-table></tink-interactive-table>
```

### Options

Attr | Type | Default | Details
--- | --- | --- | ---
data-ng-model (required) | `array` | `undefined` | The table info that needs to be shown.
data-tink-headers (required) | `array` | `undefined` | The header information for each column.
data-tink-actions | `array` | `undefined` | When present checkboxes will appear to do some predefined actions with it.
data-tink-checked | `function($data,$checked)` | `undefined` | will be called when you check a checkbox.
data-tink-loading | `Boolean` | `false` | If true the table will have a loading icon and rows won't be clickable.
data-tink-empty-message | `string` | `` | This will the message that will be shown when there is no data.
data-tink-force-responsive | `Boolean` | `false` | This will add a responsive wrapper class (`.table-force-responsive`) when true.

### Script example

```html
<tink-interactive-table tink-checked="boxChecked($data,$checked)" tink-loading="ct.loading" tink-headers="headers" tink-data="data.content" tink-actions="actions" tink-empty-message="het is leeg">
 <table>
    <thead>
      <tr>
        <th ng-repeat='view in tinkHeaders'>{{ view.alias }}</th>
      </tr>
    </thead>
    <tbody>
      <tr ng-click="$parent.$parent.load()" ng-repeat='view in tinkData'>
        <td>{{ view.firstname | date:'dd/MM/yyyy' }}</td>
        <td>{{ view.lastname }}</td>
        <td>{{ view.username }}</td>
      </tr>
    </tbody>
  </table>

  <tink-pagination  tink-current-page="$parent.ct.nums" tink-change="$parent.changed(type,value,next)" tink-total-items="$parent.ct.totalitems" tink-items-per-page="$parent.ct.numpp"></tink-pagination>
</tink-interactive-table>
```

```javascript
    scope.data = [
      {
        firstname: 'Jasper',
        lastname: 'Van Proeyen',
        username: '@trianglejuice'
      },
      {
        firstname: 'Tom',
        lastname: 'Wuyts',
        username: '@pxlpanic'
      },
      {
        firstname: 'Kevin',
        lastname: 'De Mulder',
        username: '@clopin'
      },
      {
        firstname: 'Vincent',
        lastname: 'Bouillart',
        username: '@BouillartV'
      }
    ];
```

> If you want to **hide a column** give the header a **property** `checked` with the value `false`.

```javascript
scope.headers = [
      {
        field: 'firstname',
        alias: 'Voornaam',
        checked: true, //to show this header or not required
        disabled:true, // can't change the checked value
      },
      {
        field: 'lastname',
        alias: 'Achternaam',
        checked: false
      },
      {
        field: 'username',
        alias: 'Gebruikersnaam',
        checked: true
      }
    ];
```

> To **add action** create an array with objects with a `name` property and a `callback` function. This callback function will be called when this action is used. The function will give you an array of items that is selected. The function will also give you a function as a parameter to uncheck all the checkboxes.

```javascript
   scope.actions = [
      {
          name: 'remove',
          callback: function(items) {
            angular.forEach(items, function(val) {
              scope.data.content.splice(scope.data.content.indexOf(val),1);
            });
          },
          order:0, //orde of the button
          master:true, //required !
          icon:'fa-close', //the icon required.
          single:true // only when one checkbox is selected
        }
    ];
```



----------



### tink-pagination

```html
<tink-pagination></tink-pagination>
```

### Options

Attr | Type | Default | Details
--- | --- | --- | ---
data-tink-pagination-id (required) | `string` | `''` | An id that specifies to which table it belongs.
tink-current-page (required) | `number` | `undefined` | The number of the current page.
tink-total-items (required) | `number` | `undefined` | Total number of items you want to show.
tink-items-per-page (required) | `number` | `undefined` | How many items you want to show!
tink-items-per-page-values (required) | `array` | `undefined` | Array of numbers that will be shown as per page value.
tink-change | `function` | `undefined` | To receive information if the pagination or perPage value change!


```javascript
 scope.changed = function(chaged,next){
  /* changed will give you an  object if the page or peerage is changed.
  * {type:'page',value:2}
  * {type:'perPage',value:20}
  * If you do not change the data ! use next();
  */
 }
```

###Example

A working example can be found in [the Tink documentation](http://tink.digipolis.be/#/docs/directives/interactive-table#example).

## Contribution guidelines

* If you're not sure, drop us a note
* Fork this repo
* Do your thing
* Create a pull request

## Who do I talk to?

* Jasper Van Proeyen - jasper.vanproeyen@digipolis.be - Lead front-end
* Tom Wuyts - tom.wuyts@digipolis.be - Lead UX
* [The hand](https://www.youtube.com/watch?v=_O-QqC9yM28)
