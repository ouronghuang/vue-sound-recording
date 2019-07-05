let mix = require('laravel-mix');

mix.sass('src/sass/index.scss', 'dist/css/vue-sound-recording.css')
    .js('src/js/index.js', 'dist/js/vue-sound-recording.js')
    .setPublicPath('dist')
    .options({
        processCssUrls: false
    });
