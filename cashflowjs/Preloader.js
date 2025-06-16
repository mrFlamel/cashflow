var Preloader = (function () {
    function Preloader() {
        this.version = window.location.search.split("=")[1];
    }
    return Preloader;
})();