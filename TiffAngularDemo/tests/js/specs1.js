describe('Testing the controller EventCtrl', function () {   
    var scope, myTiffService, sce, $location;

    // mock the service that retrieves the REST Api data
    beforeEach(function () {
        var mockTiffService = {};
        module('gpApp', function ($provide) {
            $provide.value('myTiffService', mockTiffService);
        });
        inject(function ($q) {
            mockTiffService.data = {
                EventCollection: [
                  {
                      dockey:'2330037772-Festival-2014 Fall',
                      eventId: '2330037772',
                      article: '',
                      title: 'Wild Tales',
                      titleSecond: 'Relatos salvajes',
                      country: 'Argentina/Spain',
                      filmpitch: 'More than living up to its title, director Damián Szifron’s compendium of outrageous, hilarious and truly bizarre anecdotes offers a subversive, blackly comic portrait of contemporary Argentina.\r\n',
                      filmnote: 'Revenge is a dish best served wild. As its\r\ntitle suggests, Damian Szifron\'s latest\r\nfeature, <em>Wild Tales</em>',
                      relatedmedia: [
                          {
                              url: 'https://s3.amazonaws.com/media.tiff.net/content/carousel/89fb2d2f31457ecfae0adf3a51c5a039.jpg',
                              mediatype: 'image'
                          }
                      ],
                      parents: null,
                      children: null,
                      schedule: [
                          {
                              scheddate: '05/09/2014',
                              sortime: '201409051415',
                              schedtime: '2:15 PM',
                              longdate: 'Friday September 5',
                              venueName: 'Scotiabank 2',
                              scheduletype: '1'
                          },
                          {
                              scheddate: '09/09/2014',
                              sortime: '201409092100',
                              schedtime: '9:00 PM',
                              longdate: 'Tuesday September 9',
                              venueName: 'Visa Screening Room (Elgin)',
                              scheduletype: '0'
                          }
                      ]
                  }
                ]
            };
            mockTiffService.getTiffApiData = function () {
                var defer = $q.defer();

                defer.resolve(this.data);

                return defer.promise;
            };            
        });
    });

    beforeEach(inject(function ($controller, $rootScope, _$sce_, _myTiffService_, _$location_) {
        scope = $rootScope.$new();
        sce = _$sce_;
        $location = _$location_;
        myTiffService = _myTiffService_;

        $controller('EventCtrl', { $scope: scope, $myTiffService: myTiffService, $sce: sce });

        scope.$digest();
    }));

    // first test, check data is assigned to expected scope property
    it('scope should contain the expected test event data at $scope.eventdata.EventCollection[0]', function () {
        expect(scope.eventdata.EventCollection[0].title).toEqual('Wild Tales');
        expect(scope.eventdata.EventCollection[0].article).toEqual('');
        expect(scope.eventdata.EventCollection[0].titleSecond).toEqual('Relatos salvajes');
        expect(scope.eventdata.EventCollection[0].country).toEqual('Argentina/Spain');
        expect(scope.eventdata.EventCollection[0].filmnote).toEqual('Revenge is a dish best served wild. As its\r\ntitle suggests, Damian Szifron\'s latest\r\nfeature, <em>Wild Tales</em>');
        expect(scope.eventdata.EventCollection[0].filmnote).toMatch('<em>Wild Tales</em>');
    });

    // second test, check event has no parents and no children
    it('scope should contain no parents and no children', function () {
        expect(scope.havechildren).toBe(false);
        expect(scope.haveparent).toBe(false);
    });
});