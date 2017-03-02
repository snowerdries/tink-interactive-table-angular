'use strict';
(function(module) {
  try {
    module = angular.module('tink.interactivetable');
  } catch (e) {
    module = angular.module('tink.interactivetable', ['tink.popover','tink.sorttable','tink.tooltip','tink.safeApply','tink.pagination']);
  }
  module.directive('tinkInteractiveTable',[function(){
    return{
      restrict:'EA',
      priority: 1500.1,
      replace:true,
      compile: function compile(tElement, tAttrs) {
        $(tElement.find('thead tr')[0]).prepend($('<th ng-if="(hasActions() && NotAllActionsAreVisibleAllTheTime()) || tinkShowCheckboxes" class="has-checkbox"><div class="checkbox"><input type="checkbox" ng-click="checkAll($event)" ng-class="{indeterminate:true}"  ng-checked="checked().length === tinkData.length" indeterminate id="{{$id}}-all" name="{{$id}}-all" value=""><label for="{{$id}}-all"></label></div></th>'));
        var td = $('<td ng-show="(hasActions() && NotAllActionsAreVisibleAllTheTime()) || tinkShowCheckboxes" ng-click="prevent($event)"><input type="checkbox" ng-change="checkChange(tinkData[$index])" ng-model="tinkData[$index].checked" id="{{$id}}-{{$index}}" name="{{$id}}-{{$index}}" value=""><label for="{{$id}}-{{$index}}"></label></td>');
        $(tElement.find('tbody tr')[0]).prepend(td);
        if(tAttrs.tinkHideBackgroundOfSelectedRows !== true && tAttrs.tinkHideBackgroundOfSelectedRows !== 'true'){
          $(tElement.find('tbody tr')[0]).attr('ng-class', '{\'is-selected\':tinkData[$index].checked}');
        }
        $(tElement.find('tbody')[0]).append('</tr><tr ng-show="!tinkLoading && (tinkData.length === 0 || tinkData === undefined || tinkData === null)"><td colspan="{{tinkHeaders.length+1}}">{{tinkEmptyMessage}}</td></tr>`');
        $(tElement.find('thead tr')[0]).find('th').each(function(index){
            if(index>0){
             $(this).attr('ng-if','tinkHeaders[$index].checked');
            }
          });

        tAttrs._tr = $(tElement.find('tbody tr')).clone();
        tAttrs._th = $(tElement.find('thead tr')).clone();
        return {
          post:function postLink(scope,attr){
            scope._tr = attr._tr;
          }
        };
      }
    };
  }]);
    module.controller('interactiveCtrl', ['$scope','$attrs','$element','$compile', function($scope,$attrs,$element,$compile) {
        var ctrl = this;

        ctrl.replaceBody = function(){
          //find the tbody and thead
          var tbody = $element.find('tbody');
          var thead = $element.find('thead');
          //clean the content
          tbody.html('');
          thead.html('');

          //add the needed class to the table
          $element.find('table').addClass('table-interactive');

         //clone the tr and th's we retrieved at the beginning (so the original wont be compiled)
         var trClone = $attrs._tr.clone();
         var thClone = $attrs._th.clone();

         //add the clones
         tbody.append(trClone);
         thead.append(thClone);

          tbody.find('tr:first td').each(function(index){
            if(index>0){
              if($scope.tinkHeaders && $scope.tinkHeaders[(index-1)]){
                $(this).attr('ng-if','tinkHeaders['+(index-1)+'].checked');
              }
            }
          });

        //compile the tbody and thead
          $compile(trClone)($scope);
          $compile(thClone)($scope);
        };

        $scope.prevent = function($event){
          $event.stopPropagation();
        };

        ctrl.changeColumn = function(a,b){
          a+=1;
          b+=1;
          ctrl.swapTds(a,b);
          ctrl.replaceBody($attrs._tr);
        };

        ctrl.swapTds = function(a,b){
          var td1 = $attrs._tr.find('td:eq('+a+')'); // indices are zero-based here
          var td2 = $attrs._tr.find('td:eq('+b+')');
          if(a < b){
            td1.detach().insertAfter(td2);
          }else if(a > b){
            td1.detach().insertBefore(td2);
          }
        };
      }]);
  module.directive('tinkInteractiveTable',['$compile','$rootScope','safeApply','$filter',function($compile,$rootScope,safeApply,$filter){
    return{
      restrict:'EA',
      transclude:true,
      priority: 1500,
      replace:true,
      scope:{
        tinkData:'=',
        tinkHeaders:'=',
        tinkActions:'=',
        tinkAllowColumnReorder:'=',
        tinkLoading:'=',
        tinkEmptyMessage:'@',
        tinkForceResponsive:'=',
        tinkChecked:'&',
        tinkShowCheckboxes:'=',
        tinkHideBackgroundOfSelectedRows:'=',
        tinkCtrl:'='
      },
      controller:'interactiveCtrl',
      templateUrl:'templates/interactive-table.html',
      compile: function compile() {

        return {
          post: function postLink(scope, iElement, iAttrs, controller) {

            scope.forceResponsive = function(){
              if(scope.tinkForceResponsive === true || scope.tinkForceResponsive === 'true'){
                return true;
              }
              return false;
            };

            if(scope.forceResponsive()) {
              iElement.find('table').wrap('<div class="table-force-responsive"></div>');
            }

            //compile all the stuff to get scope of interactive table
            $compile($(iElement.children()[1]).children())(scope);
            //change the content
            controller.replaceBody();

            /*stuff actions*/
            scope.actionConf = {};

            var breakpoint = {};
            //this function will see wich type of view we are
            breakpoint.refreshValue = function () {
              var screenSize = window.getComputedStyle(document.querySelector('body'), ':before').getPropertyValue('content').replace(/\'/g, '').replace(/\"/g, '');
              // if(screenSize !== 'widescreen-view'){
              //   scope.actionConf.tekst = false;
              // }else{
              //   scope.actionConf.tekst = true;
              // }
              if(screenSize === 'phone-view' || screenSize === 'tablet-view'){
                scope.actionConf.menu = true;
              }else{
                scope.actionConf.menu = false;
              }
            };

            //on resize check wich view we are
            function startResize() {
              $(window).bind('resize.tink',function () {
                safeApply(scope,function(){
                  breakpoint.refreshValue();
                });
              });
            }
            startResize();
            //when the directive start check for new view
            breakpoint.refreshValue();

            //watch on the tinkLoading
            var tinkLoad = scope.$watch('tinkLoading',function(newV){
              if(newV){
                iElement.find('table').addClass('is-loading');
               }else{
                iElement.find('table').removeClass('is-loading');
               }
            });


            /*end actions*/
            scope.selected = {value :-1};
            //If you select an other kolom name in de kolumn popup this function will be fired.
            scope.select = function(e,index){
              //Prevent the default to disable checkbox behaviour.
              e.preventDefault();
              //Changed the selected index.
              scope.selected.value = index;
            };
            scope.allChecked = false;

            function getDataWithNoAlwaysEnabledButtons(master){
              var data = [];
                for (var i = scope.tinkActions.length - 1; i >= 0; i--) {
                  if(scope.tinkActions[i] && scope.tinkActions[i].alwaysEnabled !== true && scope.tinkActions[i].master === master){
                    data.push(scope.tinkActions[i]);
                  }
                }
              return data;
            }

            scope.masterObject = function(){
              return getDataWithNoAlwaysEnabledButtons(true);
            };

            scope.subObject = function(){
              return getDataWithNoAlwaysEnabledButtons(false);
            };

            scope.actionCallBack = function(c){
              if(scope.checked().length !== 0 || c.alwaysEnabled === true){
                var array = $.grep(scope.tinkData, function( a ) {
                  return a.checked;
                });
                if(c.callback instanceof Function){
                  c.callback(array);
                }
              }
              scope.close();
            };

            scope.close = function(){
              $rootScope.$broadcast('popover-open', { group: 'option-table-2',el:$('<div><div>') });
            };

            scope.checkAll = function(){
              var checkAllArray = [];
              if(scope.tinkData){
                checkAllArray = $.grep(scope.tinkData, function( a ) {
                  return a.checked;
                });
              }

              if(checkAllArray.length === scope.tinkData.length){
                for (var i = 0, len = scope.tinkData.length; i < len; i++) {
                  scope.tinkData[i].checked = false;
                }
                scope.allChecked = false;
              }else{
                for (var j = 0, len1 = scope.tinkData.length; j < len1; j++) {
                  scope.tinkData[j].checked = true;
                }
                scope.allChecked = true;
              }

            };
            scope.checked = function(){
              if(scope.tinkData && scope.tinkData.length > 0) {
                return $.grep(scope.tinkData, function( a ) {
                  return a.checked;
                });
              }
              return [];
            };
            scope.checkChange = function(data){
              var checkChangeArray = $.grep(scope.tinkData, function( a ) {
                return a.checked;
              });
              if(scope.tinkChecked){
                scope.tinkChecked({$data:data,$checked:data.checked});
              }
              if(checkChangeArray.length === scope.tinkData.length){
                scope.allChecked = true;
              }else if(checkChangeArray.length === 0 ){
                scope.allChecked = false;
              }else{
                scope.allChecked = false;
              }
            };

            scope.$on('$destroy', function() {
                $(window).unbind('resize.tink');
                tinkLoad();
            });

            scope.elemDisabled = function(action){
              if(action){
                if(action.alwaysDisabled){
                  return true;
                }
                if(action.checkedAll){
                 if(scope.tinkData.length === scope.checked().length){
                    return false;
                  }else{
                    return true;
                  }
                }
                return (scope.checked().length === 0 || (action.single && scope.checked().length > 1)) && action.alwaysEnabled !== true;
              }
              return scope.checked().length === 0
            };

            scope.switchPosition = function(a,b){
              scope.tinkHeaders.move(a,b);
              controller.changeColumn(a,b);
            };

            scope.NotAllActionsAreVisibleAllTheTime = function(){
              return scope.tinkActions && $filter('filter')(scope.tinkActions, {alwaysEnabled: true}).length !== scope.tinkActions.length;
            };

            scope.MoreActions = function(){
              var moreArry = [];
              var notEnabled = $filter('tinkFilterFalse')(scope.tinkActions,{},'alwaysEnabled',false);
              var master = $filter('filter')(notEnabled, {master: true});
              var sub = $filter('filter')(notEnabled, {master: false});
              if(master && master.length> 5){
                moreArry =  master.slice(5);
                moreArry = moreArry.concat(sub);
              }else if(master && sub && (master.length + sub.length) > 5){
                return sub.slice(5-sub.length);
              }
              return moreArry;
            };

            scope.hasActions = function(){
              if(scope.tinkActions !== undefined || scope.tinkActions !== null){
                if(scope.tinkActions instanceof Array && scope.tinkActions.length > 0){
                  return true;
                }
              }

              return false;
            };

            //function will be called when pressing arrow for order change
            scope.arrowUp = function(){
              if(scope.selected.value > 0){
                scope.switchPosition(scope.selected.value,scope.selected.value-1);
                scope.selected.value-=1;
              }
            };
            //function will be called when pressing arrow for order change
            scope.arrowDown = function(){
              if(scope.selected.value < scope.tinkHeaders.length-1){
                scope.switchPosition(scope.selected.value,scope.selected.value+1);
                scope.selected.value+=1;
              }
            };

            //added this to swap elements easly
            Array.prototype.swap = function(a, b) {
              var temp = this[a];
              this[a] = this[b];
              this[b] = temp;
            };
            Array.prototype.move = function (oldIndex, newIndex) {
                if (newIndex >= this.length) {
                    var k = newIndex - this.length;
                    while ((k--) + 1) {
                        this.push(undefined);
                    }
                }
                this.splice(newIndex, 0, this.splice(oldIndex, 1)[0]);
                return this; // for testing purposes
            };

          }
        };
      }
    };
  }])
.filter('tinkActionFilter',['$filter',function($filter) {

  // In the return function, we must pass in a single parameter which will be the data we will work on.
  // We have the ability to support multiple other parameters that can be passed into the filter optionally
  return function(input, optional1, optional2) {

    if(!input){
      return [];
    }

    var data = [];
    for (var i = input.length - 1; i >= 0; i--) {
      if(input[i] && input[i].alwaysEnabled !== true){
        data.push(input[i]);
      }
    }
    data.reverse();
    var master = $filter('filter')(optional1, {master: true});
    if(!master){
      return [];
    }

    if(optional2 === 'master'){
      if(master.length < 5){
        return data;
      }else{
        return data.slice(0,5);
      }
    }else{
      if(master.length >=5){
        return [];
      }else{
        return data.slice(0,5-master.length);
      }
    }
  };

}])
.filter('tinkFilterFalse',['$filter',function($filter) {

  // In the return function, we must pass in a single parameter which will be the data we will work on.
  // We have the ability to support multiple other parameters that can be passed into the filter optionally
  return function(input, optional1, optional2,optinal3) {

    if(optinal3 !== false || optinal3 !== true){
      optinal3 = true;
    }

    var newInput = $filter('filter')(input,optional1),
    data = [];
    if(newInput && newInput.length > 0){
      for (var i = newInput.length - 1; i >= 0; i--) {
        if(newInput[i] && newInput[i][optional2] !== optinal3){
          data.push(newInput[i]);
        }
      }
    }


    if(data.length <=0){
      return [];
    }

    return data;

  };

}])
.filter('tinkSlice', function() {
  return function(arr, start) {
    return (arr || []).slice(start);
  };
})
.directive('tinkShiftSort',['$timeout',function(timeout){
  return {
    restrict:'A',
    controller:'interactiveCtrl',
    link:function(scope,elem){
      timeout(function(){
        Sortable.create(elem.find('ul').get(0),{
          ghostClass: 'draggable-placeholder',
          animation: 200,
          handle:'.draggable-elem',
          onStart: function () {
             scope.$apply(function(){
             // scope.selected.value = evt.oldIndex;
            });
          },
          onUpdate: function (evt) {
            scope.$apply(function(){
              var oldIndex = evt.oldIndex;
              var newIndex = evt.newIndex;
              scope.selected.value = evt.newIndex;
              scope.switchPosition(oldIndex,newIndex);

            });
          },
        });
      },200);
    }
  };
}]);
})();
