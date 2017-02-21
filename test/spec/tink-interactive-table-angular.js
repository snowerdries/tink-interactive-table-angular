'use strict';
describe('tink-interactive-table-angular', function() {

  var bodyEl = $('body'), sandboxEl;
  var $compile, $templateCache, scope;

  beforeEach(module('tink.interactivetable'));
  beforeEach(module('templates'));

  beforeEach(inject(function (_$rootScope_, _$compile_, _$templateCache_) {
    scope = _$rootScope_.$new();
    $compile = _$compile_;
    $templateCache = _$templateCache_;
    bodyEl.html('');
    sandboxEl = $('<div>').attr('id', 'sandbox').appendTo(bodyEl);

     var template = $templateCache.get('src/templates/interactive-table.html');
        $templateCache.put('templates/interactive-table.html',template);
        template = $templateCache.get('src/templates/actions.html');
        $templateCache.put('templates/actions.html',template);
        template = $templateCache.get('src/templates/columns.html');
        $templateCache.put('templates/columns.html',template);
      }));

  afterEach(function() {
    scope.$destroy();
    sandboxEl.remove();
  });

  function compileDirective(template, locals) {
    template = templates[template];
    angular.extend(scope, angular.copy(template.scope || templates['default'].scope), locals);
    var element = $(template.element).appendTo(sandboxEl);
    element = $compile(element)(scope);
    scope.$digest();
    return jQuery(element[0]);
  }

  var templates = {
    'default': {
      scope: {},
      element: '<tink-interactive-table tink-actions="actions" class="table-interactive" tink-checked="boxChecked($data,$checked)" tink-loading="ct.loading" tink-headers="headers" tink-data="data.content" tink-empty-message="Geen resultaten">'+
                '<table tink-sort-table="data.content" tink-callback="sorted($property,$order,$type)" tink-asc="ctrl.asc" tink-sort-field="firstname">'+
                  '<thead>'+
                    '<tr>'+
                      '<th ng-repeat="view in tinkHeaders" tink-sort-header="{{view.sort}}">{{ view.alias }}</th>'+
                    '</tr>'+
                  '</thead>'+
                  '<tbody>'+
                    '<tr ng-click="$parent.$parent.load()" ng-repeat="view in tinkData">'+
                      '<td>{{ view.firstname | date:"dd/MM/yyyy" }}</td>'+
                      '<td>{{ view.lastname }}</td>'+
                      '<td>{{ view.username }}</td>'+
                    '</tr>'+
                  '</tbody>'+
                '</table>'+
                  '<tink-pagination  tink-current-page="$parent.ct.nums" tink-change="$parent.changed(type,value,next)" tink-total-items="$parent.ct.totalitems" tink-items-per-page="$parent.ct.numpp"></tink-pagination>'+
                '</tink-interactive-table>'}
  };


  describe('default', function() {
    it('should run master',function(){
      var actions = [{
           name: 'Verwijderen', // the name of the actions
           callback: function (items) {
               // here you are going to write what happen when they clicked on the button.
               // The items variable contains the items that are checked.
           },
           order: 0, // The order the button is viewed in the bar
           master: true, // If the button is a master button or not ! this value is required.
           icon: 'fa-remove' // The icon ('font-awesome') thats going to be showed. this is required !
       }];

       function createArray(num){
        var action = [];
        for (var i=0; i <num; i++) {
          action.push({
             name: 'Verwijderen'+i, // the name of the actions
             callback: function (items) {
                 // here you are going to write what happen when they clicked on the button.
                 // The items variable contains the items that are checked.
             },
             order: 0, // The order the button is viewed in the bar
             master: true, // If the button is a master button or not ! this value is required.
             icon: 'fa-remove' // The icon ('font-awesome') thats going to be showed. this is required !
         });
        };
        return action;
       }

      
      for(var i=0;i<6;i++){
        var element = compileDirective('default',{actions:createArray(i+1)});
        var elements = element.find('.bar.table-interactive-bar li button span');
        var arrayActions = [];
        elements.each(function(index){
          arrayActions.push($(this).html());
        });
        expect(arrayActions.length).toBe(i+1);
      }
    });
  });


});