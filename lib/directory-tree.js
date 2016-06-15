var fs = require('fs');
var path = require('path');

/**
 * Create json tree based on directory stucture
 * @param  {string} basepath directory path
 * @param  {object} options  
 * @param  {array} options.whiteExtensions
 * @param  {array} options.blackExtensions
 * @param  {bool} options.includeDotFile
 * @return {object}          
 */
function directoryTree(basepath, options) {
    options = options || {};
    var blackExtensions = (options.blackExtensions && options.blackExtensions.length > 0) ? options.blackExtensions : false;
    var whiteExtensions = (!blackExtensions && options.whiteExtensions && options.whiteExtensions.length > 0) ? options.whiteExtensions : false;
    var includeDotFile = options.includeDotFile || false;

    var _directoryTree = function (name) {
        var stats = fs.statSync(name);
        var item = {
            path: path.relative(basepath, name),
            name: path.basename(name)
        };
        var ext = path.extname(name).toLowerCase().substring(1);

        if (stats.isFile()) {
            // whiteExtensions has high priority
            if (whiteExtensions &&
                whiteExtensions.indexOf(ext) === -1) {
                return null;
            }
            else if (blackExtensions &&
                blackExtensions.indexOf(ext) > -1) {
                return null;
            }

            // Dot file
            if (includeDotFile && item.name[0] === '.') {
                return null;
            }
            if (options.excludePattern && options.excludePattern.test(item.name)) {
                return null;
            }
        } else {
            item.children = fs.readdirSync(name).map(function (child) {
                return _directoryTree(path.join(name, child));
            }).filter(function (e) {
                return e !== null;
            });

            if (item.children.length === 0) {
                return null;
            }
        }

        return item;
    }
    return _directoryTree(basepath);
}

exports.directoryTree = directoryTree;

