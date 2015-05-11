function NgAdminConfiguration() {
    this.config = null;
    this.adminDescription = null;
}

NgAdminConfiguration.prototype.setAdminDescription = function(adminDescription) {
    this.adminDescription = adminDescription;
};

NgAdminConfiguration.prototype.configure = function (config) {
    this.config = config;
};

NgAdminConfiguration.prototype.$get = function () {
    var config = this.config;
    return function () {
        return config;
    };
};

NgAdminConfiguration.prototype.application = function(name) {
    return this.adminDescription.application(name);
};

NgAdminConfiguration.prototype.entity = function(name) {
    return this.adminDescription.entity(name);
};

NgAdminConfiguration.prototype.field = function(name, type) {
    return this.adminDescription.field(name, type);
};

NgAdminConfiguration.prototype.registerFieldType = function(name, type) {
    return this.adminDescription.registerFieldType(name, type);
};

NgAdminConfiguration.prototype.menu = function(entity) {
    return this.adminDescription.menu(entity);
};

NgAdminConfiguration.$inject = [];

module.exports = NgAdminConfiguration;
