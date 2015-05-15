/*global define*/

define(function () {
    'use strict';

    /**
     *
     * @param {$q}          $q
     * @param {Restangular} Restangular
     * @param {Application} Configuration
     * @param {AdminDescription} AdminDescription
     * @constructor
     */
    function Queries($q, Restangular, Configuration, AdminDescription) {
        this.$q = $q;
        this.Restangular = Restangular;
        this.config = Configuration();
        this.PromisesResolver = AdminDescription.getPromisesResolver();

        this.Restangular.setFullResponse(true);  // To get also the headers
    }

    Queries.$inject = ['$q', 'Restangular', 'NgAdminConfiguration', 'AdminDescription'];

    return Queries;
});
