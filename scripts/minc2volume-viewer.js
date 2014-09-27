#!/usr/bin/env node
/*
* BrainBrowser: Web-based Neurological Visualization Tools
* (https://brainbrowser.cbrain.mcgill.ca)
*
* Copyright (C) 2011 McGill University 
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/*
* Author: Tarek Sherif <tsherif@gmail.com> (http://tareksherif.ca/)
* Author: Nicolas Kassis
* Author: Paul Mougel
*/

/*
* Usage:
*   $ node minc2volume-viewer.js <filename>
* OR as a node module:
*   var minc2volumeViewer = require('./minc2volume-viewer')
*   minc2volumeViewer.getHeader('<filename>', function (err, header) {
*     ...
*   })
*   var rawStream = minc2volumeViewer.getRawDataStream('<filename>')
*   rawStream.pipe(...)
*   rawStream.on('error', function (err) { ... })
*/


"use strict";

var fs = require("fs");
var exec =  require("child_process").exec;
var spawn = require("child_process").spawn;
var version = "0.3";

if (require.main === module) {
  var filename = process.argv[2];

  if (filename === undefined) {
    printUsage();
    process.exit(0);
  }

  fs.exists(filename, function(exists) {

    if (!exists) {
      console.error("File " + filename + " does not exist.");
      process.exit(1);
    }

    fs.stat(filename, function(err, stat) {
      if (!stat.isFile()) {
        console.error(filename + " is not a valid file.");
        process.exit(1);
      }

      var basename = filename.match(/[^\/]+$/)[0];
      var rawDataStream, rawFileStream;

      console.log("Processing file:", filename);

      console.log("Creating header file: ", basename + ".header");
      getHeader(filename, function(err, header) {
        if (err) {
          return logExecutionError(err);
        }
        fs.writeFile(basename + ".header", JSON.stringify(header));
      });

      console.log("Creating raw data file: ", basename + ".raw");
      rawDataStream = getRawDataStream(filename);
      rawDataStream.on('error', logExecutionError);
      rawFileStream = fs.createWriteStream(basename + ".raw");
      rawDataStream.pipe(rawFileStream);
    });

  });
} else {
  module.exports.getHeader = getHeader;
  module.exports.getRawDataStream = getRawDataStream;
}

///////////////////////////
// Helper functions
///////////////////////////

function printUsage() {
  console.log("minc2volume-viewer.js v" + version);
  console.log("\nUsage: node minc2volume-viewer.js <filename>\n");
}

function getRawDataStream(filename) {
  var minctoraw = spawn("minctoraw", ["-byte", "-unsigned", "-normalize", filename]);
  minctoraw.on("exit", function (code) {
    if (code === null || code !== 0) {
      var err = new Error("Process minctoraw failed with error code " + code);
      minctoraw.stdout.emit("error", err);
    }
  });
  minctoraw.on("error", function (err) {
    minctoraw.stdout.emit("error", err);
  });
  return minctoraw.stdout;
}

function getHeader(filename, callback) {
  
  function getSpace(filename, header, space, callback) {
    header[space] = {};
    exec("mincinfo -attval " + space + ":start " + filename, function(error, stdout) {
      if (error) {
        return callback(error);
      }

      header[space].start = parseFloat(stdout);
      exec("mincinfo -dimlength " + space + " " + filename, function(error, stdout) {
        if (error) {
          return callback(error);
        }

        header[space].space_length = parseFloat(stdout);
        
        exec("mincinfo -attval " + space + ":step " + filename, function(error, stdout) {
          if (error) {
            return callback(error);
          }

          header[space].step = parseFloat(stdout);

          exec("mincinfo -attval " + space + ":direction_cosines " + filename, function(error, stdout) {
            if (error) {
              return callback(error);
            }

            var direction_cosines = stdout.replace(/^\s+/, "").replace(/\s+$/, "").split(/\s+/);

            if (direction_cosines.length > 1) {
              header[space].direction_cosines = direction_cosines.map(parseFloat);
            }

            callback(null, header);
          });
        });

      });

    });
  }

  function getOrder(header, filename, callback) {
    
    function handleOrder(order, callback) {
      header.order = order;
      
      if (order.length === 4) {
        exec("mincinfo -attval time:start " + filename, function(error, time_start) {
          if (error) {
            return callback(error);
          }

          exec("mincinfo -dimlength time " + filename, function(error, time_length) {
            if (error) {
              return callback(error);
            }

            header.time = {
              start: parseFloat(time_start),
              space_length: parseFloat(time_length)
            };
            callback(null, header);
          });
        });
      
      } else {
        callback(null, header);
      }
    
    }
    
    exec("mincinfo -attval image:dimorder " + filename, function(error, stdout) {
      var order = [];
      order = stdout.trim().split(",");
      
      if (order.length < 3 || order.length > 4) {
        exec("mincinfo -dimnames " + filename,function(error, stdout) {
          if (error) {
            return callback(error);
          }

          order = stdout.trim().split(" ");
          handleOrder(order, callback);
        });
      } else {
        handleOrder(order, callback);
      }
    
    });
  }

  function buildHeader(filename, callback) {
    var header = {};
   
    getOrder(header, filename, function(err, header) {
      if (err) {
        return callback(err);
      }
      getSpace(filename, header, "xspace", function(err, header) {
        if (err) {
          return callback(err);
        }
        getSpace(filename, header, "yspace", function(err, header) {
          if (err) {
            return callback(err);
          }
          getSpace(filename, header, "zspace",function(err, header) {
            if (err) {
              return callback(err);
            }
            if(header.order > 3) {
              getSpace(filename, header, "time", callback);
            } else {
              callback(null, header);
            }
          });
        });
      });
    });
  }

  buildHeader(filename, callback);
}

function logExecutionError(error) {
  error = error.toString();
  if (error.match("not installed") || error.match("command not found")) {
    console.error("\nminc2volume-viewer.js requires that the MINC tools be installed.");
    console.error("Visit http://www.bic.mni.mcgill.ca/ServicesSoftware/MINC for more info.\n");
  } else {
    console.trace(error);
  }
}
    
           
