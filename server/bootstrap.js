Meteor.startup(function () {
    if (Geometries.find().count() === 0) {
        var geometries = [
            {
                "name" : "knight",
                "type": "ascii",
                "url" : "https://www.filepicker.io/api/file/wEEjVqZrQ2ebYrpCVPn2"
            }
        ];

        for (var i = 0; i < geometries.length; i++)
            Geometries.insert(geometries[i]);
    }
});