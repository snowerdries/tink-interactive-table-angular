'use strict';
(function(module) {
  try {
    module = angular.module('tink.interactivetable');
  } catch (e) {
    module = angular.module('tink.interactivetable', ['tink.popover','tink.sorttable','ngLodash']);
  }
  module.directive('tinkPagination',['lodash',function(_){
  return{
    restrict:'EA',
    templateUrl:'templates/pagination.html',
    scope:{
      tinkTotalItems:'=',
      tinkItemsPerPage:'=',
      tinkItemsPerPageValues:'=',
      tinkCurrentPage:'=',
      tinkChange:'=',
      tinkPaginationId:'@'
    },
    controllerAs:'ctrl',
    controller:['$scope','$rootScope','$timeout',function($scope,$rootScope,timeout){
      var ctrl = this;

      //ctrl.init = function(){
        /*ctrl.tinkTotalItems = $scope.tinkTotalItems;
        $scope.tinkItemsPerPage = $scope.tinkItemsPerPage;
        $scope.tinkItemsPerPageValues = $scope.tinkItemsPerPageValues;
        $scope.tinkCurrentPage =  $scope.tinkCurrentPage;
      //}*/
      ctrl.itemsPerPage = function(){
        if($scope.tinkItemsPerPageValues && $scope.tinkItemsPerPageValues instanceof Array && $scope.tinkItemsPerPageValues.length >0){
          if($scope.tinkItemsPerPageValues.indexOf(parseInt($scope.tinkItemsPerPage)) === -1){
            $scope.tinkItemsPerPage = $scope.tinkItemsPerPageValues[0];
          }
          return $scope.tinkItemsPerPageValues;
        }else{
          var basic = [5,10,20,30];
          if(basic.indexOf(parseInt($scope.tinkItemsPerPage)) === -1){
            $scope.tinkItemsPerPage = basic[0];
          }
          return basic;
        }
      };

      ctrl.perPageChange = function(){
        $rootScope.$broadcast('tink-pagination-'+$scope.tinkPaginationId,'loading');
        timeout(function(){
          $scope.tinkChange({type:'perPage',value:$scope.tinkItemsPerPage},function(){
            $rootScope.$broadcast('tink-pagination-'+$scope.tinkPaginationId,'ready');
          });
        },0);
      };

      ctrl.setPage = function(page){
        $scope.tinkCurrentPage = page;
        sendMessage();
      };


      ctrl.setPrev = function(){
        if($scope.tinkCurrentPage > 1){
          $scope.tinkCurrentPage = $scope.tinkCurrentPage -1;
        }
        sendMessage(); 
      };

      ctrl.setNext = function(){
        if($scope.tinkCurrentPage < ctrl.pages){
          $scope.tinkCurrentPage = $scope.tinkCurrentPage +1;
        }
        sendMessage(); 
      };

      function sendMessage(){
        $rootScope.$broadcast('tink-pagination-'+$scope.tinkPaginationId,'loading');
        timeout(function(){
          $scope.tinkChange({type:'page',value:$scope.tinkCurrentPage},function(){
            $rootScope.$broadcast('tink-pagination-'+$scope.tinkPaginationId,'ready');
          });
        },0);
      }

      ctrl.calculatePages = function(){
        var num = $scope.tinkCurrentPage;
        ctrl.pages = Math.ceil($scope.tinkTotalItems/$scope.tinkItemsPerPage);
        if(ctrl.pages <=0 || ctrl.pages === undefined || ctrl.pages === null || isNaN(ctrl.pages)){
          ctrl.pages = 1;
        }

        if(num > ctrl.pages){
          num = $scope.tinkCurrentPage = ctrl.pages;
        }else if(num <=0 || num === undefined || num === null){
          $scope.tinkCurrentPage = 1;
        }

        var arrayNums;
        if(ctrl.pages <6){
          arrayNums = _.range(2,ctrl.pages);
        }else{
          if(num < 4){
            arrayNums = _.range(2,4);
            arrayNums.push(-1);
          }else if(num >= ctrl.pages -2){
            arrayNums = [-1].concat(_.range(ctrl.pages-2,ctrl.pages));
          }else{
            arrayNums = [-1,num,-1];
          }
        }
        if(ctrl.pages >1 ){
          arrayNums.push(ctrl.pages);
        }
        return arrayNums;
      };

    }]
  };
  }]).filter('limitNum', [function() {
   return function(input, limit) {
      if (input > limit) {
          return limit;
      }
      return input;
   };
  }])
  .filter('tinkMin', [function() {
   return function(input, limit) {
    if(limit === undefined){
      limit = 0;
    }
      if (input < limit) {
          return limit;
      }
      return input;
   };
  }]).directive('tinkPaginationKey',['$rootScope',function(rootScope){
    return {
      link:function($scope,element,attrs){
        
        rootScope.$on('tink-pagination-'+attrs.tinkPaginationKey,function(e,value){

          if(value === 'loading'){
            $(element).find('table.table-interactive').addClass('is-loading');
          }else if(value === 'ready'){
            $(element).find('table.table-interactive').removeClass('is-loading'); 
          }
          
        });

      }
    };

  }]);
})();
;'use strict';
(function(module) {
  try {
    module = angular.module('tink.interactivetable');
  } catch (e) {
    module = angular.module('tink.interactivetable', ['tink.popover','tink.sorttable','ngLodash']);
  }
  module.directive('tinkInteractiveTable',['$compile','$rootScope','$filter',function($compile,$rootScope,$filter){
  return{
    restrict:'EA',
    templateUrl:'templates/reorder.html',
    scope:{
      ngModel:'=',
      tinkHeaders:'=',
      tinkActions:'=',
      tinkForceResponsive:'=',
      tinkColumnReorder:'=',
      tinkRowClick:'&',
      tinkChange:'&',
      tinkEmptyMessage:'@'
    },
    link:function(scope,element){
      scope.checkB = [];

      var currentSort = {field:null,order:null};

      scope.hasAction = function(){
        if(scope.viewActions && scope.viewActions instanceof Array && scope.viewActions.length > 0){
          return true;
        }
          return false;
      };
      scope.hasReorder = function(){
        if(scope.tinkColumnReorder === false || scope.tinkColumnReorder === 'false'){
          return false;
        }
        return true;
      };
      scope.forceResponsive = function(){
        if(scope.tinkForceResponsive === true || scope.tinkForceResponsive === 'true'){
          return true;
        }
        return false;
      };

        scope.buildTable = function(){
          if(scope.ngModel){
            changeAction();
            var tableEl = element.find('table');
            //Create a new table object
            var table = document.createElement('table');
            $(tableEl).addClass('table-interactive');
            $(tableEl).attr('tink-callback','sortHeader($property,$order,$type)');

            createHeaders(table,scope.tinkHeaders);
            //create the body of the table
            createBody(table,scope.ngModel);

            scope.checkB = scope.createArray(scope.ngModel.length);
            fullChecked();

            tableEl.children('thead').html($(table).children('thead').children());
            tableEl.children('tbody').html($(table).children('tbody').children());
            $compile(tableEl.children('thead'))(scope);
            $compile(tableEl.children('tbody'))(scope);
          }
        };

        function createCheckbox(row,i,hulp){
        if(!hulp){
          hulp ='';
        }
        var random = Math.random().toString(36).substring(7);
        var checkbox = '<div class="checkbox">'+
                          '<input type="checkbox" ng-change="checkChange('+row+')" ng-model="checkB['+row+']._checked" id="'+random+row+'" name="'+random+row+'" value="'+row+'">'+
                          '<label for="'+random+row+'"></label>'+
                        '</div>';
        return checkbox;
      }

        function createBody(table,content){
          if(scope.tinkHeaders instanceof Array && content instanceof Array){
            var body = table.createTBody();
            for(var i=scope.tinkHeaders.length-1;i>=0;i--){
              for(var j=0;j<content.length;j++){
                var row;
                if(body.rows[j]){
                  row = body.rows[j];
                  //row
                }else{
                  row = body.insertRow(j);
                  //If we have action add a checkbox.
                  $(row).attr('ng-click','rowClick('+j+')');
                  if(scope.hasAction()){
                    var check = row.insertCell(0);
                    check.innerHTML = createCheckbox(j, j);
                    $(check).attr('ng-click', 'preventEvent($event)');
                  }
                }
                var fieldExpression = scope.tinkHeaders[i].field;
                var fieldNames = scope.tinkHeaders[i].field.split('+');
                angular.forEach(fieldNames, function (fieldName) {
                    fieldName = fieldName.trim();
                    if (fieldName.indexOf('"') < 0) {
                        var splittedFieldNames = fieldName.split('.');
                        var fieldValue = content[j];
                        angular.forEach(splittedFieldNames, function (splittedFieldName) {
                            fieldValue = fieldValue[splittedFieldName];
                        });
                        if (fieldValue === null || fieldValue === undefined) {
                        	fieldExpression = fieldExpression.replace(fieldName, '"-"');
                        }
                        else {
                        	fieldExpression = fieldExpression.replace(fieldName, '"' + fieldValue + '"');
                        }
                    }
                });
                /*jshint -W061 */
                var fieldValueComplete = eval(fieldExpression);
                var cell;
                if (scope.hasAction()) {
                    cell = row.insertCell(1);
                } else {
                    cell = row.insertCell(0);
                }
                $(cell).attr('ng-if', 'tinkHeaders[' + i + '].checked');
                if (scope.tinkHeaders[i].filter) {
                    cell.innerHTML = $filter(scope.tinkHeaders[i].filter)(fieldValueComplete, scope.tinkHeaders[i].filterArg);
                }
                else {
                    cell.innerHTML = fieldValueComplete;
                }
              }
            }
          }
        }

        function changeAction(){
          if(scope.tinkActions instanceof Array){
            scope.viewActions = [];
            for(var i=0;i<scope.tinkActions.length;i++){
              var action = scope.tinkActions[i];
              scope.viewActions.push({name:action.name,callback:function(){
                var checked = [];
                for(var i=0;i<scope.ngModel.length;i++){
                  if(scope.checkB[i] && scope.checkB[i]._checked===true){
                    checked.push(scope.ngModel[i]);
                  }
                }
                scope.close();
                action.callback(checked,uncheckAll);
              }});
            }
          }
        }

        scope.rowClick=function(i){
          scope.tinkRowClick.call(null,{$element:scope.ngModel[i]});
        };

        scope.preventEvent = function (event) {
            event.stopPropagation();
        };

        function createHeaders(tableEl,headers){
          if(scope.tinkHeaders instanceof Array && headers instanceof Array){
            var header = tableEl.createTHead();
            var row = header.insertRow(0);

            if(scope.hasAction()){
              var thCheck = document.createElement('th');
              thCheck.setAttribute('class', 'has-checkbox');
              thCheck.innerHTML = createCheckbox(-1,-1,'hulp');
              row.appendChild(thCheck);
            }

            for(var i=0;i<headers.length;i++){
              //take alias of field of the headers
              var val = headers[i].alias || headers[i].field;
              var th = document.createElement('th');
              th.innerHTML = val;
              $(th).attr('ng-if','tinkHeaders['+i+'].checked');
              if(headers[i].sort){
                $(th).attr('tink-sort-header',headers[i].field);
              }

              row.appendChild(th);
            }
          }
        }

        scope.sortHeader = function(field,order,type){
          currentSort = {};
          currentSort.field = field;
          currentSort.type = type;
          currentSort.order = order;
          scope.tinkChange({$property:field,$order:order,$type:type});
        };

        function fullChecked(){
          var length = 0;
          for(var i=0;i<scope.ngModel.length;i++){
            if(scope.checkB[i] && scope.checkB[i]._checked){
                length+=1;
              }
            }
            if(!scope.checkB[-1]){
              scope.checkB[-1] = {};
            }
            if(length !== 0){
              scope.selectedCheck = true;
            }else{
              scope.selectedCheck = false;
            }
            if(length === scope.ngModel.length){
              scope.checkB[-1]._checked = true;
            }else{
              scope.checkB[-1]._checked = false;
            }
        }

        function uncheckAll(){
          for(var i=0;i<scope.ngModel.length;i++){
            if(scope.checkB[i] && scope.checkB[i]._checked===true){
              scope.checkB[i]._checked = false;
            }
          }
          if(scope.checkB[-1]){
              scope.checkB[-1]._checked = false;
            }
        }

        scope.createArray = function(num){
          var array = [];
          for(var i=0;i<num;i++){
            array[i] = {};
          }
          return array;
        };

        scope.checkChange = function(i){
          if(i === -1){
            var check = scope.checkB[-1]._checked;
            angular.forEach(scope.checkB,function(val){
              val._checked = check;
              scope.selectedCheck = check;
            });
          }else{
            if(scope.checkB[-1]){
              scope.checkB[-1]._checked = false;
            }
            fullChecked();
          }
        };

        //function will be called when pressing arrow for order change
        scope.arrowUp = function(){
          if(scope.selected > 0){
            scope.tinkHeaders.swap(scope.selected,scope.selected-1);
            scope.selected-=1;
            scope.buildTable();
          }
        };
        //function will be called when pressing arrow for order change
        scope.arrowDown = function(){
          if(scope.selected < scope.tinkHeaders.length-1){
            scope.tinkHeaders.swap(scope.selected,scope.selected+1);
            scope.selected+=1;
            scope.buildTable();
          }
        };

        scope.close = function(){
          $rootScope.$broadcast('popover-open', { group: 'option-table',el:$('<div><div>') });
        };

        //If you check/uncheck a checbox in de kolom popup this function will be fired.
        scope.headerChange = function(){
          scope.buildTable();
        };
        //If you select an other kolom name in de kolumn popup this function will be fired.
        scope.select = function(e,index){
          //Prevent the default to disable checkbox behaviour.
          e.preventDefault();
          //Changed the selected index.
          scope.selected = index;
        };

        scope.$watch('ngModel',function(){
          scope.buildTable();
        },true);

        //added this to swap elements easly
        Array.prototype.swap = function(a, b) {
          var temp = this[a];
          this[a] = this[b];
          this[b] = temp;
        };
    }
  };
  }]).directive('tinkShiftSort',['$timeout',function(timeout){
  return {
    restirct:'A',
    link:function(scope,elem){
      timeout(function(){
        Sortable.create(elem.find('ul').get(0),{
          ghostClass: 'draggable-placeholder',
          animation: 200,
          handle:'.draggable-elem',
          onStart: function (evt) {
             scope.$apply(function(){
              scope.selected = evt.oldIndex;
            });
          },
          onUpdate: function (evt) {
            scope.$apply(function(){
              var old = scope.tinkHeaders[evt.oldIndex];
              scope.tinkHeaders.splice(evt.oldIndex, 1);
              scope.tinkHeaders.splice(evt.newIndex, 0,old);
              scope.selected = evt.newIndex;
              scope.buildTable();
            });
          },
        });
      },200);
    }
  };
}]);
})();

;angular.module('tink.interactivetable').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/pagination.html',
    "<div class=table-sort-options> <div class=table-sort-info> <strong>{{tinkItemsPerPage*(tinkCurrentPage-1)+1 | tinkMin:1}} - {{tinkItemsPerPage*tinkCurrentPage | limitNum:tinkTotalItems | tinkMin:tinkItemsPerPage}}</strong> van {{tinkTotalItems}} <div class=select> <select data-ng-change=ctrl.perPageChange() data-ng-model=tinkItemsPerPage> <option data-ng-repeat=\"items in ctrl.itemsPerPage()\">{{items}}</option> </select> items per pagina </div> </div> <div class=table-sort-pagination> <ul class=pagination> <li class=prev data-ng-class=\"{disabled:tinkCurrentPage===1}\" data-ng-click=\"tinkCurrentPage===1 || ctrl.setPrev()\" ng-disabled=\"tinkCurrentPage===1\"><a href=\"\"><span>Vorige</span></a></li> <li data-ng-class=\"{active:tinkCurrentPage===1}\" data-ng-click=ctrl.setPage(1)><a href=\"\">1</a></li> <li data-ng-repeat=\"pag in ctrl.calculatePages() track by $index\" data-ng-class=\"{active:pag===tinkCurrentPage}\" data-ng-click=\"pag === -1 || ctrl.setPage(pag)\"><a href=\"\" data-ng-if=\"pag !== -1\">{{pag}}</a> <span data-ng-show=\"pag === -1\">...<span></span></span></li> <li class=next data-ng-click=\"tinkCurrentPage===ctrl.pages || ctrl.setNext()\" data-ng-class=\"{disabled:tinkCurrentPage===ctrl.pages}\" ng-disabled=\"tinkCurrentPage===ctrl.pages\"><a href=\"\"><span>Volgende</span></a></li> </ul> </div> </div>"
  );


  $templateCache.put('templates/reorder.html',
    " <div class=bar> <div class=bar-section>  <ul class=bar-section-right> <li> <button data-ng-if=\"hasAction() && selectedCheck\" tink-popover tink-popover-group=option-table tink-popover-template=templates/tinkTableAction.html>Acties <i class=\"fa fa-caret-down\"></i></button> </li> <li> <button data-ng-if=hasReorder() tink-popover tink-popover-group=option-table tink-popover-template=templates/tinkTableShift.html>Kolommen <i class=\"fa fa-caret-down\"></i></button> </li> </ul> </div> </div>  <table id=theInteractiveTable tink-sort-table=ngModel tink-sort=false tink-callback=sortHeader($property,$order,$type) class=table-interactive tink-pagination-key=directivePag data-ng-class=\"{'table-force-responsive': forceResponsive()}\"> <thead> </thead> <tbody> </tbody> </table> <div data-ng-if=\"ngModel.length === 0\" class=table-message>{{tinkEmptyMessage}}</div> "
  );


  $templateCache.put('templates/tinkTableAction.html',
    "<ul class=\"popover-list-buttons ng-scope\"> <li data-ng-repeat=\"action in viewActions\"><a href=\"\" data-ng-click=action.callback()>{{action.name}}</a></li> </ul>"
  );


  $templateCache.put('templates/tinkTableShift.html',
    "<div class=table-interactive-options tink-shift-sort>  <div class=table-interactive-sort> <button class=btn-borderless ng-disabled=\"selected<1\" ng-click=arrowUp()><i class=\"fa fa-arrow-up\"> </i></button>\n" +
    "<button class=btn-borderless ng-disabled=\"selected<0 || selected === headers.length-1\" ng-click=arrowDown()><i class=\"fa fa-arrow-down\"></i></button> </div>  <ul ng-model=tinkHeaders class=table-interactive-cols> <li ng-repeat=\"header in tinkHeaders\"> <div class=\"checkbox is-selectable is-draggable\" ng-class=\"{selected:selected===$index}\"> <input type=checkbox ng-model=header.checked id={{header.alias}} name={{header.alias}} value={{header.alias}} checked> <label for={{header.alias}}><span class=draggable-elem ng-class=\"{selected:selected===$index}\" ng-click=select($event,$index)>{{header.alias}}</span></label> </div> </li> </ul> <div class=table-interactive-sort>  <button class=btn-xs ng-click=close()>Sluiten</button> </div> </div>"
  );

}]);
