(function () {
    "use strict";


    var langArr = [
    'af', 'sq',
    'ar', 'ar-DZ', 'ar-BH', 'ar-EG', 'ar-IL', 'ar-JO', 'ar-KW', 'ar-LB', 'ar-MA', 'ar-OM',
    'ar-PS', 'ar-QA', 'ar-SA', 'ar-TN', 'ar-AE',
    'hy', 'az', 'eu', 'be', 'bn', 'bs', 'bg', 'ca', 'ceb', 'ny',
    'zh', 'zh-CN', 'zh-HK', 'zh-TW', 'zh-YUE',
    'hr', 'cs', 'da', 'nl',
    'en', 'en-AU', 'en-CA', 'en-IN', 'en-IE', 'en-NZ', 'en-PH', 'en-ZA', 'en-US', 'en-UK',
    'eo', 'et', 'tl', 'fi', 'fr', 'gl', 'ka', 'de', 'el', 'gu', 'ht', 'ha', 'iw', 'hi',
    'hmn', 'hu', 'is', 'ig', 'id', 'ga',
    'it', 'ja', 'jw', 'kn', 'kk', 'km',
    'ko', 'lo', 'la', 'lv', 'lt', 'mk', 'mg', 'ms', 'ml',
    'mt', 'mi', 'mr', 'mn', 'my', 'ne', 'no', 'fa', 'pl',
    'pt', 'pt-PT', 'pt-BR',
    'pa', 'ro', 'ru', 'sr', 'st',
    'si', 'sk', 'sl', 'so',
    'es', 'es-AR', 'es-BO', 'es-CL', 'es-CO', 'es-CR', 'es-DO',
    'es-EC', 'es-SV', 'es-GT', 'es-HN', 'es-MX', 'es-NI', 'es-PA',
    'es-PY', 'es-PE', 'es-PR', 'es-ES', 'es-US', 'es-UY', 'es-VE',
    'su', 'sw', 'sv', 'tg', 'ta', 'te', 'th', 'tr', 'uk', 'ur', 'uz', 'vi', 'cy', 'yi', 'yo', 'zu',
    'am', 'co', 'fy', 'ky', 'haw', 'ku', 'lb', 'sm', 'gd', 'sn', 'sd', 'ps', 'xh',
  ];

    function loadlanguageList() {
        Custom.Data.languageList.splice(0, Custom.Data.languageList.length);
        Custom.Data.langArr.forEach(function (language_id) {
            Custom.Data.languageList.push({
                language_id: language_id,
                language_name: WinJS.Resources.getString("/languages/" + language_id).value,
                main: 1
            });
        });
        Custom.Data.languageList.sort(function (x, y) {
            var xs = x.language_name;
            var ys = y.language_name;
            return xs.localeCompare(ys);
        });
    }

    var themeXList = new WinJS.Binding.List([
        { name: 'light', hex: '#fff', thex: '#000' },
        { name: 'dark', hex: '#000', thex: '#fff' },
    ]);

    var themeYList = new WinJS.Binding.List([
        { name: 'red', statusbar: { r: 211, g: 47, b: 47, a: 1 }, hex: '#F44336' },
        { name: 'pink', statusbar: { r: 194, g: 24, b: 91, a: 1 }, hex: '#E91E63' },
        { name: 'purple', statusbar: { r: 123, g: 31, b: 162, a: 1 }, hex: '#9C27B0' },
        { name: 'deep-purple', statusbar: { r: 81, g: 45, b: 168, a: 1 }, hex: '#673AB7' },
        { name: 'indigo', statusbar: { r: 48, g: 63, b: 159, a: 1 }, hex: '#3F51B5' },
        { name: 'blue', statusbar: { r: 13, g: 71, b: 161, a: 1 }, hex: '#1976D2' },
        { name: 'light-blue', statusbar: { r: 1, g: 87, b: 155, a: 1 }, hex: '#0288D1' },
        { name: 'cyan', statusbar: { r: 0, g: 151, b: 167, a: 1 }, hex: '#00BCD4' },
        { name: 'teal', statusbar: { r: 0, g: 121, b: 107, a: 1 }, hex: '#009688' },
        { name: 'green', statusbar: { r: 56, g: 142, b: 60, a: 1 }, hex: '#4CAF50' },
        { name: 'light-green', statusbar: { r: 85, g: 139, b: 47, a: 1 }, hex: '#689f38' },
        { name: 'deep-orange', statusbar: { r: 230, g: 74, b: 25, a: 1 }, hex: '#FF5722' },
        { name: 'brown', statusbar: { r: 93, g: 64, b: 55, a: 1 }, hex: '#795548' },
        { name: 'grey', statusbar: { r: 33, g: 33, b: 33, a: 1 }, hex: '#616161' },
        { name: 'blue-grey', statusbar: { r: 69, g: 90, b: 100, a: 1 }, hex: '#607D8B' },
    ]);

    var languageList = new WinJS.Binding.List([]);
    var groupedlanguageList = languageList
                              .createGrouped(
                                function (x) { return x.main; },
                                function (x) { return { main: x.main }; },
                                function (x, y) { return x - y; }
                              )

    WinJS.Namespace.define("Custom.Data", {
        langArr: langArr,
        languageList: languageList,
        groupedlanguageList: groupedlanguageList,
        loadlanguageList: loadlanguageList,
        themeXList: themeXList,
        themeYList: themeYList
    });

})();
