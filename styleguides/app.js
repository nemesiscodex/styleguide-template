(function(){
  angular.module('styleguides', [])
    .directive('mainMenu', function(){
      return {
        scope: {
          categories: '=',
          callback: '='
        },
        templateUrl: 'styleguides/mainMenu.template.html'
      };
    })
    .directive('categoryElement', function(){
      var uniqueId = 1;
      return {
        scope: {
          element: '='
        },
        templateUrl: 'styleguides/categoryElement.template.html',
        link: function(scope, element, attr){
          scope.element.basecss = scope.element.basecss || [];
          scope.element.basejs =  scope.element.basejs || [];
          scope.element.css = scope.element.css || [];
          scope.element.js =  scope.element.js || [];

          var cssFiles, jsFiles;
          var $css, $js;
          var $iContent = $(element).find('iframe').contents();
          var $head = $iContent.find('head')
          var $body = $iContent.find('body');
          scope.element.id = uniqueId++;
          //load css files
          cssFiles = scope.element.css = [].concat(scope.element.css);
          scope.element.basecss = [].concat(scope.element.basecss);
          cssFiles = scope.element.basecss.concat(cssFiles);
          for(var i = 0; i < cssFiles.length; i++){
            $css = $('<link rel="stylesheet" type="text/css">');
            $css.attr('href', cssFiles[i]);
            $head.append($css);
          }



          //load js
          jsFiles = scope.element.js = [].concat(scope.element.js);
          scope.element.basejs = [].concat(scope.element.basejs);
          jsFiles = scope.element.basejs.concat(jsFiles);

          scope.tab = function($event){
            var $el = $($event.target);
            $(element).find('[data-tab]').removeClass('active');
            $('[data-tab=' + $el.data('tab') + ']').addClass('active');
          };
          scope.filename = function(name){
            if(!name){
              return '<empty>';
            }
            var ret = name.split('/');
            return ret[ret.length - 1];
          };

          //load html
          $body.load(scope.element.html, function(){
            console.log(jsFiles);

            for(var i = 0; i < jsFiles.length; i++){
              $js = $('<script>');
              $js.attr('src', jsFiles[i]);
              $body.append($js);
            }


            setTimeout(function () {
              $(element).find('iframe').css('height', 'calc(20px + ' + $body.css('height') + ')');
              $(element).find('[data-load]').each(function(_, el){
                var $el = $(el);
                $el.load($el.data('load'), function(){
                  var $code = $('<div>').text($el.html());
                  $el.html($code);
                  scope.$digest();
                  $el.each(function(i, block) {
                    hljs.highlightBlock(block);
                  });
                });
              })
            });

          });



        }
      };
    })
    .directive('categoryPage', function(){
      return {
        scope: {
          category: '='
        },
        templateUrl: 'styleguides/categoryPage.template.html'
      };
    })
    .controller('styleguideController', [ '$http', function($http){
      var vm = this;
      vm.categories = [];

      $http.get('styleguides/categories.yml')
        .then(function(data){
          vm.categories = (jsyaml.safeLoad(data.data));
          vm.setItem(vm.categories[0]);
        })

      vm.current = [];

      vm.setItem = function(category){
        $http.get('styleguides/categories/' + category + '/category.yml')
          .then(function(data){
            vm.current = jsyaml.safeLoad(data.data);
          })
      };


    }])
  ;

})();
