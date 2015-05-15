/*global define,jasmine,spyOn,angular,describe,it,expect,beforeEach*/

define(function (require) {
    'use strict';

    var RetrieveQueries = require('ng-admin/Crud/repository/RetrieveQueries'),
        Field = require('ng-admin/es6/lib/Field/Field'),
        TextField = require('ng-admin/es6/lib/Field/TextField'),
        Entity = require('ng-admin/es6/lib/Entity/Entity'),
        ReferenceField = require('ng-admin/es6/lib/Field/ReferenceField'),
        ReferencedListField = require('ng-admin/es6/lib/Field/ReferencedListField'),
        Restangular = require('mock/Restangular'),
        mixins = require('mixins'),
        PromisesResolver = require('mock/PromisesResolver'),
        $q = require('mock/q'),
        adminDescription,
        config,
        rawCats,
        rawHumans,
        catEntity,
        humanEntity,
        catView,
        entity,
        view;

    describe("Service: RetrieveQueries", function () {

        beforeEach(function () {
            config = function () {
                return {
                    baseApiUrl: angular.noop,
                    getRouteFor: function (entity) {
                        return 'http://localhost/' + entity.name();
                    }
                };
            };

            catEntity = new Entity('cat').identifier(new Field('id'));
            humanEntity = new Entity('human');
            catView = catEntity.listView()
                .addField(new TextField('name'))
                .addField(new ReferenceField('human_id').targetEntity(humanEntity).targetField(new Field('firstName')));

            humanEntity.identifier(new Field('id'));

            rawCats = [
                {"id": 1, "human_id": 1, "name": "Mizoute", "summary": "A Cat"},
                {"id": 2, "human_id": 1, "name": "Suna", "summary": "A little Cat"}
            ];

            rawHumans = [
                {"id": 1, "firstName": "Daph"},
                {"id": 2, "firstName": "Manu"},
                {"id": 3, "firstName": "Daniel"}
            ];
        });

        describe('getAll', function() {
            it('should return all data to display a ListView', function (done) {
                spyOn(Restangular, 'getList').and.returnValue(mixins.buildPromise({data: rawCats, headers: function() {}}));
                spyOn(PromisesResolver, 'allEvenFailed').and.returnValue(mixins.buildPromise([{status: 'success', result: rawHumans[0] }, {status: 'success', result: rawHumans[1] }, {status: 'success', result: rawHumans[2] }]));

                adminDescription = {
                    getPromisesResolver: function() {
                        return PromisesResolver;
                    }
                };

                var retrieveQueries = new RetrieveQueries($q, Restangular, config, adminDescription);

                retrieveQueries.getAll(catView)
                    .then(function (result) {
                        expect(result.totalItems).toEqual(2);
                        expect(result.data.length).toEqual(2);

                        expect(result.data[0].id).toEqual(1);
                        expect(result.data[0].name).toEqual('Mizoute');

                        expect(result.data[0].human_id).toEqual(1);
                    })
                    .then(done, done.fail);
            });
        });

        describe('getReferencedData', function() {
            it('should return all references data for a View with multiple calls', function (done) {
                var retrieveQueries,
                    post = new Entity('posts'),
                    author = new Entity('authors'),
                    authorRef = new ReferenceField('author');

                var rawPosts = [
                    {id: 1, author: 'abc'},
                    {id: 2, author: '19DFE'}
                ];

                var rawAuthors = [
                    {id: 'abc', name: 'Rollo'},
                    {id: '19DFE', name: 'Ragna'}
                ];

                authorRef.targetEntity(author);
                authorRef.targetField(new Field('name'));
                post.listView()
                    .addField(authorRef);

                spyOn(Restangular, 'get').and.returnValue(mixins.buildPromise(mixins.buildPromise({})));
                spyOn(PromisesResolver, 'allEvenFailed').and.returnValue(mixins.buildPromise([{status: 'success', result: rawAuthors[0] }, { status: 'success', result: rawAuthors[1] }]));

                adminDescription = {
                    getPromisesResolver: function() {
                        return PromisesResolver;
                    }
                };

                retrieveQueries = new RetrieveQueries($q, Restangular, config, adminDescription);

                retrieveQueries.getReferencedData(post.listView().getReferences(), rawPosts)
                    .then(function (referencedData) {
                        expect(referencedData.author.length).toEqual(2);
                        expect(referencedData.author[0].id).toEqual('abc');
                        expect(referencedData.author[1].name).toEqual('Ragna');
                    })
                    .then(done, done.fail);
            });

            it('should return all references data for a View with one call', function (done) {
                var retrieveQueries,
                    post = new Entity('posts'),
                    author = new Entity('authors'),
                    authorRef = new ReferenceField('author');

                authorRef.singleApiCall(function (ids) {
                    return {
                        id: ids
                    };
                });

                var rawPosts = [
                    {id: 1, author: 'abc'},
                    {id: 2, author: '19DFE'}
                ];

                var rawAuthors = [
                    {id: 'abc', name: 'Rollo'},
                    {id: '19DFE', name: 'Ragna'}
                ];

                authorRef.targetEntity(author);
                authorRef.targetField(new Field('name'));
                post.listView()
                    .addField(authorRef);

                spyOn(Restangular, 'getList').and.returnValue(mixins.buildPromise(mixins.buildPromise({})));
                spyOn(PromisesResolver, 'allEvenFailed').and.returnValue(mixins.buildPromise([{status: 'success', result: { data: rawAuthors }}]));

                adminDescription = {
                    getPromisesResolver: function() {
                        return PromisesResolver;
                    }
                };

                retrieveQueries = new RetrieveQueries($q, Restangular, config, adminDescription);

                retrieveQueries.getReferencedData(post.listView().getReferences(), rawPosts)
                    .then(function (referencedData) {
                        expect(referencedData['author'].length).toEqual(2);
                        expect(referencedData['author'][0].id).toEqual('abc');
                        expect(referencedData['author'][1].name).toEqual('Ragna');
                    })
                    .then(done, done.fail);
            });
        });

        describe('getReferencedListData', function() {
            it('should return all referencedLists data for a View', function (done) {
                var retrieveQueries,
                    state = new Entity('states').identifier(new Field('id')),
                    character = new Entity('characters'),
                    stateCharacters = new ReferencedListField('character');

                var rawCharacters = [
                    {id: 'abc', state_id: 1, name: 'Rollo', age: 35, eyes: 'blue'},
                    {id: '19DFE', state_id: 1, name: 'Ragna', age: 33, eyes: 'brown'},
                    {id: '1G53a', state_id: 2, name: 'Aelle', age: 45, eyes: 'brown'}
                ];

                stateCharacters
                    .targetReferenceField('state_id')
                    .targetFields([
                        new Field('id'),
                        new Field('name'),
                        new Field('state_id')
                    ])
                    .targetEntity(character);

                state.listView()
                    .addField(stateCharacters);

                spyOn(Restangular, 'getList').and.returnValue(mixins.buildPromise(mixins.buildPromise({data: rawCharacters})));
                spyOn($q, 'all').and.returnValue(mixins.buildPromise([{data: rawCharacters}]));

                adminDescription = {
                    getPromisesResolver: function() {
                        return PromisesResolver;
                    }
                };

                retrieveQueries = new RetrieveQueries($q, Restangular, config, adminDescription);

                retrieveQueries.getReferencedListData(state.listView().getReferencedLists(), null, null, 1)
                    .then(function (referencedListData) {
                        expect(referencedListData.character.length).toEqual(3);
                        expect(referencedListData.character[0].name).toEqual('Rollo');
                        expect(referencedListData.character[1].id).toEqual('19DFE');
                    })
                    .then(done, done.fail);
            });
        });

        describe("getOne", function () {

            beforeEach(function () {
                config = function () {
                    return {
                        baseApiUrl: angular.noop,
                        getQueryParamsFor: function (view, params) {
                            return params;
                        },
                        getRouteFor: function (entity, viewUrl, viewType, identyId) {
                            return 'http://localhost/' + entity.name() + (identyId ? '/' + identyId : '');
                        }
                    };
                };

                adminDescription = {
                    getPromisesResolver: function() {
                        return PromisesResolver;
                    }
                };

                entity = new Entity('cat').identifier(new Field('id'));
                view = entity.creationView()
                    .addField(new TextField('name'));
            });

            it('should return the entity with all fields.', function (done) {
                spyOn(Restangular, 'oneUrl').and.callThrough();
                spyOn(Restangular, 'get').and.returnValue(mixins.buildPromise({
                    data: {
                        "id": 1,
                        "name": "Mizoute",
                        "summary": "A Cat"
                    }
                }));

                var retrieveQueries = new RetrieveQueries({}, Restangular, config, adminDescription);

                retrieveQueries.getOne(entity, view.type, 1)
                    .then(function (rawEntry) {
                        expect(Restangular.oneUrl).toHaveBeenCalledWith('cat', 'http://localhost/cat/1');
                        expect(Restangular.get).toHaveBeenCalledWith();

                        expect(rawEntry.id).toBe(1);
                        expect(rawEntry.name).toBe('Mizoute');

                        // Non mapped field should also be retrieved
                        expect(rawEntry.summary).toBe("A Cat");
                    })
                    .then(done, done.fail);
            });

        });
    });
});
